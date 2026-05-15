import { useEffect, useState } from "react";
import api from "../api/axios";
import CategoryBadge from "../components/CategoryBadge";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import StatusBadge from "../components/StatusBadge";
import { getApiErrorMessage } from "../utils/api";
import { formatStatusLabel, getCategoryMeta } from "../utils/complaints";

const categories = ["", "pothole", "water", "electricity", "garbage", "other"];
const statuses = ["filed", "acknowledged", "in_progress", "resolved", "rejected"];
const rowTintClasses = {
  filed: "bg-blue-50/40",
  acknowledged: "bg-amber-50/45",
  in_progress: "bg-sky-50/50",
  resolved: "bg-emerald-50/40",
  rejected: "bg-rose-50/40",
};

export default function AdminDashboard({ showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", category: "", ward: "" });
  const [confirmState, setConfirmState] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsResponse, statsResponse] = await Promise.all([
        api.get("/admin/complaints", {
          params: Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
        }),
        api.get("/stats"),
      ]);
      setComplaints(complaintsResponse.data);
      setStats(statsResponse.data);
      setDrafts(
        complaintsResponse.data.reduce((accumulator, complaint) => {
          accumulator[complaint.id] = {
            status: complaint.status,
            resolution_note: complaint.resolution_note || "",
          };
          return accumulator;
        }, {})
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to load admin dashboard"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.status, filters.category, filters.ward]);

  const handleSave = async (complaintId) => {
    try {
      await api.patch(`/admin/complaints/${complaintId}/status`, drafts[complaintId]);
      showToast("Complaint status updated");
      await fetchData();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to update complaint"), "error");
    } finally {
      setConfirmState(null);
    }
  };

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.title.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await api.get("/admin/export/pdf", {
        params: Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "civicpulse_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Report downloaded");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to export report"), "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] bg-brand-ink p-8 text-white shadow-float">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-200">Monitor the complaint queue and keep citizens informed with timely updates.</p>
          </div>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {exporting ? "Generating..." : "⬇️ Export PDF"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-sm text-sky-100">Total</p>
            <p className="mt-2 text-3xl font-black">{stats?.total ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-blue-500/20 p-5">
            <p className="text-sm text-sky-100">Filed</p>
            <p className="mt-2 text-3xl font-black">{stats?.filed ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-sky-500/20 p-5">
            <p className="text-sm text-sky-100">In Progress</p>
            <p className="mt-2 text-3xl font-black">{stats?.in_progress ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-emerald-500/20 p-5">
            <p className="text-sm text-sky-100">Resolved</p>
            <p className="mt-2 text-3xl font-black">{stats?.resolved ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] bg-white/90 p-5 shadow-float">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search complaints by title"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          />
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          >
            <option value="">All Categories</option>
            {categories.map((category) =>
              category ? (
                <option key={category} value={category}>
                  {getCategoryMeta(category).icon} {getCategoryMeta(category).label}
                </option>
              ) : null
            )}
          </select>
          <input
            value={filters.ward}
            onChange={(event) => setFilters((current) => ({ ...current, ward: event.target.value }))}
            placeholder="Filter by ward"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          />
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[2rem] bg-white/90 shadow-float">
        {loading ? (
          <div className="space-y-4 p-8">
            <LoadingSkeleton rows={4} />
            <LoadingSkeleton rows={4} />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No complaints match your search"
              description="Try another title keyword to find the complaint you want to manage."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Ward</th>
                  <th className="px-6 py-4">Upvotes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Filed</th>
                  <th className="px-6 py-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className={`border-t border-slate-100 align-top ${rowTintClasses[complaint.status] || ""}`}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-brand-ink">{complaint.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{complaint.description}</p>
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      <CategoryBadge category={complaint.category} />
                    </td>
                    <td className="px-6 py-5 text-slate-600">{complaint.ward}</td>
                    <td className="px-6 py-5 text-slate-600">{complaint.upvote_count}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <div className="space-y-3">
                        <select
                          value={drafts[complaint.id]?.status || complaint.status}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [complaint.id]: {
                                ...current[complaint.id],
                                status: event.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-sky"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                        <input
                          value={drafts[complaint.id]?.resolution_note || ""}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [complaint.id]: {
                                ...current[complaint.id],
                                resolution_note: event.target.value,
                              },
                            }))
                          }
                          placeholder="Resolution note"
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-sky"
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmState({ complaintId: complaint.id, title: complaint.title })}
                          className="rounded-2xl bg-brand-clay px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {stats && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
            <h2 className="text-xl font-bold text-brand-ink">By Category</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(stats.by_category).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="capitalize text-slate-600">{key}</span>
                  <span className="font-bold text-brand-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
            <h2 className="text-xl font-bold text-brand-ink">By Ward</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(stats.by_ward).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">{key}</span>
                  <span className="font-bold text-brand-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmState)}
        title="Confirm Status Change"
        description={
          confirmState
            ? `Are you sure you want to mark "${confirmState.title}" as ${formatStatusLabel(drafts[confirmState.complaintId]?.status).toLowerCase()}?`
            : ""
        }
        confirmLabel="Yes, Save"
        onCancel={() => setConfirmState(null)}
        onConfirm={() => handleSave(confirmState.complaintId)}
      />
    </div>
  );
}
