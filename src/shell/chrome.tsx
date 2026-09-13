import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DependencyList,
  type ReactNode,
} from "react";

export type ChromeAction = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  /** Drives the action's own in-place state change — it never remounts. */
  active?: boolean;
};

export type ChromeState = {
  title: string;
  /** Presence of a back handler is what makes the chevron animate in. */
  back?: () => void;
  action?: ChromeAction;
  hideTabBar?: boolean;
};

const DEFAULT: ChromeState = { title: "Playground" };

type ChromeStore = {
  chrome: ChromeState;
  setChrome: (next: ChromeState) => void;
};

const ChromeContext = createContext<ChromeStore>({
  chrome: DEFAULT,
  setChrome: () => {},
});

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<ChromeState>(DEFAULT);
  const value = useMemo(() => ({ chrome, setChrome }), [chrome]);
  return <ChromeContext value={value}>{children}</ChromeContext>;
}

export function useChromeState() {
  return useContext(ChromeContext).chrome;
}

/**
 * Screens declare what the persistent chrome should show.
 *
 * `deps` must include any state the action's onPress closes over, otherwise the
 * header would keep calling a stale callback.
 */
export function useChrome(state: ChromeState, deps: DependencyList) {
  const { setChrome } = useContext(ChromeContext);
  const latest = useRef(state);
  latest.current = state;

  const apply = useCallback(() => setChrome(latest.current), [setChrome]);

  useEffect(() => {
    apply();
  }, deps);
}
