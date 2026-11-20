import { useEffect, useState } from "react";
import { breaking as settings } from "../data/config";
import { BREAKING_DEMO, activeBreaking, demoBreaking, fetchBreaking } from "../lib/breaking";

// The stories that are breaking right now. It re-checks the clock, so a story drops out when its time is up,
// and with an API it asks for new ones every minute, so a freshly flagged story appears without a reload.
export function useBreaking() {
  const [stories, setStories] = useState(() => (BREAKING_DEMO ? demoBreaking() : []));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), settings.recheckMs);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (BREAKING_DEMO) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setStories(await fetchBreaking(controller.signal));
        setNow(Date.now());
      } catch {
        // Keep what is already on show. Each story still expires on its own clock.
      }
    };
    load();
    const timer = setInterval(load, settings.pollMs);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  return { list: activeBreaking(stories, now), now };
}
