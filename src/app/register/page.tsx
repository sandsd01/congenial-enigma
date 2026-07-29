"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "RENTER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push(form.role === "OWNER" ? "/owner" : "/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="animate-fade-in-up rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
        <h1 className="mb-6 font-display text-2xl font-normal text-ink">สมัครสมาชิก</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              ชื่อ-นามสกุล
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              อีเมล
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              เบอร์โทรศัพท์
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              ต้องการสมัครเป็น
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="role"
                  checked={form.role === "RENTER"}
                  onChange={() => setForm({ ...form, role: "RENTER" })}
                  className="accent-accent"
                />
                ผู้เช่ารถ
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="role"
                  checked={form.role === "OWNER"}
                  onChange={() => setForm({ ...form, role: "OWNER" })}
                  className="accent-accent"
                />
                เจ้าของรถ (ปล่อยเช่า)
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="text-accent transition-colors hover:text-accent-hover"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
