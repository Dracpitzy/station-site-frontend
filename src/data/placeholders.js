// Placeholder pictures for stories and videos that do not have a real photo yet.
//
// These are free Pexels stock photos picked to roughly match each story's subject. They are NOT real news
// photographs of the events, so they stand in until the real ones are available.
//
// To use a real photo for a story: add the photo to data/images.js and name it in the story's `photo` field.
// To change a placeholder: open a photo on pexels.com, copy the number at the end of its address, and paste it
// next to the story's id below. Every placeholder comes through this one function, so searching for
// "placeholderPhoto" finds all of them.

const pexels = (id, width) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${Math.round((width * 9) / 16)}`;

// Story id (or About page gallery name) -> Pexels photo number.
const PHOTO_IDS = {
  // Local
  "weekend-marathon-road-closures": 3554619,
  "market-traders-covered-stalls": 17691084,

  // Politics
  "assembly-passes-budget": 1146358,
  "governors-road-repair-plan": 8788264,
  "electoral-body-revised-timetable": 3605968,
  "lawmakers-question-agencies": 4488457,
  "committee-hearings-local-government-funding": 7016960,
  "assembly-youth-employment-bill": 8181774,
  "ministers-brief-lawmakers-rail-project": 9152408,

  // Business
  "naira-steadies-importers-return": 5862280,
  "small-business-loan-window": 13583431,
  "fuel-depot-supply-warning": 3184635,
  "startups-record-funding-quarter": 8190832,
  "textile-factories-reopen-power-deal": 7428850,
  "cooperatives-sign-sesame-export-contract": 20432829,
  "banks-extend-transfer-support-hours": 601170,

  // Sports
  "super-eagles-squad-named": 1618200,
  "derby-ends-in-draw": 159710,
  "athletes-return-with-medals": 3554619,
  "basketball-finals-sell-out": 159710,
  "womens-league-opens-record-crowds": 1618200,
  "young-sprinter-national-record": 3554619,
  "coach-praises-defence-cup-win": 159710,

  // Entertainment
  "afrobeats-homecoming-tour": 1870438,
  "lagos-film-opens-packed-cinemas": 4170572,
  "theatre-festival-free-student-shows": 4889279,
  "comedy-night-sells-out-three-shows": 8254900,
  "gospel-choir-album-tops-charts": 7715618,
  "radio-drama-returns-new-season": 2918997,

  // Technology
  "phone-prices-fall-data-costs": 3183138,
  "schools-coding-clubs-pilot": 3183196,
  "solar-charging-kiosks-markets": 3183193,

  // Health
  "malaria-cases-rise-with-rains": 6129681,
  "clinic-cuts-waiting-times-mothers": 4266944,
  "free-eye-screening-drive": 5206951,

  // World
  "african-leaders-trade-summit": 3534783,
  "oil-prices-dip-supply-forecasts": 8062306,
  "tourism-rebounds-flights-return": 2612113,

  // Stories that have a real photo in data/images.js do not use these two, but keep a picture ready.
  "itv-new-broadcast-centre": 4170571,
  "breakfast-show-record-audience": 2918997,

  // About page gallery
  "about-newsroom": 8062306,
  "about-camera": 4170572,
  "about-radio-desk": 164755,
};

// A new story that is not listed above still gets a steady picture: the same seed always picks the same one.
const FALLBACK_IDS = [164755, 2918997, 4170571, 8062306, 3184635, 5862280, 2612113, 3183196];

function photoIdFor(seed) {
  if (PHOTO_IDS[seed]) return PHOTO_IDS[seed];
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_IDS[hash % FALLBACK_IDS.length];
}

// Returns src, srcSet, width and height for an <img>, always 16:9. The middle width is the default.
export function placeholderPhoto(seed, widths = [480, 800, 1280]) {
  const main = widths[1];
  const id = photoIdFor(seed);
  return {
    src: pexels(id, main),
    srcSet: widths.map((w) => `${pexels(id, w)} ${w}w`).join(", "),
    width: main,
    height: Math.round((main * 9) / 16),
  };
}