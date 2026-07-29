// Thin single-weight line marks, drawn in the same arc/point grammar as the
// RentCar logo mark, so the icon set reads as one considered system rather
// than a grab-bag of stock emoji.

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconListing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="5" y="6" width="22" height="20" rx="2" {...strokeProps} />
      <path d="M10 13h12M10 18h8" {...strokeProps} />
      <circle cx="22" cy="21.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHandshake({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M20.5 20.5a11 11 0 1 0-9 0" {...strokeProps} />
      <circle cx="10.3" cy="21.7" r="1.6" fill="currentColor" stroke="none" />
      <path d="M20.3 21.9l3.2 3.2" {...strokeProps} />
    </svg>
  );
}

export function IconPayout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 22V16M14 22V11M22 22V7" {...strokeProps} />
      <path d="M22 7l3.5 1.6M22 7l-1 3.8" {...strokeProps} />
    </svg>
  );
}
