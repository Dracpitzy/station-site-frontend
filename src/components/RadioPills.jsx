import { useEffect, useState } from "react";
import { radioStations } from "../data/config";
import { radioPlayer, useRadioPlayer } from "../player/radio";
import { Icon } from "./Icons";
import "../styles/radiopills.css";

const ACTIVE = ["playing", "buffering", "connecting", "reconnecting"];

// The live radios as play buttons: one for each station.
//   variant "pills": small pills, for the front page.   variant "cards": larger cards, for the Radio page.
//   inline: the "off the air" message sits in the layout instead of floating over it (used on phones).
// A station that is off the air does not play. Tapping it says so, and offers the one that is live.
export default function RadioPills({ variant = "pills", inline = false, label }) {
  const player = useRadioPlayer();
  const [downId, setDownId] = useState(null);

  const down = radioStations.find((s) => s.id === downId);
  const alternative = radioStations.find((s) => s.live);

  // The message goes away by itself, or on Escape
  useEffect(() => {
    if (!downId) return;
    const timer = setTimeout(() => setDownId(null), 9000);
    const onKey = (e) => e.key === "Escape" && setDownId(null);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [downId]);

  const press = (s) => {
    if (!s.live) {
      setDownId(s.id);
      return;
    }
    setDownId(null);
    radioPlayer.play(s.id);
  };

  return (
    <div className={`rpills rpills--${variant}${inline ? " is-inline" : ""}`}>
      <div className="rpills__head">
        {label && <span className="rpills__label">{label}</span>}
        <div className="rpills__row">
          {radioStations.map((s) => {
            const playing = s.live && player.stationId === s.id && ACTIVE.includes(player.status);
            const name = variant === "cards" ? s.fullName : s.name;
            return (
              <button
                key={s.id}
                type="button"
                className={`rpill${playing ? " is-playing" : ""}${s.live ? "" : " is-down"}`}
                onClick={() => press(s)}
                aria-pressed={s.live ? playing : undefined}
                aria-label={
                  s.live
                    ? `${playing ? "Pause" : "Play"} ${s.fullName} ${s.frequency}`
                    : `${s.fullName} is off the air for now`
                }
              >
                <span className="rpill__icon">
                  <Icon name={!s.live ? "signalSlash" : playing ? "pause" : "play"} size={variant === "cards" ? 20 : 15} />
                </span>
                <span className="rpill__text">
                  <span className="rpill__name">{name}</span>
                  {s.live ? (
                    <span className="rpill__freq">{s.frequency}</span>
                  ) : (
                    // The real number is not shown: this is only a blurred placeholder
                    <span className="rpill__freq is-blurred" aria-hidden="true">
                      00.0 FM
                    </span>
                  )}
                  {variant === "cards" && (
                    <span className="rpill__status">{!s.live ? "Off the air for now" : playing ? "Playing" : "Live"}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {down && (
        <div className="rnotice" role="status">
          <span className="rnotice__icon">
            <Icon name="signalSlash" size={22} />
          </span>
          <div className="rnotice__body">
            <strong>{down.fullName} is off the air for now</strong>
            <p>We are working to bring it back.{alternative ? ` ${alternative.fullName} is live if you would like to listen.` : ""}</p>
            <div className="rnotice__actions">
              {alternative && (
                <button
                  type="button"
                  className="rnotice__btn"
                  onClick={() => {
                    setDownId(null);
                    radioPlayer.play(alternative.id);
                  }}
                >
                  Listen to {alternative.name}
                </button>
              )}
              <button type="button" className="rnotice__close" onClick={() => setDownId(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
