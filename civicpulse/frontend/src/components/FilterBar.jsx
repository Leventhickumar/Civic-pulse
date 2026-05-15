import { useEffect, useState } from "react";
import useDebounce from "../utils/useDebounce";
import { getCategoryMeta } from "../utils/complaints";

const categories = ["", "pothole", "water", "electricity", "garbage", "other"];
const statuses = ["", "filed", "acknowledged", "in_progress", "resolved", "rejected"];

export default function FilterBar({ filters, onChange, onSortChange, sortBy }) {
  const [searchText, setSearchText] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchText, 400);
  const isSearching = searchText !== debouncedSearch;

  useEffect(() => {
    onChange("search", debouncedSearch);
  }, [debouncedSearch, onChange]);

  useEffect(() => {
    setSearchText(filters.search || "");
  }, [filters.search]);

  return (
    <div className="space-y-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-float">
      <div>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search complaints by title, description, or ward"
            className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-12 outline-none focus:border-brand-sky"
          />
          {searchText ? (
            <button
              type="button"
              onClick={() => setSearchText("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 transition hover:text-slate-600"
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="mt-2 min-h-5 text-xs text-slate-500">{isSearching ? "Searching..." : ""}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.category}
          onChange={(event) => onChange("category", event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
        >
          {categories.map((category) => (
            <option key={category || "all"} value={category}>
              {category ? `${getCategoryMeta(category).icon} ${getCategoryMeta(category).label}` : "All Categories"}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => onChange("status", event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
        >
          {statuses.map((status) => (
            <option key={status || "all"} value={status}>
              {status ? status.replace("_", " ") : "All Statuses"}
            </option>
          ))}
        </select>

        <input
          value={filters.ward}
          onChange={(event) => onChange("ward", event.target.value)}
          placeholder="Filter by ward"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
        />

        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-sky"
        >
          <option value="upvotes">Sort by Upvotes</option>
          <option value="recent">Sort by Recent</option>
        </select>
      </div>
    </div>
  );
}
