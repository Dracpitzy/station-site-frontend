import { useState } from "react";
import { BlockHead } from "./StoryCards";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import { latestVideos, watchAgain } from "../data/videos";
import { timeAgo } from "../data/news";
import "../styles/video.css";

// The two video rows on the front page. Choosing a video opens it in a pop-up player.
export default function VideoSection() {
  const [playing, setPlaying] = useState(null); // { video, meta }

  const play = (video, meta) => setPlaying({ video, meta });

  return (
    <>
      <section className="rowsec">
        <BlockHead>Latest videos</BlockHead>
        <div className="rowsec__grid">
          {latestVideos.map((v) => (
            <VideoCard key={v.id} video={v} label={timeAgo(v.published)} onPlay={(video) => play(video, timeAgo(video.published))} />
          ))}
        </div>
      </section>

      <section className="rowsec">
        <BlockHead>Watch again</BlockHead>
        <div className="rowsec__grid">
          {watchAgain.map((v) => (
            <VideoCard key={v.id} video={v} label={v.when} onPlay={(video) => play(video, `Aired ${video.when.toLowerCase()}`)} />
          ))}
        </div>
      </section>

      {playing && <VideoModal key={playing.video.id} video={playing.video} meta={playing.meta} onClose={() => setPlaying(null)} />}
    </>
  );
}