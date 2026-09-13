import { AnimatePresence, motion } from "motion/react";
import { useChromeState } from "./chrome";
import { ChevronLeft } from "./icons";
import { fade, morph, snappy } from "../motion/springs";

/**
 * Mounted once, above the router. Screens change what it says; the element
 * itself never unmounts, which is what makes navigation feel continuous.
 */
export function Header() {
  const { title, back, action } = useChromeState();

  return (
    <header
      className="relative z-30 shrink-0 bg-black/70 backdrop-blur-xl"
      style={{ paddingTop: "var(--safe-top, 0px)" }}
    >
      <div className="flex h-11 items-center gap-1 px-2">
        <AnimatePresence initial={false}>
          {back && (
            <motion.button
              key="back"
              type="button"
              onClick={back}
              aria-label="Back"
              initial={{ width: 0, opacity: 0, x: -8 }}
              animate={{ width: 30, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -8 }}
              transition={snappy}
              className="flex h-9 shrink-0 items-center justify-center overflow-hidden text-blue-400"
            >
              <ChevronLeft />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={morph}
              className="truncate px-1 text-[17px] font-semibold tracking-tight"
            >
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Stays mounted across screens; only its state changes. */}
        <AnimatePresence initial={false}>
          {action && (
            <motion.button
              key="action"
              type="button"
              onClick={action.onPress}
              aria-label={action.label}
              aria-pressed={action.active}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              whileTap={{ scale: 0.86 }}
              transition={snappy}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                action.active ? "text-blue-400" : "text-white/70"
              }`}
            >
              {action.icon}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-white/10"
        animate={{ opacity: 1 }}
        transition={fade}
      />
    </header>
  );
}
