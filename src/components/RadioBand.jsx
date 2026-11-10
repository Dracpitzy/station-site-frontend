import { Link } from "react-router-dom";
import { Icon } from "./Icons";
import { timeLeft } from "./OnAirCard";
import { useOnAir } from "../hooks/useOnAir";
import { radioPlayer, useRadioPlayer } from "../player/radio";
import { hostNames } from "../data/schedule";
import { station } from "../data/config";
import { photoProps } from "../data/images";
import { preloadProps } from "../routes";
import "../styles/radioband.css";

const ACTIVE = ["playing", "buffering", "connecting", "reconnecting"];

// ITV Radio on the front page: a band of blue frosted glass across a photograph.
// "Listen live" starts the radio right here. The mini-player takes over when the visitor goes elsewhere.
export default function RadioBand() {
  const { radio } = useOnAir();
  const player = useRadioPlayer();
  const photo = photoProps("radio", [800, 1280, 1920]);

  const { current, next, progress, minutesLeft } = radio;
  const hosts = hostNames(current);
  const active = ACTIVE.includes(player.status);

  return (
    <section className="radioband" aria-label="ITV Radio" data-tone="dark">
      <img className="radioband__bg" {...photo} alt="" sizes="100vw" loading="lazy" decoding="async" />
      <div className="radioband__shade" aria-hidden="true" />

      <div className="radioband__glass">
        <div className="container radioband__row">
          <div className="radioband__id">
            <p className="radioband__label">
              <span className="live-dot" />
              ITV Radio {station.frequency}
            </p>
            <h2>{current.title}</h2>
            <p className="radioband__time">
              {current.startLabel} to {current.endLabel}
              {hosts && `, with ${hosts}`}
            </p>
          </div>

          <div className="radioband__mid">
            <div className="radioband__progress">
              <span className="radioband__bar" aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </span>
              <span>{timeLeft(minutesLeft)}</span>
            </div>
            <p className="radioband__next">
              Next: <strong>{next.title}</strong> at {next.startLabel}
            </p>
          </div>

          <div className="radioband__actions">
            <button type="button" className="btn btn--white" onClick={radioPlayer.toggle}>
              <Icon name={active ? "pause" : "play"} size={18} />
              {active ? "Pause" : "Listen live"}
            </button>
            <Link to="/radio" className="radioband__more" {...preloadProps("Radio")}>
              Open the radio page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}