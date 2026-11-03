import { useRef, useState } from "react";
import { LiquidGlass } from "../components/liquid-glass/LiquidGlass";
import { glassMode } from "../components/liquid-glass/engine";
import "../styles/lab.css";

const SLIDERS = [
  ["thickness", "Thickness", 5, 100, 1],
  ["bezel", "Bezel", 5, 70, 1],
  ["ior", "IOR", 1.2, 3, 0.05],
  ["blur", "Blur", 0, 4, 0.1],
  ["specular", "Specular", 0, 1, 0.05],
  ["tint", "Tint", 0, 0.2, 0.005],
  ["shadow", "Shadow", 0, 1, 0.05],
  ["radius", "Radius", 10, 90, 1],
];

const START = {
  thickness: 55,
  bezel: 40,
  ior: 2.6,
  blur: 1.2,
  specular: 0.55,
  tint: 0.05,
  shadow: 0.45,
  radius: 44,
  saturation: 3,
  scaleRatio: 1,
};

// A glass surface you can drag around, so you can watch the background bend as it moves.
function DragLens({ start, children, className = "", style, ...props }) {
  const [pos, setPos] = useState(start);
  const grab = useRef(null);

  return (
    <LiquidGlass
      {...props}
      className={`lab__lens ${className}`}
      style={{ left: pos.x, top: pos.y, ...style }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        grab.current = { x: e.pageX - pos.x, y: e.pageY - pos.y };
      }}
      onPointerMove={(e) => {
        if (grab.current) setPos({ x: e.pageX - grab.current.x, y: e.pageY - grab.current.y });
      }}
      onPointerUp={() => (grab.current = null)}
      onPointerCancel={() => (grab.current = null)}
    >
      {children}
    </LiquidGlass>
  );
}

export default function Lab() {
  const [tune, setTune] = useState(START);
  const mode = glassMode();
  const narrow = window.innerWidth < 760;

  return (
    <section className="lab">
      {/* Test card: bright colour, hard lines, big text and a few high-contrast shapes */}
      <div className="lab__bar" style={{ left: "6%", top: "44%", width: "58%", height: 16, background: "#000" }} />
      <div className="lab__bar" style={{ left: "30%", top: "62%", width: "50%", height: 10, background: "#ffd23f" }} />
      <div className="lab__dot" style={{ left: "62%", top: "50%", width: 130, height: 130, background: "#fff" }} />
      <div className="lab__word" style={{ left: "5%", top: "50%" }}>WATCH</div>
      <div className="lab__word" style={{ right: "3%", top: "28%" }}>LISTEN</div>
      <div className="lab__word" style={{ left: "26%", top: "66%" }}>READ</div>

      <div className="container lab__intro">
        <h1>Glass lab</h1>
        <p>Drag the glass over the colours, lines and text. Near its curved edges the background should visibly bend.</p>
        <span className="lab__mode">
          {mode === "full"
            ? "Refraction on. Add ?glass=css to the address to preview the iPhone look."
            : "Fallback mode: frosted glass. This is what iPhone, Safari and Firefox visitors see."}
        </span>
      </div>

      <DragLens start={{ x: 24, y: 270 }} preset={tune} style={{ width: 300, height: 180 }}>
        <span className="lab__label">Tuned lens</span>
      </DragLens>

      <DragLens
        start={narrow ? { x: 24, y: 470 } : { x: 400, y: 280 }}
        preset="navbar"
        style={{ width: 300, height: 60 }}
      >
        <span className="lab__label">navbar preset</span>
      </DragLens>

      <DragLens
        as="button"
        type="button"
        interactive
        start={narrow ? { x: 24, y: 550 } : { x: 400, y: 370 }}
        preset="button"
        style={{ width: 170, height: 52, color: "#fff" }}
      >
        <span className="lab__label">Watch Live</span>
      </DragLens>

      <DragLens
        start={narrow ? { x: 24, y: 620 } : { x: 400, y: 450 }}
        preset="floatingPlayer"
        radius="pill"
        style={{ width: 320, height: 76 }}
      >
        <span className="lab__label" style={{ gridAutoFlow: "column", gap: "0.7rem", justifyContent: "center" }}>
          <span className="live-dot" />
          <span>ITV Radio</span>
        </span>
      </DragLens>

      <details className="lab__tuner" open={!narrow}>
        <summary>Tune the first lens</summary>
        {SLIDERS.map(([key, label, min, max, step]) => (
          <label key={key}>
            {label}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={tune[key]}
              onChange={(e) => setTune((t) => ({ ...t, [key]: Number(e.target.value) }))}
            />
            <output>{tune[key]}</output>
          </label>
        ))}
        <pre>{JSON.stringify(tune, null, 2)}</pre>
      </details>
    </section>
  );
}