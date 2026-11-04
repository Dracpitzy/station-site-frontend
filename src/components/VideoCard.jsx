import Cover from "./Cover";
import { Icon } from "./Icons";

// One video: a picture with a play badge and its length, then the title. The whole card is one button.
export default function VideoCard({ video, label, onPlay }) {
  return (
    <article className="vcard">
      <div className="vcard__thumb">
        <Cover story={video} sizes="(max-width: 720px) 50vw, 280px" className="vcard__cover" />
        <span className="vcard__play" aria-hidden="true">
          <Icon name="play" size={22} />
        </span>
        <span className="vcard__time" aria-hidden="true">
          {video.duration}
        </span>
      </div>
      <strong>{video.title}</strong>
      <span className="meta">
        <span>{label}</span>
      </span>
      <button
        type="button"
        className="vcard__hit"
        onClick={() => onPlay(video)}
        aria-label={`Play video: ${video.title}, ${video.duration}`}
      />
    </article>
  );
}