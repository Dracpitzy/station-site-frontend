// Placeholder article text for the demo. Every story gets five paragraphs picked from this pool,
// starting at a different place for each story, so the articles do not all read the same.
// When real articles exist, each story will carry its own text and this file goes away.

const POOL = [
  "Details are still emerging, and ITV News will update this story as more information becomes available.",
  "Speaking to reporters, a spokesperson said the matter had been under discussion for several weeks and that a formal statement would follow.",
  "Residents interviewed by our reporters welcomed the news, although some said they wanted to see clear timelines before celebrating.",
  "Analysts say the announcement could shape decisions over the coming months, particularly for families and small businesses planning ahead.",
  "Not everyone is convinced. Critics argued that earlier promises had not been kept and called for regular public updates on progress.",
  "The ITV newsroom has asked the organisations involved for further comment and will report their responses when they arrive.",
  "Experts note that similar steps elsewhere have produced mixed results, depending largely on how well plans are carried out on the ground.",
  "For many people the immediate question is simple: what changes this week? Officials said practical guidance would be published through official channels.",
  "Community leaders have urged the public to rely on verified information and to share updates only from trusted sources.",
  "Further reports and reaction will be carried on ITV television and radio throughout the day, and here on this website.",
];

const hash = (s) => [...s].reduce((n, ch) => n + ch.charCodeAt(0), 0);

// Returns [{ type: "p" | "h2", text }]
export function articleBody(story) {
  const start = hash(story.id) % POOL.length;
  // Stepping by 3 around a pool of 10 never repeats within five paragraphs.
  const paragraphs = Array.from({ length: 5 }, (_, i) => POOL[(start + i * 3) % POOL.length]);
  return [
    { type: "p", text: paragraphs[0] },
    { type: "p", text: paragraphs[1] },
    { type: "h2", text: "What this means" },
    { type: "p", text: paragraphs[2] },
    { type: "p", text: paragraphs[3] },
    { type: "p", text: paragraphs[4] },
  ];
}