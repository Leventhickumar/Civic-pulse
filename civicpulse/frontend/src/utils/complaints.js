export const CATEGORY_META = {
  pothole: {
    icon: "🕳️",
    label: "Pothole",
    badgeClass: "bg-orange-100 text-orange-700",
    borderClass: "border-l-orange-400",
  },
  water: {
    icon: "💧",
    label: "Water",
    badgeClass: "bg-cyan-100 text-cyan-700",
    borderClass: "border-l-sky-400",
  },
  electricity: {
    icon: "⚡",
    label: "Electricity",
    badgeClass: "bg-amber-100 text-amber-700",
    borderClass: "border-l-amber-400",
  },
  garbage: {
    icon: "🗑️",
    label: "Garbage",
    badgeClass: "bg-emerald-100 text-emerald-700",
    borderClass: "border-l-emerald-400",
  },
  other: {
    icon: "📋",
    label: "Other",
    badgeClass: "bg-slate-200 text-slate-700",
    borderClass: "border-l-slate-400",
  },
};

export const STATUS_LABELS = {
  filed: "Filed",
  acknowledged: "Acknowledged",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export function getCategoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.other;
}

export function formatStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (Number.isNaN(date.getTime())) {
    return "";
  }
  if (diff < 60) {
    return "just now";
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)} minutes ago`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hours ago`;
  }
  if (diff < 2592000) {
    return `${Math.floor(diff / 86400)} days ago`;
  }
  return date.toLocaleDateString();
}
