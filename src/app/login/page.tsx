"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/google-signin-button";

const inputClass =
  "w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="animate-fade-in-up rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
        <h1 className="mb-6 font-display text-2xl font-normal text-ink">เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">
              อีเมล
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-ink-faint">หรือ</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton label="เข้าสู่ระบบด้วย Gmail" callbackUrl={callbackUrl} />
        <p className="mt-4 text-sm text-ink-muted">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="text-accent transition-colors hover:text-accent-hover"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
