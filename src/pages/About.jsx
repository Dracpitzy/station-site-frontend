import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { about } from "../data/about";
import { photos, photoProps } from "../data/images";
import { placeholderPhoto } from "../data/placeholders";
import { presenters } from "../data/presenters";
import { station } from "../data/config";
import { preloadProps } from "../routes";
import "../styles/about.css";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

const people = Object.entries(presenters);

export default function About() {
  const rootRef = useRef(null);
  useReveal(rootRef);

  useEffect(() => {
    document.title = `About | ${station.name}`;
  }, []);

  const hero = photoProps("studio", [800, 1280, 1920]);
  const who = photoProps("radio", [480, 800, 1280]);
  const closing = photoProps("studio", [800, 1280, 1920]);
  const [feature, ...support] = about.behind.photos;

  return (
    <div className="about" ref={rootRef}>
      {/* Opening */}
      <section className="ahero" data-tone="dark">
        <img className="ahero__bg" {...hero} alt="" sizes="100vw" fetchPriority="high" decoding="async" />
        <div className="ahero__shade" aria-hidden="true" />
        <div className="container ahero__inner">
          <p className="ahero__kicker">{about.kicker}</p>
          <h1>
            {about.headline.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </h1>
          <p className="ahero__intro">{about.intro}</p>
          <div className="ahero__links">
            <a href="#story" className="btn abtn--ghost">
              Our story
            </a>
            <Link to="/live" className="btn btn--white" {...preloadProps("LiveTV")}>
              Watch ITV
            </Link>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="awho" id="story">
        <div className="container awho__grid" data-reveal>
          <div className="awho__text">
            <p className="alabel">{about.story.label}</p>
            <h2>{about.story.title}</h2>
            {about.story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <figure className="awho__photo">
            <img {...who} alt="" sizes="(max-width: 1000px) 100vw, 520px" loading="lazy" decoding="async" />
            <figcaption>{photos.radio.alt}</figcaption>
          </figure>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="amission" data-tone="dark">
        <div className="container amission__grid" data-reveal>
          <div>
            <p className="alabel alabel--gold">{about.mission.label}</p>
            <h2>{about.mission.statement}</h2>
          </div>
          <span className="amission__rule" aria-hidden="true" />
          <div>
            <p className="alabel alabel--gold">{about.vision.label}</p>
            <h2>{about.vision.statement}</h2>
          </div>
        </div>
      </section>

      {/* Behind the broadcast */}
      <section className="abehind">
        <div className="container">
          <div className="abehind__head" data-reveal>
            <h2>{about.behind.title}</h2>
            <p>{about.behind.intro}</p>
          </div>
          <div className="abehind__gallery" data-reveal>
            <figure className="abehind__feature">
              <img {...placeholderPhoto(feature.seed, [640, 1000, 1400])} alt="" sizes="(max-width: 700px) 100vw, 60vw" loading="lazy" decoding="async" />
              <span className="achip">Placeholder photograph</span>
              <figcaption>{feature.caption}</figcaption>
            </figure>
            <div className="abehind__more">
              {support.map((p) => (
                <figure key={p.seed}>
                  <img {...placeholderPhoto(p.seed, [480, 720, 1000])} alt="" sizes="(max-width: 700px) 76vw, 36vw" loading="lazy" decoding="async" />
                  <span className="achip">Placeholder photograph</span>
                  <figcaption>{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="avalues">
        <div className="container">
          <h2 data-reveal>Our values</h2>
          <ol className="avalues__list" data-reveal>
            {about.values.map((v, i) => (
              <li key={v.title}>
                <span className="avalues__n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The people */}
      <section className="apeople">
        <div className="container">
          <div className="apeople__head" data-reveal>
            <h2>{about.people.title}</h2>
            <p>{about.people.note}</p>
          </div>
          <ul className="apeople__grid" data-reveal>
            {people.map(([id, p], i) => (
              <li key={id} className="aperson">
                <span className={`aperson__pic aperson__pic--${i % 3}`} aria-hidden="true">
                  {initials(p.name)}
                </span>
                <h3>{p.name}</h3>
                <p className="aperson__role">{p.role}</p>
                <p className="aperson__bio">{p.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing */}
      <section className="aclose" data-tone="dark">
        <img className="aclose__bg" {...closing} alt="" sizes="100vw" loading="lazy" decoding="async" />
        <div className="aclose__shade" aria-hidden="true" />
        <div className="container aclose__inner" data-reveal>
          <h2>{about.closing.title}</h2>
          <p>{about.closing.text}</p>
          <div className="aclose__links">
            <Link to="/live" className="btn btn--white" {...preloadProps("LiveTV")}>
              Watch live
            </Link>
            <Link to="/radio" className="btn abtn--ghost" {...preloadProps("Radio")}>
              Listen live
            </Link>
            <Link to="/contact" className="btn abtn--ghost" {...preloadProps("Contact")}>
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}