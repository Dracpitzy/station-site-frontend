import { useEffect, useState } from "react";

// Works out whether the part of the live picture behind a floating control is bright or dark, so the
// control can be dark on a bright scene and white on a dark one.
// It reads a few pixels from the playing video about three times a second. If the browser does not
// allow reading the picture, it stays white and stops trying.
const BRIGHT_ABOVE = 0.6; // switch to dark controls above this
const DARK_BELOW = 0.45; // switch back to white controls below this (a gap, so it does not flicker)

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

// frameRef: the element holding the video. selector: the control to look behind. active: only while it is on show.
export function useVideoTone(frameRef, selector, active) {
  const [tone, setTone] = useState("dark");

  useEffect(() => {
    if (!active) return;
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 8;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let timer = 0;

    const sample = () => {
      const frame = frameRef.current;
      const video = frame && frame.querySelector("video");
      const control = frame && frame.querySelector(selector);
      if (!video || !control || video.readyState < 2 || !video.videoWidth) return;
      const f = frame.getBoundingClientRect();
      const c = control.getBoundingClientRect();
      if (!f.width || !c.width) return;
      // The video fills the frame and is cropped to cover it, so work out which part of the picture is behind the control
      const scale = Math.max(f.width / video.videoWidth, f.height / video.videoHeight);
      const offX = (f.width - video.videoWidth * scale) / 2;
      const offY = (f.height - video.videoHeight * scale) / 2;
      const sx = (c.left - f.left - offX) / scale;
      const sy = (c.top - f.top - offY) / scale;
      try {
        ctx.drawImage(video, sx, sy, c.width / scale, c.height / scale, 0, 0, 24, 8);
        const px = ctx.getImageData(0, 0, 24, 8).data;
        let sum = 0;
        for (let i = 0; i < px.length; i += 4) {
          sum += 0.2126 * channel(px[i]) + 0.7152 * channel(px[i + 1]) + 0.0722 * channel(px[i + 2]);
        }
        const level = sum / (px.length / 4);
        setTone((prev) => (prev === "dark" ? (level > BRIGHT_ABOVE ? "light" : "dark") : level < DARK_BELOW ? "dark" : "light"));
      } catch {
        clearInterval(timer); // the picture cannot be read here
        setTone("dark");
      }
    };

    sample();
    timer = setInterval(sample, 350);
    return () => clearInterval(timer);
  }, [frameRef, selector, active]);

  return tone;
}
