const LABELS: Record<string, { text: string; className: string }> = {
  PENDING: { text: "รอตรวจสอบ", className: "bg-amber-100 text-amber-700" },
  APPROVED: { text: "อนุมัติแล้ว", className: "bg-green-100 text-green-700" },
  REJECTED: { text: "ถูกปฏิเสธ", className: "bg-red-100 text-red-700" },
  SUSPENDED: { text: "ระงับ", className: "bg-slate-200 text-slate-600" },
  CONFIRMED: { text: "ยืนยันแล้ว", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { text: "ยกเลิก", className: "bg-slate-200 text-slate-600" },
  COMPLETED: { text: "เสร็จสิ้น", className: "bg-green-100 text-green-700" },
  UNPAID: { text: "ยังไม่ชำระ", className: "bg-amber-100 text-amber-700" },
  PAID: { text: "ชำระแล้ว", className: "bg-green-100 text-green-700" },
  REFUNDED: { text: "คืนเงินแล้ว", className: "bg-slate-200 text-slate-600" },
};

export function StatusBadge({ status }: { status: string }) {
  const info = LABELS[status] ?? { text: status, className: "bg-slate-100" };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${info.className}`}
    >
      {info.text}
    </span>
  );
}
