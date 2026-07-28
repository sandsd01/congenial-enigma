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
      className="mb-8 rounded-xl border border-slate-200 bg-white p-5"
    >
      <label className="mb-1 block text-sm font-medium">
        อัตราค่าคอมมิชชั่นของแพลตฟอร์ม
      </label>
      <p className="mb-3 text-xs text-slate-500">
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
          className="w-28 rounded-md border border-slate-300 px-3 py-2"
        />
        <span className="text-slate-500">%</span>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {message && (
          <span className="text-sm text-green-600">{message}</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
