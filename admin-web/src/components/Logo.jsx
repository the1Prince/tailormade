export default function Logo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M20 6v28M8 20h24M12 10l16 20M28 10L12 30"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <text x="20" y="26" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Georgia, serif" fontWeight="600">TM</text>
    </svg>
  );
}
