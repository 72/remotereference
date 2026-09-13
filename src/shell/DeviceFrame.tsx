import type { CSSProperties, ReactNode } from "react";
import { useIsFramed } from "./useIsFramed";

/** iPhone 14/15 Pro logical size, and the insets iOS reserves on it. */
const SCREEN = { width: 390, height: 844, safeTop: 59, safeBottom: 34 };

/**
 * Screens read `--safe-top` / `--safe-bottom` rather than calling env() directly,
 * so the same layout code works framed on desktop and full-bleed on device.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const framed = useIsFramed();

  if (!framed) {
    return (
      <div
        className="bg-canvas relative h-full w-full overflow-hidden"
        style={
          {
            "--safe-top": "env(safe-area-inset-top, 0px)",
            "--safe-bottom": "env(safe-area-inset-bottom, 0px)",
          } as CSSProperties
        }
      >
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#e7e5e0] p-6">
      <div
        className="relative rounded-[3.5rem] bg-[#1c1b19] p-[3px] shadow-[0_24px_70px_-20px_rgba(55,53,47,0.45)]"
        style={{
          width: SCREEN.width + 6,
          height: SCREEN.height + 6,
          maxHeight: "calc(100dvh - 3rem)",
        }}
      >
        <div
          className="bg-canvas relative h-full w-full overflow-hidden rounded-[3.3rem]"
          style={
            {
              "--safe-top": `${SCREEN.safeTop}px`,
              "--safe-bottom": `${SCREEN.safeBottom}px`,
            } as CSSProperties
          }
        >
          {children}
          <div className="pointer-events-none absolute top-[11px] left-1/2 h-[35px] w-[125px] -translate-x-1/2 rounded-full bg-[#1c1b19]" />
        </div>
      </div>
    </div>
  );
}
