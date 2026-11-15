import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ITEMS, isActivePath } from "../data/navItems";
import { useBackdropTone } from "../hooks/useBackdropTone";
import { useCompact } from "../hooks/useCompact";
import { preloadProps } from "../routes";
import { Icon } from "./Icons";
import { LiquidGlass } from "./liquid-glass/LiquidGlass";
import "../styles/phonenav.css";

// The navigation on a phone: three separate pieces of glass floating at the bottom of the screen.
//   Home (a circle) | News, Live TV and Radio (a capsule) | More (a circle)
// It slides down out of sight when scrolling stops, and comes straight back when scrolling or touching starts.

const IDLE_MS = 1200; // this long after the last scroll, it slides away (the slide takes about half a second)

// Clear glass with thick convex edges, the same material as the lens in the desktop navigation
const PIECE = {
  radius: "pill",
  thickness: 30,
  bezel: 18,
  ior: 2.2,
  blur: 0.3,
  specular: 0.3,
  tint: 0.02,
  shadow: 0.4,
  saturation: 1.4,
  scaleRatio: 1,
};

const byTo = (to) => ITEMS.find((i) => i.to === to);
const HOME = byTo("/");
const MAIN = ["/news", "/live", "/radio"].map(byTo);
const MORE = ["/schedule", "/about", "/contact"].map(byTo);
const FILLED = { home: "homeFill", news: "newsFill", tv: "tvFill", radio: "radioFill" };

export default function PhoneNav() {
  return useCompact() ? <PhoneNavBar /> : null;
}

function PhoneNavBar() {
  const { pathname } = useLocation();
  const rootRef = useRef(null);
  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);

  // The menu remembers the page it was opened on, so going to another page closes it
  const [openAt, setOpenAt] = useState(null);
  const open = openAt === pathname;
  // Same idea for sliding away: it only applies to the page it happened on, so a new page always starts with the navigation showing
  const [idleAt, setIdleAt] = useState(null);
  const hidden = idleAt === pathname && !open;

  // Dark icons over a light page, white icons over a dark one
  const tone = useBackdropTone(rootRef, true, pathname);

  // Tell the mini-player and the page where the navigation is
  useEffect(() => {
    document.documentElement.dataset.phonenav = hidden ? "hidden" : "shown";
    return () => {
      delete document.documentElement.dataset.phonenav;
    };
  }, [hidden]);

  // Sliding away and coming back
  useEffect(() => {
    let timer = 0;
    let lastY = window.scrollY;
    let pressed = false;

    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const root = rootRef.current;
        const keyboardInside = root && root.querySelector(":focus-visible");
        if (open || pressed || keyboardInside) return;
        setIdleAt(pathname);
      }, IDLE_MS);
    };
    const wake = () => {
      setIdleAt(null);
      arm();
    };

    const onScroll = () => {
      // Ignore a scroll event that did not move the page, so nothing flickers
      if (Math.abs(window.scrollY - lastY) < 1) return;
      lastY = window.scrollY;
      wake();
    };
    // Touching the page brings it back too, so a short page that cannot scroll never loses it for good
    const onPointerDown = (e) => {
      pressed = !!(rootRef.current && rootRef.current.contains(e.target));
      wake();
    };
    const onPointerEnd = () => {
      pressed = false;
      arm();
    };
    const onFocusIn = () => setIdleAt(null);

    arm();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("pointerup", onPointerEnd, { passive: true });
    document.addEventListener("pointercancel", onPointerEnd, { passive: true });
    const root = rootRef.current;
    root && root.addEventListener("focusin", onFocusIn);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("pointerup", onPointerEnd);
      document.removeEventListener("pointercancel", onPointerEnd);
      root && root.removeEventListener("focusin", onFocusIn);
    };
  }, [pathname, open]);

  // Closing the menu: Escape, or touching anywhere outside it
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpenAt(null);
      moreButtonRef.current && moreButtonRef.current.focus();
    };
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const moreActive = MORE.some((i) => isActivePath(i, pathname));

  const piece = (item) => {
    const active = isActivePath(item, pathname);
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`phonenav__link${active ? " is-active" : ""}`}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        {...preloadProps(item.page)}
      >
        <Icon name={active && FILLED[item.icon] ? FILLED[item.icon] : item.icon} size={26} />
      </Link>
    );
  };

  return (
    <div ref={rootRef} className={`phonenav${hidden ? " is-hidden" : ""}`} data-tone={tone}>
      <LiquidGlass preset={PIECE} className="phonenav__piece phonenav__round">
        {piece(HOME)}
      </LiquidGlass>

      <LiquidGlass as="nav" aria-label="Main" preset={PIECE} className="phonenav__piece phonenav__capsule">
        {MAIN.map(piece)}
      </LiquidGlass>

      <div className="phonenav__more" ref={moreRef}>
        <LiquidGlass preset={PIECE} className="phonenav__piece phonenav__round">
          <button
            ref={moreButtonRef}
            type="button"
            className={`phonenav__link${open || moreActive ? " is-active" : ""}`}
            aria-label={open ? "Close menu" : "More pages"}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="phonenav-menu"
            onClick={() => setOpenAt(open ? null : pathname)}
          >
            <Icon name={open ? "close" : "more"} size={26} />
          </button>
        </LiquidGlass>

        <LiquidGlass
          id="phonenav-menu"
          preset="modal"
          radius={28}
          role="dialog"
          aria-label="More pages"
          className={`phonenav__menu${open ? " is-open" : ""}`}
        >
          {MORE.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`phonenav__menuitem${isActivePath(item, pathname) ? " is-active" : ""}`}
              aria-current={isActivePath(item, pathname) ? "page" : undefined}
              tabIndex={open ? 0 : -1}
              {...preloadProps(item.page)}
            >
              <Icon name={item.icon} size={22} />
              <span>{item.label}</span>
            </Link>
          ))}
        </LiquidGlass>
      </div>
    </div>
  );
}
