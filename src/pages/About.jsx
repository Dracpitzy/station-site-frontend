import { useEffect } from "react";
import { Link } from "react-router-dom";
import PageBand from "../components/PageBand";
import { presenters } from "../data/presenters";
import { station } from "../data/config";
import { photoProps } from "../data/images";
import { preloadProps } from "../routes";
import "../styles/about.css";

// Placeholder wording. Replace it with the station's own story and values.
const VALUES = [
  {
    title: "Independent",
    text: "We answer to the people who watch and listen. Our newsroom decides what is worth your time, and our schedule is built around you.",
  },
  {
    title: "Local first",
    text: "The stories that matter most are the ones close to home. We start with our own communities and tell them in our own voices.",
  },
  {
    title: "Always on",
    text: "News, sport, music and conversation, on TV and radio, day and night. Tune in whenever it suits you.",
  },
];

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

const team = Object.entries(presenters);
const studio = photoProps("studio", [640, 1024, 1600]);

export default function About() {
  useEffect(() => {
    document.title = `About | ${station.name}`;
  }, []);

  return (
    <>
      <PageBand eyebrow="About us" title={`About ${station.name}`}>
        {station.fullName}, on air 24 hours a day.
      </PageBand>

      <section className="container section about__story">
        <div className="about__text">
          <h2>Our story</h2>
          <p>
            {station.name} is an independent television and radio station. We put the day&rsquo;s news, sport, music and
            conversation on air around the clock, on TV, on {station.frequency} and online wherever you are.
          </p>
          <p>
            We call ourselves independent because we answer to our audience first. Our newsroom chooses its own stories,
            our presenters say what they think, and the programmes you see and hear are shaped by the people they are for.
          </p>
          <p>
            Whether you are catching the morning headlines, the afternoon grooves or a late-night talk show, you are
            hearing the same team, telling the stories of the communities we serve.
          </p>
        </div>

        <figure className="about__photo">
          <img {...studio} sizes="(max-width: 860px) 100vw, 520px" loading="lazy" decoding="async" />
          <figcaption>
            <span className="live-dot" />
            On air 24 hours a day
          </figcaption>
        </figure>
      </section>

      <section className="section section--tint">
        <div className="container">
          <h2 className="about__heading">What we stand for</h2>
          <div className="about__values">
            {VALUES.map((v, i) => (
              <article key={v.title} className="about__value">
                <span className="about__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="about__heading">Meet the presenters</h2>
        <ul className="about__team">
          {team.map(([id, p], i) => (
            <li key={id} className="about__person">
              <span className={`about__avatar about__avatar--${i % 4}`} aria-hidden="true">
                {initials(p.name)}
              </span>
              <div>
                <h3>{p.name}</h3>
                <p className="about__role">{p.role}</p>
                <p className="about__bio">{p.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container about__cta-wrap">
        <div className="about__cta">
          <div>
            <h2>Join us on air</h2>
            <p>
              Watch on TV, listen on {station.frequency}, or tell us what you think.
            </p>
          </div>
          <div className="about__cta-actions">
            <Link to="/live" className="btn btn--white" {...preloadProps("LiveTV")}>
              Watch live
            </Link>
            <Link to="/radio" className="btn about__ghost" {...preloadProps("Radio")}>
              Listen live
            </Link>
            <Link to="/contact" className="btn about__ghost" {...preloadProps("Contact")}>
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}