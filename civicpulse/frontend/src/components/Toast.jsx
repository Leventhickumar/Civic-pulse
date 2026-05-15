export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-brand-ink px-5 py-4 text-white shadow-float">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{toast.type === "error" ? "Something went wrong" : "Success"}</p>
          <p className="mt-1 text-sm text-slate-100">{toast.message}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xl leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
