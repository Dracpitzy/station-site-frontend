import { useState } from "react";

// Share a story: WhatsApp first (it is how most people pass news around), then Facebook, X and a copy-link button.
// On phones and tablets that support it there is also the device's own share sheet.
export default function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const links = [
    { name: "WhatsApp", cls: "share__btn--wa", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers: select a temporary field and copy from it.
      const field = document.createElement("textarea");
      field.value = url;
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
      } catch {
        // nothing more to try
      }
      field.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = () => navigator.share({ title, url }).catch(() => {});

  return (
    <div className="share">
      <span className="share__label">Share</span>
      {links.map((l) => (
        <a
          key={l.name}
          className={`share__btn ${l.cls || ""}`.trim()}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.name}`}
        >
          {l.name}
        </a>
      ))}
      <button className={`share__btn${copied ? " is-done" : ""}`} onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      {typeof navigator !== "undefined" && navigator.share && (
        <button className="share__btn" onClick={nativeShare}>
          More
        </button>
      )}
    </div>
  );
}