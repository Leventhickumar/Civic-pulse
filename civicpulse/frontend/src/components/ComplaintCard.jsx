import { Link } from "react-router-dom";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime, getCategoryMeta } from "../utils/complaints";

export default function ComplaintCard({ complaint, onUpvote, canUpvote = true, isPulsing = false }) {
  const categoryMeta = getCategoryMeta(complaint.category);

  return (
    <Link to={`/complaint/${complaint.id}`} className={`group block rounded-3xl border border-white/70 border-l-4 ${categoryMeta.borderClass} bg-white/90 p-6 shadow-float backdrop-blur transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:shadow-lg`}>
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={complaint.category} />
              <StatusBadge status={complaint.status} />
            </div>
            <h2 className="text-xl font-bold text-brand-ink transition group-hover:text-brand-sky">
              {complaint.title}
            </h2>
            <p className="text-sm text-slate-500">
              Ward {complaint.ward} • Filed {formatRelativeTime(complaint.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`rounded-2xl bg-brand-mist px-4 py-2 text-center transition ${isPulsing ? "scale-105 animate-pulse" : ""}`}>
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-brand-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M14 9V5.5A2.5 2.5 0 0 0 11.5 3L7 10v11h10.28a2 2 0 0 0 1.96-1.62l1.31-7A2 2 0 0 0 18.59 10H15a1 1 0 0 1-1-1ZM5 10H3v11h2V10Z" />
                </svg>
                {complaint.upvote_count}
              </div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Upvotes</div>
            </div>
            {canUpvote && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onUpvote?.(complaint.id);
                }}
                className="rounded-2xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-slate-800"
              >
                Support
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-end">
          <span className="text-sm font-semibold text-brand-clay transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-ink">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
