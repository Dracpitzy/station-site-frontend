import { useSyncExternalStore } from "react";

// True on a phone or a small tablet, where the navigation is the three glass pieces at the bottom of the screen.
const QUERY = "(max-width: 860px)";

export function useCompact() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(QUERY);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
