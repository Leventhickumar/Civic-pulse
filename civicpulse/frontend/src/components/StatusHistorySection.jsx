import { formatRelativeTime, formatStatusLabel } from "../utils/complaints";

export default function StatusHistorySection({ history }) {
  return (
    <section className="rounded-[2rem] bg-white/90 p-6 shadow-float">
      <h2 className="text-2xl font-black text-brand-ink">Status History</h2>
      <div className="mt-5 space-y-4">
        {history.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No status changes have been recorded yet.</div>
        ) : (
          history.map((entry) => (
            <article key={entry.id} className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-brand-ink">
                  {formatStatusLabel(entry.old_status)} to {formatStatusLabel(entry.new_status)}
                </p>
                <p className="text-xs text-slate-500">{formatRelativeTime(entry.changed_at)}</p>
              </div>
              <p className="mt-2 text-sm text-slate-500">Updated by {entry.actor?.name || "Admin"}</p>
              {entry.note ? <p className="mt-3 text-sm text-slate-600">{entry.note}</p> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
