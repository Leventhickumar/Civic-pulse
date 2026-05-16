export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const borderClass = isError ? "border-l-4 border-red-500" : "border-l-4 border-green-500";
  const icon = isError ? "✕" : "✓";
  const iconColor = isError ? "text-red-500 bg-red-100" : "text-green-500 bg-green-100";

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-4 rounded-2xl bg-brand-ink px-5 py-4 text-white shadow-float animate-slideInRight ${borderClass}`}>
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{isError ? "Something went wrong" : "Success"}</p>
        <p className="mt-1 text-sm text-slate-300">{toast.message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-xl leading-none text-slate-400 hover:text-white">
        ×
      </button>
    </div>
  );
}
