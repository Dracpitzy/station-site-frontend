import { Link } from "react-router-dom";
import { station } from "../data/config";
import { categories } from "../data/news";
import { contactInfo } from "../data/contact";

const columns = [
  {
    title: "Watch & Listen",
    items: [
      ["Live TV", "/live"],
      ["Radio", "/radio"],
      ["Programme Schedule", "/schedule"],
    ],
  },
  {
    title: "News",
    items: [
      ["Latest News", "/news"],
      ...categories.slice(0, 5).map((c) => [c.name, `/news?category=${c.slug}`]),
    ],
  },
  {
    title: "The Station",
    items: [
      ["About ITV", "/about"],
      ["Meet the Presenters", "/about"],
      ["Contact Us", "/contact"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer" data-tone="dark">
      <div className="container footer__grid">
        <div className="footer__brand">
          <h3>{station.name}</h3>
          <p>{station.fullName}</p>
          <p>{station.tagline}</p>
          <p className="footer__freq">
            <span className="live-dot" />
            Radio {station.frequency}
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.items.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4>Follow Us</h4>
          <div className="footer__socials">
            {contactInfo.socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {s.name}
              </a>
            ))}
          </div>
          <p className="footer__contact">
            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            <br />
            <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>{contactInfo.phone}</a>
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-row">
          <span>
            © {new Date().getFullYear()} {station.fullName}. All rights reserved.
          </span>
          <button type="button" className="footer__top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}