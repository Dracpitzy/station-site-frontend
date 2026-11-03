import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useOnAir } from "../hooks/useOnAir";
import { useDarkNavSection } from "../hooks/useNavTheme";
import { tvPlayer, useTvPlayer } from "../player/tv";
import { hostNames } from "../data/schedule";
import { photoProps } from "../data/images";
import { LiquidGlass } from "../components/liquid-glass/LiquidGlass";
import { Icon } from "../components/Icons";
import { timeLeft } from "../components/OnAirCard";
import "../styles/player.css";

const STATE_MESSAGES = {
  connecting: "Connecting to the live stream...",
  reconnecting: "Connection lost. Reconnecting...",
  buffering: "Buffering...",
};

export default function LiveTV() {
  const { tv: show } = useOnAir();
  const player = useTvPlayer();
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const slotRef = useRef(null);
  const hideTimer = useRef(0);
  const [awake, setAwake] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useDarkNavSection(sectionRef);

  // Take hold of the one shared video while this page is open, and hand it to the mini-player on the way out.
  useLayoutEffect(() => {
    const el = slotRef.current;
    tvPlayer.attach(el);
    return () => tvPlayer.release(el);
  }, []);

  useEffect(() => {
    tvPlayer.preload();
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // The controls fade away after a few still seconds, but only while the video is playing.
  const wake = useCallback(() => {
    setAwake(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setAwake(false), 3200);
  }, []);

  useEffect(() => {
    if (player.status === "playing") wake();
    return () => clearTimeout(hideTimer.current);
  }, [player.status, wake]);

  const toggleFullscreen = () => {
    const frame = frameRef.current;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.requestFullscreen) frame.requestFullscreen().catch(() => {});
    else frame.querySelector("video")?.webkitEnterFullscreen?.(); // iPhone only fullscreens the video itself
  };

  const onKey = (e) => {
    if (e.target.tagName === "INPUT") return;
    const key = e.key.toLowerCase();
    if ((key === " " || key === "k") && e.target === e.currentTarget) {
      e.preventDefault();
      tvPlayer.toggle();
    } else if (key === "m") tvPlayer.toggleMute();
    else if (key === "f") toggleFullscreen();
    wake();
  };

  const pickLevel = (index) => {
    tvPlayer.setLevel(index);
    setMenuOpen(false);
  };

  const { current, next, later } = show;
  const hosts = hostNames(current);
  const status = player.status;
  const playing = status === "playing";
  const controlsVisible = awake || !playing || menuOpen;
  const showBigPlay = status === "idle" || status === "paused";
  const message = STATE_MESSAGES[status];
  const poster = photoProps("studio", [800, 1280, 1920]);

  return (
    <section className="tvpage" ref={sectionRef}>
      <div className="container">
        <h1 className="sr-only">Watch ITV live</h1>

        <div
          className={`tv__frame${controlsVisible ? "" : " is-idle"}`}
          ref={frameRef}
          tabIndex={0}
          role="group"
          aria-label="Live TV player"
          onPointerMove={wake}
          onPointerDown={wake}
          onKeyDown={onKey}
        >
          <div className="tv__slot" ref={slotRef} onClick={() => tvPlayer.toggle()} />

          {!player.started && (
            <div className="tv__poster">
              <img {...poster} alt="" sizes="(max-width: 1200px) 100vw, 1200px" decoding="async" />
              <div className="tv__posterShade" />
            </div>
          )}

          <div className="tv__top">
            <span className="tv__badge">
              <span className="live-dot" />
              LIVE
            </span>
            <span className="tv__chip">{current.title}</span>
          </div>

          {message && (
            <div className={`tv__state${status === "buffering" ? " tv__state--soft" : ""}`} role="status">
              <span className="tv__spinner" />
              <span>{message}</span>
            </div>
          )}

          {status === "offline" && (
            <div className="tv__state tv__state--offline" role="alert">
              <strong>Live broadcast is currently unavailable.</strong>
              <span>We couldn't connect to the live stream.</span>
              <button className="btn btn--white" onClick={() => tvPlayer.retry()}>
                Retry
              </button>
            </div>
          )}

          {showBigPlay && (
            <LiquidGlass
              as="button"
              type="button"
              preset="floatingPlayer"
              radius="pill"
              interactive
              className="tv__play"
              aria-label={player.started ? "Resume live TV" : "Play live TV"}
              onClick={() => tvPlayer.toggle()}
            >
              <Icon name="play" size={38} />
            </LiquidGlass>
          )}

          <LiquidGlass
            preset="player"
            radius="pill"
            className={`tv__bar${controlsVisible ? "" : " is-hidden"}`}
            aria-hidden={!controlsVisible}
          >
            <div className="tv__controls">
              <button className="tv__btn" onClick={() => tvPlayer.toggle()} aria-label={playing ? "Pause" : "Play"}>
                <Icon name={playing ? "pause" : "play"} />
              </button>

              <div className="tv__vol">
                <button
                  className="tv__btn"
                  onClick={() => tvPlayer.toggleMute()}
                  aria-label={player.muted ? "Unmute" : "Mute"}
                >
                  <Icon name={player.muted || player.volume === 0 ? "mute" : "volume"} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={player.muted ? 0 : player.volume}
                  onChange={(e) => tvPlayer.setVolume(Number(e.target.value))}
                  aria-label="Volume"
                />
              </div>

              <div className="tv__now">
                <strong>{current.title}</strong>
                <small>
                  {current.startLabel} to {current.endLabel}, {timeLeft(show.minutesLeft)}
                </small>
                <span className="tv__prog" aria-hidden="true">
                  <span style={{ transform: `scaleX(${show.progress})` }} />
                </span>
              </div>

              {player.levels.length > 1 && (
                <div className="tv__menuwrap">
                  <button
                    className="tv__btn"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Video quality"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <Icon name="settings" />
                  </button>
                  {menuOpen && (
                    <div className="tv__menu" role="menu">
                      <button role="menuitemradio" aria-checked={player.level === -1} onClick={() => pickLevel(-1)}>
                        Auto
                      </button>
                      {player.levels.map((l) => (
                        <button
                          key={l.index}
                          role="menuitemradio"
                          aria-checked={player.level === l.index}
                          onClick={() => pickLevel(l.index)}
                        >
                          {l.height}p
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tvPlayer.pipSupported && (
                <button className="tv__btn" onClick={() => tvPlayer.togglePip()} aria-label="Picture in picture">
                  <Icon name="pip" />
                </button>
              )}

              <button
                className="tv__btn"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              >
                <Icon name={fullscreen ? "exitFullscreen" : "fullscreen"} />
              </button>
            </div>
          </LiquidGlass>
        </div>

        <div className="tvpage__info">
          <div>
            <p className="tvpage__label">Now playing</p>
            <h2>{current.title}</h2>
            <p className="tvpage__meta">
              {current.startLabel} to {current.endLabel}
              {hosts && `, with ${hosts}`}
            </p>
            <p className="tvpage__desc">{current.desc}</p>
          </div>

          <div>
            <p className="tvpage__label">Up next</p>
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