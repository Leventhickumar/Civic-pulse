import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ComplaintCard from "../components/ComplaintCard";
import EmptyState from "../components/EmptyState";
import FilterBar from "../components/FilterBar";
import LoadingSkeleton from "../components/LoadingSkeleton";
import StatCounter from "../components/StatCounter";
import { getApiErrorMessage } from "../utils/api";

export default function Home({ showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [filters, setFilters] = useState({ search: "", category: "", status: "", ward: "" });
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pulsingId, setPulsingId] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    setSkip(0);
  }, [sortBy, filters.search, filters.category, filters.status, filters.ward]);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (skip === 0) setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        );
        const { data } = await api.get("/complaints", {
          params: {
            ...cleanFilters,
            search: filters.search,
            sort_by: sortBy,
            skip,
            limit: 10,
          },
        });
        if (skip === 0) {
          setComplaints(data);
        } else {
          setComplaints((current) => [...current, ...data]);
        }
        setHasMore(data.length === 10);
      } catch (error) {
        showToast(getApiErrorMessage(error, "Failed to load complaints"), "error");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [sortBy, filters.search, filters.category, filters.status, filters.ward, skip]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get("/stats");
      setStats(data);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to load dashboard stats"), "error");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpvote = async (complaintId) => {
    if (!isLoggedIn) {
      showToast("Please login to upvote complaints", "error");
      return;
    }

    try {
      const { data } = await api.post(`/complaints/${complaintId}/upvote`);
      setPulsingId(complaintId);
      window.setTimeout(() => setPulsingId((current) => (current === complaintId ? null : current)), 450);
      setComplaints((current) =>
        current.map((complaint) =>
          complaint.id === complaintId ? { ...complaint, upvote_count: data.upvote_count } : complaint
        )
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to update upvote"), "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-[2rem] bg-brand-ink px-6 py-10 text-white shadow-float md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Public Grievance Tracking</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">Report local issues, rally support, and track every update.</h1>
            <p className="mt-4 text-sm text-slate-200">
              CivicPulse gives residents a single view of complaints across wards, from potholes to power cuts.
            </p>
          </div>
          <Link
            to={isLoggedIn ? "/file" : "/login"}
            className="inline-flex w-fit rounded-full bg-white px-6 py-3 font-semibold text-brand-ink transition hover:bg-slate-100"
          >
            File a Complaint
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCounter label="Total Complaints" value={statsLoading ? 0 : stats.total} accentClass="shadow-inner" />
          <StatCounter label="Resolved" value={statsLoading ? 0 : stats.resolved} accentClass="shadow-inner" />
          <StatCounter label="Pending" value={statsLoading ? 0 : stats.pending} accentClass="shadow-inner" />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <FilterBar
          filters={filters}
          sortBy={sortBy}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onSortChange={setSortBy}
        />
      </div>

      <div className="mt-6 mb-2 font-semibold text-slate-500">
        Showing {complaints.length} complaints
      </div>

      <section className="space-y-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} card />)
        ) : complaints.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No complaints yet"
            description="Try widening the ward or status filters to surface more reports from nearby neighborhoods."
            action={
              <Link to="/file" className="inline-flex rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white hover:scale-[1.02] transition">
                Be the first to file one
              </Link>
            }
          />
        ) : (
          complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onUpvote={handleUpvote}
              canUpvote
              isPulsing={pulsingId === complaint.id}
            />
          ))
        )}
        
        {hasMore && !loading && complaints.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setSkip((prev) => prev + 10)}
              className="rounded-full bg-brand-mist px-6 py-3 font-semibold text-brand-ink transition hover:bg-slate-200 hover:scale-[1.02]"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
