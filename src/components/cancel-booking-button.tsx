"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setError("");
    setLoading(true);

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "ยกเลิกไม่สำเร็จ");
      return;
    }

    setConfirming(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-ink-faint underline transition-colors hover:text-danger"
      >
        ยกเลิกการจอง
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-ink-muted">ยืนยันการยกเลิก?</span>
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={cancel}
          className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-accent-ink transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "กำลังยกเลิก..." : "ยืนยัน"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-raised"
        >
          ไม่ยกเลิก
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
