import { Link } from "react-router-dom";
import "../styles/stories.css";

// A section title with an accent bar, and an optional link on the right ("View all" unless told otherwise).
export function BlockHead({ children, to, label = "View all" }) {
  return (
    <div className="blockhead">
      <h2>{children}</h2>
      {to && (
        <Link to={to} className="blockhead__more">
          {label}
        </Link>
      )}
    </div>
  );
}