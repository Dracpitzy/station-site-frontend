import { useSyncExternalStore } from "react";

// True on a phone-sized screen. The front page uses it to swap in layouts made for phones.
const QUERY = "(max-width: 700px)";

export function useIsPhone() {
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