"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const inputClass =
  "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export function BookingForm({
  carId,
  pricePerDay,
  initialStartDate,
  initialEndDate,
}: {
  carId: string;
  pricePerDay: number;
  initialStartDate?: string;
  initialEndDate?: string;
}) {
  const { status } = useSession();
  const router = useRouter();

  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [endDate, setEndDate] = useState(initialEndDate ?? "");
  const [notes, setNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isGuest = status === "unauthenticated";

  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const total = days * pricePerDay;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId,
        startDate,
        endDate,
        notes,
        ...(isGuest ? { guestName, guestPhone, guestEmail } : {}),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <div className="animate-fade-in-up rounded-lg border border-success/30 bg-success-bg p-4 text-sm text-success">
        ส่งคำขอจองรถสำเร็จ! เจ้าของรถจะตรวจสอบและยืนยันการจองของคุณเร็วๆ นี้
        {isGuest ? (
          <> เจ้าของรถจะติดต่อกลับตามเบอร์โทรศัพท์ที่ให้ไว้</>
        ) : (
          <>
            {" "}
            ดูสถานะได้ที่{" "}
            <a href="/bookings" className="font-medium underline">
              การจองของฉัน
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
    >
      <h3 className="font-semibold text-ink">จองรถคันนี้</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            วันรับรถ
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            วันคืนรถ
          </label>
          <input
            type="date"
            required
            min={startDate || new Date().toISOString().split("T")[0]}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      {isGuest && (
        <div className="animate-fade-in-up space-y-3 rounded-md border border-border bg-surface-hover p-3">
          <p className="text-xs text-ink-muted">
            จองแบบไม่ต้องสมัครสมาชิก กรอกข้อมูลติดต่อไว้ให้เจ้าของรถ
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              ชื่อ-นามสกุล
            </label>
            <input
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              เบอร์โทรศัพท์
            </label>
            <input
              required
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              อีเมล (ถ้ามี)
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <p className="text-xs text-ink-faint">
            มีบัญชีอยู่แล้ว?{" "}
            <a
              href={`/login?callbackUrl=/cars/${carId}`}
              className="text-accent underline"
            >
              เข้าสู่ระบบ
            </a>
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          หมายเหตุถึงเจ้าของรถ (ถ้ามี)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      {days > 0 && (
        <div className="animate-fade-in-up rounded-md border border-border bg-surface-hover p-3 text-sm">
          <div className="flex justify-between text-ink">
            <span>
              {days} วัน × ฿{pricePerDay.toLocaleString()}
            </span>
            <span className="font-semibold text-accent">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={
          loading || days <= 0 || (isGuest && (!guestName || !guestPhone))
        }
        className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "กำลังส่งคำขอ..." : "ขอจองรถ"}
      </button>
    </form>
  );
}
