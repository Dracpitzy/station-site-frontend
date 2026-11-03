import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageBand from "../components/PageBand";
import EmptyState from "../components/EmptyState";
import { Card } from "../components/StoryCards";
import { articles, categories } from "../data/news";
import "../styles/news.css";

const PAGE_SIZE = 12;
const newestFirst = (a, b) => b.published - a.published;

// Keyed by the category, so choosing another category starts again from the first page.
function Listing({ stories }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const visible = stories.slice(0, shown);

  return (
    <>
      <div className="newsgrid">
        {visible.map((s, i) => (
          <Card key={s.id} story={s} wide={i === 0} showCategory />
        ))}
      </div>

      <div className="newsmore">
        <p>
          Showing {visible.length} of {stories.length} stories
        </p>
        {shown < stories.length && (
          <button className="btn btn--soft" onClick={() => setShown((n) => n + PAGE_SIZE)}>
            Show more stories
          </button>
        )}
      </div>
    </>
  );
}

export default function News() {
  const [params] = useSearchParams();
  const slug = params.get("category");
  const category = categories.find((c) => c.slug === slug);
  const unknown = Boolean(slug) && !category;

  const stories = (category ? articles.filter((a) => a.category === category.slug) : articles)
    .slice()
    .sort(newestFirst);
  const title = category ? category.name : "Latest news";

  useEffect(() => {
    document.title = `${title} | ITV`;
  }, [title]);

  return (
    <>
      <PageBand eyebrow="Newsroom" title={title}>
        {category ? `${stories.length} stories in ${category.name}.` : "Stories from across the country, as they develop."}
      </PageBand>

      <div className="container">
        <nav className="newschips" aria-label="News categories">
          <Link to="/news" className="newschips__item" aria-current={!slug ? "true" : undefined}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/news?category=${c.slug}`}
              className="newschips__item"
              aria-current={slug === c.slug ? "true" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {unknown || stories.length === 0 ? (
          <EmptyState title="No stories here yet" action={{ to: "/news", label: "See all news" }}>
            We couldn't find any stories in that category. Try another one, or head back to the full news feed.
          </EmptyState>
        ) : (
          <Listing key={slug || "all"} stories={stories} />
        )}
      </div>
    </>
  );
}