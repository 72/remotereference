import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChromeState } from "./chrome";
import { GridIcon, LayersIcon } from "./icons";
import { morph, snappy } from "../motion/springs";

const TABS = [
  { to: "/", label: "Prototypes", Icon: LayersIcon },
  { to: "/gallery", label: "Gallery", Icon: GridIcon },
];

/**
 * Also mounted once. Entering a prototype slides it out of the way rather than
 * unmounting it, so returning re-uses the same element.
 */
export function TabBar() {
  const { hideTabBar } = useChromeState();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      className="relative z-30 shrink-0 border-t border-white/10 bg-black/70 backdrop-blur-xl"
      animate={{ y: hideTabBar ? "100%" : "0%" }}
      transition={morph}
      style={{ paddingBottom: "var(--safe-bottom, 0px)" }}
    >
      <div className="flex h-[49px] items-stretch">
        {TABS.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <button
              key={to}
              type="button"
              onClick={() => navigate(to)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  transition={snappy}
                  className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-blue-400"
                />
              )}
              <motion.span
                animate={{ color: active ? "rgb(96 165 250)" : "rgba(255,255,255,0.45)" }}
                transition={snappy}
                className="flex flex-col items-center gap-0.5"
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[10px] font-medium tracking-tight">{label}</span>
              </motion.span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
