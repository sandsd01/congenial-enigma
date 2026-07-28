"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
      >
        เขียนรีวิว
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 w-full space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-amber-400" : "text-slate-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="เล่าประสบการณ์การเช่ารถของคุณ (ถ้ามี)"
        rows={2}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
