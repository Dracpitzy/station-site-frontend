// Liquid Glass engine (SVG refraction).
// The maths is adapted from archisvaze/liquid-glass (MIT, (c) 2026 Archis Vaze). See NOTICE.txt.

// Convex squircle: the soft, Apple-like bulge. Input 0 = outer edge, 1 = end of the bezel.
const squircle = (x) => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

const SPECULAR_ANGLE = Math.PI / 3;

export function resolveRadius(radius, w, h) {
  const max = Math.min(w, h) / 2;
  if (radius === "pill") return Math.floor(max);
  return Math.floor(Math.min(radius, max));
}

// How far light bends at each step across the bezel (Snell's law on the curved surface).
export function refractionProfile(thickness, bezel, ior, samples = 128) {
  const eta = 1 / ior;
  const profile = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    const y = squircle(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const deriv = (squircle(x + dx) - y) / dx;
    const mag = Math.sqrt(deriv * deriv + 1);
    const nx = -deriv / mag;
    const ny = -1 / mag;
    const k = 1 - eta * eta * (1 - ny * ny);
    if (k < 0) {
      profile[i] = 0;
      continue;
    }
    const sq = Math.sqrt(k);
    const rx = -(eta * ny + sq) * nx;
    const ry = eta - (eta * ny + sq) * ny;
    profile[i] = rx * ((y * bezel + thickness) / ry);
  }
  return profile;
}

function makeLayer(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);
  return { canvas, ctx, img, data: img.data };
}

function finishLayer(layer) {
  layer.ctx.putImageData(layer.img, 0, 0);
  return layer.canvas.toDataURL();
}

// Draws the displacement map (red = x shift, green = y shift, 128 = no shift)
// and the thin specular rim map in a single pass over the pixels.
function renderMaps(w, h, r, bezel, profile, maxDisp) {
  const disp = makeLayer(w, h);
  const spec = makeLayer(w, h);
  const d = disp.data;

  for (let i = 0; i < d.length; i += 4) {
    d[i] = 128;
    d[i + 1] = 128;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  const s = spec.data;
  const S = profile.length;
  const rSq = r * r;
  const r1Sq = (r + 1) * (r + 1);
  const rBSq = Math.max(r - bezel, 0) ** 2;
  const wB = w - r * 2;
  const hB = h - r * 2;
  const sx = Math.cos(SPECULAR_ANGLE);
  const sy = Math.sin(SPECULAR_ANGLE);

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq) continue;

      const dist = Math.sqrt(dSq);
      if (dist === 0) continue;
      const fromSide = r - dist;
      const op = dSq < rSq ? 1 : 1 - (dist - r);
      if (op <= 0) continue;

      const cos = x / dist;
      const sin = y / dist;
      const idx = (y1 * w + x1) * 4;

      // Specular rim: only the outer ~2px, strongest where the edge faces the light.
      if (fromSide > 0 && fromSide < 2) {
        const dot = Math.abs(cos * sx + -sin * sy);
        const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
        const k = dot * edge;
        const c = (255 * k) | 0;
        s[idx] = c;
        s[idx + 1] = c;
        s[idx + 2] = c;
        s[idx + 3] = (c * k * op) | 0;
      }

      // Displacement: only inside the bezel ring.
      if (dSq < rBSq) continue;
      const bi = Math.min(((fromSide / bezel) * S) | 0, S - 1);
      const disp1 = profile[bi] || 0;
      d[idx] = (128 + ((-cos * disp1) / maxDisp) * 127 * op + 0.5) | 0;
      d[idx + 1] = (128 + ((-sin * disp1) / maxDisp) * 127 * op + 0.5) | 0;
    }
  }

  return { dispUrl: finishLayer(disp), specUrl: finishLayer(spec) };
}

// Maps are the expensive part, so identical sizes and settings share one.
const cache = new Map();
const CACHE_MAX = 24;

export function computeGlass(p, w, h, radiusSetting) {
  const radius = resolveRadius(radiusSetting, w, h);
  const bezel = Math.max(1, Math.min(p.bezel, radius - 1, Math.min(w, h) / 2 - 1));
  const key = [w, h, radius, bezel, p.thickness, p.ior].join("|");

  let maps = cache.get(key);
  if (!maps) {
    const profile = refractionProfile(p.thickness, bezel, p.ior);
    let maxDisp = 0;
    for (const v of profile) maxDisp = Math.max(maxDisp, Math.abs(v));
    maxDisp = maxDisp || 1;
    maps = { ...renderMaps(w, h, radius, bezel, profile, maxDisp), maxDisp };
    cache.set(key, maps);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  }

  return {
    w,
    h,
    radius,
    scale: maps.maxDisp * (p.scaleRatio ?? 1),
    dispUrl: maps.dispUrl,
    specUrl: maps.specUrl,
    blur: p.blur,
    specular: p.specular,
    saturation: p.saturation ?? 3,
  };
}

// blur, then displace, then saturate and add the specular rim on top.
export function filterMarkup(id, g) {
  return `<filter id="${id}" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="${g.blur}" result="blurred_source" />
  <feImage href="${g.dispUrl}" x="0" y="0" width="${g.w}" height="${g.h}" result="disp_map" />
  <feDisplacementMap in="blurred_source" in2="disp_map" scale="${g.scale}" xChannelSelector="R" yChannelSelector="G" result="displaced" />
  <feColorMatrix in="displaced" type="saturate" values="${g.saturation}" result="displaced_sat" />
  <feImage href="${g.specUrl}" x="0" y="0" width="${g.w}" height="${g.h}" result="spec_layer" />
  <feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />
  <feComponentTransfer in="spec_layer" result="spec_faded">
    <feFuncA type="linear" slope="${g.specular}" />
  </feComponentTransfer>
  <feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />
  <feBlend in="spec_faded" in2="with_sat" mode="normal" />
</filter>`;
}

// "full" = real refraction. "css" = frosted fallback with the same shape and edge light.
// Real refraction needs backdrop-filter with an SVG filter, which only Chromium supports
// (Chrome and Edge on desktop, Chrome on Android). Safari, iPhone browsers and Firefox get "css".
let cachedMode;

export function glassMode() {
  if (!cachedMode) cachedMode = detectMode();
  return cachedMode;
}

function detectMode() {
  if (typeof window === "undefined") return "css";
  // Add ?glass=css to any URL to preview the fallback on a Chromium browser.
  if (new URLSearchParams(window.location.search).get("glass") === "css") return "css";

  const uad = navigator.userAgentData;
  const chromium =
    (uad && uad.brands && uad.brands.some((b) => /Chromium/.test(b.brand))) ||
    /\bChrome\//.test(navigator.userAgent);
  if (!chromium) return "css";

  // Weak phones skip refraction and keep the cheaper material.
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if (lowMemory || lowCores) return "css";

  return "full";
}