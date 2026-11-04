import { streams } from "./config.js";

// Dummy videos for the front page. Every clip plays the same public test video until real files exist.
// For a real clip, put its own address in `src` (an .mp4 file or an HLS .m3u8 link).
// category: one of the news categories, which decides the colour of the designed thumbnail.
// A clip can also carry a `photo` key from data/images.js to use a real picture instead.

const SAMPLE = streams.tv;

const clip = (id, category, title, duration, extra = {}) => ({
  id,
  category,
  title,
  duration,
  src: SAMPLE,
  ...extra,
});

// `ago` is how many minutes before the page loads the video went up, so they always look fresh.
const recent = (ago, video) => ({ ...video, published: Date.now() - ago * 60000 });

export const latestVideos = [
  recent(35, clip("assembly-budget-night-session", "politics", "Highlights: the Assembly's night session on the budget", "2:41")),
  recent(150, clip("naira-steadies-explained", "business", "Explained: why the naira is steadying", "4:12")),
  recent(420, clip("marathon-route-walkthrough", "sports", "Walk the weekend marathon route before race day", "3:05")),
  recent(900, clip("inside-new-broadcast-centre", "local", "Inside ITV's new broadcast centre", "5:30", { photo: "studio" })),
];

// Recent programmes to catch up on. `when` is shown as written.
export const watchAgain = [
  clip("replay-evening-news", "politics", "The Evening News", "58:40", { when: "Yesterday, 7:00 PM" }),
  clip("replay-the-panel", "world", "The Panel", "57:15", { when: "Yesterday, 8:00 PM" }),
  clip("replay-sports-desk", "sports", "Sports Desk", "54:30", { when: "Yesterday, 4:00 PM" }),
  clip("replay-business-today", "business", "Business Today", "55:10", { when: "Yesterday, 1:00 PM" }),
];