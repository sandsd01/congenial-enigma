"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerificationForm({
  status,
  rejectReason,
}: {
  status: string;
  rejectReason: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("กรุณาเลือกไฟล์เอกสาร");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("document", file);
    const res = await fetch("/api/verification", {
      method: "POST",
      body: form,
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    setFile(null);
    router.refresh();
  }

  if (status === "PENDING") {
    return (
      <div className="animate-fade-in-up rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
        เอกสารของคุณอยู่ระหว่างการตรวจสอบ กรุณารอการยืนยันจากแอดมิน
      </div>
    );
  }

  if (status === "VERIFIED") {
    return (
      <div className="animate-fade-in-up rounded-lg border border-success/30 bg-success-bg p-4 text-sm text-success">
        ยืนยันตัวตนสำเร็จแล้ว ✓
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
    >
      {status === "REJECTED" && (
        <div className="rounded-md border border-danger/30 bg-danger-bg p-3 text-sm text-danger">
          คำขอยืนยันตัวตนก่อนหน้าถูกปฏิเสธ
          {rejectReason && <> เหตุผล: {rejectReason}</>} กรุณาอัปโหลดเอกสารใหม่
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-muted">
          บัตรประชาชน หรือ ใบขับขี่ (อย่างใดอย่างหนึ่ง)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-sm text-ink transition-colors file:mr-3 file:rounded file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-ink file:transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent hover:file:bg-surface-raised"
        />
        <p className="mt-1 text-xs text-ink-faint">
          JPEG, PNG หรือ WebP ขนาดไม่เกิน 4MB
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "กำลังอัปโหลด..." : "ส่งเอกสารยืนยันตัวตน"}
      </button>
    </form>
  );
}
