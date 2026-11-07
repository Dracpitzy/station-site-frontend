import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icons";
import { useOnAir } from "../hooks/useOnAir";
import { tvPlayer, useTvPlayer } from "../player/tv";
import { photoProps } from "../data/images";
import { preloadProps } from "../routes";
import "../styles/livestrip.css";

// The player that opens under the strip. It shows the shared video, so playback carries straight on
// when it is closed: the mini-player picks it up.
function StripPlayer() {
  const slotRef = useRef(null);
  const player = useTvPlayer();

  useLayoutEffect(() => {
    const el = slotRef.current;
    tvPlayer.attach(el);
    return () => tvPlayer.release(el);
  }, []);

  const playing = player.status === "playing" || player.status === "buffering";
  const silent = player.muted || player.volume === 0;

  return (
    <div className="livestrip__player">
      <div className="livestrip__screen">
        <div className="livestrip__slot" ref={slotRef} />
        {player.status === "offline" && (
          <div className="livestrip__error" role="alert">
            <span>The live stream is not available right now.</span>
            <button type="button" className="livestrip__btn" onClick={() => tvPlayer.retry()}>
              Try again
            </button>
          </div>
        )}
      </div>
      <div className="livestrip__controls">
        <button type="button" className="livestrip__btn" onClick={() => tvPlayer.toggle()} aria-label={playing ? "Pause" : "Play"}>
          <Icon name={playing ? "pause" : "play"} size={18} />
        </button>
        <button
          type="button"
          className="livestrip__btn"
          onClick={() => tvPlayer.toggleMute()}
          aria-label={silent ? "Turn sound on" : "Turn sound off"}
        >
          <Icon name={silent ? "mute" : "volume"} size={18} />
          {silent && <span>Sound off</span>}
        </button>
        <Link to="/live" className="livestrip__page" {...preloadProps("LiveTV")}>
          Full page
        </Link>
      </div>
    </div>
  );
}

// On a phone, live TV is a slim strip: a small picture, what is on air, and a Watch button.
// Nothing plays until the visitor taps Watch, so it does not use up mobile data by itself.
export default function LiveStrip() {
  const { tv } = useOnAir();
  const player = useTvPlayer();
  const [open, setOpen] = useState(false);
  const thumb = photoProps("studio", [160, 320]);
  const { current, next } = tv;

  const toggle = () => {
    if (!open && !player.session) tvPlayer.start();
    setOpen((o) => !o);
  };

  return (
    <section className="livestrip" aria-label="Live on ITV">
      <div className="livestrip__bar">
        <Link to="/live" className="livestrip__thumb" aria-label="Open live TV" {...preloadProps("LiveTV")}>
          <img {...thumb} alt="" sizes="80px" decoding="async" />
        </Link>

        <div className="livestrip__text">
          <span className="livestrip__kicker">
            <span className="live-dot" />
            LIVE
          </span>
          <strong>{current.title}</strong>
          <span className="livestrip__next">
            Next: {next.title}, {next.startLabel}
          </span>
        </div>

        <button type="button" className="livestrip__watch" aria-expanded={open} onClick={toggle}>
          {open ? "Minimise" : "Watch"}
        </button>
      </div>

      {open && <StripPlayer />}
    </section>
  );
}