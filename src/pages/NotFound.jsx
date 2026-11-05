import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useOnAir } from "../hooks/useOnAir";
import { station } from "../data/config";
import { preloadProps } from "../routes";
import "../styles/notfound.css";

// Shown for any address that does not exist. It looks like a television that has lost its signal.
export default function NotFound() {
  const { pathname } = useLocation();
  const { tv } = useOnAir();

  useEffect(() => {
    document.title = `Page not found | ${station.name}`;
  }, []);

  return (
    <section className="container nf">
      <div className="nf__screen" aria-hidden="true">
        <div className="nf__bars">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="nf__badge">
          <span className="live-dot" />
          No signal
        </span>
        <div className="nf__lower">
          <strong>404</strong>
          <small>Channel not found</small>
        </div>
      </div>

      <h1>We’ve lost this signal</h1>
      <p className="nf__text">
        We couldn’t find <code>{pathname}</code>. It may have moved, or it never aired.
      </p>

      <div className="nf__actions">
        <Link to="/" className="btn btn--primary">
          Back to home
        </Link>
        <Link to="/live" className="btn btn--soft" {...preloadProps("LiveTV")}>
          Watch live
        </Link>
        <Link to="/schedule" className="btn btn--soft" {...preloadProps("Schedule")}>
          Programme schedule
        </Link>
        <Link to="/news" className="btn btn--soft" {...preloadProps("News")}>
          Latest news
        </Link>
      </div>

      <p className="nf__now">
        <span className="live-dot" />
        On air now: <strong>{tv.current.title}</strong>
      </p>
    </section>
  );
}