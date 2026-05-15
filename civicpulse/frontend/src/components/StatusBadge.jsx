import { formatStatusLabel } from "../utils/complaints";

const statusColors = {
  filed: "bg-blue-100 text-blue-700",
  acknowledged: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-sky-100 text-sky-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status] || "bg-slate-100 text-slate-700"}`}>
      {formatStatusLabel(status)}
    </span>
  );
}
