import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ComplaintCard from "../components/ComplaintCard";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { getApiErrorMessage } from "../utils/api";

export default function MyComplaints({ showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMine = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/complaints/mine");
        setComplaints(data);
      } catch (error) {
        showToast(getApiErrorMessage(error, "Failed to load your complaints"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMine();
  }, [showToast]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-[2rem] bg-white/90 p-8 shadow-float">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Citizen View</p>
        <h1 className="mt-3 text-4xl font-black text-brand-ink">My Complaints</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">Track the issues you’ve filed and jump back into the details anytime.</p>
      </section>

      <section className="mt-8 space-y-5">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => <LoadingSkeleton key={index} card />)
        ) : complaints.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="You haven't filed anything yet"
            description="When something needs attention in your ward, start a report and we’ll help you track it from filing to resolution."
            action={
              <Link to="/file" className="inline-flex rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white hover:scale-[1.02] transition">
                File your first complaint
              </Link>
            }
          />
        ) : (
          complaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} canUpvote={false} />)
        )}
      </section>
    </div>
  );
}
