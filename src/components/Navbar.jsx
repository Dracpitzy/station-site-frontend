import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { station } from "../data/config";
import { articles, categories } from "../data/news";
import { useOnAir } from "../hooks/useOnAir";
import { preloadProps } from "../routes";
import { Icon } from "./Icons";
import { LiquidGlass } from "./liquid-glass/LiquidGlass";
import "../styles/nav.css";
import "../styles/newsmenu.css";

const ITEMS = [
  { to: "/", label: "Home", icon: "home", page: "Home", end: true },
  { to: "/live", label: "Live TV", icon: "tv", page: "LiveTV" },
  { to: "/radio", label: "Radio", icon: "radio", page: "Radio" },
  { to: "/news", label: "News", icon: "news", page: "News" },
  { to: "/schedule", label: "Schedule", icon: "calendar", page: "Schedule" },
  { to: "/about", label: "About", icon: "info", page: "About" },
  { to: "/contact", label: "Contact", icon: "mail", page: "Contact" },
];

// ---------- settings you can change ----------
const RAIL_AT = 80; // the rail can only appear once you are this far down the page
const TOP_AT = 24; // this close to the top, it is always the bar
const DOWN_STEP = 6; // scroll down this many pixels and the bar becomes the rail
const UP_STEP = 8; // scroll up this many pixels and the rail becomes the bar at once
const RAIL_MIN_WIDTH = 861; // narrower windows keep the bar, so the rail never covers the page
const MORPH_MS = 420;
const REST_MS = 3000; // with no scrolling or touching for this long, the rail slides away
const EDGE_ZONE = 80; // moving the pointer this close to the left edge brings it back

// Exceptionally clear glass: almost no tint or blur, thick convex edges and a bright specular rim.
const INDICATOR = {
  radius: 20,
  thickness: 38,
  bezel: 19,
  ior: 2.4,
  blur: 0.3,
  specular: 0.7,
  tint: 0.01,
  shadow: 0.4,
  saturation: 1.3,
  scaleRatio: 1,
};

// Which item the current address belongs to. Story pages belong to News. -1 = none of them.
function activeIndexFor(pathname) {
  return ITEMS.findIndex((i) => (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(i.to + "/")));
}

// On a phone the same navigation sits at the bottom of the screen.
function useCompact() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia("(max-width: 860px)");
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia("(max-width: 860px)").matches,
    () => false
  );
}

// Bar at the top, or rail down the side. The direction of the scroll decides:
// a short push down gives the rail, a short push up gives the bar straight back.
// beforeChange runs just before the switch, so the old positions can be recorded for the animation.
function useRailState(beforeChange) {
  const [rail, setRail] = useState(
    () => window.matchMedia(`(min-width: ${RAIL_MIN_WIDTH}px)`).matches && window.scrollY > RAIL_AT
  );
  const railRef = useRef(rail);
  const beforeRef = useRef(beforeChange);

  useEffect(() => {
    beforeRef.current = beforeChange;
  });

  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${RAIL_MIN_WIDTH}px)`);
    let frame = 0;
    let lastY = window.scrollY;
    let down = 0; // pixels scrolled down since the direction last changed
    let up = 0; // pixels scrolled up since the direction last changed

    const evaluate = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      if (dy > 0) {
        down += dy;
        up = 0;
      } else if (dy < 0) {
        up -= dy;
        down = 0;
      }

      let next = railRef.current;
      if (!wide.matches || y <= TOP_AT) next = false;
      else if (up >= UP_STEP) next = false;
      else if (down >= DOWN_STEP && y > RAIL_AT) next = true;

      if (next === railRef.current) return;
      beforeRef.current();
      railRef.current = next;
      setRail(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(evaluate);
    };
    const onWide = () => {
      if (wide.matches) {
        down = DOWN_STEP;
        up = 0;
      }
      schedule();
    };

    evaluate();
    window.addEventListener("scroll", schedule, { passive: true });
    wide.addEventListener("change", onWide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      wide.removeEventListener("change", onWide);
    };
  }, []);

  return rail;
}

// While the rail is showing, it slips away after a few quiet seconds and returns the moment
// the page is scrolled, touched or reached for. It never leaves while it is being used.
function useRailRest(rail, headerRef) {
  const [resting, setResting] = useState(false);

  useEffect(() => {
    if (!rail) {
      setResting(false);
      return;
    }
    let timer = 0;

    // Being used means: a real mouse pointer is over it, or keyboard focus is inside it.
    // A link that kept focus after a mouse click does not count.
    const busy = () => {
      const header = headerRef.current;
      if (!header) return false;
      const mouse = window.matchMedia("(hover: hover)").matches;
      if (mouse && header.matches(":hover")) return true;
      const active = document.activeElement;
      try {
        return !!active && header.contains(active) && active.matches(":focus-visible");
      } catch {
        return false; // very old browsers do not know :focus-visible
      }
    };

    const sleep = () => {
      if (busy()) {
        timer = setTimeout(sleep, REST_MS);
        return;
      }
      setResting(true);
    };
    const wake = () => {
      clearTimeout(timer);
      setResting(false);
      timer = setTimeout(sleep, REST_MS);
    };
    const onPointer = (e) => {
      // The browser sometimes fires pointermove with no movement when the page shifts under the pointer
      if (!e.movementX && !e.movementY) return;
      if (e.clientX <= EDGE_ZONE) wake();
    };

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("keydown", wake);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [rail, headerRef]);

  return rail && resting;
}

// Where the active item is inside the navigation track.
function useActiveBox(trackRef, index, mode) {
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || index < 0) return;

    const measure = () => {
      const cell = track.querySelector(`[data-nav-index="${index}"]`);
      if (!cell) return;
      const next = { x: cell.offsetLeft, y: cell.offsetTop, w: cell.offsetWidth, h: cell.offsetHeight };
      setBox((b) => (b && b.x === next.x && b.y === next.y && b.w === next.w && b.h === next.h ? b : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackRef, index, mode]);

  return box;
}

// The glass is bigger than the item it covers, so it looks like it swells out of the track.
// In the bar it grows a little all round. In the rail it is wide enough to hold the label and
// reaches clearly past both edges. On a phone it rises above the bottom bar.
function glassBox(box, mode) {
  if (mode === "rail") {
    const w = 56;
    const h = box.h + 8;
    return { w, h, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2 };
  }
  if (mode === "compact") {
    const w = Math.max(box.w + 20, 92);
    const h = box.h + 12;
    return { w, h, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2 - 4 };
  }
  const w = box.w + 16;
  const h = box.h + 16;
  return { w, h, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2 };
}

// ---------- the bar-to-rail animation ----------
// The navigation changes shape in one step, and this animates from where everything was to where
// it now is: the dark block and the track recess change size, every item glides to its new place
// and the glass travels with them.

const rectOf = (el) => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};
const centreOf = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

function snapshotNav({ bg, recess, logo, live, track }) {
  const glass = track.querySelector(".nav__glass");
  return {
    bg: rectOf(bg),
    bgRadius: getComputedStyle(bg).borderRadius || "0px",
    recess: rectOf(recess),
    logo: rectOf(logo),
    live: rectOf(live),
    glass: glass && !glass.classList.contains("is-hidden") ? rectOf(glass) : null,
    cells: [...track.querySelectorAll("[data-nav-index]")].map(rectOf),
  };
}

function playMorph(first, parts, index, mode) {
  const { frame, bg, recess, logo, live, track } = parts;
  if (!bg.animate) return [];

  const last = snapshotNav(parts);
  const frameNow = rectOf(frame);
  const trackNow = rectOf(track);
  const timing = { duration: MORPH_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
  const animations = [];

  // The dark block
  animations.push(
    bg.animate(
      [
        {
          left: `${first.bg.left - frameNow.left}px`,
          top: `${first.bg.top - frameNow.top}px`,
          width: `${first.bg.width}px`,
          height: `${first.bg.height}px`,
          borderRadius: first.bgRadius,
        },
        {
          left: "0px",
          top: "0px",
          width: `${last.bg.width}px`,
          height: `${last.bg.height}px`,
          borderRadius: last.bgRadius,
        },
      ],
      timing
    )
  );

  // The deeper recess the items sit in
  animations.push(
    recess.animate(
      [
        {
          left: `${first.recess.left - trackNow.left}px`,
          top: `${first.recess.top - trackNow.top}px`,
          width: `${first.recess.width}px`,
          height: `${first.recess.height}px`,
        },
        { left: "0px", top: "0px", width: `${last.recess.width}px`, height: `${last.recess.height}px` },
      ],
      timing
    )
  );

  // Logo, items and the live indicator glide from their old centres to their new ones
  const glide = (el, a, b, delay = 0) => {
    const dx = centreOf(a).x - centreOf(b).x;
    const dy = centreOf(a).y - centreOf(b).y;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    animations.push(
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }], {
        ...timing,
        delay,
        fill: "backwards",
      })
    );
  };
  glide(logo, first.logo, last.logo);
  glide(live, first.live, last.live);
  [...track.querySelectorAll("[data-nav-index]")].forEach((cell, i) => glide(cell, first.cells[i], last.cells[i], i * 22));

  // The glass: it keeps its identity, travelling and changing size on the way
  const glass = track.querySelector(".nav__glass");
  if (glass && first.glass && index >= 0 && last.cells[index]) {
    const c = last.cells[index];
    const target = glassBox(
      { x: c.left - trackNow.left, y: c.top - trackNow.top, w: c.width, h: c.height },
      mode
    );
    animations.push(
      glass.animate(
        [
          {
            transform: `translate3d(${first.glass.left - trackNow.left}px, ${first.glass.top - trackNow.top}px, 0) scale(${
              first.glass.width / target.w
            }, ${first.glass.height / target.h})`,
          },
          { transform: `translate3d(${target.x}px, ${target.y}px, 0) scale(1, 1)` },
        ],
        { ...timing, easing: "cubic-bezier(0.34, 1.2, 0.64, 1)" }
      )
    );
  }

  return animations;
}

// ---------- pieces ----------

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className="nav__item"
      aria-label={item.label}
      {...preloadProps(item.page)}
    >
      <Icon name={item.icon} size={20} />
      <span className="nav__label">{item.label}</span>
    </NavLink>
  );
}

const storyCount = (slug) => articles.filter((a) => a.category === slug).length;

// The News item also opens a panel of categories. Hover opens it on a computer.
// The little arrow (and tabbing onto the item) opens it from the keyboard.
function NewsCell({ item, index }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(0);
  const { pathname, search } = useLocation();

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  // Any navigation closes the panel.
  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  // Escape or a click elsewhere closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const onFocus = (e) => {
    let byKeyboard = false;
    try {
      byKeyboard = e.target.matches(":focus-visible");
    } catch {
      // very old browsers do not know :focus-visible
    }
    if (byKeyboard) show();
  };

  return (
    <div
      className="nav__cell newsmenu"
      data-nav-index={index}
      ref={wrapRef}
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onFocus={onFocus}
      onBlur={(e) => {
        if (!wrapRef.current.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <NavItem item={item} />
      <button
        className="newsmenu__chev"
        onClick={() => setOpen((o) => !o)}
        aria-label="News categories"
        aria-expanded={open}
        aria-controls="news-categories"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div id="news-categories" className={`newsmenu__panel${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="newsmenu__inner">
          <p className="newsmenu__label">Browse by category</p>
          <div className="newsmenu__grid">
            {categories.map((c) => (
              <Link key={c.slug} to={`/news?category=${c.slug}`} className="newsmenu__item">
                <span className={`newsmenu__dot newsmenu__dot--${c.slug}`} />
                <span className="newsmenu__name">{c.name}</span>
                <span className="newsmenu__count">{storyCount(c.slug)}</span>
              </Link>
            ))}
          </div>
          <Link to="/news" className="newsmenu__all">
            All news
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { tv } = useOnAir();
  const frameRef = useRef(null);
  const bgRef = useRef(null);
  const recessRef = useRef(null);
  const logoRef = useRef(null);
  const liveRef = useRef(null);
  const trackRef = useRef(null);
  const headerRef = useRef(null);
  const snapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [morphing, setMorphing] = useState(false);

  const compact = useCompact();
  const parts = () => ({
    frame: frameRef.current,
    bg: bgRef.current,
    recess: recessRef.current,
    logo: logoRef.current,
    live: liveRef.current,
    track: trackRef.current,
  });

  // Just before the bar and rail swap, remember where everything is.
  const rail = useRailState(() => {
    snapRef.current = snapshotNav(parts());
  });
  const resting = useRailRest(rail, headerRef);

  const mode = compact ? "compact" : rail ? "rail" : "bar";
  const index = activeIndexFor(pathname);
  const box = useActiveBox(trackRef, index, mode);

  // After the swap, animate from the old positions to the new ones.
  useLayoutEffect(() => {
    const first = snapRef.current;
    if (!first) return;
    snapRef.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations = playMorph(first, parts(), index, rail ? "rail" : "bar");
    if (!animations.length) return;

    let cancelled = false;
    setMorphing(true);
    Promise.allSettled(animations.map((a) => a.finished)).then(() => {
      if (!cancelled) setMorphing(false);
    });
    return () => {
      cancelled = true;
      animations.forEach((a) => a.cancel && a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rail]);

  // The glass should snap into place on the first load, and only travel after that.
  useEffect(() => {
    if (!box || ready) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [box, ready]);

  const glass = box && index >= 0 ? glassBox(box, mode) : null;

  return (
    <header
      ref={headerRef}
      className={`nav${ready ? " is-ready" : ""}${morphing ? " is-morphing" : ""}`}
      data-layout={rail ? "rail" : "bar"}
      data-resting={resting}
    >
      <div className="nav__frame" ref={frameRef}>
        <div className="nav__bg" ref={bgRef} aria-hidden="true" />

        <div className="nav__row">
          <Link to="/" className="nav__logo" ref={logoRef} aria-label={`${station.name} home`} {...preloadProps("Home")}>
            <span className="nav__mark">{station.name}</span>
            <span className="nav__sub">Television &amp; Radio</span>
          </Link>

          <nav className="nav__track" aria-label="Main" ref={trackRef}>
            <div className="nav__recess" ref={recessRef} aria-hidden="true" />

            {ITEMS.map((item, i) =>
              item.to === "/news" ? (
                <NewsCell key={item.to} item={item} index={i} />
              ) : (
                <div className="nav__cell" key={item.to} data-nav-index={i}>
                  <NavItem item={item} />
                </div>
              )
            )}

            <LiquidGlass
              preset={INDICATOR}
              className={`nav__glass${glass ? "" : " is-hidden"}`}
              aria-hidden="true"
              style={
                glass
                  ? { width: glass.w, height: glass.h, transform: `translate3d(${glass.x}px, ${glass.y}px, 0)` }
                  : undefined
              }
            />
          </nav>

          <Link
            to="/live"
            className="nav__live"
            ref={liveRef}
            aria-label={`Live now: ${tv.current.title}`}
            {...preloadProps("LiveTV")}
          >
            <span className="live-dot" />
            <span className="nav__livetag">LIVE</span>
            <span className="nav__livetitle">{tv.current.title}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}