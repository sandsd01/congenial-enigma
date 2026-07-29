"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminVerificationActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    setLoading(true);
    await fetch(`/api/verification/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "VERIFIED" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function reject() {
    setLoading(true);
    await fetch(`/api/verification/${userId}`, {
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
          className="rounded-md border border-border-strong bg-bg px-2 py-1 text-xs text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !reason}
            onClick={reject}
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
    <div className="flex gap-2">
      <a
        href={`/api/verification/document/${userId}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-md bg-surface-hover px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-surface-raised"
      >
        ดูเอกสาร
      </a>
      <button
        disabled={loading}
        onClick={approve}
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
    </div>
  );
}
