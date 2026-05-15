import { useState } from "react";
import { formatRelativeTime } from "../utils/complaints";

export default function CommentsSection({ comments, isLoggedIn, submitting, onSubmit }) {
  const [content, setContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const shouldReset = await onSubmit(trimmed);
    if (shouldReset !== false) {
      setContent("");
    }
  };

  return (
    <section className="rounded-[2rem] bg-white/90 p-6 shadow-float">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-brand-ink">Comments</h2>
        <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand-ink">{comments.length}</span>
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Add context, updates, or support for this complaint"
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{content.length}/1000 characters</p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-2xl bg-brand-mist px-4 py-3 text-sm text-slate-600">Log in to join the discussion on this complaint.</p>
      )}

      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No comments yet. Be the first to add context or support.</div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-3xl bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-brand-ink">{comment.user?.name || "Citizen"}</p>
                <p className="text-xs text-slate-500">{formatRelativeTime(comment.created_at)}</p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{comment.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
