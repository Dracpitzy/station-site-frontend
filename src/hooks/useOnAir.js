import { useMemo, useSyncExternalStore } from "react";
import { dateLabel, formatMinutes, getOnAir, stationClock } from "../data/schedule.js";

// One shared timer for the whole site, however many components use useOnAir().
// It wakes up just after each new minute starts and tells every subscriber.
const listeners = new Set();
let timer;

function notify() {
  listeners.forEach((l) => l());
  arm();
}

function arm() {
  clearTimeout(timer);
  timer = setTimeout(notify, 60000 - (Date.now() % 60000) + 100);
}

// Timers slow down in background tabs, so catch up the moment the tab is visible again.
function onVisible() {
  if (document.visibilityState === "visible") notify();
}

function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) {
    arm();
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

const getMinute = () => Math.floor(Date.now() / 60000);

/**
 * What is on air right now, on the station's clock.
 *
 * const { time, date, tv, radio } = useOnAir();
 * tv.current / tv.next / tv.later   the programme slots
 * tv.progress                       0 to 1 through the current programme
 * tv.minutesLeft                    minutes until the current programme ends
 */
export function useOnAir() {
  const minute = useSyncExternalStore(subscribe, getMinute, getMinute);

  return useMemo(() => {
    const ms = minute * 60000;
    const { day, minutes } = stationClock(ms);
    return {
      day,
      minutes,
      time: formatMinutes(minutes),
      date: dateLabel(ms),
      tv: getOnAir("tv", day, minutes),
      radio: getOnAir("radio", day, minutes),
    };
  }, [minute]);
}