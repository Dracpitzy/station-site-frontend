import { Link } from "react-router-dom";
import { station } from "../data/config";

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
    title: "Newsroom",
    items: [
      ["Latest News", "/news"],
      ["About ITV", "/about"],
      ["Contact Us", "/contact"],
    ],
  },
];

const socials = ["Facebook", "X", "Instagram", "YouTube"];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <h3>{station.name}</h3>
          <p>{station.fullName}</p>
          <p>{station.tagline}</p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.items.map(([label, to]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4>Follow Us</h4>
          <div className="footer__socials">
            {socials.map((name) => (
              <a key={name} href="#">
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} {station.fullName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}