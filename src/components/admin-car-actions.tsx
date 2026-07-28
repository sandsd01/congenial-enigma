"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminCarActions({ carId }: { carId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    setLoading(true);
    await fetch(`/api/cars/${carId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function reject() {
    setLoading(true);
    await fetch(`/api/cars/${carId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED", rejectReason: reason }),
    });
    setLoading(false);
    setRejecting(false);
    router.refresh();
  }

  if (rejecting) {
    return (
      <div className="flex flex-col gap-2">
        <input
          autoFocus
          placeholder="เหตุผลที่ปฏิเสธ"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !reason}
            onClick={reject}
            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            ยืนยันปฏิเสธ
          </button>
          <button
            onClick={() => setRejecting(false)}
            className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={approve}
        className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        อนุมัติ
      </button>
      <button
        disabled={loading}
        onClick={() => setRejecting(true)}
        className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        ปฏิเสธ
      </button>
    </div>
  );
}
