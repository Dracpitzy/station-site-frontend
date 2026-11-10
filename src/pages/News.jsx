import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { GridTile, LeadTile, RowTile, SideTile } from "../components/Tiles";
import { BlockHead, articleLink } from "../components/StoryCards";
import { useIsPhone } from "../hooks/useIsPhone";
import { articles, categories, categoryName, inCategory, popular, timeAgo } from "../data/news";
import "../styles/home.css"; // the section layouts shared with the front page
import "../styles/news.css";

const PAGE_SIZE = 9;
const newestFirst = (a, b) => b.published - a.published;

// Choosing a category starts the page again from the top of that category.
function Listing({ stories, phone }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const visible = stories.slice(0, shown);

  return (
    <>
      {phone ? (
        <div className="rows rows--latest">
          {visible.map((s) => (
            <RowTile key={s.id} story={s} />
          ))}
        </div>
      ) : (
        <div className="grid grid--3">
          {visible.map((s) => (
            <GridTile key={s.id} story={s} />
          ))}
        </div>
      )}

      <div className="newsmore">
        <p>
          Showing {visible.length} of {stories.length} stories
        </p>
        {shown < stories.length && (
          <button type="button" className="newsmore__btn" onClick={() => setShown((n) => n + PAGE_SIZE)}>
            Show more stories
          </button>
        )}
      </div>
    </>
  );
}

// A subject on the page: one larger story, with smaller ones beside it or under it. The arrangement
// changes from one subject to the next, so the sections do not all look the same.
function CategoryBlock({ slug, stories, index, phone }) {
  const [first, ...rest] = stories;
  const kind = phone || stories.length < 3 ? "feature" : ["feature", "trio", "feature-flip"][index % 3];

  return (
    <section className="hsec">
      <BlockHead to={`/news?category=${slug}`} label="View more">
        {categoryName(slug)}
      </BlockHead>

      {kind === "trio" ? (
        <div className="grid grid--3">
          {stories.slice(0, 3).map((s) => (
            <GridTile key={s.id} story={s} summary />
          ))}
        </div>
      ) : phone ? (
        <>
          <LeadTile story={first} size="feature" />
          <div className="rows rows--after">
            {rest.slice(0, 2).map((s) => (
              <RowTile key={s.id} story={s} />
            ))}
          </div>
        </>
      ) : (
        <div className={`sec${kind === "feature-flip" ? " sec--flip" : ""}`}>
          <LeadTile story={first} size="feature" />
          <div className="rows">
            {rest.slice(0, 2).map((s) => (
              <RowTile key={s.id} story={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function News() {
  const phone = useIsPhone();
  const [params] = useSearchParams();
  const tabsRef = useRef(null);
  const slug = params.get("category");
  const category = categories.find((c) => c.slug === slug);
  const unknown = Boolean(slug) && !category;

  const pool = (category ? articles.filter((a) => a.category === category.slug) : articles).slice().sort(newestFirst);
  const title = category ? category.name : "News";

  useEffect(() => {
    document.title = `${title} | ITV`;
  }, [title]);

  // On a narrow screen the chosen tab can be off to the side, so bring it into view
  useEffect(() => {
    tabsRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [slug]);

  // The featured block: the editorial lead and the two newest others, or the newest three of a category
  const lead = category ? pool[0] : articles.find((a) => a.lead) ?? pool[0];
  const side = pool.filter((s) => s.id !== lead?.id).slice(0, 2);
  const rest = pool.filter((s) => s.id !== lead?.id && !side.some((x) => x.id === s.id));

  // Subject sections (all news only): stories that are not already visible higher up
  const visibleAbove = new Set([lead?.id, ...side.map((s) => s.id), ...rest.slice(0, PAGE_SIZE).map((s) => s.id)]);
  const sections = category
    ? []
    : categories
        .map((c) => ({ slug: c.slug, stories: inCategory(c.slug, 3, [...visibleAbove]) }))
        .filter((s) => s.stories.length >= 2);

  const newest = pool[0];

  return (
    <div className="container newspage">
      <header className="newshead">
        <h1>News</h1>
        <p>{category ? `${pool.length} stories in ${category.name}.` : "The latest news, reports and developments."}</p>
        {newest && (
          <p className="newshead__meta">
            Updated {timeAgo(newest.published)} · {articles.length} stories
          </p>
        )}
      </header>

      <nav className="newstabs" aria-label="News categories" ref={tabsRef}>
        <Link to="/news" aria-current={!slug ? "true" : undefined}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} to={`/news?category=${c.slug}`} aria-current={slug === c.slug ? "true" : undefined}>
            {c.name}
          </Link>
        ))}
      </nav>

      {unknown || pool.length === 0 ? (
        <EmptyState title="No stories here yet" action={{ to: "/news", label: "See all news" }}>
          We couldn't find any stories in that category. Try another one, or head back to the full news feed.
        </EmptyState>
      ) : (
        <>
          <section className="top newstop" aria-label="Featured stories">
            <LeadTile story={lead} />
            {!phone && (
              <div className="top__side">
                {side.map((s) => (
                  <SideTile key={s.id} story={s} />
                ))}
              </div>
            )}
          </section>

          <section className="hsec">
            <BlockHead>{category ? `Latest in ${category.name}` : "Latest reports"}</BlockHead>
            <div className={`nlatest${category ? " nlatest--wide" : ""}`}>
              <div>
                {/* On a phone the two stories beside the lead on a wide screen head the feed instead */}
                <Listing key={slug || "all"} stories={phone ? [...side, ...rest] : rest} phone={phone} />
              </div>

              {!category && (
                <aside className="nside" aria-label="Most read">
                  <h3 className="nside__title">Most read</h3>
                  <ol className="mostread">
                    {popular(5).map((s, i) => (
                      <li key={s.id}>
                        <Link to={articleLink(s)}>
                          <span className="mostread__n">{i + 1}</span>
                          <span className="mostread__text">
                            <small>{categoryName(s.category)}</small>
                            <strong>{s.title}</strong>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </aside>
              )}
            </div>
          </section>

          {sections.map((s, i) => (
            <CategoryBlock key={s.slug} slug={s.slug} stories={s.stories} index={i} phone={phone} />
          ))}
        </>
      )}
    </div>
  );
}