import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icons";
import { timeLeft } from "./OnAirCard";
import { useOnAir } from "../hooks/useOnAir";
import { tvPlayer, useTvPlayer } from "../player/tv";
import { hostNames } from "../data/schedule";
import { photoProps } from "../data/images";
import { preloadProps } from "../routes";
import "../styles/livepanel.css";

// The live TV panel under the navigation: the picture on the left, what is on air on the right.
// The picture plays by itself, muted, while it is on screen. Hover it for play / pause and sound.
// Click the picture or "Watch live" to open the full player.
export default function LivePanel() {
  const { tv } = useOnAir();
  const player = useTvPlayer();
  const panelRef = useRef(null);
  const slotRef = useRef(null);
  const poster = photoProps("studio", [480, 800]);

  // Show the shared video here, without counting as "the visitor is watching".
  useLayoutEffect(() => {
    const el = slotRef.current;
    tvPlayer.attach(el, { passive: true });
    return () => tvPlayer.release(el);
  }, []);

  // Autoplay only while the panel is on screen and the tab is visible, and never for people who asked for less motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inView = false;
    const sync = () =>
      inView && document.visibilityState === "visible" ? tvPlayer.autoStart() : tvPlayer.autoPause();

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.4 }
    );
    observer.observe(panelRef.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const { current, next, progress, minutesLeft } = tv;
  const hosts = hostNames(current);
  const playing = player.status === "playing" || player.status === "buffering";
  const silent = player.muted || player.volume === 0;
  // The controls stay on show while the sound is off or the video is paused, so they are easy to find.
  const pinned = player.started && (silent || !playing);

  return (
    <section className="livepanel" ref={panelRef} aria-label="Live on ITV">
      <div className="livepanel__video">
        <div className="livepanel__slot" ref={slotRef} />

        {!player.started && (
          <div className="livepanel__poster">
            <img {...poster} alt="" sizes="460px" decoding="async" />
          </div>
        )}

        <Link to="/live" className="livepanel__open" aria-label="Open live TV" onClick={() => tvPlayer.engage()} />

        <span className="livepanel__badge">
          <span className="live-dot" />
          LIVE
        </span>

        {!player.started && (
          <button className="livepanel__play" onClick={() => tvPlayer.toggle()} aria-label="Play live TV">
            <Icon name="play" size={22} />
          </button>
        )}

        {player.started && (
          <div className={`livepanel__controls${pinned ? " is-pinned" : ""}`}>
            <button className="livepanel__btn" onClick={() => tvPlayer.toggle()} aria-label={playing ? "Pause" : "Play"}>
              <Icon name={playing ? "pause" : "play"} size={18} />
            </button>
            <button
              className="livepanel__btn"
              onClick={() => tvPlayer.toggleMute()}
              aria-label={silent ? "Turn sound on" : "Turn sound off"}
            >
              <Icon name={silent ? "mute" : "volume"} size={18} />
              {silent && <span>Sound off</span>}
            </button>
          </div>
        )}
      </div>

      <div className="livepanel__info">
        <p className="livepanel__kicker">
          <span className="live-dot" />
          On air now on ITV
        </p>
        <h2>{current.title}</h2>
        <p className="livepanel__time">
          {current.startLabel} to {current.endLabel}
          {hosts && `, with ${hosts}`}
        </p>
        <p className="livepanel__desc">{current.desc}</p>

        <div className="livepanel__progress">
          <span className="livepanel__bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </span>
          <span>{timeLeft(minutesLeft)}</span>
        </div>

        <div className="livepanel__foot">
          <Link to="/live" className="btn btn--white" onClick={() => tvPlayer.engage()} {...preloadProps("LiveTV")}>
            <Icon name="play" size={18} />
            Watch live
          </Link>
          <span className="livepanel__next">
            Next: <strong>{next.title}</strong> at {next.startLabel}
          </span>
        </div>
      </div>
    </section>
  );
}