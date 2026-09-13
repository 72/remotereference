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
        className="relative h-[100dvh] w-full overflow-hidden bg-black"
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
    <div className="flex h-[100dvh] w-full items-center justify-center bg-neutral-900 p-6">
      <div
        className="relative rounded-[3.5rem] bg-black p-[3px] shadow-2xl ring-1 ring-white/10"
        style={{
          width: SCREEN.width + 6,
          height: SCREEN.height + 6,
          maxHeight: "calc(100dvh - 3rem)",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[3.3rem] bg-black"
          style={
            {
              "--safe-top": `${SCREEN.safeTop}px`,
              "--safe-bottom": `${SCREEN.safeBottom}px`,
            } as CSSProperties
          }
        >
          {children}
          <div className="pointer-events-none absolute top-[11px] left-1/2 h-[35px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
