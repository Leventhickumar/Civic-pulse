import { useState, useEffect } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import CivicIcon from "../components/CivicIcon";

export default function Leaderboard() {
  const [data, setData] = useState({ top_wards: [], top_categories: [], most_upvoted: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 animate-fadeIn">
        <p className="text-center text-slate-500 mt-10">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fadeIn">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-brand-ink">Community Leaderboard</h1>
        <p className="mt-2 text-lg text-slate-500">Most active wards and top complaints</p>
      </header>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Wards Activity Table */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-float">
            <h2 className="text-xl font-bold text-brand-ink mb-6 flex items-center gap-2">
              <CivicIcon className="h-6 w-6 text-brand-sky" /> Top Wards by Activity
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="rounded-tl-xl px-4 py-3">Ward</th>
                    <th className="px-4 py-3 text-center">Complaints</th>
                    <th className="px-4 py-3 text-center">Resolved</th>
                    <th className="rounded-tr-xl px-4 py-3">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.top_wards.map((ward, idx) => (
                    <tr key={ward.ward} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-brand-ink">
                        <span className="text-slate-400 mr-2">#{idx + 1}</span> {ward.ward}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{ward.count}</td>
                      <td className="px-4 py-3 text-center text-emerald-600 font-medium">{ward.resolved}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-brand-sky"
                              style={{ width: `${ward.resolution_rate}%` }}
                            ></div>
                          </div>
                          <span className="min-w-[3rem] text-right text-xs font-bold">{ward.resolution_rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.top_wards.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-400">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Categories */}
          <div className="rounded-[2rem] bg-white p-6 shadow-float">
            <h2 className="text-xl font-bold text-brand-ink mb-6">Complaints by Category</h2>
            <div className="space-y-4">
              {data.top_categories.map((cat, idx) => {
                const maxCount = Math.max(...data.top_categories.map(c => c.count), 1);
                const pct = (cat.count / maxCount) * 100;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span className="capitalize">{cat.category.replace(/_/g, " ")}</span>
                      <span className="text-slate-500">{cat.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-clay" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Most Supported Complaints */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-brand-ink flex items-center gap-2">
            <span className="text-2xl">🔥</span> Most Supported Complaints
          </h2>
          <div className="space-y-4">
            {data.most_upvoted.map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-brand-clay capitalize">{complaint.category.replace(/_/g, " ")}</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <h3 className="font-bold text-brand-ink line-clamp-2">{complaint.title}</h3>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>📍 {complaint.ward}</span>
                  <span className="flex items-center gap-1 font-bold text-brand-sky">
                    <span>⬆️</span> {complaint.upvote_count}
                  </span>
                </div>
              </div>
            ))}
            {data.most_upvoted.length === 0 && (
              <p className="text-center text-slate-400">No popular complaints yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
