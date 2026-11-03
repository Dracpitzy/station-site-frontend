import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { computeGlass, filterMarkup, glassMode } from "./engine";
import { presets } from "./presets";
import "./liquidGlass.css";

/**
 * The Liquid Glass material.
 *
 * preset   name from presets.js, or a preset object (the /lab page tunes one live)
 * radius   number (px) or "pill". Defaults to the preset's radius
 * as       the element to render: "div", "button", "nav", "header"...
 * interactive   adds the spring hover and press feel
 */
export function LiquidGlass({
  as: Tag = "div",
  preset = "player",
  radius,
  interactive = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const p = typeof preset === "string" ? presets[preset] || presets.player : preset;
  const radiusSetting = radius ?? p.radius ?? 28;
  const full = glassMode() === "full";
  const id = "lg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Real refraction needs the element's exact size, so we measure it and re-measure on resize.
  useLayoutEffect(() => {
    if (!full) return;
    const el = ref.current;
    if (!el) return;

    const read = () =>
      setSize((s) =>
        s.w === el.offsetWidth && s.h === el.offsetHeight
          ? s
          : { w: el.offsetWidth, h: el.offsetHeight }
      );
    read();

    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(read, 120);
    });
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [full]);

  const glass = useMemo(
    () => (full && size.w > 1 && size.h > 1 ? computeGlass(p, size.w, size.h, radiusSetting) : null),
    [full, size.w, size.h, p, radiusSetting]
  );

  const r = glass ? glass.radius : radiusSetting === "pill" ? 9999 : radiusSetting;
  const filterUrl = glass ? `url(#${id})` : undefined;

  return (
    <Tag
      ref={ref}
      className={`lg ${full ? "lg--full" : "lg--css"}${interactive ? " lg--interactive" : ""} ${className}`.trim()}
      style={{
        borderRadius: r,
        "--lg-tint": p.tint,
        "--lg-spec": p.specular,
        "--lg-shadow": p.shadow,
        ...style,
      }}
      {...rest}
    >
      <span
        className="lg__backdrop"
        aria-hidden="true"
        style={filterUrl ? { backdropFilter: filterUrl, WebkitBackdropFilter: filterUrl } : undefined}
      />
      <span className="lg__sheen" aria-hidden="true" />
      <span className="lg__content">{children}</span>
      {glass && (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
          style={{ position: "absolute", overflow: "hidden" }}
          colorInterpolationFilters="sRGB"
        >
          <defs dangerouslySetInnerHTML={{ __html: filterMarkup(id, glass) }} />
        </svg>
      )}
    </Tag>
  );
}

export function LiquidGlassButton({ className = "", children, ...props }) {
  return (
    <LiquidGlass as="button" type="button" preset="button" interactive className={`lg-btn ${className}`} {...props}>
      {children}
    </LiquidGlass>
  );
}

export function LiquidGlassPanel({ children, ...props }) {
  return (
    <LiquidGlass preset="player" {...props}>
      {children}
    </LiquidGlass>
  );
}