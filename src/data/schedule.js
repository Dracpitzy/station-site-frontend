import { station } from "./config.js";
import { presenters } from "./presenters.js";

// How to edit this file: each list is one day of programmes for one channel.
// A slot runs from its start time until the next slot starts, and the last slot runs to midnight.
// So every list must begin at "00:00", and the start times must be in order.
const slot = (start, title, desc, category, hosts = []) => ({ start, title, desc, category, hosts });

const tvWeekday = [
  slot("00:00", "Nightwatch", "The day's top stories, replayed through the night.", "news"),
  slot("05:00", "First Light", "Quiet music and reflection to start the day.", "faith"),
  slot("06:00", "Daybreak Live", "News, weather, traffic and the morning's conversation.", "news", ["amaka-obi", "tunde-bello"]),
  slot("09:00", "Morning News", "The stories shaping the day, with guests in the studio.", "news", ["tunde-bello"]),
  slot("12:00", "News Update", "Midday headlines and developing stories.", "news", ["ngozi-eze"]),
  slot("13:00", "Business Today", "Markets, jobs and money, explained plainly.", "business", ["chidi-okafor"]),
  slot("14:00", "Afternoon Show", "Music, celebrity chat, lifestyle and live guests.", "entertainment", ["funke-adeyemi"]),
  slot("16:00", "Sports Desk", "Scores, analysis and the week's big matches.", "sports", ["ibrahim-musa"]),
  slot("17:00", "The Documentary Hour", "One story, told in full.", "documentary"),
  slot("18:00", "Evening Headlines", "A quick look at where the day has landed.", "news", ["ngozi-eze"]),
  slot("19:00", "The Evening News", "The main bulletin, with reports from across the country.", "news", ["tunde-bello", "ngozi-eze"]),
  slot("20:00", "The Panel", "Three guests, one big question of the day.", "talk", ["chidi-okafor"]),
  slot("21:00", "Weeknight Drama", "An hour of scripted drama.", "entertainment"),
  slot("22:00", "Late Edition", "The last word on the day's news.", "news", ["ibrahim-musa"]),
  slot("23:00", "Midnight Sessions", "Live music from the ITV studio.", "music"),
];

const tvSaturday = [
  slot("00:00", "Nightwatch", "The week's top stories, replayed through the night.", "news"),
  slot("05:00", "First Light", "Quiet music and reflection to start the day.", "faith"),
  slot("06:00", "Weekend Rise", "A relaxed start to the weekend.", "entertainment", ["funke-adeyemi"]),
  slot("09:00", "Kids Zone", "Cartoons, quizzes and stories for children.", "kids"),
  slot("11:00", "Sports Weekend", "Live scores and the weekend's fixtures.", "sports", ["ibrahim-musa"]),
  slot("14:00", "Weekend Cinema", "A feature film.", "entertainment"),
  slot("17:00", "The Documentary Hour", "One story, told in full.", "documentary"),
  slot("19:00", "Weekend News", "The day's news in one bulletin.", "news", ["ngozi-eze"]),
  slot("20:00", "Saturday Night Stage", "Live performances and special guests.", "music"),
  slot("23:00", "Midnight Sessions", "Live music from the ITV studio.", "music"),
];

const tvSunday = [
  slot("00:00", "Nightwatch", "The week's top stories, replayed through the night.", "news"),
  slot("05:00", "First Light", "Quiet music and reflection to start the day.", "faith"),
  slot("08:00", "Faith and Family", "Music, readings and community stories.", "faith"),
  slot("10:00", "Sunday Magazine", "Profiles, features and conversation.", "entertainment", ["amaka-obi"]),
  slot("12:00", "Film Matinee", "A family film.", "entertainment"),
  slot("15:00", "Sports Weekend Replay", "The weekend's best action again.", "sports", ["ibrahim-musa"]),
  slot("17:00", "The Documentary Hour", "One story, told in full.", "documentary"),
  slot("18:00", "Week in Review", "The week's biggest stories and what comes next.", "news", ["tunde-bello"]),
  slot("19:00", "The Evening News", "The main bulletin, with reports from across the country.", "news", ["tunde-bello", "ngozi-eze"]),
  slot("20:00", "The Panel", "Three guests, one big question of the week.", "talk", ["chidi-okafor"]),
  slot("21:00", "Sunday Drama", "An hour of scripted drama.", "entertainment"),
  slot("22:00", "Late Edition", "The last word on the news before the week begins.", "news", ["ibrahim-musa"]),
  slot("23:00", "Midnight Sessions", "Live music from the ITV studio.", "music"),
];

const radioWeekday = [
  slot("00:00", "Night Shift", "Smooth music through the small hours.", "music", ["segun-adebayo"]),
  slot("04:00", "Dawn Chorus", "Uplifting songs and a quiet start.", "music"),
  slot("06:00", "The Breakfast Show", "News, traffic, laughs and the morning's biggest tunes.", "talk", ["kelechi-nwosu", "zainab-lawal"]),
  slot("10:00", "Mid-Morning Mix", "Hit songs and interviews to carry you to lunch.", "music", ["zainab-lawal"]),
  slot("13:00", "Lunchtime Live", "Requests, shout-outs and your lunch break soundtrack.", "music", ["kelechi-nwosu"]),
  slot("15:00", "Afternoon Groove", "Feel-good music for the stretch before home time.", "music", ["ada-nwachukwu"]),
  slot("17:00", "Drive Time", "News, traffic and the best songs for the journey home.", "talk", ["segun-adebayo"]),
  slot("20:00", "Talk Night", "Calls, opinions and the stories people are discussing.", "talk", ["ada-nwachukwu"]),
  slot("22:00", "Slow Jams", "Mellow music to end the day.", "music", ["zainab-lawal"]),
];

const radioSaturday = [
  slot("00:00", "Night Shift", "Smooth music through the small hours.", "music", ["segun-adebayo"]),
  slot("04:00", "Dawn Chorus", "Uplifting songs and a quiet start.", "music"),
  slot("07:00", "Weekend Wake-Up", "A slow, sunny start to the weekend.", "talk", ["kelechi-nwosu"]),
  slot("11:00", "Top 20 Countdown", "This week's most-played songs, counted down.", "music", ["zainab-lawal"]),
  slot("14:00", "Sports Roundup", "Scores, reactions and weekend fixtures.", "sports", ["ibrahim-musa"]),
  slot("16:00", "Saturday Party Mix", "Dance music to get the evening going.", "music", ["segun-adebayo"]),
  slot("22:00", "Slow Jams", "Mellow music to end the day.", "music", ["zainab-lawal"]),
];

const radioSunday = [
  slot("00:00", "Night Shift", "Smooth music through the small hours.", "music", ["segun-adebayo"]),
  slot("04:00", "Dawn Chorus", "Uplifting songs and a quiet start.", "music"),
  slot("08:00", "Sunday Soul", "Soul, gospel and easy listening.", "music", ["ada-nwachukwu"]),
  slot("12:00", "Classics Request Show", "Your favourite songs from every era.", "music", ["kelechi-nwosu"]),
  slot("16:00", "The Week Ahead", "What to expect in the news, sport and entertainment.", "talk", ["zainab-lawal"]),
  slot("18:00", "Sunday Drive", "Relaxed music and conversation.", "talk", ["segun-adebayo"]),
  slot("21:00", "Slow Jams", "Mellow music to end the weekend.", "music", ["zainab-lawal"]),
];

export const schedule = {
  tv: { weekday: tvWeekday, saturday: tvSaturday, sunday: tvSunday },
  radio: { weekday: radioWeekday, saturday: radioSaturday, sunday: radioSunday },
};

// ---------- helpers ----------

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// 0 to 1440 minutes into "6:00 AM"
export function formatMinutes(total) {
  const t = total % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// Give every slot an id, minutes and ready-to-show labels.
function build(channel, type, list) {
  return list.map((s, i) => {
    const startMin = toMinutes(s.start);
    const endMin = i < list.length - 1 ? toMinutes(list[i + 1].start) : 1440;
    return {
      ...s,
      id: `${channel}-${type}-${s.start.replace(":", "")}`,
      channel,
      startMin,
      endMin,
      startLabel: formatMinutes(startMin),
      endLabel: formatMinutes(endMin),
    };
  });
}

const days = {};
for (const channel of Object.keys(schedule)) {
  days[channel] = {};
  for (const [type, list] of Object.entries(schedule[channel])) {
    days[channel][type] = build(channel, type, list);
  }
}

const dayType = (day) => (day === 0 ? "sunday" : day === 6 ? "saturday" : "weekday");

// day: 0 = Sunday ... 6 = Saturday
export function getDaySchedule(channel, day) {
  return days[channel][dayType(day)];
}

// What is on, what is next and what comes after, for one channel at one moment.
export function getOnAir(channel, day, minutes) {
  const line = [];
  for (let i = 0; i < 3; i++) {
    for (const s of getDaySchedule(channel, (day + i) % 7)) {
      line.push({ ...s, startAbs: s.startMin + i * 1440, endAbs: s.endMin + i * 1440, dayOffset: i });
    }
  }
  const idx = line.findIndex((s) => minutes >= s.startAbs && minutes < s.endAbs);
  const current = line[idx];
  return {
    current,
    next: line[idx + 1],
    later: line[idx + 2],
    progress: (minutes - current.startAbs) / (current.endAbs - current.startAbs),
    minutesLeft: current.endAbs - minutes,
  };
}

export function hostNames(slotItem) {
  const names = slotItem.hosts.map((id) => presenters[id]?.name).filter(Boolean);
  return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(names);
}

// ---------- the station's clock ----------

const clockFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: station.timezone,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: station.timezone,
  weekday: "long",
  month: "long",
  day: "numeric",
});
const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// The day and minute of the day on the station's clock.
export function stationClock(ms = Date.now()) {
  const parts = {};
  for (const p of clockFormat.formatToParts(new Date(ms))) parts[p.type] = p.value;
  return {
    day: DAY_INDEX[parts.weekday],
    minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute),
  };
}

export const dateLabel = (ms = Date.now()) => dateFormat.format(new Date(ms));

// Checks the lists above for mistakes. Returns a list of problems (empty means all good).
export function validateSchedule() {
  const problems = [];
  for (const [channel, types] of Object.entries(schedule)) {
    for (const [type, list] of Object.entries(types)) {
      const where = `${channel}.${type}`;
      if (list[0]?.start !== "00:00") problems.push(`${where} must start at 00:00`);
      for (let i = 1; i < list.length; i++) {
        if (toMinutes(list[i].start) <= toMinutes(list[i - 1].start)) {
          problems.push(`${where}: "${list[i].title}" starts before the slot above it`);
        }
      }
      for (const s of list) {
        for (const id of s.hosts) {
          if (!presenters[id]) problems.push(`${where}: "${s.title}" has an unknown host "${id}"`);
        }
      }
    }
  }
  return problems;
}

if (import.meta.env?.DEV) {
  const problems = validateSchedule();
  if (problems.length) console.warn("Schedule problems:\n" + problems.join("\n"));
}