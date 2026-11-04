import { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageBand from "../components/PageBand";
import { Icon } from "../components/Icons";
import { timeLeft } from "../components/OnAirCard";
import { useOnAir } from "../hooks/useOnAir";
import { getDaySchedule, hostNames } from "../data/schedule";
import { station } from "../data/config";
import { preloadProps } from "../routes";
import "../styles/schedule.css";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const zone = station.timezone;
const shortDay = new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "short" });
const dayOfMonth = new Intl.DateTimeFormat("en-US", { timeZone: zone, day: "numeric" });
const fullDate = new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "long", month: "long", day: "numeric" });
const city = zone.split("/").pop().replace(/_/g, " ");

// The seven days from today on the station's clock, not the visitor's.
function buildWeek(today) {
  const now = Date.now();
  return Array.from({ length: 7 }, (_, offset) => {
    const ms = now + offset * 86400000;
    const day = (today + offset) % 7;
    return {
      offset,
      day,
      key: WEEKDAYS[day],
      label: offset === 0 ? "Today" : shortDay.format(ms),
      date: dayOfMonth.format(ms),
      full: fullDate.format(ms),
    };
  });
}

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function duration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h && m ? `${h} hr ${m} min` : h ? `${h} hr` : `${m} min`;
}

export default function Schedule() {
  const [params, setParams] = useSearchParams();
  const onAir = useOnAir();
  const nowRef = useRef(null);

  const week = useMemo(() => buildWeek(onAir.day), [onAir.day]);
  const channel = params.get("channel") === "radio" ? "radio" : "tv";
  const selected = week.find((d) => d.key === params.get("day")) ?? week[0];
  const isToday = selected.offset === 0;
  const air = onAir[channel];
  const slots = getDaySchedule(channel, selected.day);

  // The choices live in the address (/schedule?channel=radio&day=sat), so a link shows the same view.
  const choose = (patch) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  useEffect(() => {
    document.title = "Schedule | ITV";
  }, []);

  // Opening the page on today starts at whatever is on air now.
  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);

  const jump = () => nowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });

  return (
    <>
      <PageBand eyebrow="Programmes" title="Schedule">
        What is on TV and radio, today and all week.
      </PageBand>

      <div className="container sched">
        <div className="sched__bar">
          <div className="sched__switch" role="group" aria-label="Channel" data-channel={channel}>
            <button type="button" aria-pressed={channel === "tv"} onClick={() => choose({ channel: null })}>
              <Icon name="tv" size={18} />
              TV
            </button>
            <button type="button" aria-pressed={channel === "radio"} onClick={() => choose({ channel: "radio" })}>
              <Icon name="radio" size={18} />
              Radio
            </button>
          </div>

          <div className="sched__days" role="group" aria-label="Day">
            {week.map((d) => (
              <button
                key={d.key}
                type="button"
                className="sched__day"
                aria-pressed={d.key === selected.key}
                onClick={() => choose({ day: d.offset === 0 ? null : d.key })}
              >
                <span>{d.label}</span>
                <strong>{d.date}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="sched__head">
          <h2>{selected.full}</h2>
          <p>
            Times are in {city} time{isToday ? `. It is ${onAir.time} there now.` : "."}
          </p>
          {isToday && (
            <button type="button" className="sched__jump" onClick={jump}>
              Jump to on air
            </button>
          )}
        </div>

        <ol className="sched__list">
          {slots.map((s) => {
            const now = isToday && s.id === air.current.id;
            const past = isToday && s.endMin <= onAir.minutes;
            const hosts = hostNames(s);
            return (
              <li
                key={s.id}
                ref={now ? nowRef : undefined}
                className={`sched__item${now ? " is-now" : past ? " is-past" : ""}`}
                aria-current={now ? "true" : undefined}
              >
                <div className="sched__time">
                  <strong>{s.startLabel}</strong>
                  <small>{duration(s.endMin - s.startMin)}</small>
                </div>
                <span className="sched__dot" aria-hidden="true" />
                <div className="sched__card">
                  <div className="sched__meta">
                    <span className={`sched__tag sched__tag--${s.category}`}>{capitalise(s.category)}</span>
                    {now && (
                      <span className="sched__badge">
                        <span className="live-dot" />
                        On air
                      </span>
                    )}
                  </div>
                  <h3>{s.title}</h3>
                  {hosts && <p className="sched__hosts">with {hosts}</p>}
                  <p className="sched__desc">{s.desc}</p>

                  {now && (
                    <div className="sched__live">
                      <span className="sched__prog" aria-hidden="true">
                        <span style={{ transform: `scaleX(${air.progress})` }} />
                      </span>
                      <span className="sched__left">{timeLeft(air.minutesLeft)}</span>
                      <Link
                        to={channel === "tv" ? "/live" : "/radio"}
                        className="sched__watch"
                        {...preloadProps(channel === "tv" ? "LiveTV" : "Radio")}
                      >
                        {channel === "tv" ? "Watch live" : "Listen live"}
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}