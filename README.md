# RentCar — แพลตฟอร์มตัวกลางเช่ารถ

เว็บแอปสำหรับเป็นตัวกลางระหว่าง **เจ้าของรถ** ที่ต้องการปล่อยเช่ารถ กับ
**ผู้เช่า** ที่ต้องการหารถเช่า โดยแพลตฟอร์มจะหักค่าคอมมิชชั่นจากยอดจอง
แต่ละครั้งโดยอัตโนมัติ

## ฟีเจอร์หลัก

- **สมัครสมาชิก/เข้าสู่ระบบ** แบ่งเป็น 3 บทบาท: ผู้เช่า (RENTER), เจ้าของรถ (OWNER),
  แอดมิน (ADMIN)
- **เจ้าของรถ**: ลงประกาศรถ แก้ไข ดูสถานะการอนุมัติ ดูคำขอจอง ยืนยัน/ปฏิเสธการจอง
  และดูรายได้สุทธิ (หลังหักค่าคอมมิชชั่น)
- **ผู้เช่า**: ค้นหา/กรองรถ (คำค้น, จังหวัด, ช่วงราคา), จองรถตามช่วงวันที่,
  ดูสถานะการจองของตัวเอง
- **แอดมิน**: อนุมัติ/ปฏิเสธประกาศรถก่อนแสดงต่อสาธารณะ, ดูภาพรวมค่าคอมมิชชั่นสะสม,
  มูลค่าการจองรวม (GMV), และรายการจองทั้งหมด
- **คำนวณค่าคอมมิชชั่นอัตโนมัติ**: ทุกการจองจะคำนวณยอดรวม, ค่าคอมมิชชั่นของแพลตฟอร์ม
  (ค่าเริ่มต้น 15%, ปรับได้ผ่านตาราง `PlatformSetting`), และยอดที่เจ้าของรถจะได้รับ
- **รีวิว**: ผู้เช่าให้คะแนนดาวและเขียนรีวิวได้หลังจบการเช่า แสดงคะแนนเฉลี่ยบนหน้ารถ

## วงจรสถานะการจอง (Booking lifecycle)

```
PENDING ──(เจ้าของ/แอดมิน ยืนยัน)──> CONFIRMED ──(เจ้าของ/แอดมิน)──> COMPLETED ──> รีวิวได้
   │                                     │
   ├──(เจ้าของ/แอดมิน ปฏิเสธ)──> REJECTED  └──(ผู้เช่า/เจ้าของ/แอดมิน)──> CANCELLED
   └──(ผู้เช่า/แอดมิน ยกเลิก)──> CANCELLED
```

## เทคโนโลยีที่ใช้

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma 7](https://www.prisma.io) ORM กับฐานข้อมูล PostgreSQL (ผ่าน `@prisma/adapter-pg`)
- [Auth.js (NextAuth v5)](https://authjs.dev) — ระบบล็อกอินแบบ credentials (email/password)
  พร้อม bcrypt hashing
- อัปโหลดรูปรถเก็บเป็น `bytea` ในฐานข้อมูลโดยตรง (ไม่ต้องพึ่งบริการเก็บไฟล์ภายนอก)
  ผ่าน `/api/cars/[id]/image`

## เริ่มต้นใช้งาน (Local Development)

ต้องมี PostgreSQL รันอยู่ (เช่น `postgresql://postgres:postgres@localhost:5432/rentcar`)
คัดลอก `.env.example` เป็น `.env` แล้วใส่ค่า `DATABASE_URL` และ `AUTH_SECRET`

```bash
npm install

# รัน migration (ครั้งแรกเท่านั้น)
npx prisma migrate deploy

# ใส่ข้อมูลตัวอย่าง (ผู้ใช้ทดสอบ + รถตัวอย่าง)
npm run seed

# รันเซิร์ฟเวอร์สำหรับพัฒนา
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### บัญชีทดสอบ (หลังรัน `npm run seed`)

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| แอดมิน | `admin@rentcar.dev` | `password123` |
| เจ้าของรถ | `owner@rentcar.dev` | `password123` |
| ผู้เช่า | `renter@rentcar.dev` | `password123` |

## โครงสร้างข้อมูลหลัก (`prisma/schema.prisma`)

- `User` — ผู้ใช้งาน พร้อมบทบาท (RENTER / OWNER / ADMIN)
- `Car` — ประกาศรถ พร้อมสถานะการอนุมัติ (PENDING / APPROVED / REJECTED / SUSPENDED)
- `Booking` — การจอง เก็บยอดรวม, อัตราค่าคอมมิชชั่น ณ ขณะจอง, ค่าคอมมิชชั่น,
  และยอดที่เจ้าของรถได้รับ พร้อมสถานะการจองและการชำระเงิน
- `Review` — รีวิวของผู้เช่า (1 รีวิวต่อ 1 การจองที่จบแล้ว)
- `CarImage` — ไฟล์รูปรถที่อัปโหลด เก็บเป็น `bytea`
- `PlatformSetting` — ตั้งค่าอัตราค่าคอมมิชชั่นของแพลตฟอร์ม (ค่าเริ่มต้น 15%)

## Environment Variables (`.env`)

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
AUTH_SECRET="เปลี่ยนเป็นค่าสุ่มที่ปลอดภัยก่อน deploy จริง"
```

สร้างค่า `AUTH_SECRET` ใหม่ด้วยคำสั่ง `npx auth secret` หรือ `openssl rand -base64 32`

## Deploy (Railway)

โปรเจกต์นี้ deploy บน [Railway](https://railway.com) ได้โดยตรงจาก GitHub:

1. สร้าง project ใหม่ แล้วเพิ่ม **PostgreSQL** service
2. เพิ่ม service จาก GitHub repo นี้ (branch `main`)
3. ตั้งค่า environment variables ของ service แอป:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (อ้างอิง service Postgres)
   - `AUTH_SECRET` = ค่าสุ่มที่สร้างเอง
4. ตั้ง **Pre-deploy command** เป็น `npx prisma migrate deploy && npm run seed`
   (ตัด `&& npm run seed` ออกได้ถ้าไม่ต้องการข้อมูลตัวอย่าง)
5. Generate domain เพื่อเปิดใช้งานสาธารณะ

Railway จะ build ด้วย Railpack และรัน `npm run build` / `npm start` ให้อัตโนมัติ

## หมายเหตุสำหรับการใช้งานจริง (Production)

โปรเจกต์นี้เป็น MVP ที่ยังไม่รวมระบบต่อไปนี้ ซึ่งควรเพิ่มก่อนเปิดใช้งานจริง:

- **ระบบชำระเงินจริง** (เช่น Omise, 2C2P, Stripe) — ปัจจุบันมีเพียงฟิลด์
  `paymentStatus` ให้แอดมินอัปเดตสถานะด้วยตนเอง ต้องใช้ API key จริงจากบัญชี
  payment gateway ของเจ้าของแพลตฟอร์มจึงจะเชื่อมต่อได้
- **การยืนยันตัวตน/ใบขับขี่** ของผู้เช่าและเอกสารรถของเจ้าของรถ
- **CDN/object storage สำหรับรูปภาพ** หากมีรูปจำนวนมาก การเก็บใน Postgres โดยตรง
  เหมาะกับ MVP แต่ควรย้ายไป object storage (เช่น Cloudflare R2, S3) เมื่อสเกลขึ้น
