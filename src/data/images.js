// Free stock photos from Pexels (free to use, no attribution required).
// To swap a photo: open it on pexels.com, copy the number at the end of its address, and paste it here.
const pexels = (id, w) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const photos = {
  studio: { id: 164755, alt: "Microphone in a recording studio" },
  radio: { id: 2918997, alt: "Studio microphone with headphones" },
};

// Returns src, srcSet and alt for an <img>, so phones download a smaller file than desktops.
export function photoProps(key, widths = [640, 1024, 1600]) {
  const { id, alt } = photos[key];
  return {
    src: pexels(id, widths[1]),
    srcSet: widths.map((w) => `${pexels(id, w)} ${w}w`).join(", "),
    alt,
  };
}