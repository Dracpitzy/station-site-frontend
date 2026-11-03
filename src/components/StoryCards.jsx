import { Link } from "react-router-dom";
import Cover from "./Cover";
import { categoryName, timeAgo } from "../data/news";
import "../styles/stories.css";

export const articleLink = (s) => `/news/${s.id}`;

// A small section title with an accent bar, and an optional "View all" link.
export function BlockHead({ children, to }) {
  return (
    <div className="blockhead">
      <h2>{children}</h2>
      {to && (
        <Link to={to} className="blockhead__more">
          View all
        </Link>
      )}
    </div>
  );
}

// A story card: picture on top, headline underneath.
export function Card({ story, wide = false, showCategory = false }) {
  return (
    <Link to={articleLink(story)} className={`card${wide ? " card--wide" : ""}`}>
      <Cover
        story={story}
        eager={wide}
        sizes={wide ? "(max-width: 720px) 100vw, 580px" : "(max-width: 720px) 50vw, 280px"}
        className="card__cover"
      />
      {showCategory && <small className="card__cat">{categoryName(story.category)}</small>}
      <strong>{story.title}</strong>
      <span className="meta">
        <span>{timeAgo(story.published)}</span>
        {wide && <span>{story.readMins} min read</span>}
      </span>
    </Link>
  );
}