import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useOnAir } from "../hooks/useOnAir";
import { tvPlayer, useTvPlayer } from "../player/tv";
import { radioPlayer, useRadioPlayer } from "../player/radio";
import { photoProps } from "../data/images";
import { LiquidGlass } from "./liquid-glass/LiquidGlass";
import { Icon } from "./Icons";
import "../styles/player.css";
import "../styles/mini-radio.css";

const radioCover = photoProps("radio", [160, 320, 480]);
const RADIO_ACTIVE = ["playing", "buffering", "connecting", "reconnecting"];

// Floats above every page while the visitor has the TV or the radio going, except on the page
// that already has the full player. It is always mounted, so the video always has somewhere to go.
// Only one of the two plays at a time, so it shows whichever one is on.
export default function MiniPlayer() {
  const { pathname } = useLocation();
  const tv = useTvPlayer();
  const radio = useRadioPlayer();
  const onAir = useOnAir();
  const slotRef = useRef(null);

  useEffect(() => {
    tvPlayer.setMiniSlot(slotRef.current);
    return () => tvPlayer.setMiniSlot(null);
  }, []);

  // A video that is only autoplaying on the front page never gets a mini-player.
  // It also stays off the Contact page, so it can never cover the form.
  const tvVisible = tv.session && !tv.auto && pathname !== "/live" && pathname !== "/contact";
  const radioVisible = radio.session && radio.status !== "offline" && pathname !== "/radio" && pathname !== "/contact";
  const visible = tvVisible || radioVisible;
  const radioMode = radioVisible && !tvVisible;

  const player = radioMode ? radioPlayer : tvPlayer;
  const playing = radioMode
    ? RADIO_ACTIVE.includes(radio.status)
    : tv.status === "playing" || tv.status === "buffering";
  const title = radioMode ? onAir.radio.current.title : onAir.tv.current.title;

  return (
    <LiquidGlass
      preset="floatingPlayer"
      radius="pill"
      className={`mini${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="mini__row">
        {/* The video slot stays in the page even while the radio is showing, so the video always has a place to go */}
        <Link to="/live" className="mini__video" aria-label="Open live TV" hidden={radioMode}>
          <span className="mini__slot" ref={slotRef} />
        </Link>
        {radioMode && (
          <Link to="/radio" className="mini__video mini__cover" aria-label="Open live radio">
            <img {...radioCover} alt="" sizes="92px" decoding="async" />
          </Link>
        )}

        <Link to={radioMode ? "/radio" : "/live"} className="mini__info">
          <span className="mini__live">
            <span className="live-dot" />
            {radioMode ? "LIVE RADIO" : "LIVE"}
          </span>
          <strong>{title}</strong>
        </Link>

        <button className="mini__btn" onClick={player.toggle} aria-label={playing ? "Pause" : "Play"}>
          <Icon name={playing ? "pause" : "play"} size={20} />
        </button>
        <button className="mini__btn" onClick={player.stop} aria-label="Close player">
          <Icon name="close" size={18} />
        </button>
      </div>
    </LiquidGlass>
  );
}