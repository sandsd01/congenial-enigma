"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-blue-600">
          🚗 RentCar
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cars" className="text-slate-600 hover:text-blue-600">
            ค้นหารถ
          </Link>

          {status === "loading" ? null : session ? (
            <>
              {session.user.role === "OWNER" && (
                <Link
                  href="/owner"
                  className="text-slate-600 hover:text-blue-600"
                >
                  รถของฉัน
                </Link>
              )}
              {session.user.role === "RENTER" && (
                <Link
                  href="/bookings"
                  className="text-slate-600 hover:text-blue-600"
                >
                  การจองของฉัน
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-slate-600 hover:text-blue-600"
                >
                  แอดมิน
                </Link>
              )}
              <span className="hidden text-slate-400 sm:inline">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-blue-600"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
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
