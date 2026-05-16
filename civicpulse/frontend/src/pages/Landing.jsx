import { Link } from "react-router-dom";
import CivicIcon from "../components/CivicIcon";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Landing() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, resolution_rate: 0 });

  useEffect(() => {
    api.get("/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans animate-fadeIn">
      {/* Navbar specific to Landing */}
      <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/85 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-ink">
            <div className="rounded-2xl bg-brand-mist p-2 text-brand-ink">
              <CivicIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">CivicPulse</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="rounded-full border border-brand-ink px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-mist transition">Login</Link>
            <Link to="/register" className="rounded-full bg-brand-ink px-4 py-2 text-sm font-semibold text-white hover:scale-102 hover:bg-slate-800 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-ink to-slate-900 px-4 py-24 text-center text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">Your city. Your voice. Your record.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">CivicPulse lets you file civic complaints, rally community support, and hold local authorities accountable — all in one transparent platform.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="rounded-full bg-brand-sky px-8 py-4 text-lg font-bold text-white transition hover:scale-105 hover:bg-sky-400">File a Complaint &rarr;</Link>
            <Link to="/leaderboard" className="rounded-full border border-slate-500 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur transition hover:bg-white/20">View Public Feed</Link>
          </div>
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-4xl font-black">{stats.total}</p>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mt-1">Total Complaints</p>
            </div>
            <div>
              <p className="text-4xl font-black">{stats.resolved}</p>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mt-1">Resolved</p>
            </div>
            <div>
              <p className="text-4xl font-black">{stats.resolution_rate}%</p>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mt-1">Resolution Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-brand-ink text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-float text-center border border-slate-100">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-mist text-2xl font-black text-brand-ink">1</div>
              <h3 className="mt-6 text-xl font-bold text-brand-ink">Report</h3>
              <p className="mt-3 text-slate-600">Describe your issue with photo evidence and specific location details.</p>
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-float text-center border border-slate-100">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-mist text-2xl font-black text-brand-ink">2</div>
              <h3 className="mt-6 text-xl font-bold text-brand-ink">Rally Support</h3>
              <p className="mt-3 text-slate-600">Citizens upvote your complaint to prioritize it for local authorities.</p>
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-float text-center border border-slate-100">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-mist text-2xl font-black text-brand-ink">3</div>
              <h3 className="mt-6 text-xl font-bold text-brand-ink">Track Progress</h3>
              <p className="mt-3 text-slate-600">Get real-time status updates as authorities work to resolve the issue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-24 bg-white">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-12">
          <div>
            <div className="text-brand-sky mb-4 text-4xl">🔍</div>
            <h3 className="text-xl font-bold text-brand-ink">Transparent Tracking</h3>
            <p className="mt-2 text-slate-600 line-clamp-2">Every status change is logged publicly, ensuring authorities remain accountable.</p>
          </div>
          <div>
            <div className="text-brand-clay mb-4 text-4xl">⬆️</div>
            <h3 className="text-xl font-bold text-brand-ink">Community Upvoting</h3>
            <p className="mt-2 text-slate-600 line-clamp-2">The most urgent issues rise to the top of the feed through citizen support.</p>
          </div>
          <div>
            <div className="text-brand-ink mb-4 text-4xl">📄</div>
            <h3 className="text-xl font-bold text-brand-ink">PDF Reports</h3>
            <p className="mt-2 text-slate-600 line-clamp-2">Admins export structured reports to hand off directly to local authorities.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 px-4 py-12 text-slate-400 mt-auto">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2 text-white">
              <CivicIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">CivicPulse</p>
              <p className="text-xs">Making cities more accountable</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-semibold">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/stats" className="hover:text-white transition">Stats</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
