import { getCategoryMeta } from "../utils/complaints";

export default function CategoryBadge({ category, className = "" }) {
  const meta = getCategoryMeta(category);

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass} ${className}`}>
      <span aria-hidden="true">{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
