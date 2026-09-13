import { AnimatePresence, motion } from "motion/react";
import { useChromeState } from "./chrome";
import { ChevronLeft } from "./icons";
import { morph, snappy } from "../motion/springs";

/**
 * Mounted once, above the router. Screens change what it says; the element
 * itself never unmounts, which is what makes navigation feel continuous.
 *
 * The bar itself is transparent — under the new design language the glass
 * belongs to the controls, not to a full-width slab.
 */
export function Header() {
  const { title, back, action } = useChromeState();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
      {/* Content passing underneath fades instead of meeting a hard divider. */}
      <div
        className="scroll-edge absolute inset-x-0 top-0"
        style={{ height: "calc(var(--safe-top, 0px) + 4.5rem)" }}
      />

      <div
        className="relative flex h-13 items-center gap-2 px-3"
        style={{ marginTop: "var(--safe-top, 0px)" }}
      >
        <div className="flex w-11 shrink-0 justify-start">
          <AnimatePresence initial={false}>
            {back && (
              <motion.button
                key="back"
                type="button"
                onClick={back}
                aria-label="Back"
                initial={{ opacity: 0, scale: 0.6, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.6, x: -6 }}
                whileTap={{ scale: 0.88 }}
                transition={snappy}
                className="glass pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full text-white"
              >
                <ChevronLeft className="h-[19px] w-[19px]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={morph}
              className="truncate text-[17px] font-semibold tracking-tight"
            >
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Stays mounted across screens; only its state changes. */}
        <div className="flex w-11 shrink-0 justify-end">
          <AnimatePresence initial={false}>
            {action && (
              <motion.button
                key="action"
                type="button"
                onClick={action.onPress}
                aria-label={action.label}
                aria-pressed={action.active}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileTap={{ scale: 0.88 }}
                transition={snappy}
                className={`glass pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full ${
                  action.active ? "glass-strong text-blue-300" : "text-white/85"
                }`}
              >
                {action.icon}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
