import { useEffect, useState, useSyncExternalStore } from "react";

// A page with a dark hero at the top registers it here, so the navbar knows
// when it is floating over something dark and can switch its text to white.
let section = null;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getSection = () => section;

// Call this in a page, passing a ref to its dark hero section.
export function useDarkNavSection(ref) {
  useEffect(() => {
    section = ref.current;
    listeners.forEach((l) => l());
    return () => {
      section = null;
      listeners.forEach((l) => l());
    };
  }, [ref]);
}

// Used by the navbar: true while the registered dark section sits behind it.
export function useNavOnDark() {
  const node = useSyncExternalStore(subscribe, getSection, () => null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!node) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const r = node.getBoundingClientRect();
      setDark(r.top <= 40 && r.bottom > 40);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [node]);

  return node ? dark : false;
}