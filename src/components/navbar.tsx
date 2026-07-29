"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogoMark } from "@/components/logo-mark";

function NavLinks({
  session,
  onNavigate,
  className,
  linkClassName,
}: {
  session: ReturnType<typeof useSession>["data"];
  onNavigate?: () => void;
  className?: string;
  linkClassName: string;
}) {
  return (
    <div className={className}>
      <Link href="/cars" onClick={onNavigate} className={linkClassName}>
        ค้นหารถ
      </Link>
      {session && session.user.role !== "ADMIN" && (
        <>
          <Link href="/owner" onClick={onNavigate} className={linkClassName}>
            รถของฉัน
          </Link>
          <Link href="/bookings" onClick={onNavigate} className={linkClassName}>
            การจองของฉัน
          </Link>
        </>
      )}
      {session?.user.role === "ADMIN" && (
        <Link href="/admin" onClick={onNavigate} className={linkClassName}>
          แอดมิน
        </Link>
      )}
      {session && (
        <Link href="/verify" onClick={onNavigate} className={linkClassName}>
          ยืนยันตัวตน
        </Link>
      )}
    </div>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          onClick={closeMenu}
          className="font-display flex items-center gap-2 text-lg tracking-wide text-accent transition-opacity hover:opacity-80"
        >
          <LogoMark className="h-7 w-7" />
          RentCar
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          <NavLinks
            session={session}
            className="flex items-center gap-4"
            linkClassName="text-ink-muted transition-colors hover:text-accent"
          />

          {status === "loading" ? null : session ? (
            <>
              <Link
                href="/account"
                className="text-ink-faint transition-colors hover:text-accent"
              >
                {session.user.name}
              </Link>
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="เปิดเมนู"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-hover sm:hidden"
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 sm:hidden">
          <NavLinks
            session={session}
            onNavigate={closeMenu}
            className="flex flex-col gap-1"
            linkClassName="rounded-md px-2 py-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-accent"
          />

          <div className="mt-2 border-t border-border pt-2">
            {status === "loading" ? null : session ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="block rounded-md px-2 py-2 text-xs text-ink-faint transition-colors hover:bg-surface-hover hover:text-accent"
                >
                  {session.user.name}
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="mt-1 w-full rounded-md bg-surface-hover px-3 py-2 text-left font-medium text-ink transition-colors hover:bg-surface-raised"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-md px-2 py-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-accent"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-md bg-accent px-3 py-2 text-center font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
