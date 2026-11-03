import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useOnAir } from "../hooks/useOnAir";
import { tvPlayer, useTvPlayer } from "../player/tv";
import { LiquidGlass } from "./liquid-glass/LiquidGlass";
import { Icon } from "./Icons";
import "../styles/player.css";

// Floats above every page except Live TV while the visitor has the stream going.
// It is always mounted, so the video always has somewhere to go when a page lets it go.
export default function MiniPlayer() {
  const { pathname } = useLocation();
  const player = useTvPlayer();
  const { tv } = useOnAir();
  const slotRef = useRef(null);

  useEffect(() => {
    tvPlayer.setMiniSlot(slotRef.current);
    return () => tvPlayer.setMiniSlot(null);
  }, []);

  // A video that is only autoplaying on the front page never gets a mini-player.
  const visible = player.session && !player.auto && pathname !== "/live";
  const playing = player.status === "playing" || player.status === "buffering";

  return (
    <LiquidGlass
      preset="floatingPlayer"
      radius="pill"
      className={`mini${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="mini__row">
        <Link to="/live" className="mini__video" aria-label="Open live TV">
          <span className="mini__slot" ref={slotRef} />
        </Link>

        <Link to="/live" className="mini__info">
          <span className="mini__live">
            <span className="live-dot" />
            LIVE
          </span>
          <strong>{tv.current.title}</strong>
        </Link>

        <button className="mini__btn" onClick={tvPlayer.toggle} aria-label={playing ? "Pause" : "Play"}>
          <Icon name={playing ? "pause" : "play"} size={20} />
        </button>
        <button className="mini__btn" onClick={tvPlayer.stop} aria-label="Close player">
          <Icon name="close" size={18} />
        </button>
      </div>
    </LiquidGlass>
  );
}