import { Link } from "react-router-dom";
import Cover from "../components/Cover";
import LiveCard from "../components/LiveCard";
import OnAirCard from "../components/OnAirCard";
import VideoSection from "../components/VideoSection";
import { BlockHead, Card, articleLink } from "../components/StoryCards";
import { useOnAir } from "../hooks/useOnAir";
import { photoProps } from "../data/images";
import {
  breakingStory,
  categories,
  categoryName,
  inCategory,
  latest,
  leadStory,
  popular,
  timeAgo,
} from "../data/news";
import "../styles/home.css";

// ---------- Breaking news strip ----------
function Breaking() {
  const s = breakingStory;
  if (!s) return null;
  return (
    <div className="container">
      <Link to={articleLink(s)} className="breaking">
        <span className="breaking__tag">
          <span className="live-dot" />
          Breaking
        </span>
        <span className="breaking__text">{s.title}</span>
        <span className="breaking__time">{timeAgo(s.published)}</span>
      </Link>
    </div>
  );
}

// ---------- Lists and cards ----------
function PopularList() {
  return (
    <section className="popular">
      <BlockHead>Popular</BlockHead>
      <ol>
        {popular(5).map((s, i) => (
          <li key={s.id}>
            <Link to={articleLink(s)}>
              <span className="popular__n">{i + 1}</span>
              <span className="popular__text">
                <strong>{s.title}</strong>
                <small>{categoryName(s.category)}</small>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Lead({ story }) {
  return (
    <Link to={articleLink(story)} className="lead">
      <Cover story={story} eager sizes="(max-width: 720px) 100vw, 600px" className="lead__cover" />
      <span className="lead__shade" />
      <span className="lead__text">
        <span className="chip">{categoryName(story.category)}</span>
        <strong>{story.title}</strong>
        <span className="meta">
          <span>{timeAgo(story.published)}</span>
          <span>{story.readMins} min read</span>
        </span>
      </span>
    </Link>
  );
}

function SideStory({ story }) {
  return (
    <Link to={articleLink(story)} className="side">
      <Cover story={story} sizes="140px" className="side__cover" />
      <span className="side__text">
        <small>{categoryName(story.category)}</small>
        <strong>{story.title}</strong>
        <span className="meta">
          <span>{timeAgo(story.published)}</span>
        </span>
      </span>
    </Link>
  );
}

function LatestList({ stories }) {
  return (
    <section className="latest">
      <BlockHead to="/news">Latest</BlockHead>
      <ul>
        {stories.map((s) => (
          <li key={s.id}>
            <Link to={articleLink(s)}>
              <span className="latest__time">{timeAgo(s.published)}</span>
              <strong>{s.title}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryRow({ slug }) {
  return (
    <section className="rowsec">
      <BlockHead to={`/news?category=${slug}`}>{categoryName(slug)}</BlockHead>
      <div className="rowsec__grid">
        {inCategory(slug, 4).map((s) => (
          <Card key={s.id} story={s} />
        ))}
      </div>
    </section>
  );
}

// ---------- The page ----------
export default function Home() {
  const { radio } = useOnAir();
  const lead = leadStory;
  const sideStories = latest(2, [lead.id]);
  const latestStories = latest(7);

  return (
    <>
      <Breaking />

      <div className="container front">
        <div className="front__col">
          <div className="live-wrap">
            <LiveCard />
          </div>
          <PopularList />
        </div>

        <div className="front__col">
          <Lead story={lead} />
          <div className="sides">
            {sideStories.map((s) => (
              <SideStory key={s.id} story={s} />
            ))}
          </div>
        </div>

        <div className="front__col">
          <LatestList stories={latestStories} />
          <section className="radiopanel">
            <img
              className="radiopanel__bg"
              {...photoProps("radio", [480, 800])}
              alt=""
              sizes="300px"
              loading="lazy"
              decoding="async"
            />
            <span className="radiopanel__shade" />
            <p className="radiopanel__label">On air now</p>
            <OnAirCard channel="radio" data={radio} />
          </section>
        </div>
      </div>

      <div className="container">
        <VideoSection />

        {["politics", "business", "sports", "entertainment"].map((slug) => (
          <CategoryRow key={slug} slug={slug} />
        ))}

        <section className="rowsec">
          <BlockHead>More from ITV News</BlockHead>
          <div className="chips">
            {categories.map((c) => (
              <Link key={c.slug} to={`/news?category=${c.slug}`} className="chips__item">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}