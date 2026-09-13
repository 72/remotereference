import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChromeState } from "./chrome";
import { GridIcon, LayersIcon } from "./icons";
import { morph, snappy } from "../motion/springs";

const TABS = [
  // A prototype is a screen *within* the Prototypes section, so the tab stays
  // selected while you are inside one.
  { to: "/", label: "Prototypes", Icon: LayersIcon, owns: (p: string) => p === "/" || p.startsWith("/p/") },
  { to: "/gallery", label: "Gallery", Icon: GridIcon, owns: (p: string) => p.startsWith("/gallery") },
];

/**
 * A detached capsule floating over content rather than a bar welded to the
 * bottom edge — the structural half of the new design language.
 *
 * Also mounted once: entering a prototype slides it away instead of
 * unmounting it, so returning re-uses the same element.
 */
export function TabBar() {
  const { hideTabBar } = useChromeState();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // The bar floats *over* the home-indicator zone rather than clearing the
  // whole safe area, so the inset is capped: adding the full 34pt inset on top
  // of a gap leaves it stranded well above the bottom edge.
  const insetBottom = "calc(min(var(--safe-bottom, 0px), 1rem) + 0.5rem)";

  return (
    <motion.nav
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4"
      animate={{ y: hideTabBar ? 140 : 0, opacity: hideTabBar ? 0 : 1 }}
      transition={morph}
      style={{ paddingBottom: insetBottom }}
    >
      <div className="glass pointer-events-auto flex items-stretch gap-1 rounded-full p-1.5">
        {TABS.map(({ to, label, Icon, owns }) => {
          const active = owns(pathname);
          return (
            <motion.button
              key={to}
              type="button"
              onClick={() => navigate(to)}
              whileTap={{ scale: 0.94 }}
              transition={snappy}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-2"
            >
              {/* The selection is its own glass capsule that slides between tabs. */}
              {active && (
                <motion.span
                  layoutId="tab-selection"
                  transition={snappy}
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(55,53,47,0.12)]"
                />
              )}
              <motion.span
                animate={{ color: active ? "#37352f" : "#93908a" }}
                transition={snappy}
                className="relative flex items-center gap-1.5"
              >
                <Icon className="h-[19px] w-[19px]" />
                <span className="text-[13px] font-semibold tracking-tight">{label}</span>
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
