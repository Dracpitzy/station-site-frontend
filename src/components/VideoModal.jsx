import { useEffect, useRef, useState } from "react";
import { claim, register, release } from "../player/channels";
import { Icon } from "./Icons";
import "../styles/video.css";

const isHls = (url) => /\.m3u8(\?|#|$)/i.test(url);

// A video playing in a pop-up over the page. It is a real modal dialog, so the page behind
// is switched off, Escape closes it, and the keyboard stays inside until it is closed.
export default function VideoModal({ video, meta, onClose }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  // Anything else that is playing, the live TV or the radio, stops so the clip is the only sound.
  useEffect(() => {
    register("clip", () => dialogRef.current?.close());
    claim("clip");
    return () => release("clip");
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    let hls = null;
    let cancelled = false;
    const play = () => el.play().catch(() => {});

    (async () => {
      if (!isHls(video.src) || el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = video.src;
        play();
        return;
      }
      const { default: Hls } = await import("hls.js");
      if (cancelled) return;
      if (!Hls.isSupported()) {
        el.src = video.src;
        play();
        return;
      }
      hls = new Hls();
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setFailed(true);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.loadSource(video.src);
      hls.attachMedia(el);
    })();

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [video.src]);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="vmodal"
      aria-label={video.title}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dark area around the player, not on the player itself
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="vmodal__box">
        <div className="vmodal__screen">
          <video ref={videoRef} controls playsInline onError={() => setFailed(true)} />
          {failed && (
            <p className="vmodal__error" role="alert">
              This video can’t be played right now.
            </p>
          )}
        </div>
        <div className="vmodal__bar">
          <div>
            <h2>{video.title}</h2>
            {meta && <p>{meta}</p>}
          </div>
          <button type="button" className="vmodal__close" onClick={close} aria-label="Close video">
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>
    </dialog>
  );
}