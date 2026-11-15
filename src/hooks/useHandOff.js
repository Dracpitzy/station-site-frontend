import { useEffect } from "react";
import { tvPlayer } from "../player/tv";

// On the front page, while the visitor is watching the live video and it scrolls out of view,
// the mini-player takes it over. When it scrolls back, the video returns to the page.
// watchRef: the area whose visibility matters. slotRef: the slot the video sits in.
export function useHandOffWhenOffscreen(watchRef, slotRef) {
  useEffect(() => {
    const watch = watchRef.current;
    const slot = slotRef.current;
    if (!watch || !slot || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tvPlayer.showSlot(slot);
      else tvPlayer.hideSlot(slot);
    });
    observer.observe(watch);
    return () => {
      observer.disconnect();
      tvPlayer.showSlot(slot);
    };
  }, [watchRef, slotRef]);
}
