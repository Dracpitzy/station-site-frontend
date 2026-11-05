import { useId, useState } from "react";
import { photoProps } from "../data/images";
import { placeholderPhoto } from "../data/placeholders";
import { categoryName } from "../data/news";

// The plain cover shown when a picture cannot load: ITV navy with the category and the station mark.
// It is the same for every category, so no category gets its own colour.
export function CoverArt({ category }) {
  const id = useId();
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12306f" />
          <stop offset="1" stopColor="#071426" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id})`} />
      <text
        x="312"
        y="158"
        textAnchor="end"
        fontSize="130"
        fontWeight="800"
        fill="#ffffff"
        fillOpacity="0.07"
        style={{ fontFamily: "var(--font-display)" }}
      >
        ITV
      </text>
      <rect x="18" y="124" width="26" height="3" fill="#5a97ff" />
      <text
        x="18"
        y="148"
        fontSize="13"
        fontWeight="700"
        letterSpacing="2.4"
        fill="#ffffff"
        fillOpacity="0.85"
        style={{ fontFamily: "var(--font)" }}
      >
        {categoryName(category).toUpperCase()}
      </text>
    </svg>
  );
}

// A story's picture: its real photo if it has one, otherwise a placeholder photo.
// If a picture cannot load, the plain navy cover takes its place, so there is never an empty box.
export default function Cover({ story, eager = false, sizes = "400px", className = "" }) {
  const [failed, setFailed] = useState(false);
  const picture = story.photo ? photoProps(story.photo, [480, 800, 1280]) : placeholderPhoto(story.id);

  return (
    <div className={`cover ${className}`.trim()}>
      {failed ? (
        <CoverArt category={story.category} />
      ) : (
        <img
          {...picture}
          alt=""
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          data-placeholder={story.photo ? undefined : "true"}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}