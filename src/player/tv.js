import { useSyncExternalStore } from "react";
import { streams } from "../data/config.js";
import { activeChannel, claim, register, release } from "./channels.js";

// The live TV player. It lives outside React, so playback survives page changes.
// There is exactly one <video> element. Pages and the mini-player take turns holding it.

const PREFS_KEY = "itv-player";
const MAX_RETRIES = 5;

const clamp01 = (n) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 1));

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

let video = null; // the one <video> element
let parking = null; // hidden holder used when no page or mini-player wants the video
let slot = null; // the page slot currently holding the video
let miniSlot = null; // the mini-player's slot
let hls = null;
let retries = 0;
let mediaRecoveries = 0;
let retryTimer = 0;

// status: idle | connecting | playing | paused | buffering | reconnecting | offline
let state = {
  status: "idle",
  session: false, // the visitor has pressed play and has not closed the player
  started: false, // a first frame has been shown in this session
  playing: false,
  auto: false, // started by itself (muted, on the front page) and not yet touched by the visitor
  ...loadPrefs(),
  pip: false,
  levels: [], // [{ index, height }]
  level: -1, // -1 = automatic quality
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

function ensureVideo() {
  if (video) return video;

  video = document.createElement("video");
  video.className = "tv-video";
  video.setAttribute("playsinline", "");
  video.setAttribute("aria-label", "ITV live television");
  video.preload = "none";
  video.volume = state.volume;
  video.muted = state.muted;

  parking = document.createElement("div");
  parking.setAttribute("aria-hidden", "true");
  parking.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  document.body.appendChild(parking);
  parking.appendChild(video);

  video.addEventListener("playing", () => {
    retries = 0;
    mediaRecoveries = 0;
    set({ status: "playing", started: true, playing: true });
  });
  video.addEventListener("pause", () => {
    if (state.session && state.status !== "offline" && state.status !== "reconnecting") {
      set({ status: "paused", playing: false });
    }
  });
  video.addEventListener("waiting", () => {
    if (state.status === "playing") set({ status: "buffering" });
  });
  video.addEventListener("loadedmetadata", () => {
    // A recorded test stream has an end. Loop it so it behaves like a broadcast that never stops.
    video.loop = Number.isFinite(video.duration);
  });
  video.addEventListener("volumechange", () => {
    set({ volume: video.volume, muted: video.muted });
    if (!state.auto) savePrefs();
  });
  video.addEventListener("enterpictureinpicture", () => set({ pip: true }));
  video.addEventListener("leavepictureinpicture", () => set({ pip: false }));
  video.addEventListener("error", () => {
    // With hls.js, errors are handled by its own error event. This covers native playback.
    if (state.session && !hls && state.status !== "idle") retry();
  });

  window.addEventListener("online", () => {
    if (state.session && (state.status === "reconnecting" || state.status === "offline")) start();
  });
  window.addEventListener("offline", () => {
    if (state.session && state.started) set({ status: "reconnecting" });
  });

  return video;
}

// Put the video where it belongs: a page slot first, then the mini-player, then the hidden holder.
function place() {
  const v = ensureVideo();
  const target = slot || miniSlot || parking;
  if (!target || v.parentNode === target) return;

  const wasPlaying = state.playing;
  target.appendChild(v);
  // Moving the element in one go should not interrupt playback. If a browser pauses it anyway, resume.
  if (wasPlaying) {
    setTimeout(() => {
      if (state.session && v.paused) v.play().catch(() => {});
    }, 80);
  }
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
  const v = ensureVideo();
  destroyHls();
  const url = streams.tv;

  // Safari and iPhones play HLS natively.
  if (v.canPlayType("application/vnd.apple.mpegurl")) {
    v.src = url;
    return;
  }

  // Everyone else uses hls.js, loaded only now.
  const { default: Hls } = await import("hls.js");
  if (!Hls.isSupported()) {
    v.src = url;
    return;
  }

  hls = new Hls({ backBufferLength: 30, capLevelToPlayerSize: true, startLevel: 0 });
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    const seen = new Set();
    const levels = hls.levels
      .map((l, index) => ({ index, height: l.height }))
      .filter((l) => l.height && !seen.has(l.height) && seen.add(l.height))
      .sort((a, b) => b.height - a.height);
    set({ levels, level: -1 });
  });
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
  hls.attachMedia(v);
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
  if (video) {
    video.removeAttribute("src");
    video.load();
  }
  set({ status: "offline", playing: false, started: false, levels: [], level: -1 });
}

function retry() {
  scheduleRetry(start);
}

// ---------- controls ----------

// auto: true = started by the front page, false = started by the visitor, undefined = keep as it was.
async function start(auto) {
  const v = ensureVideo();
  if (auto !== undefined) claim("tv"); // starting the video stops the radio
  if (auto === true) {
    v.muted = true;
    set({ auto: true });
  } else if (auto === false) {
    set({ auto: false });
  }
  set({ session: true, status: "connecting", playing: false });

  if (!streams.tv) {
    fail();
    return;
  }

  try {
    await load();
    await v.play();
  } catch (err) {
    if (err && err.name === "NotAllowedError") set({ status: "paused", playing: false });
    else if (err && err.name === "AbortError") return; // a newer start() took over
    else fail();
  }
}

function resume() {
  const v = ensureVideo();
  // A real live stream has no end. After a pause, rejoin the live edge. A recorded stream just continues.
  if (v.duration === Infinity) {
    try {
      if (hls && hls.liveSyncPosition) v.currentTime = hls.liveSyncPosition;
      else if (v.seekable.length) v.currentTime = v.seekable.end(v.seekable.length - 1);
    } catch {
      // some browsers refuse to seek a live stream, playing from here is fine
    }
  }
  v.play().catch(() => {});
}

// Any deliberate action by the visitor takes over from autoplay.
function engage() {
  if (state.auto) set({ auto: false });
}

function toggle() {
  engage();
  const v = ensureVideo();
  if (!state.session || state.status === "idle" || state.status === "offline") start(false);
  else if (v.paused) resume();
  else v.pause();
}

function stop() {
  destroyHls();
  if (video) {
    if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  retries = 0;
  set({ session: false, started: false, playing: false, status: "idle", levels: [], level: -1, pip: false, auto: false });
  release("tv");
  // Autoplay may have silenced the video. Give the visitor's own volume settings back.
  if (video) {
    const prefs = loadPrefs();
    video.volume = prefs.volume;
    video.muted = prefs.muted;
  }
}

register("tv", stop);

function setVolume(value) {
  engage();
  const v = ensureVideo();
  v.volume = clamp01(value);
  v.muted = v.volume === 0;
}

function toggleMute() {
  engage();
  const v = ensureVideo();
  if (v.muted && v.volume === 0) v.volume = 0.5;
  v.muted = !v.muted;
}

async function togglePip() {
  engage();
  const v = ensureVideo();
  try {
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await v.requestPictureInPicture();
  } catch {
    // not available right now, nothing to do
  }
}

function setLevel(index) {
  engage();
  if (!hls) return;
  hls.currentLevel = index; // -1 = automatic
  set({ level: index });
}

// Autoplay is a courtesy, not a right: never on data saver or very slow connections.
function autoAllowed() {
  const c = typeof navigator !== "undefined" ? navigator.connection : null;
  if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""))) return false;
  return Boolean(streams.tv);
}

// Called by the front page when its live card scrolls into view.
function autoStart() {
  if (!autoAllowed()) return;
  if (activeChannel() === "radio") return; // the visitor is listening to the radio, do not talk over it
  if (state.session && !state.auto) return; // the visitor is already watching, leave it alone
  if (state.session && state.auto) {
    // Paused because the card scrolled away. Carry on.
    if (video && video.paused && state.status === "paused") video.play().catch(() => {});
    return;
  }
  start(true);
}

// Called when the card scrolls out of view or the tab is hidden. Saves data.
function autoPause() {
  if (state.session && state.auto && video && !video.paused) video.pause();
}

// Start downloading hls.js ahead of the first press of play, on browsers that need it.
function preload() {
  if (typeof document === "undefined") return;
  const v = ensureVideo();
  if (v.canPlayType("application/vnd.apple.mpegurl")) return;
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
  idle(() => import("hls.js"));
}

export const tvPlayer = {
  // where the video lives. passive: true means "just showing it", not "watching it".
  attach(el, opts) {
    slot = el;
    if (!opts || !opts.passive) engage();
    place();
  },
  release(el) {
    if (slot !== el) return;
    slot = null;
    // Leaving the front page while the video was only autoplaying: switch it off.
    if (state.auto) stop();
    place();
  },
  setMiniSlot(el) {
    miniSlot = el;
    if (video) place();
  },
  // controls
  toggle,
  start: () => start(false),
  stop: () => {
    engage();
    stop();
  },
  retry: () => start(false),
  engage,
  autoStart,
  autoPause,
  setVolume,
  toggleMute,
  togglePip,
  setLevel,
  preload,
  get pipSupported() {
    return typeof document !== "undefined" && Boolean(document.pictureInPictureEnabled);
  },
};

export function useTvPlayer() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}