// Dummy newsroom. Every story's `ago` is how many minutes before the page loads it was published,
// so the front page always looks fresh. Stories are made up for the demo.
//
// photo: a key from data/images.js. Stories without one get a designed cover for their category.
// Swap in a real photo later by adding a photo to images.js and naming it here.

export const categories = [
  { slug: "politics", name: "Politics" },
  { slug: "business", name: "Business" },
  { slug: "sports", name: "Sports" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "technology", name: "Technology" },
  { slug: "health", name: "Health" },
  { slug: "world", name: "World" },
  { slug: "local", name: "Local" },
];

const story = (id, category, title, summary, ago, views, extra = {}) => ({
  id,
  category,
  title,
  summary,
  ago,
  views,
  author: "ITV Newsroom",
  ...extra,
});

const RAW = [
  // Local
  story("itv-new-broadcast-centre", "local", "ITV launches 24-hour live coverage from its new broadcast centre",
    "The expanded studio brings television, radio and the newsroom under one roof.", 20, 7000, { lead: true, photo: "studio", readMins: 4 }),
  story("weekend-marathon-road-closures", "local", "Road closures planned for the weekend marathon",
    "Drivers are advised to use alternative routes from early Saturday morning.", 120, 5200),
  story("market-traders-covered-stalls", "local", "Market traders get new covered stalls after fire",
    "Rebuilt stalls are expected to reopen to shoppers within three weeks.", 310, 9100),

  // Politics
  story("assembly-passes-budget", "politics", "Assembly passes next year's budget after marathon night session",
    "Lawmakers approved the spending plan after hours of debate over capital projects.", 14, 9400, { breaking: true }),
  story("governors-road-repair-plan", "politics", "Governors agree joint plan to speed up local road repairs",
    "States will pool resources to fix major routes before the rainy season ends.", 95, 4300),
  story("electoral-body-revised-timetable", "politics", "Electoral body publishes revised timetable for off-cycle polls",
    "Candidates have a fresh deadline to submit their nomination papers.", 210, 3800),
  story("lawmakers-question-agencies", "politics", "Lawmakers question agencies over unspent capital allocations",
    "Committee members asked why billions earmarked for projects remain untouched.", 380, 3100),

  // Business
  story("naira-steadies-importers-return", "business", "Naira steadies as importers return to the foreign exchange market",
    "Traders say improved supply has calmed prices after weeks of volatility.", 40, 12100, { readMins: 5 }),
  story("small-business-loan-window", "business", "Small businesses queue for new low-interest loan window",
    "Thousands applied on the first day as the programme opened to traders and artisans.", 130, 4700),
  story("fuel-depot-supply-warning", "business", "Fuel depot owners warn of supply gaps ahead of the holidays",
    "Marketers asked regulators to speed up approvals for incoming cargo.", 260, 3900),
  story("startups-record-funding-quarter", "business", "Local startups raise record funding in a single quarter",
    "Fintech and logistics companies took the largest share of new investment.", 520, 3400),

  // Sports
  story("super-eagles-squad-named", "sports", "Super Eagles name squad for crucial qualifier",
    "The coach recalled two veterans and handed debuts to three young players.", 55, 15800, { readMins: 4 }),
  story("derby-ends-in-draw", "sports", "League leaders held to a draw in a tense derby",
    "A late equaliser kept the title race wide open with six matches to play.", 150, 6200),
  story("athletes-return-with-medals", "sports", "Athletes return home with a haul of medals from the regional games",
    "Fans lined the airport to welcome the team after a record-breaking week.", 330, 4100),
  story("basketball-finals-sell-out", "sports", "Basketball finals tipped to sell out as playoffs begin",
    "Organisers added extra seating after tickets vanished within hours.", 600, 2900),

  // Entertainment
  story("breakfast-show-record-audience", "entertainment", "Breakfast Show hits record audience as listeners tune in on mobile",
    "More than half of morning listeners now stream the show on their phones.", 70, 6800, { photo: "radio" }),
  story("afrobeats-homecoming-tour", "entertainment", "Afrobeats star announces a ten-city homecoming tour",
    "Tickets go on sale this weekend, with a free show planned for fans in the capital.", 180, 11200),
  story("lagos-film-opens-packed-cinemas", "entertainment", "New film from a Lagos studio opens to packed cinemas",
    "Critics praised the lead performances and the film's sharp humour.", 400, 5400),
  story("theatre-festival-free-student-shows", "entertainment", "Theatre festival returns with free shows for students",
    "Ten productions will run across the city over two weeks.", 700, 2400),

  // Technology
  story("phone-prices-fall-data-costs", "technology", "Phone makers cut prices as data costs ease",
    "Entry-level smartphones are now cheaper than at any point this year.", 110, 4600),
  story("schools-coding-clubs-pilot", "technology", "Schools pilot coding clubs with free internet vouchers",
    "Pupils will learn to build simple apps in after-class sessions.", 300, 8300),
  story("solar-charging-kiosks-markets", "technology", "Researchers test solar-powered charging kiosks in markets",
    "Traders can charge phones for free while they work.", 640, 2600),

  // Health
  story("malaria-cases-rise-with-rains", "health", "Health officials urge early checks as malaria cases rise with the rains",
    "Clinics are stocking more test kits and treatment ahead of the peak season.", 90, 10400, { readMins: 4 }),
  story("clinic-cuts-waiting-times-mothers", "health", "New clinic opens to cut waiting times for mothers and babies",
    "The centre will offer check-ups and vaccinations six days a week.", 280, 4800),
  story("free-eye-screening-drive", "health", "Free eye screening drive reaches ten thousand residents",
    "Volunteers also handed out reading glasses to older people.", 540, 3000),

  // World
  story("african-leaders-trade-summit", "world", "African leaders meet to agree a shared approach to trade",
    "Talks focus on cutting border delays and boosting regional exports.", 65, 5900),
  story("oil-prices-dip-supply-forecasts", "world", "Global oil prices dip as supply forecasts improve",
    "Analysts expect calmer markets through the end of the year.", 200, 3700),
  story("tourism-rebounds-flights-return", "world", "Tourism rebounds across the continent as flights return",
    "Hotels report their best bookings in three years.", 1700, 2200),

  // More placeholder stories, added so the redesigned front page has enough different stories to show
  // each one only once. Replace them with real articles later.
  story("committee-hearings-local-government-funding", "politics", "Committee opens hearings on direct funding for local governments",
    "Members will hear from council chairs and civil society groups over two days.", 800, 3500),
  story("assembly-youth-employment-bill", "politics", "State assembly debates youth employment bill",
    "The proposal would fund apprenticeships in construction, farming and technology.", 1100, 3000),
  story("ministers-brief-lawmakers-rail-project", "politics", "Ministers brief lawmakers on stalled rail project",
    "Officials said construction will resume once outstanding payments are cleared.", 1500, 2700),

  story("textile-factories-reopen-power-deal", "business", "Textile factories reopen after new power supply deal",
    "Hundreds of workers return as three plants restart their production lines.", 900, 3600),
  story("cooperatives-sign-sesame-export-contract", "business", "Farmers' cooperatives sign first export contract for sesame",
    "The deal covers two harvest seasons and guarantees a minimum price.", 1300, 3200),
  story("banks-extend-transfer-support-hours", "business", "Banks extend support hours as festive shopping begins",
    "Customers can now reach help desks until late evening on weekdays.", 1800, 2500),

  story("womens-league-opens-record-crowds", "sports", "Women's league opens with record crowds",
    "Four of the six opening matches drew full stadiums.", 850, 5100),
  story("young-sprinter-national-record", "sports", "Young sprinter breaks national record at the school games",
    "The teenager shaved a tenth of a second off the previous best.", 1200, 4400),
  story("coach-praises-defence-cup-win", "sports", "Coach praises defence after cup quarter-final win",
    "A clean sheet sends the home side into the semi-finals.", 1600, 2800),

  story("comedy-night-sells-out-three-shows", "entertainment", "Comedy night sells out three shows in a week",
    "Organisers say a fourth date will be announced on Monday.", 950, 4900),
  story("gospel-choir-album-tops-charts", "entertainment", "Gospel choir's debut album tops the streaming charts",
    "The 14-track record passed a million streams in its first four days.", 1400, 5600),
  story("radio-drama-returns-new-season", "entertainment", "Beloved radio drama returns for a new season",
    "Listeners can hear the first episode this Sunday evening on ITV Radio.", 1900, 3300),
];

const BOOT = Date.now();

export const articles = RAW.map((s) => ({
  ...s,
  published: BOOT - s.ago * 60000,
  readMins: s.readMins ?? 3,
}));

export const getArticle = (id) => articles.find((a) => a.id === id);
export const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name ?? slug;
export const leadStory = articles.find((a) => a.lead);
export const breakingStory = articles.find((a) => a.breaking);

export const latest = (n, exclude = []) =>
  [...articles].filter((a) => !exclude.includes(a.id)).sort((a, b) => b.published - a.published).slice(0, n);

export const popular = (n) => [...articles].sort((a, b) => b.views - a.views).slice(0, n);

export const inCategory = (slug, n, exclude = []) =>
  articles
    .filter((a) => a.category === slug && !exclude.includes(a.id))
    .sort((a, b) => b.published - a.published)
    .slice(0, n);

// "12 min ago", "3 h ago", "Yesterday"
export function timeAgo(ms, now = Date.now()) {
  const minutes = Math.max(1, Math.round((now - ms) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return "Yesterday";
}