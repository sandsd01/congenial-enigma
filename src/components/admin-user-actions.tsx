"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminUserActions({
  userId,
  isSuspended,
}: {
  userId: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: !isSuspended }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      disabled={loading}
      onClick={toggle}
      className={
        isSuspended
          ? "rounded-md bg-success-bg px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
          : "rounded-md bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
      }
    >
      {isSuspended ? "ยกเลิกการระงับ" : "ระงับบัญชี"}
    </button>
  );
}
