import { useSyncExternalStore } from "react";
import { station, streams } from "../data/config.js";
import { getOnAir, stationClock } from "../data/schedule.js";
import { photoProps } from "../data/images.js";
import { claim, register, release } from "./channels.js";

// The live radio player. Like the TV player it lives outside React, so the sound
// carries on while the visitor moves between pages. There is exactly one <audio> element,
// and it needs no holder in the page because sound has nothing to show.

const PREFS_KEY = "itv-radio";
const MAX_RETRIES = 5;
const META_REFRESH_MS = 60000;

const clamp01 = (n) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 1));
const isHls = (url) => /\.m3u8(\?|#|$)/i.test(url);

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    return { volume: clamp01(p?.volume ?? 1), muted: Boolean(p?.muted) };
  } catch {
    return { volume: 1, muted: false };
  }
}

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ volume: state.volume, muted: state.muted }));
  } catch {
    // storage can be blocked, the player works fine without it
  }
}

let audio = null; // the one <audio> element
let hls = null;
let retries = 0;
let mediaRecoveries = 0;
let retryTimer = 0;
let metaTimer = 0;
let startToken = 0; // lets a press of stop cancel a start that is still loading

// status: idle | connecting | playing | paused | buffering | reconnecting | offline
let state = {
  status: "idle",
  session: false, // the visitor has pressed play and has not closed the player
  started: false, // sound has played in this session
  playing: false,
  ...loadPrefs(),
};

const listeners = new Set();
function set(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- the element ----------

function ensureAudio() {
  if (audio) return audio;

  audio = new Audio();
  audio.preload = "none";
  audio.volume = state.volume;
  audio.muted = state.muted;

  audio.addEventListener("playing", () => {
    retries = 0;
    mediaRecoveries = 0;
    set({ status: "playing", started: true, playing: true });
  });
  audio.addEventListener("pause", () => {
    if (state.session && state.status !== "offline" && state.status !== "reconnecting") {
      set({ status: "paused", playing: false });
    }
  });
  audio.addEventListener("waiting", () => {
    if (state.status === "playing") set({ status: "buffering" });
  });
  audio.addEventListener("loadedmetadata", () => {
    // A recorded test stream has an end. Loop it so it behaves like a broadcast that never stops.
    audio.loop = Number.isFinite(audio.duration);
  });
  audio.addEventListener("volumechange", () => {
    set({ volume: audio.volume, muted: audio.muted });
    savePrefs();
  });
  audio.addEventListener("error", () => {
    // With hls.js, errors are handled by its own error event. This covers native playback.
    if (state.session && !hls && state.status !== "idle") retry();
  });
  audio.addEventListener("ended", () => {
    // A live stream that ends has lost its connection.
    if (state.session && !hls) retry();
  });

  window.addEventListener("online", () => {
    if (state.session && (state.status === "reconnecting" || state.status === "offline")) start();
  });
  window.addEventListener("offline", () => {
    if (state.session && state.started) set({ status: "reconnecting" });
  });

  return audio;
}

// ---------- loading ----------

function destroyHls() {
  clearTimeout(retryTimer);
  if (hls) {
    hls.destroy();
    hls = null;
  }
}

async function load() {
  const a = ensureAudio();
  destroyHls();
  const url = streams.radio;

  // MP3 and AAC streams (Icecast, Shoutcast) play natively. Safari and iPhones play HLS natively too.
  if (!isHls(url) || a.canPlayType("application/vnd.apple.mpegurl")) {
    a.src = url;
    return;
  }

  const { default: Hls } = await import("hls.js");
  if (!Hls.isSupported()) {
    a.src = url;
    return;
  }

  hls = new Hls({ backBufferLength: 30 });
  hls.on(Hls.Events.ERROR, (_, data) => {
    if (!data.fatal) return;
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
      scheduleRetry(() => hls && hls.startLoad());
    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveries++ < 2) {
      hls.recoverMediaError();
    } else {
      fail();
    }
  });
  hls.loadSource(url);
  hls.attachMedia(a);
}

function scheduleRetry(action) {
  if (retries >= MAX_RETRIES) {
    fail();
    return;
  }
  retries++;
  set({ status: "reconnecting" });
  clearTimeout(retryTimer);
  retryTimer = setTimeout(action, 1500 * retries);
}

function fail() {
  destroyHls();
  if (audio) {
    audio.removeAttribute("src");
    audio.load();
  }
  unbindMediaSession();
  set({ status: "offline", playing: false, started: false });
}

function retry() {
  scheduleRetry(start);
}

// ---------- lock screen and headset controls ----------

const hasMediaSession = () =>
  typeof navigator !== "undefined" && "mediaSession" in navigator && typeof MediaMetadata !== "undefined";

function syncMediaSession() {
  if (!hasMediaSession()) return;
  const { day, minutes } = stationClock();
  const show = getOnAir("radio", day, minutes).current;
  const art = photoProps("radio", [256, 512, 1024]);
  navigator.mediaSession.metadata = new MediaMetadata({
    title: show.title,
    artist: `${station.name} Radio ${station.frequency}`,
    album: "Live radio",
    artwork: [{ src: art.src, sizes: "512x512" }],
  });
}

function bindMediaSession() {
  if (!hasMediaSession()) return;
  syncMediaSession();
  // The programme changes through the day, so keep the title on the lock screen up to date.
  clearInterval(metaTimer);
  metaTimer = setInterval(syncMediaSession, META_REFRESH_MS);

  const on = (action, handler) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // this browser does not offer that button
    }
  };
  on("play", () => {
    if (!audio || audio.paused) toggle();
  });
  on("pause", () => {
    if (audio && !audio.paused) audio.pause();
  });
  on("stop", stop);
}

function unbindMediaSession() {
  clearInterval(metaTimer);
  if (!hasMediaSession()) return;
  for (const action of ["play", "pause", "stop"]) {
    try {
      navigator.mediaSession.setActionHandler(action, null);
    } catch {
      // nothing to undo
    }
  }
  navigator.mediaSession.metadata = null;
}

// ---------- controls ----------

async function start() {
  claim("radio");
  const a = ensureAudio();
  const token = ++startToken;
  set({ session: true, status: "connecting", playing: false });
  bindMediaSession();

  if (!streams.radio) {
    fail();
    return;
  }

  try {
    await load();
    if (token !== startToken) {
      destroyHls(); // the visitor pressed stop while this was loading
      return;
    }
    await a.play();
  } catch (err) {
    if (err && err.name === "NotAllowedError") set({ status: "paused", playing: false });
    else if (err && err.name === "AbortError") return; // a newer start() or a stop took over
    else fail();
  }
}

function resume() {
  const a = ensureAudio();
  if (hls) {
    // A live broadcast has no end. After a pause, rejoin the live edge.
    try {
      if (hls.liveSyncPosition) a.currentTime = hls.liveSyncPosition;
    } catch {
      // some browsers refuse to seek a live stream, playing from here is fine
    }
    a.play().catch(() => {});
    return;
  }
  // A direct stream keeps old sound in its buffer. Reconnect so the visitor hears the broadcast as it is now.
  start();
}

function toggle() {
  if (!state.session || state.status === "idle" || state.status === "offline") start();
  else if (state.status === "connecting" || state.status === "reconnecting") stop();
  else if (ensureAudio().paused) resume();
  else audio.pause();
}

function stop() {
  startToken++;
  destroyHls();
  unbindMediaSession();
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }
  retries = 0;
  set({ session: false, started: false, playing: false, status: "idle" });
  release("radio");
}

function setVolume(value) {
  const a = ensureAudio();
  a.volume = clamp01(value);
  a.muted = a.volume === 0;
}

function toggleMute() {
  const a = ensureAudio();
  if (a.muted && a.volume === 0) a.volume = 0.5;
  a.muted = !a.muted;
}

// iPhones keep the volume under the hardware buttons. The page uses this to hide a slider that would do nothing.
let volumeSettable = null;
function canSetVolume() {
  if (volumeSettable === null) {
    const probe = new Audio();
    probe.volume = 0.5;
    volumeSettable = probe.volume === 0.5;
  }
  return volumeSettable;
}

register("radio", stop);

export const radioPlayer = {
  toggle,
  start,
  stop,
  retry: start,
  setVolume,
  toggleMute,
  get volumeSettable() {
    return typeof Audio === "undefined" ? true : canSetVolume();
  },
};

export function useRadioPlayer() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}