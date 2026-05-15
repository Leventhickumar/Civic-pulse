export default function LoadingSkeleton({ rows = 3, card = false, className = "" }) {
  if (card) {
    return (
      <div className={`overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-float ${className}`}>
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-7 w-3/5 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 h-4 w-2/5 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-float ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-4 animate-pulse rounded-full bg-slate-100" />
      ))}
    </div>
  );
}
