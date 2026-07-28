import { z } from "zod";

export const carSchema = z.object({
  title: z.string().min(3).max(120),
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(60),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  transmission: z.enum(["AUTO", "MANUAL"]),
  seats: z.coerce.number().int().min(1).max(20),
  fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "EV"]),
  location: z.string().min(1).max(100),
  pricePerDay: z.coerce.number().positive().max(1_000_000),
  description: z.string().min(10).max(2000),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const bookingSchema = z
  .object({
    carId: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "วันคืนรถต้องอยู่หลังวันรับรถ",
    path: ["endDate"],
  })
  .refine((data) => data.startDate >= new Date(new Date().toDateString()), {
    message: "วันรับรถต้องไม่ใช่วันที่ผ่านมาแล้ว",
    path: ["startDate"],
  });
