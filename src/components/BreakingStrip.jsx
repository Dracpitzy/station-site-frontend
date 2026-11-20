import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { breaking as settings } from "../data/config";
import { useBreaking } from "../hooks/useBreaking";
import { articleLink } from "../lib/articleLink";
import "../styles/breaking.css";

// "12 min ago", "1 h 35 min ago". Rounded down, so it never reads 2 h before the story has actually run out.
function ago(ms, now) {
  const minutes = Math.max(1, Math.floor((now - ms) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)} h${rest ? ` ${rest} min` : ""} ago`;
}

// The red strip under the live panel. It shows each breaking headline in turn, sliding the next one in,
// and folds away when no story is breaking any more. Each headline links to its article.
export default function BreakingStrip() {
  const { list, now } = useBreaking();
  const has = list.length > 0;

  // The strip folds open and shut. While it folds shut the last headlines stay on show.
  const [mounted, setMounted] = useState(has);
  const [open, setOpen] = useState(has);
  const [kept, setKept] = useState(list);
  useEffect(() => {
    let frame = 0;
    let timer = 0;
    if (has) {
      frame = requestAnimationFrame(() => {
        setKept(list);
        setMounted(true);
        frame = requestAnimationFrame(() => setOpen(true));
      });
    } else {
      frame = requestAnimationFrame(() => setOpen(false));
      timer = setTimeout(() => setMounted(false), 550);
    }
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [has, list]);

  const items = has ? list : kept;
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });

  // Which headline is on show, and which one is sliding out
  const [view, setView] = useState({ curId: null, prevId: null });
  const [paused, setPaused] = useState(false);
  const multi = items.length > 1;

  useEffect(() => {
    if (!multi || paused) return;
    const timer = setInterval(() => {
      setView((v) => {
        const all = itemsRef.current;
        const curId = all.some((s) => s.id === v.curId) ? v.curId : all[0].id;
        const next = all[(all.findIndex((s) => s.id === curId) + 1) % all.length];
        return { curId: next.id, prevId: curId };
      });
    }, settings.rotateMs);
    return () => clearInterval(timer);
  }, [multi, paused]);

  // The headline that slid out is removed once it has gone
  useEffect(() => {
    if (!view.prevId) return;
    const timer = setTimeout(() => setView((v) => ({ ...v, prevId: null })), 650);
    return () => clearTimeout(timer);
  }, [view.prevId]);

  if (!mounted) return null;

  const cur = items.find((s) => s.id === view.curId) || items[0];
  const prev = view.prevId && view.prevId !== cur.id ? items.find((s) => s.id === view.prevId) : null;
  const position = items.findIndex((s) => s.id === cur.id) + 1;

  return (
    <section className={`breakwrap${open ? " is-open" : ""}`} aria-label="Breaking news">
      <div className="breakwrap__inner">
        <div
          className="breakbar"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <span className="breakbar__tag">
            <span className="live-dot" />
            Breaking news
          </span>

          <div className="breakbar__view">
            {prev && <Headline key={`out-${prev.id}`} story={prev} state="out" />}
            <Headline key={cur.id} story={cur} state={prev ? "in" : ""} />
          </div>

          {multi && (
            <span className="breakbar__count" aria-label={`Story ${position} of ${items.length}`}>
              {position} / {items.length}
            </span>
          )}
          <span className="breakbar__time">{ago(cur.breakingAt, now)}</span>
        </div>
      </div>
    </section>
  );
}

function Headline({ story, state }) {
  return (
    <Link
      to={articleLink(story)}
      className={`breakbar__item${state ? ` is-${state}` : ""}`}
      tabIndex={state === "out" ? -1 : undefined}
      aria-hidden={state === "out" ? true : undefined}
    >
      {story.title}
    </Link>
  );
}
