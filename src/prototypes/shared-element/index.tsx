import { useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { useNavigate } from "react-router-dom";
import { records, type Record } from "./data";
import { useChrome } from "../../shell/chrome";
import { Bookmark } from "../../shell/icons";
import { fade, morph, snappy } from "../../motion/springs";

/** Past this, or thrown faster than this, the detail dismisses. */
const DISMISS_OFFSET = 110;
const DISMISS_VELOCITY = 0.5; // px/ms

export default function SharedElement() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const open = openId ? records.find((r) => r.id === openId) : undefined;
  const isSaved = open ? saved.has(open.id) : false;

  const toggleSaved = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // The same header element serves both screens — only its state changes.
  useChrome(
    {
      title: open ? open.title : "Collection",
      back: open ? () => setOpenId(null) : () => navigate("/"),
      action: open
        ? {
            icon: <Bookmark filled={isSaved} />,
            label: isSaved ? "Remove bookmark" : "Bookmark",
            active: isSaved,
            onPress: () => toggleSaved(open.id),
          }
        : undefined,
      hideTabBar: Boolean(open),
    },
    [open?.id, isSaved],
  );

  return (
    <div className="relative h-full">
      <div
        className="scrollbar-none h-full overflow-y-auto overscroll-contain px-4"
        style={{
          paddingTop: "calc(var(--chrome-top) + 0.5rem)",
          paddingBottom: "var(--chrome-bottom)",
        }}
      >
        <div className="flex flex-col gap-2.5">
          {records.map((r) => (
            <ListCard
              key={r.id}
              record={r}
              saved={saved.has(r.id)}
              onPress={() => setOpenId(r.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && <Detail key={open.id} record={open} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ListCard({
  record,
  saved,
  onPress,
}: {
  record: Record;
  saved: boolean;
  onPress: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      layoutId={`card-${record.id}`}
      transition={morph}
      whileTap={{ scale: 0.975 }}
      className="glass flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-card)] p-2.5 text-left"
    >
      <motion.div
        layoutId={`media-${record.id}`}
        transition={morph}
        className="h-16 w-16 shrink-0 rounded-[var(--radius-inset)]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${record.accent[0]}, ${record.accent[1]})`,
        }}
      />
      <div className="min-w-0 flex-1">
        <motion.h3
          layoutId={`title-${record.id}`}
          transition={morph}
          className="truncate text-[15px] font-semibold tracking-tight"
        >
          {record.title}
        </motion.h3>
        <p className="truncate text-[13px] text-ink-2">{record.subtitle}</p>
      </div>
      {saved && <Bookmark filled className="mr-1 h-4 w-4 shrink-0 text-accent" />}
    </motion.button>
  );
}

function Detail({ record, onClose }: { record: Record; onClose: () => void }) {
  const y = useMotionValue(0);
  const scrimOpacity = useTransform(y, [0, 320], [1, 0.2]);
  const scale = useTransform(y, [0, 320], [1, 0.92]);
  const radius = useTransform(y, [0, 120], [0, 40]);
  const dragging = useRef(false);

  // Drag lives on the hero only, so the body below can scroll natively.
  const bindHero = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (last) {
        dragging.current = false;
        if (my > DISMISS_OFFSET || (vy > DISMISS_VELOCITY && dy > 0)) onClose();
        else animate(y, 0, snappy);
        return;
      }
      dragging.current = true;
      // Upward travel resists rather than stopping dead.
      y.set(my < 0 ? my * 0.25 : my);
    },
    // Pointer events, not touch — the same gesture must work under a mouse in
    // the desktop device frame and under a finger on a phone.
    { axis: "y", filterTaps: true },
  );

  return (
    <div className="absolute inset-0 z-20">
      <motion.div
        className="absolute inset-0 bg-[#37352f]"
        style={{ opacity: scrimOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
      />

      <motion.div className="absolute inset-0" style={{ y, scale }}>
        {/* Opaque: a full-screen sheet gains nothing from translucency, and
            letting the scrim bleed through only muddies the ground. */}
        <motion.div
          layoutId={`card-${record.id}`}
          transition={morph}
          style={{ borderRadius: radius }}
          className="bg-raised ring-hairline flex h-full flex-col overflow-hidden ring-1 ring-inset"
        >
          <motion.div
            layoutId={`media-${record.id}`}
            transition={morph}
            className="relative h-72 w-full shrink-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${record.accent[0]}, ${record.accent[1]})`,
            }}
          >
            {/* Plain element: use-gesture's DOM handlers and Motion's props don't mix. */}
            <div {...bindHero()} className="absolute inset-0 touch-none">
              <div
                className="absolute inset-x-0 flex justify-center"
                style={{ top: "calc(var(--safe-top, 0px) + 0.5rem)" }}
              >
                <div className="glass h-1.5 w-10 rounded-full" />
              </div>
            </div>
          </motion.div>

          <div
            className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5"
            style={{ paddingBottom: "calc(var(--safe-bottom, 0px) + 2rem)" }}
          >
            <motion.h2
              layoutId={`title-${record.id}`}
              transition={morph}
              className="text-[26px] leading-tight font-bold tracking-tight"
            >
              {record.title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ...morph, delay: 0.04 }}
            >
              <p className="mt-1 text-[14px] text-ink-2">{record.subtitle}</p>
              <p className="mt-0.5 font-mono text-[11px] tracking-wide text-ink-3 uppercase">
                {record.meta}
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-ink">{record.body}</p>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-3">
                Drag the image down to dismiss — a slow drag past the threshold and a fast
                flick below it both close, because release reads velocity, not just distance.
                Grab it again mid-flight to catch it.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
