import { Link } from "react-router-dom";
import Cover from "./Cover";
import { articleLink } from "./StoryCards";
import { categoryName, timeAgo } from "../data/news";
import "../styles/tiles.css";

// The story layouts used on the front page. They are plain: a picture, a small category label,
// a condensed headline and the time. No boxes, no shadows.

function Meta({ story, readTime = false }) {
  return (
    <span className="tile__meta">
      <span>{timeAgo(story.published)}</span>
      {readTime && <span>{story.readMins} min read</span>}
    </span>
  );
}

// The big one. size="lead" is the main story of the page, size="feature" is the leader of a category.
export function LeadTile({ story, size = "lead" }) {
  return (
    <Link to={articleLink(story)} className={`tile tile--${size}`}>
      <Cover
        story={story}
        eager={size === "lead"}
        sizes={size === "lead" ? "(max-width: 900px) 100vw, 760px" : "(max-width: 900px) 100vw, 640px"}
        className="tile__img"
      />
      <span className="tile__body">
        <span className="tile__cat">{categoryName(story.category)}</span>
        <h2 className="tile__title">{story.title}</h2>
        <span className="tile__summary">{story.summary}</span>
        <Meta story={story} readTime />
      </span>
    </Link>
  );
}

// A smaller story with its own picture, stacked beside the lead.
export function SideTile({ story }) {
  return (
    <Link to={articleLink(story)} className="tile tile--side">
      <Cover story={story} sizes="(max-width: 900px) 100vw, 400px" className="tile__img" />
      <span className="tile__body">
        <span className="tile__cat">{categoryName(story.category)}</span>
        <h3 className="tile__title">{story.title}</h3>
        <Meta story={story} />
      </span>
    </Link>
  );
}

// A standard story for grids: picture, label, headline, time. A short summary can be switched on.
export function GridTile({ story, summary = false }) {
  return (
    <Link to={articleLink(story)} className="tile tile--grid">
      <Cover story={story} sizes="(max-width: 900px) 50vw, 380px" className="tile__img" />
      <span className="tile__body">
        <span className="tile__cat">{categoryName(story.category)}</span>
        <h3 className="tile__title">{story.title}</h3>
        {summary && <span className="tile__summary">{story.summary}</span>}
        <Meta story={story} />
      </span>
    </Link>
  );
}

// A compact row: a small picture beside the headline. For lists of supporting stories.
export function RowTile({ story }) {
  return (
    <Link to={articleLink(story)} className="tile tile--row">
      <Cover story={story} sizes="120px" className="tile__img" />
      <span className="tile__body">
        <span className="tile__cat">{categoryName(story.category)}</span>
        <h3 className="tile__title">{story.title}</h3>
        <Meta story={story} />
      </span>
    </Link>
  );
}