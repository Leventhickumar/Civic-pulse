import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CivicIcon from "./CivicIcon";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const linkClassName = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive ? "bg-brand-ink text-white" : "text-slate-600 hover:text-brand-ink"
    }`;

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/40 bg-white/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3 text-brand-ink" onClick={() => setMenuOpen(false)}>
            <div className="rounded-2xl bg-brand-mist p-2 text-brand-ink">
              <CivicIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">CivicPulse</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Civic Reporting</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-ink md:hidden"
          >
            Menu
          </button>
        </div>

        <div className={`${menuOpen ? "flex" : "hidden"} flex-col gap-4 pt-4 md:flex md:flex-row md:items-center md:justify-between md:pt-3`}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <NavLink to="/" className={linkClassName} onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/stats" className={linkClassName} onClick={() => setMenuOpen(false)}>
              Stats
            </NavLink>
            {token ? (
              <NavLink to="/file" className={linkClassName} onClick={() => setMenuOpen(false)}>
                File Complaint
              </NavLink>
            ) : null}
            {token ? (
              <NavLink to="/my-complaints" className={linkClassName} onClick={() => setMenuOpen(false)}>
                My Complaints
              </NavLink>
            ) : null}
            {user?.role === "admin" ? (
              <NavLink to="/admin" className={linkClassName} onClick={() => setMenuOpen(false)}>
                Admin
              </NavLink>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {token && user?.name ? <p className="text-sm font-semibold text-slate-600">{user.name}</p> : null}
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-brand-ink px-4 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="rounded-full bg-brand-ink px-4 py-2 text-center text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
