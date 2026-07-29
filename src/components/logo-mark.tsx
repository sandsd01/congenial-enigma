export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="RentCar"
    >
      <defs>
        <linearGradient id="logoGold" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#facc15" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path
        d="M 55.209 79.544 A 30 30 0 1 0 21.809 60.261"
        fill="none"
        stroke="url(#logoGold)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="35" cy="75.981" r="6.5" fill="url(#logoGold)" />
    </svg>
  );
}
