import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icons";
import { useOnAir } from "../hooks/useOnAir";
import { tvPlayer, useTvPlayer } from "../player/tv";
import { photoProps } from "../data/images";
import "../styles/livecard.css";

// The live TV card on the front page. It plays by itself, muted, while it is on screen.
// Hover it for play / pause and sound controls. Click anywhere else on it to open Live TV.
export default function LiveCard() {
  const { tv } = useOnAir();
  const player = useTvPlayer();
  const cardRef = useRef(null);
  const slotRef = useRef(null);
  const poster = photoProps("studio", [480, 800]);

  // Show the shared video here, without counting as "the visitor is watching".
  useLayoutEffect(() => {
    const el = slotRef.current;
    tvPlayer.attach(el, { passive: true });
    return () => tvPlayer.release(el);
  }, []);

  // Autoplay only while the card is on screen and the tab is visible, and never for people who asked for less motion.
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
    observer.observe(cardRef.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const { current } = tv;
  const playing = player.status === "playing" || player.status === "buffering";
  const silent = player.muted || player.volume === 0;
  // The controls stay on show while the sound is off or the video is paused, so they are easy to find.
  const pinned = player.started && (silent || !playing);

  return (
    <div className="live" ref={cardRef}>
      <div className="live__frame">
        <div className="live__slot" ref={slotRef} />

        {!player.started && (
          <div className="live__poster">
            <img {...poster} alt="" sizes="300px" decoding="async" />
          </div>
        )}

        <Link to="/live" className="live__open" aria-label="Open live TV" onClick={() => tvPlayer.engage()} />

        <span className="live__badge">
          <span className="live-dot" />
          LIVE
        </span>

        {!player.started && (
          <button className="live__play" onClick={() => tvPlayer.toggle()} aria-label="Play live TV">
            <Icon name="play" size={22} />
          </button>
        )}

        {player.started && (
          <div className={`live__controls${pinned ? " is-pinned" : ""}`}>
            <button className="live__btn" onClick={() => tvPlayer.toggle()} aria-label={playing ? "Pause" : "Play"}>
              <Icon name={playing ? "pause" : "play"} size={18} />
            </button>
            <button
              className="live__btn"
              onClick={() => tvPlayer.toggleMute()}
              aria-label={silent ? "Turn sound on" : "Turn sound off"}
            >
              <Icon name={silent ? "mute" : "volume"} size={18} />
              {silent && <span>Sound off</span>}
            </button>
          </div>
        )}
      </div>

      <div className="live__meta">
        <strong>{current.title}</strong>
        <span>
          {current.startLabel} to {current.endLabel}
        </span>
      </div>
    </div>
  );
}