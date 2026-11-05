// Placeholder pictures for stories and videos that do not have a real photo yet.
//
// Lorem Picsum gives a steady photo for each name, so a story keeps the same picture between visits.
// These are NOT real news photographs, and they do not match the stories. They stand in so the layouts
// can be judged with real-looking images.
//
// To use a real photo for a story: add the photo to data/images.js and name it in the story's `photo` field.
// Every placeholder comes through this one function, so searching for "placeholderPhoto" finds all of them.

const picsum = (seed, width) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${Math.round((width * 9) / 16)}`;

// Returns src, srcSet, width and height for an <img>, always 16:9. The middle width is the default.
export function placeholderPhoto(seed, widths = [480, 800, 1280]) {
  const main = widths[1];
  return {
    src: picsum(seed, main),
    srcSet: widths.map((w) => `${picsum(seed, w)} ${w}w`).join(", "),
    width: main,
    height: Math.round((main * 9) / 16),
  };
}