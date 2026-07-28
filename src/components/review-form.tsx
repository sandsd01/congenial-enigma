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
        className="rounded-md bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
      >
        เขียนรีวิว
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up mt-2 w-full space-y-2 rounded-lg border border-border bg-surface-hover p-3"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl transition-colors ${n <= rating ? "text-accent" : "text-ink-faint"}`}
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
        className="w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-border"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
