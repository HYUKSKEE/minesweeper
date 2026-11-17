export function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="currentColor">
      <path d="M4 1.5a.75.75 0 0 1 .75.75v.4l7.2 2.6a.5.5 0 0 1 0 .94L4.75 8.8v4.95a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 4 1.5Z" />
    </svg>
  );
}

export function MineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="currentColor">
      <circle cx="8" cy="8" r="3.6" />
      <path
        d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2M3.4 3.4l1.5 1.5M11.1 11.1l1.5 1.5M12.6 3.4l-1.5 1.5M4.9 11.1l-1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
