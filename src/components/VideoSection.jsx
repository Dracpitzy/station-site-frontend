import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import { latestVideos, watchAgain } from "../data/videos";
import { timeAgo } from "../data/news";
import "../styles/video.css";

const TABS = [
  { key: "latest", label: "Latest videos" },
  { key: "again", label: "Watch again" },
];

// "Watch on ITV": a dark band with the videos. Two tabs switch between the latest videos and the
// programmes to watch again. Choosing a video opens it in a pop-up player.
export default function VideoSection() {
  const [tab, setTab] = useState("latest");
  const [playing, setPlaying] = useState(null); // { video, meta }

  const play = (video, meta) => setPlaying({ video, meta });
  const list = tab === "latest" ? latestVideos : watchAgain;

  return (
    <>
      <section className="watch" aria-label="Watch on ITV">
        <div className="container">
          <div className="watch__head">
            <h2>Watch on ITV</h2>
            <div className="watch__tabs" role="group" aria-label="Choose videos">
              {TABS.map((t) => (
                <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="watch__grid">
            {list.map((v) =>
              tab === "latest" ? (
                <VideoCard key={v.id} video={v} label={timeAgo(v.published)} onPlay={(video) => play(video, timeAgo(video.published))} />
              ) : (
                <VideoCard key={v.id} video={v} label={v.when} onPlay={(video) => play(video, `Aired ${video.when.toLowerCase()}`)} />
              )
            )}
          </div>
        </div>
      </section>

      {playing && <VideoModal key={playing.video.id} video={playing.video} meta={playing.meta} onClose={() => setPlaying(null)} />}
    </>
  );
}