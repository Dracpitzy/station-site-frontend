import { useEffect, useState } from "react";

// Works out whether what is behind a floating element is light or dark, so its writing can be dark
// on light and white on dark. It looks at five points across the element and takes the majority.
//
// What it understands:
//  - an element, or a parent, marked data-tone="dark" or data-tone="light" (for sections whose
//    background is a gradient or a photograph, so there is no single colour to read)
//  - a solid background colour, whose brightness is measured
//  - a picture or video, counted as dark
//  - otherwise the page itself, which is white

const LIGHT_ABOVE = 0.45; // relative brightness above which a background counts as light

function parseColor(value) {
  const m = value && value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
}

// Brightness from 0 (black) to 1 (white), as the eye sees it
function brightness({ r, g, b }) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// The tone of the first thing that tells us, going down through the stack of elements at one point
export function toneFromElements(elements) {
  for (const el of elements) {
    if (el.closest(".mini, .nav, dialog")) continue;
    const hint = el.closest("[data-tone]");
    if (hint) return hint.dataset.tone === "dark" ? "dark" : "light";
    const color = parseColor(getComputedStyle(el).backgroundColor);
    if (color && color.a > 0.6) return brightness(color) > LIGHT_ABOVE ? "light" : "dark";
    if (el.tagName === "IMG" || el.tagName === "VIDEO") return "dark";
  }
  return "light";
}

function toneAt(x, y) {
  return toneFromElements(document.elementsFromPoint(x, y));
}

// ref: the element to watch. active: switch it off when it is not needed (hidden, or on a phone).
export function useBackdropTone(ref, active, watch) {
  const [tone, setTone] = useState("dark");

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let timer = 0;
    let last = 0;

    const measure = () => {
      frame = 0;
      last = performance.now();
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      let light = 0;
      let dark = 0;
      for (const f of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        if (toneAt(r.left + r.width * f, r.top + r.height / 2) === "light") light++;
        else dark++;
      }
      // On a tie, keep what it was, so it does not flicker at a boundary
      if (light !== dark) setTone(light > dark ? "light" : "dark");
    };
    // At most about ten times a second while scrolling, and always once more when the scrolling stops
    const schedule = () => {
      if (frame || timer) return;
      const wait = Math.max(0, 100 - (performance.now() - last));
      timer = setTimeout(() => {
        timer = 0;
        frame = requestAnimationFrame(measure);
      }, wait);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Pages change under it without scrolling (pictures load, tabs switch), so look now and then too
    const interval = setInterval(measure, 700);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, active, watch]);

  return tone;
}