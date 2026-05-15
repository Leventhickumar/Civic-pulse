import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register({ showToast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Registration successful");
      navigate("/");
    } catch (error) {
      showToast(error.response?.data?.detail || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-md items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full rounded-[2rem] bg-white/90 p-8 shadow-float">
        <h1 className="text-3xl font-black text-brand-ink">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Join CivicPulse to raise issues and track progress in real time.</p>

        <div className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
            required
          />
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
          className="mt-6 w-full rounded-2xl bg-brand-clay px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-ink">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
