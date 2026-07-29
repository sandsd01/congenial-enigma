"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminPaymentAction({
  bookingId,
  paymentStatus,
}: {
  bookingId: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setPaymentStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  if (paymentStatus === "UNPAID") {
    return (
      <button
        disabled={loading}
        onClick={() => setPaymentStatus("PAID")}
        className="rounded-md bg-success-bg px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
      >
        ยืนยันการชำระเงิน
      </button>
    );
  }

  if (paymentStatus === "PAID") {
    return (
      <button
        disabled={loading}
        onClick={() => setPaymentStatus("REFUNDED")}
        className="rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-raised disabled:opacity-50"
      >
        คืนเงิน
      </button>
    );
  }

  return null;
}
