import { useEffect, useState } from "react";

export default function StatCounter({ label, value, accentClass }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    const duration = 700;
    const start = performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <div className={`rounded-3xl border border-white/40 bg-white/10 p-5 backdrop-blur ${accentClass}`}>
      <p className="text-sm uppercase tracking-[0.18em] text-sky-100">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{displayValue}</p>
    </div>
  );
}
