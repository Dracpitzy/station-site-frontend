import { useRef } from "react";
import { Link } from "react-router-dom";
import { useOnAir } from "../hooks/useOnAir";
import { useDarkNavSection } from "../hooks/useNavTheme";
import { radioPlayer, useRadioPlayer } from "../player/radio";
import { getDaySchedule, hostNames } from "../data/schedule";
import { station } from "../data/config";
import { photoProps } from "../data/images";
import { LiquidGlass } from "../components/liquid-glass/LiquidGlass";
import { Icon } from "../components/Icons";
import { timeLeft } from "../components/OnAirCard";
import "../styles/player.css";
import "../styles/radio.css";

const STATE_MESSAGES = {
  connecting: "Connecting to the live stream...",
  reconnecting: "Connection lost. Reconnecting...",
  buffering: "Buffering...",
};

export default function Radio() {
  const { radio: show, day, minutes } = useOnAir();
  const player = useRadioPlayer();
  const sectionRef = useRef(null);

  useDarkNavSection(sectionRef);

  const { current, next, later, progress, minutesLeft } = show;
  const hosts = hostNames(current);
  const status = player.status;
  const active = ["playing", "buffering", "connecting", "reconnecting"].includes(status);
  const message = STATE_MESSAGES[status];
  const background = photoProps("radio", [800, 1280, 1920]);
  const cover = photoProps("radio", [480, 800, 1280]);
  const today = getDaySchedule("radio", day);
  const silent = player.muted || player.volume === 0;

  return (
    <section className="tvpage radiopage" ref={sectionRef}>
      <img className="radiopage__bg" {...background} alt="" sizes="100vw" decoding="async" fetchPriority="high" />
      <div className="radiopage__shade" aria-hidden="true" />

      <div className="container">
        <header className="radiopage__head">
          <p className="tvpage__label radiopage__tag">
            <span className="live-dot" />
            Radio {station.frequency}
          </p>
          <h1>Listen live</h1>
        </header>

        <LiquidGlass preset="player" radius={36} className={`rplayer${status === "playing" ? " is-playing" : ""}`}>
          <div className="rplayer__body">
            <div className="rplayer__art">
              <img {...cover} alt="" sizes="(max-width: 760px) 70vw, 240px" decoding="async" />
              <span className="rplayer__eq" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>

            <div className="rplayer__main">
              <p className="tvpage__label">On air now</p>
              <h2>{current.title}</h2>
              <p className="tvpage__meta">
                {current.startLabel} to {current.endLabel}
                {hosts && `, with ${hosts}`}
              </p>
              <span className="tv__prog" aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </span>
              <p className="rplayer__left">{timeLeft(minutesLeft)}</p>

              <div className="rplayer__controls">
                <button
                  type="button"
                  className="rplayer__play"
                  data-state={active ? "pause" : "play"}
                  onClick={radioPlayer.toggle}
                  aria-label={active ? "Pause live radio" : "Play live radio"}
                >
                  <Icon name={active ? "pause" : "play"} size={30} />
                </button>

                <div className="tv__vol rplayer__vol">
                  <button
                    type="button"
                    className="tv__btn"
                    onClick={radioPlayer.toggleMute}
                    aria-label={silent ? "Unmute" : "Mute"}
                  >
                    <Icon name={silent ? "mute" : "volume"} size={22} />
                  </button>
                  {radioPlayer.volumeSettable && (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={player.muted ? 0 : player.volume}
                      onChange={(e) => radioPlayer.setVolume(Number(e.target.value))}
                      aria-label="Volume"
                    />
                  )}
                </div>
              </div>

              <div className="rplayer__status" role="status" aria-live="polite">
                {message && (
                  <>
                    <span className="tv__spinner rplayer__spinner" />
                    <span>{message}</span>
                  </>
                )}
                {status === "offline" && (
                  <>
                    <span>The live stream is not available right now.</span>
                    <button type="button" className="rplayer__retry" onClick={radioPlayer.retry}>
                      Try again
                    </button>
                  </>
                )}
                {status === "idle" && <span>Press play to listen live.</span>}
              </div>
            </div>
          </div>
        </LiquidGlass>

        <div className="tvpage__info">
          <div>
            <p className="tvpage__label">Today on radio</p>
            <ul className="tvpage__next rlist">
              {today.map((s) => {
                const now = s.id === current.id;
                const past = s.endMin <= minutes;
                return (
                  <li key={s.id} className={now ? "is-now" : past ? "is-past" : undefined} aria-current={now ? "true" : undefined}>
                    <span className="tvpage__time">{s.startLabel}</span>
                    <span>{s.title}</span>
                    {now && <span className="rlist__tag">On air</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="tvpage__label">About this show</p>
            <p className="tvpage__desc">{current.desc}</p>

            <p className="tvpage__label radiopage__gap">Up next</p>
            <ul className="tvpage__next">
              {[next, later].map((s) => (
                <li key={s.id + s.dayOffset}>
                  <span className="tvpage__time">{s.startLabel}</span>
                  <span>{s.title}</span>
                </li>
              ))}
            </ul>
            <Link to="/schedule" className="tvpage__more">
              Full schedule
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}