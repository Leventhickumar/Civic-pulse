export default function EmptyState({ icon, title, description, action = null }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-float">
      {icon ? (
        <div className="mb-4 text-6xl">{icon}</div>
      ) : (
        <svg viewBox="0 0 220 140" className="mx-auto h-36 w-full max-w-xs text-brand-sky" fill="none" aria-hidden="true">
          <rect x="35" y="36" width="150" height="72" rx="16" fill="currentColor" opacity="0.12" />
          <path d="M54 96h112" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.45" />
          <path d="M66 78h40M66 64h72" stroke="#17324d" strokeWidth="6" strokeLinecap="round" />
          <circle cx="154" cy="70" r="16" fill="#c97b63" opacity="0.2" />
          <path d="M148 70l4 4 8-8" stroke="#c97b63" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <h3 className="mt-4 text-2xl font-black text-brand-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
