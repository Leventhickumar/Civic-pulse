export default function CivicIcon({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M10 54h44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M16 54V22l16-8 16 8v32"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 30h4M36 30h4M24 38h4M36 38h4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M29 54V44h6v10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 10v4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
