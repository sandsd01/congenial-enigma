"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminCarStatusActions({
  carId,
  status,
  isActive,
}: {
  carId: string;
  status: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function setStatus(newStatus: string, rejectReason?: string) {
    setLoading(true);
    await fetch(`/api/cars/${carId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, rejectReason }),
    });
    setLoading(false);
    setRejecting(false);
    router.refresh();
  }

  async function deactivate() {
    setLoading(true);
    await fetch(`/api/cars/${carId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (!isActive) {
    return <span className="text-xs text-ink-faint">ปิดประกาศแล้ว</span>;
  }

  if (rejecting) {
    return (
      <div className="flex flex-col gap-2">
        <input
          autoFocus
          placeholder="เหตุผลที่ปฏิเสธ"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-md border border-border-strong bg-bg px-2 py-1 text-xs text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !reason}
            onClick={() => setStatus("REJECTED", reason)}
            className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-accent-ink transition-colors hover:opacity-90 disabled:opacity-50"
          >
            ยืนยันปฏิเสธ
          </button>
          <button
            onClick={() => setRejecting(false)}
            className="rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-raised"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <button
            disabled={loading}
            onClick={() => setStatus("APPROVED")}
            className="rounded-md bg-success-bg px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
          >
            อนุมัติ
          </button>
          <button
            disabled={loading}
            onClick={() => setRejecting(true)}
            className="rounded-md bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
          >
            ปฏิเสธ
          </button>
        </>
      )}
      {status === "APPROVED" && (
        <button
          disabled={loading}
          onClick={() => setStatus("SUSPENDED")}
          className="rounded-md bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
        >
          ระงับรถคันนี้
        </button>
      )}
      {status === "SUSPENDED" && (
        <button
          disabled={loading}
          onClick={() => setStatus("APPROVED")}
          className="rounded-md bg-success-bg px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
        >
          ยกเลิกการระงับ
        </button>
      )}
      {status === "REJECTED" && (
        <button
          disabled={loading}
          onClick={() => setStatus("APPROVED")}
          className="rounded-md bg-success-bg px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
        >
          อนุมัติ
        </button>
      )}
      <button
        disabled={loading}
        onClick={deactivate}
        className="rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-raised disabled:opacity-50"
      >
        ปิดประกาศ
      </button>
    </div>
  );
}
