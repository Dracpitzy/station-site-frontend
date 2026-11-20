import { articles } from "../data/news";
import { breaking as settings } from "../data/config";

// Breaking news: which stories are flagged, and which have run out of time.
//
// The strip asks the station's API for the stories flagged as breaking. Set VITE_API_URL (the same address the
// contact form uses) and it calls  GET <that address>/news/breaking/  and expects a list (or a paged
// { "results": [...] }) in which each story has:
//     id, title, category, published, breaking_at      (the two times as ISO dates, e.g. "2026-11-20T09:30:00Z")
// breaking_at is the moment the story was flagged as breaking. Without VITE_API_URL the strip runs on the demo stories.
const API_URL = import.meta.env.VITE_API_URL;
export const BREAKING_DEMO = !API_URL;

export const demoBreaking = () =>
  articles
    .filter((a) => a.breaking)
    .map(({ id, title, category, published, breakingAt }) => ({ id, title, category, published, breakingAt }));

const toMs = (value) => (typeof value === "number" ? value : Date.parse(value));

const fromApi = (item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  published: toMs(item.published),
  breakingAt: toMs(item.breaking_at ?? item.published),
});

export async function fetchBreaking(signal) {
  if (BREAKING_DEMO) return demoBreaking();
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/news/breaking/`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Breaking news could not be loaded");
  const data = await response.json();
  const list = Array.isArray(data) ? data : data.results ?? [];
  return list.map(fromApi).filter((s) => s.id && s.title && Number.isFinite(s.breakingAt));
}

// A story is breaking until the window has passed since it was flagged
export const isBreaking = (story, now) => now - story.breakingAt < settings.windowMinutes * 60000;

// The stories still breaking, newest flag first
export const activeBreaking = (stories, now) =>
  stories.filter((s) => isBreaking(s, now)).sort((a, b) => b.breakingAt - a.breakingAt);
