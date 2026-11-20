export const station = {
  name: "ITV",
  fullName: "Independent Television and Radio",
  tagline: "Your Voice. Your Station.", // placeholder, change anytime
  frequency: "89.7 FM", // Independent Radio Abuja, the station the site plays by default
  // The station's own clock. On-air times are worked out in this zone,
  // whatever time zone the visitor's device is set to.
  timezone: "Africa/Lagos",
};

export const streams = {
  // Public test stream (Big Buck Bunny). Replace with the station's own HLS .m3u8 link when you have it.
  tv: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
};

// The live radios. Each has its own stream.
//   streams: one link or a list. The list is tried in order, so a second link works as a backup.
//            MP3, AAC (Icecast, Shoutcast, Zeno) and HLS (.m3u8) links all work.
//   live:    false shows "off the air for now" when the visitor taps it, and its frequency stays blurred.
//            When Benin is back: add its stream link, set its frequency, and set live to true.
export const radioStations = [
  {
    id: "abuja",
    name: "Abuja",
    fullName: "Independent Radio Abuja",
    frequency: "89.7 FM",
    streams: ["https://stream.zeno.fm/tgtcb4bqw38uv"],
    live: true,
  },
  {
    id: "benin",
    name: "Benin",
    fullName: "Independent Radio Benin",
    frequency: "",
    streams: [],
    live: false,
  },
];

// The breaking news strip on the front page.
//   windowMinutes: a story stays in the strip this long after it was flagged as breaking (its breaking_at time).
//                  When every story has passed this, the strip folds away until a new one is flagged.
//   rotateMs:      how long each headline shows before the next one slides in.
//   recheckMs:     how often the strip checks which stories have expired.
//   pollMs:        how often it asks the API for newly flagged stories (only when VITE_API_URL is set).
export const breaking = {
  windowMinutes: 120,
  rotateMs: 5000,
  recheckMs: 15000,
  pollMs: 60000,
};
