// The pages in the navigation, in order. The desktop navbar and the phone navigation both read this list.
export const ITEMS = [
  { to: "/", label: "Home", icon: "home", page: "Home", end: true },
  { to: "/live", label: "Live TV", icon: "tv", page: "LiveTV" },
  { to: "/radio", label: "Radio", icon: "radio", page: "Radio" },
  { to: "/news", label: "News", icon: "news", page: "News" },
  { to: "/schedule", label: "Schedule", icon: "calendar", page: "Schedule" },
  { to: "/about", label: "About", icon: "info", page: "About" },
  { to: "/contact", label: "Contact", icon: "mail", page: "Contact" },
];

// Is this address the page, or a page inside it? Story pages belong to News.
export function isActivePath(item, pathname) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
}
