import "../styles/pagehead.css";

// The title block at the top of a page: small label, headline and a line of description.
export default function PageBand({ eyebrow, title, children }) {
  return (
    <div className="container pagehead">
      {eyebrow && <p className="pagehead__eyebrow">{eyebrow}</p>}
      <h1 className="pagehead__title">{title}</h1>
      {children && <p className="pagehead__lede">{children}</p>}
    </div>
  );
}