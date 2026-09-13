import { useEffect, useState } from "react";

const QUERY = "(min-width: 768px)";

/**
 * Framed on desktop so proportions stay honest while working on a laptop;
 * full-bleed on an actual phone, where the device supplies its own frame.
 */
export function useIsFramed() {
  const [framed, setFramed] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setFramed(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return framed;
}
