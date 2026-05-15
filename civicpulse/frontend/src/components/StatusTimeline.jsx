import { formatStatusLabel } from "../utils/complaints";

const defaultSteps = ["filed", "acknowledged", "in_progress", "resolved"];

export default function StatusTimeline({ status }) {
  const steps = status === "rejected" ? ["filed", "acknowledged", "in_progress", "rejected"] : defaultSteps;
  const currentIndex = steps.indexOf(status);

  return (
    <div className="space-y-4">
      <div className="hidden items-start justify-between gap-3 md:flex">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isPast = currentIndex > index;

          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    isCurrent
                      ? "border-brand-clay bg-brand-clay text-white"
                      : isPast
                        ? "border-slate-300 bg-slate-300 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`mt-1.5 text-center text-xs font-semibold ${isCurrent ? "text-brand-ink" : "text-slate-500"}`}>
                  {formatStatusLabel(step)}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div className="mt-5 h-1 flex-1 rounded-full bg-slate-200">
                  <div className={`h-1 rounded-full ${isPast ? "w-full bg-slate-300" : isCurrent ? "w-1/2 bg-brand-sky" : "w-0"}`} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-3 md:hidden">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isPast = currentIndex > index;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  isCurrent ? "border-brand-clay bg-brand-clay" : isPast ? "border-slate-300 bg-slate-300" : "border-slate-300 bg-white"
                }`}
              />
              <p className={`text-sm font-semibold ${isCurrent ? "text-brand-ink" : "text-slate-500"}`}>{formatStatusLabel(step)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
