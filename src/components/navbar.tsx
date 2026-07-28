"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-accent transition-colors hover:text-accent-hover"
        >
          🚗 RentCar
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/cars"
            className="text-ink-muted transition-colors hover:text-accent"
          >
            ค้นหารถ
          </Link>

          {status === "loading" ? null : session ? (
            <>
              {session.user.role === "OWNER" && (
                <Link
                  href="/owner"
                  className="text-ink-muted transition-colors hover:text-accent"
                >
                  รถของฉัน
                </Link>
              )}
              {session.user.role === "RENTER" && (
                <Link
                  href="/bookings"
                  className="text-ink-muted transition-colors hover:text-accent"
                >
                  การจองของฉัน
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-ink-muted transition-colors hover:text-accent"
                >
                  แอดมิน
                </Link>
              )}
              <span className="hidden text-ink-faint sm:inline">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-surface-hover px-3 py-1.5 font-medium text-ink transition-colors hover:bg-surface-raised"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-ink-muted transition-colors hover:text-accent"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-1.5 font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
