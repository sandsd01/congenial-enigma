"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OwnerBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(
    newStatus: "CONFIRMED" | "REJECTED" | "COMPLETED"
  ) {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "PENDING") {
    return (
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => updateStatus("CONFIRMED")}
          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          ยืนยัน
        </button>
        <button
          disabled={loading}
          onClick={() => updateStatus("REJECTED")}
          className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          ปฏิเสธ
        </button>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <button
        disabled={loading}
        onClick={() => updateStatus("COMPLETED")}
        className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
      >
        จบการเช่าแล้ว
      </button>
    );
  }

  return null;
}
