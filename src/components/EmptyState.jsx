import { Link } from "react-router-dom";
import "../styles/stories.css";

// What to show when a list has nothing in it, or a page cannot be found.
export default function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
      {action && (
        <Link to={action.to} className="btn btn--soft">
          {action.label}
        </Link>
      )}
    </div>
  );
}