import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { AdminUserActions } from "@/components/admin-user-actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  RENTER: "ผู้ใช้ทั่วไป",
  OWNER: "ผู้ใช้ทั่วไป",
  ADMIN: "แอดมิน",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/users");
  }

  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isSuspended: true,
      verificationStatus: true,
      _count: { select: { cars: true, bookings: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-normal text-ink">
          ผู้ใช้ทั้งหมด ({users.length})
        </h1>
        <Link
          href="/admin"
          className="text-sm text-ink-muted transition-colors hover:text-accent"
        >
          ← กลับแดชบอร์ด
        </Link>
      </div>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          placeholder="ค้นหาชื่อหรืออีเมล"
          defaultValue={q}
          className="w-full max-w-sm rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-surface-hover text-left text-ink-muted">
            <tr>
              <th className="px-4 py-2">ชื่อ</th>
              <th className="px-4 py-2">อีเมล / เบอร์โทร</th>
              <th className="px-4 py-2">บทบาท</th>
              <th className="px-4 py-2">ยืนยันตัวตน</th>
              <th className="px-4 py-2">รถ / การจอง</th>
              <th className="px-4 py-2">สถานะ</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-faint">
                  ไม่พบผู้ใช้
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-border text-ink transition-colors hover:bg-surface-hover"
              >
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">
                  <div>{user.email}</div>
                  {user.phone && (
                    <div className="text-xs text-ink-faint">{user.phone}</div>
                  )}
                </td>
                <td className="px-4 py-2">
                  {ROLE_LABEL[user.role] ?? user.role}
                </td>
                <td className="px-4 py-2">
                  {user.verificationStatus === "UNVERIFIED" ? (
                    <span className="text-ink-faint">-</span>
                  ) : (
                    <StatusBadge status={user.verificationStatus} />
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {user._count.cars} คัน / {user._count.bookings} รายการ
                </td>
                <td className="px-4 py-2">
                  {user.isSuspended ? (
                    <StatusBadge status="SUSPENDED" />
                  ) : (
                    <span className="text-ink-faint">ปกติ</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {user.role !== "ADMIN" && (
                    <AdminUserActions
                      userId={user.id}
                      isSuspended={user.isSuspended}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
