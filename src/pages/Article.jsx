import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Cover from "../components/Cover";
import EmptyState from "../components/EmptyState";
import ShareBar from "../components/ShareBar";
import { BlockHead, Card } from "../components/StoryCards";
import { articleBody } from "../data/articleBody";
import { station } from "../data/config";
import { photos } from "../data/images";
import { categoryName, getArticle, inCategory, latest } from "../data/news";
import "../styles/stories.css";
import "../styles/article.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: station.timezone,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

// The thin bar at the top of the window that fills as you read down the article.
function useReadingProgress(bodyRef, barRef) {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const body = bodyRef.current;
      const bar = barRef.current;
      if (!body || !bar) return;
      const rect = body.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      // 0 when the text reaches the middle of the window, 1 when its end does.
      const p = (window.scrollY + window.innerHeight * 0.5 - top) / rect.height;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [bodyRef, barRef]);
}

function ArticleView({ id }) {
  const story = getArticle(id);
  const bodyRef = useRef(null);
  const barRef = useRef(null);
  useReadingProgress(bodyRef, barRef);

  useEffect(() => {
    document.title = story ? `${story.title} | ITV` : "Story not found | ITV";
  }, [story]);

  if (!story) {
    return (
      <div className="container">
        <EmptyState title="We couldn't find that story" action={{ to: "/news", label: "Go to the news" }}>
          It may have been moved or taken down. The latest stories are always on the news page.
        </EmptyState>
      </div>
    );
  }

  const name = categoryName(story.category);
  const related = [
    ...inCategory(story.category, 4, [story.id]),
    ...latest(8, [story.id]).filter((a) => a.category !== story.category),
  ].slice(0, 4);
  const caption = story.photo ? photos[story.photo]?.alt : null;

  return (
    <article>
      <div className="readbar" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <div className="container">
        <header className="article__col article__head">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/news">News</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/news?category=${story.category}`}>{name}</Link>
          </nav>

          <h1>{story.title}</h1>
          <p className="article__dek">{story.summary}</p>

          <div className="article__meta">
            <span>By {story.author}</span>
            <span>{dateFormat.format(story.published)}</span>
            <span>{story.readMins} min read</span>
          </div>

          <ShareBar title={story.title} />
        </header>

        <figure className="article__hero">
          <Cover story={story} eager sizes="(max-width: 960px) 100vw, 960px" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>

        <div className="article__col article__body" ref={bodyRef}>
          {articleBody(story).map((block, i) =>
            block.type === "h2" ? <h2 key={i}>{block.text}</h2> : <p key={i}>{block.text}</p>
          )}
          <p className="article__note">This story was written for the ITV website demo.</p>
        </div>

        <div className="article__col article__end">
          <ShareBar title={story.title} />
        </div>

        <section className="rowsec">
          <BlockHead to={`/news?category=${story.category}`}>More from {name}</BlockHead>
          <div className="rowsec__grid">
            {related.map((s) => (
              <Card key={s.id} story={s} showCategory />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

// Keyed by the story, so opening a related story starts the page afresh.
export default function Article() {
  const { slug } = useParams();
  return <ArticleView key={slug} id={slug} />;
}