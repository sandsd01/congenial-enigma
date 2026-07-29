const LABELS: Record<string, { text: string; className: string }> = {
  PENDING: { text: "รอตรวจสอบ", className: "bg-accent/15 text-accent" },
  APPROVED: { text: "อนุมัติแล้ว", className: "bg-success-bg text-success" },
  REJECTED: { text: "ถูกปฏิเสธ", className: "bg-danger-bg text-danger" },
  SUSPENDED: { text: "ระงับ", className: "bg-surface-raised text-ink-muted" },
  CONFIRMED: { text: "ยืนยันแล้ว", className: "bg-info-bg text-info" },
  CANCELLED: { text: "ยกเลิก", className: "bg-surface-raised text-ink-muted" },
  COMPLETED: { text: "เสร็จสิ้น", className: "bg-success-bg text-success" },
  UNPAID: { text: "ยังไม่ชำระ", className: "bg-accent/15 text-accent" },
  PAID: { text: "ชำระแล้ว", className: "bg-success-bg text-success" },
  REFUNDED: {
    text: "คืนเงินแล้ว",
    className: "bg-surface-raised text-ink-muted",
  },
  VERIFIED: { text: "ยืนยันตัวตนแล้ว", className: "bg-success-bg text-success" },
};

export function StatusBadge({ status }: { status: string }) {
  const info = LABELS[status] ?? {
    text: status,
    className: "bg-surface-raised text-ink-muted",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${info.className}`}
    >
      {info.text}
    </span>
  );
}
