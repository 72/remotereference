import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useDrag } from "@use-gesture/react";
import { useNavigate } from "react-router-dom";
import { sections, tracks, type Track } from "./data";
import { useChrome } from "../../shell/chrome";
import { morph, sheet, snappy, fade } from "../../motion/springs";

const COLLAPSE_OFFSET = 120;
const COLLAPSE_VELOCITY = 0.5; // px/ms
/** Fake playback duration, so the progress bar has something to do. */
const TRACK_SECONDS = 90;

export default function PersistentChrome() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<Track>(tracks[0]);
  const [playing, setPlaying] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // The shell's own header is reused: switching sections changes what it says
  // without the header itself ever unmounting.
  useChrome(
    {
      title: sections[index].title,
      back: () => navigate("/"),
      hideTabBar: true,
    },
    [index],
  );

  const progress = useMotionValue(0);
  useEffect(() => {
    if (!playing) return;
    const remaining = (1 - progress.get()) * TRACK_SECONDS;
    const controls = animate(progress, 1, { duration: remaining, ease: "linear" });
    return () => controls.stop();
  }, [playing, progress, current.id]);

  const select = (track: Track) => {
    setCurrent(track);
    progress.set(0);
    setPlaying(true);
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/*
        Panes live in one horizontal track and are never unmounted, so each
        section keeps its own scroll position for free — the same reason the
        shell mounts chrome above the router rather than inside it.
      */}
      <motion.div
        className="flex h-full"
        style={{ width: `${sections.length * 100}%` }}
        animate={{ x: `-${(index * 100) / sections.length}%` }}
        transition={morph}
      >
        {sections.map((section) => (
          <Pane key={section.id} width={100 / sections.length}>
            {section.id === "listen" && <ListenPane onSelect={select} current={current} />}
            {section.id === "browse" && <BrowsePane onSelect={select} />}
            {section.id === "library" && <LibraryPane onSelect={select} current={current} />}
          </Pane>
        ))}
      </motion.div>

      {/* Chrome sits outside the pager: it never moves, never unmounts. */}
      <TabBar index={index} onChange={setIndex} />

      <AnimatePresence>
        {!expanded && (
          <MiniPlayer
            track={current}
            playing={playing}
            progress={progress}
            onToggle={() => setPlaying((p) => !p)}
            onExpand={() => setExpanded(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && (
          <FullPlayer
            track={current}
            playing={playing}
            progress={progress}
            onToggle={() => setPlaying((p) => !p)}
            onCollapse={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Pane({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <div
      className="scrollbar-none h-full shrink-0 overflow-y-auto overscroll-contain px-4"
      style={{
        width: `${width}%`,
        paddingTop: "calc(var(--chrome-top) + 0.5rem)",
        // Clear the mini player and the tab bar below it.
        paddingBottom: "calc(var(--safe-bottom, 0px) + 9.5rem)",
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- sections */

function Artwork({ track, className = "" }: { track: Track; className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `linear-gradient(135deg, ${track.accent[0]}, ${track.accent[1]})`,
      }}
    />
  );
}

function TrackRow({
  track,
  active,
  onSelect,
}: {
  track: Track;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={snappy}
      className="flex w-full items-center gap-3 rounded-[var(--radius-inset)] p-2 text-left"
    >
      <Artwork track={track} className="h-11 w-11 shrink-0 rounded-[0.7rem]" />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-semibold tracking-tight ${
            active ? "text-accent" : ""
          }`}
        >
          {track.title}
        </span>
        <span className="text-ink-2 block truncate text-[13px]">{track.artist}</span>
      </span>
      <span className="text-ink-3 shrink-0 text-[13px]">{track.length}</span>
    </motion.button>
  );
}

function ListenPane({ onSelect, current }: { onSelect: (t: Track) => void; current: Track }) {
  const featured = tracks[0];
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(featured)}
        className="glass block w-full overflow-hidden rounded-[var(--radius-card)] text-left"
      >
        <Artwork track={featured} className="m-1.5 h-40 rounded-[var(--radius-inset)]" />
        <div className="px-4 pt-2 pb-4">
          <p className="text-ink-3 text-[11px] font-semibold tracking-wide uppercase">
            Featured
          </p>
          <h3 className="mt-1 text-[18px] font-bold tracking-tight">{featured.title}</h3>
          <p className="text-ink-2 text-[13px]">{featured.artist}</p>
        </div>
      </button>

      <h4 className="mt-5 mb-1 px-2 text-[13px] font-semibold tracking-tight">
        Recently played
      </h4>
      <div className="flex flex-col">
        {tracks.map((t) => (
          <TrackRow key={t.id} track={t} active={t.id === current.id} onSelect={() => onSelect(t)} />
        ))}
      </div>
    </>
  );
}

function BrowsePane({ onSelect }: { onSelect: (t: Track) => void }) {
  return (
    <>
      <p className="text-ink-3 mb-3 px-1 text-[13px]">Switch tabs — this keeps its scroll.</p>
      <div className="grid grid-cols-2 gap-3">
        {tracks.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            whileTap={{ scale: 0.97 }}
            transition={snappy}
            className="glass overflow-hidden rounded-[var(--radius-card)] text-left"
          >
            <Artwork track={t} className="m-1.5 aspect-square rounded-[var(--radius-inset)]" />
            <div className="px-3 pt-1 pb-3">
              <p className="truncate text-[14px] font-semibold tracking-tight">{t.title}</p>
              <p className="text-ink-2 truncate text-[12px]">{t.artist}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </>
  );
}

function LibraryPane({ onSelect, current }: { onSelect: (t: Track) => void; current: Track }) {
  return (
    <>
      <p className="text-ink-3 mb-1 px-1 text-[13px]">{tracks.length} songs</p>
      <div className="flex flex-col">
        {tracks.map((t) => (
          <TrackRow key={t.id} track={t} active={t.id === current.id} onSelect={() => onSelect(t)} />
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ chrome */

function TabBar({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  return (
    <nav
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4"
      style={{ paddingBottom: "calc(min(var(--safe-bottom, 0px), 1rem) + 0.5rem)" }}
    >
      <div className="glass pointer-events-auto flex items-stretch gap-1 rounded-full p-1.5">
        {sections.map((section, i) => {
          const active = i === index;
          return (
            <motion.button
              key={section.id}
              type="button"
              onClick={() => onChange(i)}
              whileTap={{ scale: 0.94 }}
              transition={snappy}
              className="relative rounded-full px-4 py-2"
            >
              {active && (
                <motion.span
                  layoutId="section-selection"
                  transition={snappy}
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(55,53,47,0.12)]"
                />
              )}
              <motion.span
                animate={{ color: active ? "#37352f" : "#93908a" }}
                transition={snappy}
                className="relative text-[13px] font-semibold tracking-tight"
              >
                {section.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <rect x="6.5" y="5" width="4" height="14" rx="1.3" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

type PlayerProps = {
  track: Track;
  playing: boolean;
  progress: ReturnType<typeof useMotionValue<number>>;
  onToggle: () => void;
};

function MiniPlayer({
  track,
  playing,
  progress,
  onToggle,
  onExpand,
}: PlayerProps & { onExpand: () => void }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-4 z-30"
      style={{ bottom: "calc(min(var(--safe-bottom, 0px), 1rem) + 4.25rem)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
    >
      <motion.button
        type="button"
        onClick={onExpand}
        layoutId="player-surface"
        transition={morph}
        className="glass glass-strong pointer-events-auto flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-card)] p-2 text-left"
      >
        <motion.div layoutId="player-art" transition={morph}>
          <Artwork track={track} className="h-10 w-10 rounded-[0.6rem]" />
        </motion.div>

        <motion.span
          layout="position"
          className="min-w-0 flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={fade}
        >
          <span className="block truncate text-[14px] font-semibold tracking-tight">
            {track.title}
          </span>
          <span className="text-ink-2 block truncate text-[12px]">{track.artist}</span>
        </motion.span>

        <span
          role="button"
          tabIndex={0}
          aria-label={playing ? "Pause" : "Play"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onKeyDown={(e) => e.key === "Enter" && onToggle()}
          className="text-ink mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <PlayIcon playing={playing} />
        </span>

        <motion.span
          className="bg-accent absolute inset-x-0 bottom-0 h-[2px] origin-left"
          style={{ scaleX: progress }}
        />
      </motion.button>
    </motion.div>
  );
}

function FullPlayer({
  track,
  playing,
  progress,
  onToggle,
  onCollapse,
}: PlayerProps & { onCollapse: () => void }) {
  const y = useMotionValue(0);
  const scrimOpacity = useTransform(y, [0, 360], [1, 0]);
  const scale = useTransform(y, [0, 360], [1, 0.9]);
  const radius = useTransform(y, [0, 140], [0, 36]);

  // No scroll inside the player, so there is no arbitration to do here —
  // the whole surface can own the gesture.
  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (last) {
        if (my > COLLAPSE_OFFSET || (vy > COLLAPSE_VELOCITY && dy > 0)) onCollapse();
        else animate(y, 0, sheet);
        return;
      }
      y.set(my < 0 ? my * 0.25 : my);
    },
    { axis: "y", filterTaps: true },
  );

  return (
    <div className="absolute inset-0 z-40">
      <motion.div
        className="absolute inset-0 bg-[#37352f]"
        style={{ opacity: scrimOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        exit={{ opacity: 0 }}
        transition={fade}
      />

      {/* Radius and drag transform stay on this wrapper: putting a MotionValue
          border-radius on the shared layoutId element leaves it stuck there. */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y, scale, borderRadius: radius }}
      >
        <motion.div
          layoutId="player-surface"
          transition={morph}
          className="bg-raised ring-hairline flex h-full flex-col ring-1 ring-inset"
        >
          <div {...bind()} className="flex-1 touch-none px-6 pt-3">
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Collapse player"
              className="mx-auto mb-8 block h-[5px] w-9 rounded-full bg-[rgba(55,53,47,0.22)]"
              style={{ marginTop: "var(--safe-top, 0px)" }}
            />

            <motion.div layoutId="player-art" transition={morph}>
              <Artwork
                track={track}
                className="aspect-square w-full rounded-[var(--radius-sheet)] shadow-[0_24px_60px_-20px_rgba(55,53,47,0.5)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ...morph, delay: 0.05 }}
              className="mt-8"
            >
              <h2 className="text-[24px] leading-tight font-bold tracking-tight">
                {track.title}
              </h2>
              <p className="text-ink-2 mt-0.5 text-[16px]">{track.artist}</p>

              <div className="mt-6 h-[4px] w-full overflow-hidden rounded-full bg-[rgba(55,53,47,0.12)]">
                <motion.div
                  className="bg-accent h-full w-full origin-left rounded-full"
                  style={{ scaleX: progress }}
                />
              </div>
              <div className="text-ink-3 mt-1.5 flex justify-between font-mono text-[11px]">
                <span>0:00</span>
                <span>{track.length}</span>
              </div>

              <div className="mt-7 flex items-center justify-center">
                <motion.button
                  type="button"
                  onClick={onToggle}
                  aria-label={playing ? "Pause" : "Play"}
                  whileTap={{ scale: 0.9 }}
                  transition={snappy}
                  className="bg-accent flex h-16 w-16 items-center justify-center rounded-full text-white"
                >
                  <span className="scale-150">
                    <PlayIcon playing={playing} />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
