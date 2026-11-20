import { Link } from "react-router-dom";
import BreakingStrip from "../components/BreakingStrip";
import LivePanel from "../components/LivePanel";
import LiveStrip from "../components/LiveStrip";
import RadioBand from "../components/RadioBand";
import VideoSection from "../components/VideoSection";
import { GridTile, LeadTile, RowTile } from "../components/Tiles";
import { BlockHead } from "../components/StoryCards";
import { articleLink } from "../lib/articleLink";
import { useIsPhone } from "../hooks/useIsPhone";
import {
  categoryName,
  inCategory,
  latest,
  leadStory,
  popular,
} from "../data/news";
import "../styles/home.css";

// Every story is shown once in the sections of the front page. Whatever one section takes is kept out of the next.
// A story that is breaking also appears in the breaking strip, and stays in its category after the strip drops it.
const shown = new Set([leadStory.id]);
const pick = (stories) => {
  stories.forEach((s) => shown.add(s.id));
  return stories;
};

const topList = pick(latest(4, [...shown])); // the "Latest news" list beside the lead
const latestSix = pick(latest(6, [...shown]));

// Each category gets its own arrangement, so the page does not repeat one grid four times.
const SECTIONS = [
  { slug: "politics", layout: "feature", count: 4 },
  { slug: "business", layout: "trio", count: 3 },
  { slug: "sports", layout: "feature-flip", count: 4 },
  { slug: "entertainment", layout: "quad", count: 4 },
].map((s) => ({ ...s, stories: pick(inCategory(s.slug, s.count, [...shown])) }));

function CategorySection({ slug, layout, stories, phone }) {
  if (!stories.length) return null;
  const [first, ...rest] = stories;
  const head = (
    <BlockHead to={`/news?category=${slug}`} label="View more">
      {categoryName(slug)}
    </BlockHead>
  );
  const withRows = layout === "feature" || layout === "feature-flip";

  // On a phone every category is one featured story with a full-width picture. Under it come either
  // compact rows or a two-column compact grid, depending on the category.
  if (phone) {
    return (
      <section className="hsec">
        {head}
        <LeadTile story={first} size="feature" />
        {withRows ? (
          <div className="rows rows--after">
            {rest.map((s) => (
              <RowTile key={s.id} story={s} />
            ))}
          </div>
        ) : (
          <div className="pgrid">
            {rest.slice(0, 2).map((s) => (
              <GridTile key={s.id} story={s} />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (withRows) {
    return (
      <section className="hsec">
        {head}
        <div className={`sec${layout === "feature-flip" ? " sec--flip" : ""}`}>
          <LeadTile story={first} size="feature" />
          <div className="rows">
            {rest.map((s) => (
              <RowTile key={s.id} story={s} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hsec">
      {head}
      <div className={`grid ${layout === "trio" ? "grid--3" : "grid--4"}`}>
        {stories.map((s, i) => (
          <GridTile key={s.id} story={s} summary={layout === "trio" && i === 0} />
        ))}
      </div>
    </section>
  );
}

// A ranking, so these stories may also appear above
function MostRead({ count }) {
  return (
    <section className="hsec">
      <BlockHead>Most read</BlockHead>
      <ol className="mostread">
        {popular(count).map((s, i) => (
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
    </section>
  );
}

export default function Home() {
  const phone = useIsPhone();

  return (
    <>
      <h1 className="sr-only">ITV: live television, radio and the latest news</h1>

      <div className="container hmain">
        {phone ? <LiveStrip /> : <LivePanel />}
        <BreakingStrip />

        {phone ? (
          <section className="top" aria-label="Top story">
            <LeadTile story={leadStory} />
          </section>
        ) : (
          <section className="top" aria-label="Top stories">
            <LeadTile story={leadStory} size="feature" eager />
            <div className="top__latest">
              <BlockHead>Latest news</BlockHead>
              <div className="rows">
                {topList.map((s) => (
                  <RowTile key={s.id} story={s} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="hsec">
          <BlockHead to="/news" label="View all news">
            {phone ? "Latest news" : "More news"}
          </BlockHead>
          {phone ? (
            // On a phone the newest stories that sit beside the lead on a wide screen head the list instead
            <div className="rows rows--latest">
              {[...topList, ...latestSix].slice(0, 8).map((s) => (
                <RowTile key={s.id} story={s} />
              ))}
            </div>
          ) : (
            <div className="grid grid--3">
              {latestSix.map((s) => (
                <GridTile key={s.id} story={s} />
              ))}
            </div>
          )}
        </section>

        {SECTIONS.map((s) => (
          <CategorySection key={s.slug} {...s} phone={phone} />
        ))}
      </div>

      <VideoSection />
      <RadioBand />

      <div className="container hmain">
        <MostRead count={phone ? 5 : 6} />
      </div>
    </>
  );
}