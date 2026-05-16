import { formatStatusLabel } from "../utils/complaints";

const statusColors = {
  filed: "bg-blue-100 text-blue-700",
  acknowledged: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusDots = {
  filed: "bg-blue-500",
  acknowledged: "bg-yellow-500",
  in_progress: "bg-purple-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status] || "bg-slate-100 text-slate-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status] || "bg-slate-500"}`}></span>
      {formatStatusLabel(status)}
    </span>
  );
}
