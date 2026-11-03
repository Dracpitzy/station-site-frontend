const MIN_VISIBLE = 1500; // ms the splash stays up, counted from page navigation start

export function hideSplash() {
  const el = document.getElementById("splash");
  if (!el) return;

  // performance.now() already counts the time the app took to load,
  // so a slow load never adds extra waiting on top of it.
  const wait = Math.max(0, MIN_VISIBLE - performance.now());

  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 600); // remove from the DOM after the fade
  }, wait);
}