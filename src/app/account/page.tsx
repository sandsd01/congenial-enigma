"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function AccountPage() {
  const { status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/account");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);

    setTimeout(() => {
      signOut({ callbackUrl: "/login" });
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="animate-fade-in-up rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
        <h1 className="mb-6 font-display text-2xl font-normal text-ink">
          บัญชีของฉัน
        </h1>
        <h2 className="mb-4 text-sm font-medium text-ink-muted">
          เปลี่ยนรหัสผ่าน
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {success && (
            <p className="text-sm text-success">
              เปลี่ยนรหัสผ่านสำเร็จ กำลังออกจากระบบเพื่อเข้าสู่ระบบใหม่...
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}
