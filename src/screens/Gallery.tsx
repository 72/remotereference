import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useChrome } from "../shell/chrome";
import { springs, type SpringToken } from "../motion/springs";

const TOKENS: SpringToken[] = ["smooth", "snappy", "bouncy", "morph"];

/**
 * Components in isolation. The spring inspector is deliberately first: motion
 * tokens are easier to judge by feel than by number.
 */
export default function Gallery() {
  useChrome({ title: "Gallery" }, []);

  const [token, setToken] = useState<SpringToken>("snappy");
  const [duration, setDuration] = useState(0.35);
  const [bounce, setBounce] = useState(0.15);
  const [custom, setCustom] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const travel = useTravel();

  const transition = custom
    ? ({ type: "spring", duration, bounce } as const)
    : springs[token];

  return (
    <div
      className="scrollbar-none h-full overflow-y-auto overscroll-contain px-4"
      style={{
        paddingTop: "calc(var(--chrome-top) + 0.5rem)",
        paddingBottom: "var(--chrome-bottom)",
      }}
    >
      <section className="glass rounded-[var(--radius-card)] p-4">
        <h2 className="text-[15px] font-semibold tracking-tight">Spring inspector</h2>
        <p className="mt-1 text-[13px] leading-snug text-white/45">
          Tap the track to replay. Motion's duration/bounce maps onto SwiftUI's
          response/dampingFraction.
        </p>

        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          ref={travel.ref}
          className="mt-4 flex h-20 w-full items-center rounded-[var(--radius-inset)] bg-black/30 px-3 ring-1 ring-white/10 ring-inset"
        >
          <motion.div
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500"
            animate={{ x: flipped ? travel.distance : 0 }}
            transition={transition}
          />
        </button>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {TOKENS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setToken(t);
                setCustom(false);
                setFlipped((f) => !f);
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                !custom && token === t
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustom(true)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
              custom ? "bg-blue-500 text-white" : "bg-white/10 text-white/60"
            }`}
          >
            custom
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Slider
            label="duration"
            value={custom ? duration : ((springs[token] as { duration?: number }).duration ?? 0)}
            min={0.1}
            max={1.2}
            step={0.01}
            disabled={!custom}
            onChange={(v) => {
              setDuration(v);
              setCustom(true);
            }}
          />
          <Slider
            label="bounce"
            value={custom ? bounce : ((springs[token] as { bounce?: number }).bounce ?? 0)}
            min={0}
            max={0.6}
            step={0.01}
            disabled={!custom}
            onChange={(v) => {
              setBounce(v);
              setCustom(true);
            }}
          />
        </div>
      </section>

      <section className="glass mt-3 rounded-[var(--radius-card)] p-4">
        <h2 className="text-[15px] font-semibold tracking-tight">Press states</h2>
        <p className="mt-1 text-[13px] leading-snug text-white/45">
          Scale on press, spring on release.
        </p>
        <div className="mt-3 flex gap-2.5">
          {["Primary", "Secondary"].map((label, i) => (
            <motion.button
              key={label}
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={springs.snappy}
              className={`flex-1 rounded-full py-3 text-[14px] font-semibold ${
                i === 0 ? "bg-blue-500 text-white" : "glass-strong glass text-white/85"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Travel distance is measured so the demo animates transform, never layout. */
function useTravel() {
  const ref = useRef<HTMLButtonElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setDistance(Math.max(0, el.clientWidth - 24 - 48));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, distance };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-white/60">{label}</span>
        <span className="font-mono text-[12px] text-white/40">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full accent-blue-500 ${disabled ? "opacity-50" : ""}`}
      />
    </label>
  );
}
