// Small icons for the Contact page. The social ones are simplified shapes, not the official logos.

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const ICONS = {
  mail: (
    <g {...line}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </g>
  ),
  phone: (
    <g {...line}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </g>
  ),
  pin: (
    <g {...line}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </g>
  ),
  clock: (
    <g {...line}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>
  ),
  Facebook: <path fill="currentColor" d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8.6c0-.4.2-.6.6-.6z" />,
  X: (
    <g {...line} strokeWidth="2.2">
      <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" />
    </g>
  ),
  Instagram: (
    <g {...line}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  YouTube: (
    <g>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" {...line} />
      <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" />
    </g>
  ),
};

export default function ContactIcon({ name, size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}