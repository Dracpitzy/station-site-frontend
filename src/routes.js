import { lazy } from "react";

const loaders = {
  Home: () => import("./pages/Home.jsx"),
  LiveTV: () => import("./pages/LiveTV.jsx"),
  Radio: () => import("./pages/Radio.jsx"),
  News: () => import("./pages/News.jsx"),
  Article: () => import("./pages/Article.jsx"),
  Schedule: () => import("./pages/Schedule.jsx"),
  About: () => import("./pages/About.jsx"),
  Contact: () => import("./pages/Contact.jsx"),
  Lab: () => import("./pages/Lab.jsx"),
};

export const pages = Object.fromEntries(
  Object.entries(loaders).map(([name, load]) => [name, lazy(load)])
);

// Start downloading a page as soon as its link is hovered, focused or touched
export function preloadProps(name) {
  const load = () => loaders[name]();
  return { onMouseEnter: load, onFocus: load, onTouchStart: load };
}