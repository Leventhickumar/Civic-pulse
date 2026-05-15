import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import CategoryBadge from "../components/CategoryBadge";
import CommentsSection from "../components/CommentsSection";
import LoadingSkeleton from "../components/LoadingSkeleton";
import StatusBadge from "../components/StatusBadge";
import StatusHistorySection from "../components/StatusHistorySection";
import StatusTimeline from "../components/StatusTimeline";
import { getApiErrorMessage } from "../utils/api";
import { formatRelativeTime } from "../utils/complaints";

export default function ComplaintDetail({ showToast }) {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const [complaintResponse, commentsResponse, historyResponse] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/complaints/${id}/comments`),
        api.get(`/complaints/${id}/history`),
      ]);
      setComplaint(complaintResponse.data);
      setComments(commentsResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to load complaint"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleUpvote = async () => {
    if (!isLoggedIn) {
      showToast("Please login to upvote complaints", "error");
      return;
    }

    try {
      const { data } = await api.post(`/complaints/${id}/upvote`);
      setComplaint((current) => ({ ...current, upvote_count: data.upvote_count }));
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to update upvote"), "error");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Complaint link copied to clipboard");
    } catch {
      showToast("Failed to copy complaint link", "error");
    }
  };

  const handleCommentSubmit = async (content) => {
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      complaint_id: id,
      user_id: currentUser?.id,
      content,
      created_at: new Date().toISOString(),
      user: currentUser,
    };

    setCommentSubmitting(true);
    setComments((current) => [optimisticComment, ...current]);

    try {
      const { data } = await api.post(`/complaints/${id}/comments`, { content });
      setComments((current) => [data, ...current.filter((comment) => comment.id !== optimisticComment.id)]);
      showToast("Comment added");
      return true;
    } catch (error) {
      setComments((current) => current.filter((comment) => comment.id !== optimisticComment.id));
      showToast(getApiErrorMessage(error, "Failed to add comment"), "error");
      return false;
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <LoadingSkeleton card />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!complaint) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-slate-500">Complaint not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[2rem] bg-white/90 p-8 shadow-float">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryBadge category={complaint.category} />
            <StatusBadge status={complaint.status} />
          </div>

          <h1 className="mt-4 text-4xl font-black text-brand-ink">{complaint.title}</h1>
          <p className="mt-3 text-sm text-slate-500">
            Ward {complaint.ward} • Filed {formatRelativeTime(complaint.created_at)} by {complaint.user?.name || "Citizen"}
          </p>

          <p className="mt-6 whitespace-pre-line text-slate-700">{complaint.description}</p>

          {complaint.image_url && (
            <img
              src={`http://localhost:8000${complaint.image_url}`}
              alt={complaint.title}
              className="mt-6 h-72 w-full rounded-3xl object-cover"
            />
          )}

          {complaint.resolution_note && (complaint.status === "resolved" || complaint.status === "rejected") ? (
            <div className={`mt-6 rounded-3xl p-5 text-sm ${complaint.status === "resolved" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
              <p className="font-semibold">Resolution note</p>
              <p className="mt-2">{complaint.resolution_note}</p>
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Support</p>
            <div className="mt-3 text-4xl font-black text-brand-ink">{complaint.upvote_count}</div>
            <p className="text-sm text-slate-500">citizens backing this complaint</p>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={handleUpvote}
                className="w-full rounded-2xl bg-brand-ink px-4 py-3 font-semibold text-white"
              >
                Toggle Upvote
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600"
              >
                Share Complaint
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
            <p className="text-lg font-bold text-brand-ink">Status Timeline</p>
            <div className="mt-5">
              <StatusTimeline status={complaint.status} />
            </div>
            {complaint.status === "rejected" ? <p className="mt-4 text-sm text-rose-600">This complaint was rejected after review.</p> : null}
          </div>
        </section>
      </div>

      <CommentsSection
        comments={comments}
        isLoggedIn={isLoggedIn}
        submitting={commentSubmitting}
        onSubmit={handleCommentSubmit}
      />
      <StatusHistorySection history={history} />
    </div>
  );
}
