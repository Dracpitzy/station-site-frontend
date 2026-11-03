import { photoProps } from "../data/images";

// Each category has its own gradient and a large line icon, so stories without a photo still look designed.
const TONES = {
  politics: ["#1559e6", "#081f55"],
  business: ["#0a6cc4", "#08305f"],
  sports: ["#2f78ff", "#0b2a7a"],
  entertainment: ["#6a46e0", "#241a77"],
  technology: ["#0f86c9", "#0a3b66"],
  health: ["#0a95a8", "#084a63"],
  world: ["#3a5ce0", "#13237a"],
  local: ["#4a8bff", "#0f43b3"],
};

const ICONS = {
  politics: (
    <>
      <path d="M8 26 32 12l24 14z" />
      <path d="M14 30v18M26 30v18M38 30v18M50 30v18" />
      <path d="M8 52h48M12 57h40" />
    </>
  ),
  business: (
    <>
      <path d="M8 56h48" />
      <rect x="12" y="34" width="9" height="22" rx="2" />
      <rect x="28" y="24" width="9" height="32" rx="2" />
      <rect x="44" y="10" width="9" height="46" rx="2" />
    </>
  ),
  sports: (
    <>
      <circle cx="32" cy="32" r="23" />
      <path d="m32 20 11 8-4 13H25l-4-13z" />
      <path d="M32 20V9M43 28l11-4M39 41l7 10M25 41l-7 10M21 28 10 24" />
    </>
  ),
  entertainment: <path d="m32 7 7.5 16.5L57 26l-13 11.5L47.5 55 32 46 16.5 55 20 37.5 7 26l17.5-2.5z" />,
  technology: (
    <>
      <rect x="17" y="17" width="30" height="30" rx="6" />
      <rect x="26" y="26" width="12" height="12" rx="2" />
      <path d="M25 17V8M39 17V8M25 56v-9M39 56v-9M17 25H8M17 39H8M56 25h-9M56 39h-9" />
    </>
  ),
  health: <path d="M25 8h14v17h17v14H39v17H25V39H8V25h17z" />,
  world: (
    <>
      <circle cx="32" cy="32" r="23" />
      <ellipse cx="32" cy="32" rx="10" ry="23" />
      <path d="M9 32h46M12 20h40M12 44h40" />
    </>
  ),
  local: (
    <>
      <path d="M32 58S13 41 13 26a19 19 0 0 1 38 0c0 15-19 32-19 32z" />
      <circle cx="32" cy="26" r="7" />
    </>
  ),
};

export function CoverArt({ category }) {
  const [a, b] = TONES[category] || TONES.politics;
  const id = `cover-${category}`;
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.85" cy="0.1" r="0.7">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id})`} />
      <rect width="320" height="200" fill={`url(#${id}-glow)`} />
      <g
        transform="translate(168 18) scale(2.5)"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.3"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[category] || ICONS.politics}
      </g>
    </svg>
  );
}

// A story's picture: its photo if it has one, otherwise the designed cover for its category.
export default function Cover({ story, eager = false, sizes = "400px", className = "" }) {
  return (
    <div className={`cover ${className}`.trim()}>
      {story.photo ? (
        <img
          {...photoProps(story.photo, [480, 800, 1280])}
          alt=""
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <CoverArt category={story.category} />
      )}
    </div>
  );
}