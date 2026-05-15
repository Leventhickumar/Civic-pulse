import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CategoryBadge from "../components/CategoryBadge";
import FileUploadDropzone from "../components/FileUploadDropzone";
import { getApiErrorMessage } from "../utils/api";

const categories = ["pothole", "water", "electricity", "garbage", "other"];
const MAX_DESCRIPTION_LENGTH = 500;

export default function FileComplaint({ showToast }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "pothole",
    ward: "",
    latitude: "",
    longitude: "",
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") {
        payload.append(key, value);
      }
    });
    if (image) payload.append("image", image);

    setLoading(true);
    try {
      const { data } = await api.post("/complaints", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showToast("Complaint filed successfully");
      setSubmittedComplaint(data);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Failed to file complaint"), "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "pothole",
      ward: "",
      latitude: "",
      longitude: "",
    });
    setImage(null);
    setSubmittedComplaint(null);
  };

  if (submittedComplaint) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-float">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
          <h1 className="mt-6 text-4xl font-black text-brand-ink">Complaint Submitted</h1>
          <p className="mt-3 text-sm text-slate-500">Your report is now live and ready for community support and admin review.</p>
          <div className="mt-6 rounded-3xl bg-brand-mist p-5">
            <p className="text-sm text-slate-500">Reference ID</p>
            <p className="mt-1 font-semibold text-brand-ink">{submittedComplaint.id}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={`/complaint/${submittedComplaint.id}`} className="rounded-2xl bg-brand-ink px-5 py-3 text-center font-semibold text-white">
              View Complaint
            </Link>
            <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600">
              File Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-white/90 p-8 shadow-float">
        <h1 className="text-3xl font-black text-brand-ink">File a complaint</h1>
        <p className="mt-2 text-sm text-slate-500">Share the issue clearly so the right team can act faster.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Complaint title"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky md:col-span-2"
            required
          />
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            value={form.ward}
            onChange={(event) => setForm({ ...form, ward: event.target.value })}
            placeholder="Ward"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
            required
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })}
            placeholder="Describe the issue"
            rows={6}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky md:col-span-2"
            maxLength={MAX_DESCRIPTION_LENGTH}
            required
          />
          <p className="text-right text-xs text-slate-500 md:col-span-2">{form.description.length}/{MAX_DESCRIPTION_LENGTH} characters</p>
          <input
            value={form.latitude}
            onChange={(event) => setForm({ ...form, latitude: event.target.value })}
            placeholder="Latitude (optional)"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          />
          <input
            value={form.longitude}
            onChange={(event) => setForm({ ...form, longitude: event.target.value })}
            placeholder="Longitude (optional)"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
          />
          <div className="md:col-span-2">
            <FileUploadDropzone file={image} previewUrl={previewUrl} onFileSelect={setImage} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-2xl bg-brand-clay px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
        </section>

        <aside className="rounded-[2rem] bg-white/90 p-8 shadow-float">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Preview</p>
          <h2 className="mt-3 text-2xl font-black text-brand-ink">{form.title || "Complaint title preview"}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CategoryBadge category={form.category} />
            <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand-ink">
              Ward {form.ward || "TBD"}
            </span>
          </div>
          <p className="mt-6 whitespace-pre-line text-sm text-slate-600">
            {form.description || "Describe the issue clearly so residents and administrators understand what needs attention."}
          </p>
          {previewUrl ? <img src={previewUrl} alt="Complaint preview" className="mt-6 h-48 w-full rounded-3xl object-cover" /> : null}
        </aside>
      </form>
    </div>
  );
}
