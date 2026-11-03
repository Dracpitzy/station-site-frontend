import { Link } from "react-router-dom";
import { LiquidGlass } from "./liquid-glass/LiquidGlass";
import { hostNames } from "../data/schedule";
import { station } from "../data/config";
import { preloadProps } from "../routes";

export const timeLeft = (min) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m left` : `${min} min left`);

// A glass card showing what a channel has on right now, with progress and what is next.
export default function OnAirCard({ channel, data }) {
  const { current, next, progress, minutesLeft } = data;
  const isTv = channel === "tv";
  const hosts = hostNames(current);

  return (
    <LiquidGlass
      as={Link}
      to={isTv ? "/live" : "/radio"}
      preset="player"
      radius={28}
      interactive
      className="onair"
      {...preloadProps(isTv ? "LiveTV" : "Radio")}
    >
      <span className="onair__top">
        <span className="live-dot" />
        <span>{isTv ? "TV" : `Radio ${station.frequency}`}</span>
        <span className="onair__left">{timeLeft(minutesLeft)}</span>
      </span>
      <strong className="onair__title">{current.title}</strong>
      <span className="onair__meta">
        {current.startLabel} to {current.endLabel}
        {hosts && `, with ${hosts}`}
      </span>
      <span className="onair__bar">
        <span style={{ transform: `scaleX(${progress})` }} />
      </span>
      <span className="onair__next">
        Next: {next.title} at {next.startLabel}
      </span>
    </LiquidGlass>
  );
}

// A glass card listing the next two programmes on a channel. Links to the full schedule.
export function UpNextCard({ label, data }) {
  const rows = [data.next, data.later];

  return (
    <LiquidGlass
      as={Link}
      to="/schedule"
      preset="player"
      radius={28}
      interactive
      className="upnext"
      {...preloadProps("Schedule")}
    >
      <span className="upnext__label">{label}</span>
      {rows.map((s) => (
        <span className="upnext__row" key={s.id + s.dayOffset}>
          <span className="upnext__time">{s.startLabel}</span>
          <span className="upnext__name">{s.title}</span>
        </span>
      ))}
    </LiquidGlass>
  );
}