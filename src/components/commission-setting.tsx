"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommissionSetting({
  currentRate,
}: {
  currentRate: number;
}) {
  const router = useRouter();
  // Displayed as a percentage; stored as a fraction.
  const [percent, setPercent] = useState((currentRate * 100).toString());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionRate: Number(percent) / 100 }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    setMessage("บันทึกแล้ว");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border border-border bg-surface p-5"
    >
      <label className="mb-1 block text-sm font-medium text-ink">
        อัตราค่าคอมมิชชั่นของแพลตฟอร์ม
      </label>
      <p className="mb-3 text-xs text-ink-muted">
        มีผลกับการจองใหม่เท่านั้น — การจองเดิมยังใช้อัตราที่บันทึกไว้ตอนจอง
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={50}
          step={0.5}
          required
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className="w-28 rounded-md border border-border-strong bg-bg px-3 py-2 text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <span className="text-ink-muted">%</span>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {message && <span className="text-sm text-success">{message}</span>}
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    </form>
  );
}
