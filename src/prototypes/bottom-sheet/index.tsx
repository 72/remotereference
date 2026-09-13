import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { useNavigate } from "react-router-dom";
import { places } from "./data";
import { useChrome } from "../../shell/chrome";
import { sheet as sheetSpring } from "../../motion/springs";

/** Visible height of the sheet at its smallest detent. */
const PEEK = 152;
/** Middle detent, as a fraction of the sheet's full height. */
const HALF = 0.45;
/** Travel before a gesture's direction can be trusted. */
const CLAIM_THRESHOLD = 2;
/** Resistance applied past the first and last detent. */
const RUBBER = 0.4;
/**
 * UIScrollView's deceleration constant. Projecting where a throw *would* come
 * to rest is what makes a flick and a slow drag to the same release point
 * settle differently — objective 2.5.
 */
const DECELERATION = 0.9975;

const project = (position: number, velocity: number) =>
  position + (velocity * DECELERATION) / (1 - DECELERATION);

const resist = (value: number, min: number, max: number) => {
  if (value < min) return min - (min - value) * RUBBER;
  if (value > max) return max + (value - max) * RUBBER;
  return value;
};

export default function BottomSheet() {
  const navigate = useNavigate();
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const y = useMotionValue(0);
  const [height, setHeight] = useState(0);
  const [detentIndex, setDetentIndex] = useState(1);

  useChrome({ title: "Nearby", back: () => navigate("/"), hideTabBar: true }, []);

  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const measure = () => setHeight(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ascending: [full, half, peek]. Deduped so a short sheet can't produce
  // two detents at the same offset.
  const detents = useMemo(() => {
    if (!height) return [0];
    return [...new Set([0, Math.round(height * HALF), Math.max(0, height - PEEK)])].sort(
      (a, b) => a - b,
    );
  }, [height]);

  const minY = detents[0];
  const maxY = detents[detents.length - 1];
  const atFull = detentIndex === 0;

  // Refs the gesture reads without re-binding on every render.
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const detentsRef = useRef(detents);
  detentsRef.current = detents;

  const settled = useRef(false);
  useEffect(() => {
    if (!height || settled.current) return;
    settled.current = true;
    y.set(detents[1] ?? 0);
    setDetentIndex(detents.length > 1 ? 1 : 0);
  }, [height, detents, y]);

  const goTo = (index: number) => {
    const targets = detentsRef.current;
    const clamped = Math.max(0, Math.min(index, targets.length - 1));
    setDetentIndex(clamped);
    animationRef.current?.stop();
    animationRef.current = animate(y, targets[clamped], sheetSpring);
  };

  const settle = (position: number, signedVelocity: number) => {
    const targets = detentsRef.current;
    const landing = project(position, signedVelocity);
    let best = 0;
    targets.forEach((t, i) => {
      if (Math.abs(t - landing) < Math.abs(targets[best] - landing)) best = i;
    });
    goTo(best);
  };

  /**
   * Gesture arbitration — the hard part.
   *
   * Once the browser has begun a native scroll for a touch, it cannot be taken
   * back: preventDefault() on a later touchmove is ignored. So the decision of
   * who owns the gesture has to be made on its FIRST move, and the listener has
   * to be non-passive — which is why this binds via `target` rather than
   * spreading props (React attaches its own listeners passively).
   *
   * The rule, matching how a sheet behaves natively:
   *   - started outside the scroller (grabber / header) → the sheet
   *   - sheet not at its top detent → the sheet, since content must not scroll
   *     while the sheet is partially open
   *   - at the top detent, content already at scrollTop 0, dragging down → the
   *     sheet. This is the handoff.
   *   - anything else → leave it alone and let the content scroll natively,
   *     which keeps real momentum rather than a reimplementation of it.
   */
  const claim = useRef<boolean | null>(null);
  const startY = useRef(0);

  useDrag(
    ({ first, last, movement: [, my], velocity: [, vy], direction: [, dy], event }) => {
      if (first) {
        // Interruptibility: catch whatever is in flight and continue from there
        // rather than from wherever the animation was headed.
        animationRef.current?.stop();
        startY.current = y.get();
        claim.current = null;
      }

      if (claim.current === null) {
        if (Math.abs(my) < CLAIM_THRESHOLD) return;
        const scroller = scrollerRef.current;
        const target = event.target as Node | null;
        const insideScroller = !!scroller && !!target && scroller.contains(target);

        claim.current =
          !insideScroller ||
          startY.current > 1 ||
          (scroller!.scrollTop <= 0 && my > 0);
      }

      if (!claim.current) return;
      if (event.cancelable) event.preventDefault();

      const next = resist(startY.current + my, minY, maxY);
      if (last) settle(next, vy * dy);
      else y.set(next);
    },
    {
      target: sheetRef,
      axis: "y",
      filterTaps: true,
      // Required to preventDefault at all; only possible via `target`.
      eventOptions: { passive: false },
    },
  );

  const scrimOpacity = useTransform(y, [minY, maxY], [0.32, 0]);

  return (
    <div className="relative h-full">
      <MapBackdrop />

      <motion.div
        className="absolute inset-0 bg-[#37352f]"
        style={{ opacity: scrimOpacity }}
        onClick={() => goTo(detents.length - 1)}
      />

      <motion.div
        ref={sheetRef}
        style={{ y, top: "calc(var(--chrome-top) + 0.5rem)" }}
        className="glass-strong glass absolute inset-x-0 bottom-0 flex flex-col rounded-t-[var(--radius-sheet)]"
      >
        {/* Grabber and header always belong to the sheet, never to the scroller. */}
        <div className="shrink-0 touch-none px-4 pt-2.5 pb-3">
          <button
            type="button"
            onClick={() => goTo(detentIndex === 0 ? detents.length - 1 : detentIndex - 1)}
            aria-label="Cycle sheet height"
            className="mx-auto block h-[5px] w-9 rounded-full bg-[rgba(55,53,47,0.22)]"
          />
          <div className="mt-3 flex items-baseline justify-between">
            <h2 className="text-[20px] font-bold tracking-tight">Nearby</h2>
            <span className="text-ink-3 text-[13px]">{places.length} places</span>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="scrollbar-none min-h-0 flex-1 px-4"
          style={{
            // Scrolling is only available at the top detent; below it the sheet
            // owns every vertical gesture.
            overflowY: atFull ? "auto" : "hidden",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
            paddingBottom: "calc(var(--safe-bottom, 0px) + 1.5rem)",
          }}
        >
          <ul className="flex flex-col gap-1.5">
            {places.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-[var(--radius-inset)] p-2 text-left active:bg-[rgba(55,53,47,0.05)]"
                >
                  <span
                    className="h-11 w-11 shrink-0 rounded-[0.7rem]"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold tracking-tight">
                      {p.name}
                    </span>
                    <span className="text-ink-2 block truncate text-[13px]">{p.kind}</span>
                  </span>
                  <span className="text-ink-3 shrink-0 text-[13px]">{p.distance}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

/** Something for the sheet to sit over, so the material and depth read. */
function MapBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e9e7e2]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(55,53,47,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(55,53,47,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-1/4 -left-10 h-56 w-72 rotate-12 rounded-[3rem] bg-[#d7e3d2]" />
      <div className="absolute right-4 bottom-1/3 h-40 w-40 rounded-full bg-[#cfe0ea]" />
      <div className="absolute top-1/3 left-1/3 h-2 w-[140%] -rotate-[24deg] bg-[#e4dfd6]" />
    </div>
  );
}
