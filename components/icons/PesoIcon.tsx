export function PesoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 6h8a4 4 0 0 1 0 8H6" />
      <line x1="6" y1="6" x2="6" y2="20" />
      <line x1="3" y1="10" x2="11" y2="10" />
      <line x1="3" y1="14" x2="11" y2="14" />
    </svg>
  );
}
