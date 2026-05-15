import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Logged in successfully");
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      showToast(error.response?.data?.detail || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-md items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full rounded-[2rem] bg-white/90 p-8 shadow-float">
        <h1 className="text-3xl font-black text-brand-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to file complaints and support issues in your neighborhood.</p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-brand-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="font-semibold text-brand-clay">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
