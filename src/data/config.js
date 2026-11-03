export const station = {
  name: "ITV",
  fullName: "Independent Television and Radio",
  tagline: "Your Voice. Your Station.", // placeholder, change anytime
  frequency: "98.7 FM", // placeholder, change to the real frequency
  // The station's own clock. On-air times are worked out in this zone,
  // whatever time zone the visitor's device is set to.
  timezone: "Africa/Lagos",
};

export const streams = {
  // Public test stream (Big Buck Bunny). Replace with the station's own HLS .m3u8 link when you have it.
  tv: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  radio: "", // audio stream link goes here
};