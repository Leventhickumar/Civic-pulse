import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { getApiErrorMessage } from "../utils/api";
import { formatRelativeTime } from "../utils/complaints";

const categoryColors = {
  pothole: "#f97316",
  water: "#0ea5e9",
  electricity: "#eab308",
  garbage: "#10b981",
  other: "#94a3b8",
};

const statusColors = {
  filed: "#3b82f6",
  acknowledged: "#eab308",
  in_progress: "#8b5cf6",
  resolved: "#10b981",
  rejected: "#ef4444",
};

export default function StatsDashboard({ showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date().toISOString());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/stats");
        setStats(data);
        setLastUpdatedAt(new Date().toISOString());
      } catch (error) {
        showToast(getApiErrorMessage(error, "Failed to load stats dashboard"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLastUpdatedAt(new Date().toISOString());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const categoryData = useMemo(
    () =>
      stats
        ? Object.entries(stats.by_category).map(([name, value]) => ({
            name,
            value,
          }))
        : [],
    [stats]
  );

  const statusData = useMemo(
    () =>
      stats
        ? [
            { name: "Filed", value: stats.filed, key: "filed" },
            { name: "Acknowledged", value: stats.acknowledged, key: "acknowledged" },
            { name: "In Progress", value: stats.in_progress, key: "in_progress" },
            { name: "Resolved", value: stats.resolved, key: "resolved" },
            { name: "Rejected", value: stats.rejected, key: "rejected" },
          ]
        : [],
    [stats]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="rounded-[2rem] bg-brand-ink p-8 text-white shadow-float">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-200">Public Dashboard</p>
            <h1 className="mt-3 text-4xl font-black">CivicPulse Statistics</h1>
          </div>
          <p className="text-sm text-slate-200">Last updated: {formatRelativeTime(lastUpdatedAt) || "just now"}</p>
        </div>
      </section>

      {loading ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingSkeleton key={index} rows={3} />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <LoadingSkeleton rows={8} />
            <LoadingSkeleton rows={8} />
          </div>
          <LoadingSkeleton rows={10} />
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
              <p className="text-2xl">📋</p>
              <p className="mt-3 text-sm text-slate-500">Total Complaints</p>
              <p className="mt-2 text-4xl font-black text-brand-ink">{stats?.total ?? 0}</p>
            </div>
            <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
              <p className="text-2xl">✅</p>
              <p className="mt-3 text-sm text-slate-500">Resolved</p>
              <p className="mt-2 text-4xl font-black text-emerald-600">{stats?.resolved ?? 0}</p>
            </div>
            <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
              <p className="text-2xl">⏳</p>
              <p className="mt-3 text-sm text-slate-500">Pending</p>
              <p className="mt-2 text-4xl font-black text-amber-600">{stats?.pending ?? 0}</p>
            </div>
            <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
              <p className="text-2xl">📈</p>
              <p className="mt-3 text-sm text-slate-500">Resolution Rate</p>
              <p className="mt-2 text-4xl font-black text-brand-sky">{stats?.resolution_rate ?? 0}%</p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
              <h2 className="text-xl font-bold text-brand-ink">Complaints by Category</h2>
              <div className="mt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={categoryColors[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/90 p-6 shadow-float">
              <h2 className="text-xl font-bold text-brand-ink">Complaints by Status</h2>
              <div className="mt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {statusData.map((entry) => (
                        <Cell key={entry.key} fill={statusColors[entry.key]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] bg-white/90 p-6 shadow-float">
            <h2 className="text-xl font-bold text-brand-ink">Complaints Filed Over the Last 30 Days</h2>
            <div className="mt-6 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.by_date || []}>
                  <defs>
                    <linearGradient id="complaintTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5fa8d3" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5fa8d3" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="count" stroke="#5fa8d3" fill="url(#complaintTrend)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
