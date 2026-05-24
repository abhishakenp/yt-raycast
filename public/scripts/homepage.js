// src/lib/content-policy.ts
var ZW_RE = /[\u200B-\u200D\uFEFF\u2060-\u2064]/g;
var CONTENT_POLICY_CLIENT_MESSAGE = `STOP. Your request was blocked under our zero-tolerance rules for sexual content involving minors, non-consensual sexual material, graphic violence, terrorism, self-harm instructions, and related illegal activity.

This attempt is logged with technical identifiers tied to your session. Repeated or egregious abuse can result in a permanent ban and disclosure to law enforcement where required.

Do not submit this type of content again.`;
var LEET_MAP = /* @__PURE__ */ new Map([
  ["0", "o"],
  ["1", "i"],
  ["3", "e"],
  ["4", "a"],
  ["5", "s"],
  ["7", "t"],
  ["8", "b"],
  ["9", "g"],
  ["@", "a"],
  ["$", "s"],
  ["!", "i"]
]);
var BLOCKED_PHRASES = [
  "child porn",
  "childporn",
  "child porno",
  "kid porn",
  "kids porn",
  "minor porn",
  "teen porn",
  "preteen porn",
  "underage porn",
  "underage sex",
  "underage nude",
  "underage naked",
  "jailbait",
  "pedo porn",
  "pedoph",
  "paedoph",
  "lolicon",
  "shotacon",
  "toddler porn",
  "baby porn",
  "elementary porn",
  "schoolgirl porn",
  "school boy porn",
  "incest porn",
  "rape porn",
  "rape video",
  "snuff film",
  "snuff video",
  "gore porn",
  "necroph",
  "bestiality",
  "zoophil",
  "animal sex",
  "deepfake nude",
  "deepfake porn",
  "revenge porn",
  "non-consensual porn",
  "sex trafficking",
  "human trafficking site",
  "buy sex slave",
  "how to bomb",
  "make a bomb",
  "bomb tutorial",
  "how to make explosives",
  "ricin recipe",
  "anthrax how",
  "suicide method",
  "how to kill yourself",
  "self harm tutorial",
  "fentanyl synthesis",
  "how to make meth",
  "cp site",
  "pornhub clone",
  "onlyfans clone porn",
  "xxx tube",
  "hardcore porn site",
  "live sex cam site",
  "webcam sex site",
  "escort trafficking",
  "chloroform abduct",
  "chloroform kidnap"
];
var BLOCKED_COLLAPSED = [
  "childporn",
  "kidporn",
  "pedoporn",
  "jailbait",
  "lolicon",
  "shotacon",
  "snuffporn",
  "zoophil",
  "bestiality",
  "incestporn",
  "rapeporn"
];
var BLOCKED_REGEX = [
  /\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage|schoolkid)s?\b[\s\S]{0,48}\b(porn|xxx|nude|naked|fuck|sexual|erotic\s*content)\b/i,
  /\b(porn|xxx|nude|erotic)\b[\s\S]{0,48}\b(child|kid|kids|minor|minors|toddler|infant|preteen|underage)\b/i,
  /\b(rape|raping)\b[\s\S]{0,32}\b(site|video|stream|gallery|tube)\b/i,
  /\b(how\s+to)\b[\s\S]{0,64}\b(kidnap|abduct|murder|torture|waterboard)\b/i,
  /\b(hitman|contract\s+killing)\b/i,
  /\b(beheading|decapitat)\b[\s\S]{0,24}\b(video|site|live)\b/i,
  /\bisis\b[\s\S]{0,48}\b(recruit|fighter|extremist|terror|bomb)\b/i,
  /\b(plan|commit|carry\s+out)\b[\s\S]{0,40}\b(mass\s+shooting|bombing)\b/i,
  /\b(mass\s+shooting|school\s+shooting)\b[\s\S]{0,40}\b(plan|guide|tutorial|how\s+to)\b/i,
  /\bn[i1]gg+[a3]r[s]?\b/i,
  /\bk[i1]k[e2]s?\b/i,
  /\bc[h][i1]nk[s]?\b/i
];
var applyLeet = (s) => {
  let out = "";
  for (const ch of s) {
    const low = ch.toLowerCase();
    out += LEET_MAP.get(low) ?? low;
  }
  return out;
};
var normalizePolicyText = (raw) => {
  const t = String(raw ?? "").normalize("NFKC").toLowerCase().replace(ZW_RE, "");
  const spaced = t.replace(/\s+/g, " ").trim();
  const leetSpaced = applyLeet(spaced);
  const collapsed = leetSpaced.replace(/[^a-z0-9]+/g, "");
  return { spaced, leetSpaced, collapsed };
};
var checkPromptContentPolicy = (raw) => {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return { ok: true };
  const { spaced, leetSpaced, collapsed } = normalizePolicyText(text);
  const haystacks = [spaced, leetSpaced, collapsed];
  for (const phrase of BLOCKED_PHRASES) {
    const p = phrase.toLowerCase().trim();
    for (const h of haystacks) {
      if (h.includes(p)) return { ok: false, code: "CONTENT_POLICY" };
    }
  }
  for (const frag of BLOCKED_COLLAPSED) {
    if (collapsed.includes(frag)) return { ok: false, code: "CONTENT_POLICY" };
  }
  for (const re of BLOCKED_REGEX) {
    re.lastIndex = 0;
    if (re.test(spaced) || re.test(leetSpaced))
      return { ok: false, code: "CONTENT_POLICY" };
  }
  return { ok: true };
};

// src/lib/home/mixed-english-hints.ts
var MIXED_ENGLISH_SLANG_KEYWORDS = {
  ta: ["tanglish", "tanglish website", "in tanglish"],
  te: ["tenglish", "teluglish", "telugu english mix"],
  kn: ["kanglish", "kanglish website"],
  ml: ["manglish", "manglish website", "in manglish"],
  bn: ["benglish", "banglish", "bengali english mix"],
  mr: ["marathi english mix"],
  gu: ["gunglish", "gujarati english mix"],
  pa: ["punglish", "punjabi english mix"],
  or: ["odia english mix", "oriya english mix"],
  as: ["assamese english mix"],
  ur: ["urdu english mix"],
  mai: ["maithili english mix"],
  kok: ["konkani english mix"],
  mni: ["manipuri english mix"],
  sat: ["santali english mix"],
  ks: ["kashmiri english mix"],
  doi: ["dogri english mix"],
  brx: ["bodo english mix"],
  sd: ["sindhi english mix"],
  sa: ["sanskrit english mix"],
  ne: ["nepali english mix"]
};
var preferMixedEnglishBcp47FromSnippet = (snippet) => {
  const pl = String(snippet || "").toLowerCase();
  if (/\bhinglish\b/.test(pl)) return "hinglish";
  if (/\bmanglish\b/.test(pl)) return "ml-en";
  if (/\btanglish\b/.test(pl)) return "ta-en";
  if (/\b(tenglish|teluglish)\b/.test(pl)) return "te-en";
  if (/\bkanglish\b/.test(pl)) return "kn-en";
  if (/\b(benglish|banglish)\b/.test(pl)) return "bn-en";
  if (/\bgunglish\b/.test(pl)) return "gu-en";
  if (/\bpunglish\b/.test(pl)) return "pa-en";
  for (const [pureCode, words] of Object.entries(MIXED_ENGLISH_SLANG_KEYWORDS)) {
    for (const w of words) {
      if (pl.includes(w.toLowerCase())) return `${pureCode}-en`;
    }
  }
  return null;
};

// src/lib/home/indian-sample-prompts.ts
var INDIAN_SAMPLE_PROMPTS = [
  "An award-level editorial landing page for a premium Indian D2C brand with split hero, bento feature grid, glassmorphism cards, Fraunces or Syne display typography, aurora gradient bands, and subtle CSS motion on scroll.",
  "A cinematic fintech landing page for Indian founders with asymmetric layout, oversized numerals in the background, gradient mesh behind the hero, ring-glow CTAs, and monthly versus yearly pricing toggle with animated counters.",
  "A luxury hospitality landing page for a boutique Indian hotel chain with full-bleed atmospheric sections, pull-quote editorial blocks, testimonial carousel, and depth through layered blur panels \u2014 not a generic template.",
  "A Bharatanatyam academy landing page in mixed English\u2013Tamil tone with guru profiles, beginner to arangetram tracks, rehearsal calendar, and fee structure for Chennai and online students.",
  "A Kathak dance school website with gharana lineage story, tabla and tatkar-focused batches, exam and certification pathway, and winter intensive workshop booking for North Indian cities.",
  "An Odissi dance foundation landing page highlighting temple sculpture inspiration, live orchestra collaborations, costume and jewellery notes, and residency applications for international learners.",
  "A Kuchipudi ensemble and summer intensive landing page with male and female repertoire highlights, story-based items, guest choreographers, and tiered passes for Hyderabad and Bengaluru.",
  "A Kathakali repertory company landing page with evening performance schedule, make-up and costume explainers, Kerala tourism tie-ups, and corporate and school show inquiry forms.",
  "A Mohiniyattam academy landing page with lasya-focused pedagogy, percussion ensemble details, Kerala festival calendar, and scholarship audition slots for young dancers.",
  "A Manipuri classical dance institution landing page with Ras Lila context, indigenous costume care, Imphal campus and outreach tours, and donor and CSR partnership blurbs.",
  "A Sattriya dance and neo-Vaishnavite culture centre landing page with monastery heritage framing, youth and adult batches, Assamese\u2013English copy options, and grant and residency FAQs.",
  "A multi-style Indian classical dance festival landing page with Bharatanatyam Kathak Odissi showcase nights, masterclass tickets, volunteer signup, and sponsor deck download.",
  "A Navratri Garba and Dandiya event organiser landing page with city-wise venues, live dhol and DJ packages, group booking tiers, and safety and crowd management assurances.",
  "A Bhangra academy and college competition crew landing page with Punjab folk roots story, fitness-forward training tracks, costume rental add-ons, and corporate flash-mob packages.",
  "A Lavani and Maharashtrian folk performance collective landing page with rural outreach shows, urban theatre tie-ins, costume authenticity notes, and booking for weddings and corporate days.",
  "A Bihu and Assamese folk culture festival landing page with traditional dance and music slots, local food partner highlights, tourist itinerary hooks, and volunteer and vendor applications.",
  "A national handicrafts and handloom marketplace landing page with GI-tagged clusters, artisan stories, khadi and natural dye filters, and bulk order and export documentation help.",
  "A Madhubani and Mithila art gallery landing page with artist residency programmes, certificate courses, corporate gifting tiers, and international shipping and customs guidance.",
  "A Warli and tribal art tourism cooperative landing page with village homestay loops, painting workshop weekends, fair-trade pricing transparency, and guide and translator add-ons.",
  "A Carnatic music sabha season landing page with monthly kutcheri schedule, season passes, livestream add-on, parking and accessibility notes, and donor and patron circles.",
  "A Hindustani classical vocal and instrumental gurukul landing page with khayal and dhrupad tracks, tabla and harmonium faculty, examination pathway, and online riyaaz cohorts.",
  "A Jaipur Literature Festival\u2013style literary conference landing page with author line-up grid, regional language tracks, student day passes, and sponsor and media kit downloads.",
  "A heritage walking tours operator landing page for Old Delhi Agra and Jaipur circuits with licensed guides, monument combo tickets, wheelchair-friendly route flags, and group charter pricing.",
  "A classical yoga and Natya Shastra\u2013informed movement retreat landing page with abhinaya and rhythm modules, Ayurveda add-ons, ashram stay tiers, and silent-day policy copy.",
  "A trustworthy mixed Hindi-English landing page for a chartered accountant practice offering GST return filing, income tax, and ROC compliance with fees and appointment booking.",
  "A crisp company registration and startup India landing page for CS-led incorporation, MSME registration, and trademark filing with clear packages and timelines.",
  "A professional legal services website for contracts, IP filings, and litigation intake with lawyer profiles, practice areas, and a secure consultation request form.",
  "A B2B HR and payroll compliance landing page for Indian SMBs covering PF, ESI, PT, and payslip automation with pricing tiers and onboarding checklist.",
  "A manufacturing supplier directory style landing page for industrial components with RFQ flow, certifications, and tier-2 city logistics reassurance.",
  "An import-export and customs brokerage landing page with service lanes, documentation checklist, and shipment tracking CTA for Indian exporters.",
  "A facility management and security services landing page with AMC plans, guard deployment regions, and SLA-backed response times.",
  "A premium wedding and corporate event planner landing page with portfolio galleries, vendor coordination packages, and city-wise availability.",
  "A RERA-forward real estate brokerage landing page with project listings, virtual tours, and EMI calculator for Indian metro and tier-2 buyers.",
  "A co-living and PG operator landing page with room types, meal plans, house rules, and UPI-ready rent payment positioning.",
  "An interior design and modular kitchen studio landing page with 3D mood boards, material palettes, and city site-visit booking.",
  "A neighbourhood kirana going online landing page with daily essentials, slot delivery, and UPI QR trust cues for Bharat audiences.",
  "A regional FMCG snacks and spices brand landing page with festive bundles, nutrition callouts, and distributor inquiry for tier-2 retail.",
  "An ethnic wear and bridal boutique landing page with lookbook, made-to-measure appointments, and festival shipping timelines.",
  "A hallmarked jewellery showroom landing page with gold rate ticker, exchange policy, and store locator across Indian cities.",
  "A multi-brand electronics retail and authorised service landing page with warranty lookup, spare parts, and pickup repair slots.",
  "An EV dealership and charging solutions landing page with test-ride booking, subsidy FAQs, and service packages for Indian buyers.",
  "A fine-dine and family restaurant landing page with chef story, regional menu highlights, table reservation, and catering upsell.",
  "A cloud kitchen and delivery brand landing page with live order areas, combo meals, hygiene badges, and partner rider recruitment.",
  "A wedding and banquet catering landing page with per-plate tiers, live counters, tasting session booking, and city coverage map.",
  "A mithai and bakery chain landing page with sugar-free options, corporate gifting, and same-day delivery corridors.",
  "A specialty tea and filter coffee brand landing page with origin stories, subscription tins, and caf\xE9 franchise inquiry.",
  "A boutique hotel and homestay landing page with room stories, local experiences, seasonal tariffs, and direct booking incentives.",
  "A domestic pilgrimage and long-weekend travel landing page with curated itineraries, reviews, and fast flexible booking.",
  "A regional bus and intercity cab operator landing page with routes, live seat maps, safety checklist, and agent login hints.",
  "An FPO and farmer collective landing page with crop plans, mandi connect, transparent pricing charts, and member onboarding.",
  "An agri input dealer landing page with crop-wise catalogues, soil testing partners, and last-mile delivery to villages.",
  "A dairy and milk cooperative landing page with cold chain assurance, subscription milk plans, and quality lab highlights.",
  "A farm equipment rental landing page with tractor hourly rates, attachment catalogue, and operator safety training notes.",
  "An organic and natural farmer brand landing page with traceability QR story, certification badges, and metro delivery slots.",
  "A JEE NEET and state PSC coaching landing page with faculty panel, batch schedules, scholarship test, and parent dashboard teaser.",
  "A regional language edtech landing page with micro-courses, mobile-first lessons, and affordable annual plans for Bharat students.",
  "A vocational ITI and NSDC-aligned skilling landing page with placement partners, lab photos, and employer hiring day calendar.",
  "A study abroad and visa consulting landing page with university shortlists, SOP review, and loan partner pathways for Indian families.",
  "A multi-speciality hospital landing page with departments, insurance tie-ups, OT availability, and emergency contact strip.",
  "A diagnostics lab chain landing page with home collection slots, NABL highlights, and report download UX for patients.",
  "An ethical pharma distributor landing page with cold chain compliance, stockist locator, and doctor education webinar invites.",
  "An Ayurveda and integrative wellness clinic landing page with panchakarma packages, doctor credentials, and seasonal detox plans.",
  "A premium fitness studio landing page with class packs, trainer bios, body assessment booking, and nutrition add-ons.",
  "An NBFC gold loan and MSME lending landing page with transparent APR, branch locator, and minimal documentation promise.",
  "A health and term insurance comparison landing page with IRDAI disclaimers, premium illustrations, and claim assistance highlights.",
  "A mutual fund distributor and RIA landing page with goal calculators, risk questionnaire, and SIP mandate education for Indians.",
  "A stock broking and research landing page with margin FAQ, platform screenshots, and referral rewards tuned for retail traders.",
  "A UPI-first fintech landing page for bill pay, rewards, and credit-line waitlist with bank-grade security messaging.",
  "An NGO and CSR programme landing page with impact metrics, volunteer signup, donation transparency, and 80G note placeholders.",
  "A public health awareness microsite landing page with multilingual toggles, symptom checker caution, and helpline prominence.",
  "A regional digital news publication landing page with editor picks, newsletter signup, and membership wall for long-form.",
  "An indie podcast and creator network landing page with show tiles, sponsor kits, and RSS subscription guidance.",
  "A regional language book publisher landing page with author submissions, distributor map, and festival launch calendar.",
  "An independent film production landing page with slate teaser, casting note, festival laurels, and investor deck request.",
  "An offshore-ready IT services studio landing page with case studies, stack expertise, and timezone overlap chart for US EU clients.",
  "A GST payroll and inventory SaaS for Indian SMBs landing page with CA partner programme, demo video, and pricing in rupees.",
  "A cybersecurity and GRC consulting landing page with audit offerings, breach response retainer, and compliance checklist downloads.",
  "A solar EPC and rooftop landing page with subsidy steps, generation calculator, and O&M warranty table for homes and SMEs.",
  "A logistics and 3PL landing page with pincode SLA map, freight calculator, and COD reconciliation highlights for ecommerce brands.",
  "A civil construction and contracting landing page with project portfolio, RERA mention, safety record, and tender inquiry form.",
  "A community-focused matrimony landing page with verification layers, family-friendly copy, and privacy controls emphasis.",
  "A temple trust and donation landing page with darshan timings, seva booking, 80G transparency, and festival crowd management info.",
  "A sports academy landing page with coaching levels, turf booking, nutrition partners, and parent progress portal teaser.",
  "A parenting and kids activity centre landing page with age bands, weekend workshops, and trial class booking flow.",
  "A tier-3 city coaching centre landing page with hostel tie-ups, daily test series, and scholarship stories in Hinglish tone.",
  "A seafood and poultry integrated brand landing page with cold chain badges, cut options, and metro morning delivery promise.",
  "A warehouse and cold storage operator landing page with pallet pricing, CCTV assurance, and FMCH client logos.",
  "A college placement cell microsite landing page with recruiter timeline, student achievement wall, and training partner list.",
  "A boutique law firm for startups landing page with flat-fee bundles, cap table clinic, and founder office hours booking.",
  "A mobile wallet and recharge super-app landing page with rewards, bill categories, and KYC upgrade journey for India users."
];

// src/lib/home/sample-prompts.ts
var SAMPLE_PROMPTS = [
  "A cinematic travel landing page for curated weekend escapes with reviews and fast booking.",
  "A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.",
  "A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.",
  "A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.",
  "A sleek fintech landing page for founders tracking runway, burn, and investor updates.",
  "A modern fitness club website with class schedules, trainer profiles, and membership plans.",
  ...INDIAN_SAMPLE_PROMPTS
];
var LOCAL_DEV_PROMPT_SHORTCUTS = [
  "Mere local gym ke liye ek powerful modern website banao with membership plans",
  "Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.",
  "Create a clean SaaS marketing dashboard for a remote team productivity platform with charts and responsive cards.",
  "A trustworthy mixed Hindi-English landing page for a chartered accountant practice offering GST return filing, income tax, and ROC compliance with fees and appointment booking.",
  "A fine-dine and family restaurant landing page with chef story, regional menu highlights, table reservation, and catering upsell.",
  "A regional language edtech landing page with micro-courses, mobile-first lessons, and affordable annual plans for Bharat students.",
  "An FPO and farmer collective landing page with crop plans, mandi connect, transparent pricing charts, and member onboarding.",
  "A multi-speciality hospital landing page with departments, insurance tie-ups, OT availability, and emergency contact strip.",
  "A solar EPC and rooftop landing page with subsidy steps, generation calculator, and O&M warranty table for homes and SMEs."
];

// src/scripts/home-session-embed.ts
var isMarketingHomePath = () => {
  const p = location.pathname;
  return p === "/" || p === "";
};
var openEmbeddedSession = (sessionId) => {
  const idStr = String(sessionId);
  sessionStorage.setItem("sf_return_home", "1");
  location.href = `/session/${encodeURIComponent(idStr)}`;
};

// src/scripts/homepage.ts
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
var getTypedElement = (id) => document.getElementById(id);
var currentUser = null;
var authResolved = false;
var hasSessionResizeListener = false;
var openAuthOverlay = () => {
  window.dispatchEvent(new CustomEvent("sf-request-auth-overlay"));
};
async function authFetch(url, options = {}) {
  const bridge = window.__sfAuthFetch;
  if (bridge) return bridge(url, options);
  const headers = { ...options.headers || {} };
  return fetch(url, { ...options, headers });
}
async function showAnonymousApp() {
  if (getGenerationCount() >= GENERATION_LIMIT) {
    try {
      const resp = await fetch("/api/share-bonus");
      if (resp.ok) {
        const data = await resp.json();
        if (data.claimed) shareBonusClaimed = true;
      }
    } catch {
    }
  }
  updateGenerationCounter();
  syncSubmitButtonState();
  publicGalleryPage = 1;
  userGalleryPage = 1;
  await hydrateAnonymousOrPublicGallery();
}
async function showApp() {
  updateGenerationCounter();
  syncSubmitButtonState();
  loadSessions();
}
var form = getTypedElement("prompt-form");
var input = getTypedElement("prompt-input");
var languageSelect = getTypedElement("prompt-language");
var promptLanguageRow = getTypedElement("prompt-language-row");
var submitButton = getTypedElement("submit-btn");
var submitButtonLabel = submitButton?.querySelector(".btn-label");
var logoTagline = getTypedElement("logo-tagline");
var SUBMIT_BTN_DEFAULT_LABEL = "Generate";
var generationCounter = getTypedElement("gen-counter");
var promptPlaceholder = getTypedElement("prompt-placeholder");
var promptPlaceholderText = getTypedElement("prompt-placeholder-text");
var promptSuggestions = getTypedElement("prompt-suggestions");
var promptSuggestionsList = getTypedElement("prompt-suggestions-list");
var privateGenRow = getTypedElement("private-gen-row");
var privateGenCheckbox = getTypedElement("private-gen-checkbox");
var privateGenModal = getTypedElement("private-gen-modal");
var policyBlock = getTypedElement("prompt-policy-block");
var sessionPagination = getTypedElement("session-pagination");
var sessionPaginationActions = getTypedElement("session-pagination-actions");
var sessionPagePrev = getTypedElement("session-page-prev");
var sessionPageNext = getTypedElement("session-page-next");
var sessionPageStatus = getTypedElement("session-page-status");
var GALLERY_PAGE_SIZE = 12;
var GALLERY_RESTORE_PAGE_KEY = "sf_gallery_restore_page";
var GALLERY_RESTORE_SOURCE_KEY = "sf_gallery_restore_source";
var publicGalleryPage = 1;
var userGalleryPage = 1;
var gallerySource = "public";
var galleryMeta = null;
var anonSessionEntriesCacheT = 0;
var anonSessionEntriesCacheV = null;
var ANON_SESSION_ENTRIES_TTL_MS = 45e3;
var SF_PUBLIC_GALLERY_STALE_MS = 9e4;
function consumeGalleryRestore() {
  const pageRaw = sessionStorage.getItem(GALLERY_RESTORE_PAGE_KEY);
  const sourceRaw = sessionStorage.getItem(GALLERY_RESTORE_SOURCE_KEY);
  if (pageRaw != null) sessionStorage.removeItem(GALLERY_RESTORE_PAGE_KEY);
  if (sourceRaw != null) sessionStorage.removeItem(GALLERY_RESTORE_SOURCE_KEY);
  const page = pageRaw != null ? Math.max(1, parseInt(pageRaw, 10) || 1) : 1;
  const source = sourceRaw === "user" || sourceRaw === "public" ? sourceRaw : null;
  return { page, source };
}
var GENERATION_LIMIT = 2;
var GENERATION_LIMIT_WITH_BONUS = 3;
var MIN_PROMPT_LENGTH = 15;
var PROMPT_LANG_DETECT_MIN_CHARS = 65;
var PROMPT_LANG_DETECT_DEBOUNCE_MS = 400;
var PROMPT_LANG_DETECT_SNIPPET_MAX = 800;
var PROMPT_SUGGEST_MIN_CHARS = 2;
var PROMPT_SUGGEST_MAX_SHOW = 4;
var PROMPT_SUGGEST_DEBOUNCE_MS = 380;
var PREFERRED_LANGUAGE_KEY = "sf_preferred_language";
var FRANC_ISO639_3_TO_BCP47 = {
  eng: "en",
  fra: "fr",
  ita: "it",
  spa: "es",
  deu: "de",
  nld: "nl",
  por: "pt",
  rus: "ru",
  pol: "pl",
  tur: "tr",
  hun: "hu",
  ces: "cs",
  slk: "sk",
  ron: "ro",
  ell: "el",
  swe: "sv",
  dan: "da",
  fin: "fi",
  nor: "no",
  nob: "nb",
  nno: "nn",
  ind: "id",
  jpn: "ja",
  kor: "ko",
  zho: "zh",
  arb: "ar",
  ara: "ar",
  pes: "fa",
  hin: "hi",
  tam: "ta",
  tel: "te",
  kan: "kn",
  mal: "ml",
  ben: "bn",
  mar: "mr",
  guj: "gu",
  pan: "pa",
  ori: "or",
  asm: "as",
  urd: "ur",
  mai: "mai",
  kok: "kok",
  mni: "mni",
  sat: "sat",
  kas: "ks",
  doi: "doi",
  brx: "brx",
  snd: "sd",
  san: "sa",
  nep: "ne"
};
var PROMPT_DETECT_INDIAN_FRANC = /* @__PURE__ */ new Set([
  "hin",
  "tam",
  "tel",
  "kan",
  "mal",
  "ben",
  "mar",
  "guj",
  "pan",
  "ori",
  "asm",
  "urd",
  "mai",
  "kok",
  "mni",
  "sat",
  "kas",
  "doi",
  "brx",
  "snd",
  "san",
  "nep"
]);
var GENERATE_CTA_BY_LANG = {
  en: "Generate",
  hinglish: "\u092C\u0928\u093E\u0913",
  hi: "\u092C\u0928\u093E\u090F\u0902",
  ta: "\u0B89\u0BB0\u0BC1\u0BB5\u0BBE\u0B95\u0BCD\u0B95\u0BC1",
  te: "\u0C38\u0C43\u0C37\u0C4D\u0C1F\u0C3F\u0C02\u0C1A\u0C41",
  kn: "\u0CB0\u0C9A\u0CBF\u0CB8\u0CBF",
  ml: "\u0D38\u0D43\u0D37\u0D4D\u0D1F\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D15",
  bn: "\u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
  mr: "\u0924\u092F\u093E\u0930 \u0915\u0930\u093E",
  gu: "\u0AAC\u0AA8\u0ABE\u0AB5\u0ACB",
  pa: "\u0A2C\u0A23\u0A3E\u0A13",
  or: "\u0B24\u0B3F\u0B06\u0B30\u0B3F \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41",
  as: "\u09B8\u09C3\u09B7\u09CD\u099F\u09BF \u0995\u09F0\u0995",
  ur: "\u067E\u06CC\u062F\u0627 \u06A9\u0631\u06CC\u06BA",
  mai: "\u092C\u0928\u093E\u092C",
  kok: "\u0924\u092F\u093E\u0930 \u0915\u0930\u093E\u0924",
  mni: "Generate",
  sat: "\u1C5B\u1C6E\u1C6D\u1C5F\u1C68 \u1C62\u1C6E",
  ks: "\u062A\u06CC\u0627\u0631 \u06A9\u0654\u0631\u0650\u0648",
  doi: "\u092C\u0928\u093E\u0913",
  brx: "\u0938\u094B\u0932\u094B\u0902\u0925\u093E\u0907",
  sd: "\u062A\u064A\u0627\u0631 \u06AA\u0631\u064A\u0648",
  sa: "\u091C\u0928\u092F\u0924\u0941",
  ne: "\u0938\u093F\u0930\u094D\u091C\u0928\u093E \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D",
  fr: "G\xE9n\xE9rer",
  it: "Genera",
  es: "Generar",
  de: "Generieren",
  nl: "Genereren",
  pt: "Gerar",
  ru: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C",
  pl: "Generuj",
  tr: "Olu\u015Ftur",
  hu: "Gener\xE1l\xE1s",
  cs: "Vygenerovat",
  sk: "Vygenerova\u0165",
  ro: "Genereaz\u0103",
  el: "\u0394\u03B7\u03BC\u03B9\u03BF\u03CD\u03C1\u03B3\u03B7\u03C3\u03B5",
  sv: "Generera",
  da: "Generer",
  fi: "Luo",
  no: "Generer",
  nb: "Generer",
  nn: "Generer",
  id: "Hasilkan",
  ja: "\u751F\u6210",
  ko: "\uC0DD\uC131",
  zh: "\u751F\u6210",
  ar: "\u062A\u0648\u0644\u064A\u062F",
  fa: "\u062A\u0648\u0644\u06CC\u062F"
};
var SHIPFAST_TAGLINE_BY_LANG = {
  hinglish: "\u0924\u0947\u091C\u093C \u0936\u093F\u092A",
  hi: "\u0924\u0947\u091C\u093C \u092D\u0947\u091C\u0947\u0902",
  ta: "\u0BB5\u0BBF\u0BB0\u0BC8\u0BB5\u0BBE\u0B95 \u0B85\u0BA9\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1",
  te: "\u0C35\u0C47\u0C17\u0C02\u0C17\u0C3E \u0C2A\u0C02\u0C2A\u0C41",
  kn: "\u0CB5\u0CC7\u0C97\u0CB5\u0CBE\u0C97\u0CBF \u0CB0\u0CB5\u0CBE\u0CA8\u0CBF\u0CB8\u0CBF",
  ml: "\u0D35\u0D47\u0D17\u0D24\u0D4D\u0D24\u0D3F\u0D7D \u0D05\u0D2F\u0D2F\u0D4D\u0D15\u0D4D\u0D15\u0D41\u0D15",
  bn: "\u09A6\u09CD\u09B0\u09C1\u09A4 \u09AA\u09BE\u09A0\u09BE\u09A8",
  mr: "\u092A\u091F\u0915\u0928 \u092A\u093E\u0920\u0935\u093E",
  gu: "\u0A9D\u0AA1\u0AAA\u0AA5\u0AC0 \u0AAE\u0ACB\u0A95\u0AB2\u0ACB",
  pa: "\u0A24\u0A47\u0A1C\u0A3C\u0A40 \u0A28\u0A3E\u0A32 \u0A2D\u0A47\u0A1C\u0A4B",
  or: "\u0B36\u0B40\u0B18\u0B4D\u0B30 \u0B2A\u0B20\u0B3E\u0B28\u0B4D\u0B24\u0B41",
  as: "\u09A6\u09CD\u09F0\u09C1\u09A4\u09A4\u09C7\u09F0\u09C7 \u09AA\u09A0\u09BE\u0993\u0995",
  ur: "\u062A\u06CC\u0632 \u0628\u06BE\u06CC\u062C\u06CC\u06BA",
  mai: "\u0924\u0947\u091C\u0940 \u0938\u0901 \u092A\u0920\u093E\u092C",
  kok: "\u0935\u0947\u0917\u093E\u0928 \u092A\u093E\u0920\u092F\u093E\u0924",
  mni: "Ship Fast",
  sat: "\u1C5E\u1C5A\u1C5C\u1C5A\u1C71 \u1C6F\u1C5A\u1C5B\u1C5F\u1C79\u1C63",
  ks: "\u0698\u0655 \u062A\u0672\u0632\u06CC\u0656 \u067E\u0672\u0679\u0672\u06CC\u0648",
  doi: "\u0924\u0947\u091C\u0940 \u0938\u093E\u0901 \u092A\u0947\u091C\u094A",
  brx: "\u0925\u093E\u0902\u0916\u094B \u0925\u093E\u0902\u092B\u093E\u092F",
  sd: "\u062A\u06AA\u064A \u0633\u0627\u0646 \u0645\u0648\u06AA\u0644\u064A\u0648",
  sa: "\u0936\u0940\u0918\u094D\u0930\u0902 \u092A\u094D\u0930\u0947\u0937\u092F",
  ne: "\u091B\u093F\u091F\u094B \u092A\u0920\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D",
  fr: "Livraison rapide",
  it: "Spedizione veloce",
  es: "Env\xEDo veloz",
  de: "Schnell liefern",
  nl: "Snel verzenden",
  pt: "Envio r\xE1pido",
  ru: "\u0411\u044B\u0441\u0442\u0440\u0430\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0430",
  pl: "Szybka wysy\u0142ka",
  tr: "H\u0131zl\u0131 g\xF6nder",
  hu: "Gyors sz\xE1ll\xEDt\xE1s",
  cs: "Rychl\xE9 odesl\xE1n\xED",
  sk: "R\xFDchle odoslanie",
  ro: "Livrare rapid\u0103",
  el: "\u0393\u03C1\u03AE\u03B3\u03BF\u03C1\u03B7 \u03B1\u03C0\u03BF\u03C3\u03C4\u03BF\u03BB\u03AE",
  sv: "Snabb leverans",
  da: "Hurtig forsendelse",
  fi: "Nopea toimitus",
  no: "Rask forsendelse",
  nb: "Rask forsendelse",
  nn: "Rask forsendelse",
  id: "Kirim cepat",
  ja: "\u8FC5\u901F\u767A\u9001",
  ko: "\uBE60\uB978 \uBC30\uC1A1",
  zh: "\u6781\u901F\u53D1\u8D27",
  ar: "\u0634\u062D\u0646 \u0633\u0631\u064A\u0639",
  fa: "\u0627\u0631\u0633\u0627\u0644 \u0633\u0631\u06CC\u0639"
};
var PROMPT_HINGLISH_LATIN = new Set(
  `ke liye kaa ki ka ko se par pe aur ya phir bhi ho hai hain hoon hun main tum aap ham hum aapka aapki mere meri apna apni apne kuch sab koi kuchh kitna kab kahan kaise kyun kyo kyon bas fir tab jab banao banaye bana karo karein chahiye chahie milega milegi dekho dekhe suno samjho samajh wala wale wali accha achha achhi theek thik bahut zyada thoda kam sahi galat nahi nahin nhi haan haanji na mat jaldi jald jisse apne apni bas fir woh wo yeh ye koi kabhi kabhi sirf sirf bass reh reho rehi karenge karunga karungi hona honi hoga hogi`.split(
    /\s+/
  )
);
var PROMPT_ENGLISH_LEXICON = new Set(
  `the and for with from into about over under this that these those your our their its was were been being have has had do does did will would could should may might can must shall need want like make made makes making take took give gave go went come came see saw know think say said get got use used work worked call called try tried help helped show showed look looked find found keep kept let put set run ran move add added open opened close closed save saved load loaded click tapped type types typed enter enter submit cancel delete edit update create created build built design designed ship fast page home landing site web website internet online digital product products service services customer customers user users client clients team teams member members account accounts login sign signup signin register password email phone contact contacts pricing price plan plans paid free pro premium trial subscribe feature features faq help support docs doc api blog news story stories video image photo photos gallery map maps list lists search filter sort menu nav header footer sidebar modal popover popup button link links form forms field fields input inputs select checkbox radio toggle slider range progress loading spinner toast alert badge pill tag tags label labels chart charts graph graphs stats stat analytics dashboard panel admin profile settings billing payment pay invoice cart checkout order orders shipping delivery pickup return refund coupon discount offer sale deal gift promo subscription monthly yearly gym fitness fit trainer trainers train class classes schedule schedules booking book session sessions ladies women men kids family kid friendly safe safely security secure private public modern clean minimal bold premium luxury brand brands mission vision value values trust trusted review reviews rating ratings hero banner card cards grid layout layouts responsive mobile tablet desktop animation scroll slide gallery tour faq question answer answers step steps guide guides tutorial resource resources download upload share shared invite join community forum chat message messages notify notification notifications push sms otp verify account`.split(
    /\s+/
  )
);
function promptLatinEnglishLean(text) {
  const words = String(text || "").toLowerCase().match(/\b[a-z]{2,}\b/g);
  if (!words || words.length === 0) return { lean: 0, en: 0, hi: 0, n: 0 };
  let en = 0;
  let hi = 0;
  for (const word of words) {
    if (PROMPT_HINGLISH_LATIN.has(word)) hi += 1;
    else if (PROMPT_ENGLISH_LEXICON.has(word)) en += 1;
  }
  const rest = words.length - en - hi;
  const lean = (en + rest * 0.22) / words.length;
  return { lean, en, hi, n: words.length };
}
function resolveFrancCode3ForPrompt(snippet, code3) {
  if (!code3 || code3 === "und") return code3;
  if (code3 === "eng" || PROMPT_DETECT_INDIAN_FRANC.has(code3)) return code3;
  const { lean, en, hi, n } = promptLatinEnglishLean(snippet);
  if (n < 4) return code3;
  if (lean >= 0.36 && en > hi && en >= 4) return "eng";
  return code3;
}
function resolveFrancCode3HinglishPreference(snippet, code3) {
  if (!code3 || code3 === "und") return code3;
  if (code3 === "urd") return code3;
  if (PROMPT_DETECT_INDIAN_FRANC.has(code3) && code3 !== "hin") return code3;
  const lower = String(snippet || "").toLowerCase();
  const { hi, en, n } = promptLatinEnglishLean(snippet);
  const hasKeLiye = /\bke\s+liye\b/.test(lower);
  const hasBanao = /\bbanao\b/.test(lower);
  const hinglishStrong = hasKeLiye || hi >= 2 || hi >= 1 && hasBanao || n >= 6 && hi >= 2 && hi >= en * 0.35;
  if (hinglishStrong) return "hinglish";
  if (code3 === "hin") return "hin";
  return code3;
}
var francLoadPromise = null;
var promptLangDetectTimer = null;
var promptLangDetectToken = 0;
var lastPromptTrimLen = 0;
var promptLanguageRowUnlocked = false;
var isLocalDevHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "::1");
var isHomeDevPromptsEnabled = () => {
  if (true) return true;
  return isLocalDevHost;
};
var SAMPLE_PROMPTS2 = [
  "A cinematic travel landing page for curated weekend escapes with reviews and fast booking.",
  "A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.",
  "A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.",
  "A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.",
  "A sleek fintech landing page for founders tracking runway, burn, and investor updates.",
  "A modern fitness club website with class schedules, trainer profiles, and membership plans.",
  ...INDIAN_SAMPLE_PROMPTS
];
function normalizeLanguageCode(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "hinglish") return "hinglish";
  if (/^[a-z]{2,8}-en$/.test(v)) return v;
  return v.split(/[-_]/)[0];
}
function getBrowserLanguageCandidates() {
  const navigatorLanguages = Array.isArray(navigator.languages) ? navigator.languages : [];
  const candidates = navigatorLanguages.length > 0 ? navigatorLanguages : [navigator.language].filter(Boolean);
  const normalized = candidates.map((entry) => normalizeLanguageCode(entry)).filter(Boolean).filter((value, index, self) => self.indexOf(value) === index);
  return normalized;
}
function getLanguageDisplayName(code) {
  const normalized = normalizeLanguageCode(code);
  if (!normalized) return "Language";
  if (typeof Intl === "undefined" || typeof Intl.DisplayNames === "undefined") {
    return normalized;
  }
  try {
    const display = new Intl.DisplayNames(void 0, { type: "language" });
    return display.of(normalized) || normalized;
  } catch {
    return normalized;
  }
}
function getSavedPreferredLanguage() {
  if (!languageSelect) return null;
  const preferred = localStorage.getItem(PREFERRED_LANGUAGE_KEY);
  const normalized = normalizeLanguageCode(preferred);
  if (!normalized) return null;
  return Array.from(languageSelect.options).some((option) => option.value === normalized) ? normalized : null;
}
function savePreferredLanguage(language) {
  const normalized = normalizeLanguageCode(language);
  if (!normalized) return;
  if (!languageSelect) return;
  if (!Array.from(languageSelect.options).some((option) => option.value === normalized)) return;
  localStorage.setItem(PREFERRED_LANGUAGE_KEY, normalized);
}
function detectBrowserLanguage() {
  if (!languageSelect) return "en";
  const available = new Set(Array.from(languageSelect.options).map((option) => option.value));
  const storedLanguage = getSavedPreferredLanguage();
  if (storedLanguage && storedLanguage !== "en") return storedLanguage;
  const normalizedCandidates = getBrowserLanguageCandidates();
  const supportedNonEnglishMatch = normalizedCandidates.find(
    (language) => language !== "en" && available.has(language)
  );
  if (supportedNonEnglishMatch) return supportedNonEnglishMatch;
  const browserNonEnglish = normalizedCandidates.find((language) => language !== "en");
  if (browserNonEnglish) return browserNonEnglish;
  if (available.has("en")) return "en";
  if (Array.from(available).length > 0) return Array.from(available)[0];
  return available.values().next().value || "en";
}
function focusLanguageOptions(preferredLanguage) {
  if (!languageSelect) return;
  const options = Array.from(languageSelect.options);
  const englishOption = options.find((option) => option.value === "en");
  const preferredOption = options.find((option) => option.value === preferredLanguage);
  if (!englishOption) return;
  const normalizedPreferred = normalizeLanguageCode(preferredLanguage);
  const preferredToShow = normalizedPreferred && preferredOption && normalizedPreferred !== "en" ? preferredOption : null;
  const customPreferredToShow = normalizedPreferred && normalizedPreferred !== "en" && !preferredOption ? new Option(getLanguageDisplayName(normalizedPreferred), normalizedPreferred) : null;
  languageSelect.innerHTML = "";
  languageSelect.appendChild(englishOption.cloneNode(true));
  if (preferredToShow) languageSelect.appendChild(preferredToShow.cloneNode(true));
  if (customPreferredToShow) languageSelect.appendChild(customPreferredToShow);
  languageSelect.value = normalizedPreferred || "en";
}
function mergeLanguageOptionsSelect(selectedCode) {
  if (!languageSelect) return;
  const normalized = normalizeLanguageCode(selectedCode) || "en";
  const existing = Array.from(languageSelect.options);
  const englishOpt = existing.find((option) => option.value === "en");
  if (!englishOpt) return;
  const extras = [];
  const seen = /* @__PURE__ */ new Set();
  for (const option of existing) {
    if (option.value === "en") continue;
    if (seen.has(option.value)) continue;
    seen.add(option.value);
    extras.push(option);
  }
  if (normalized !== "en" && !seen.has(normalized)) {
    seen.add(normalized);
    extras.push(new Option(getLanguageDisplayName(normalized), normalized));
  }
  languageSelect.innerHTML = "";
  languageSelect.appendChild(englishOpt.cloneNode(true));
  for (const option of extras) {
    languageSelect.appendChild(option.cloneNode(true));
  }
  languageSelect.value = normalized;
}
function applyBrowserPreferredLanguage() {
  const nextLanguage = detectBrowserLanguage();
  focusLanguageOptions(nextLanguage);
  if (!languageSelect) return;
  languageSelect.value = nextLanguage;
}
function resetSubmitCtaLabel() {
  if (!submitButtonLabel) return;
  submitButtonLabel.textContent = SUBMIT_BTN_DEFAULT_LABEL;
  submitButton?.classList.remove("submit-btn--cta-shake");
}
function getLogoTaglineText(bcp47) {
  const key = normalizeLanguageCode(bcp47);
  if (!key || key === "en") return "";
  const direct = SHIPFAST_TAGLINE_BY_LANG[key];
  if (direct) return direct;
  const base = /^([a-z]{2,8})-en$/.exec(key)?.[1];
  return base && SHIPFAST_TAGLINE_BY_LANG[base] || "";
}
function resetLogoTagline() {
  if (!logoTagline) return;
  logoTagline.textContent = "";
  logoTagline.setAttribute("aria-hidden", "true");
  logoTagline.classList.remove("logo-tagline--in", "logo-tagline--settled");
}
function playLogoTaglineIn(text) {
  if (!logoTagline) return;
  logoTagline.textContent = text;
  logoTagline.setAttribute("aria-hidden", "false");
  logoTagline.classList.remove("logo-tagline--settled", "logo-tagline--in");
  void logoTagline.offsetWidth;
  logoTagline.classList.add("logo-tagline--in");
}
function getGenerateCtaLabel(bcp47) {
  const key = normalizeLanguageCode(bcp47);
  if (!key) return SUBMIT_BTN_DEFAULT_LABEL;
  const direct = GENERATE_CTA_BY_LANG[key];
  if (direct) return direct;
  const base = /^([a-z]{2,8})-en$/.exec(key)?.[1];
  return base && GENERATE_CTA_BY_LANG[base] || SUBMIT_BTN_DEFAULT_LABEL;
}
function syncPreferredLanguageUi() {
  if (!languageSelect || !promptLanguageRow || !promptLanguageRowUnlocked) return;
  if (promptLanguageRow.classList.contains("is-hidden")) return;
  if (submitButtonLabel) submitButtonLabel.textContent = getGenerateCtaLabel(languageSelect.value);
  const tag = getLogoTaglineText(languageSelect.value);
  if (tag) playLogoTaglineIn(tag);
  else resetLogoTagline();
}
function playSubmitCtaShake() {
  if (!submitButton) return;
  submitButton.classList.remove("submit-btn--cta-shake");
  void submitButton.offsetWidth;
  submitButton.classList.add("submit-btn--cta-shake");
}
function syncPromptLanguageRowVisibility() {
  if (!promptLanguageRow || !languageSelect) return;
  const show = input.value.trim().length >= PROMPT_LANG_DETECT_MIN_CHARS;
  promptLanguageRow.classList.toggle("is-hidden", !show);
  if (!show) {
    resetSubmitCtaLabel();
    resetLogoTagline();
    if (promptLanguageRowUnlocked) {
      focusLanguageOptions("en");
      languageSelect.value = "en";
      savePreferredLanguage("en");
    }
    promptLanguageRowUnlocked = false;
    return;
  }
  if (!promptLanguageRowUnlocked) {
    applyBrowserPreferredLanguage();
    promptLanguageRowUnlocked = true;
    syncPreferredLanguageUi();
  }
}
function loadFranc() {
  francLoadPromise = francLoadPromise || import("franc-min").then((mod) => mod.franc ?? mod.default);
  return francLoadPromise;
}
async function detectSnippetLanguageBcp47(fullText) {
  const fromMixedHint = preferMixedEnglishBcp47FromSnippet(fullText);
  if (fromMixedHint) return fromMixedHint;
  const snippet = String(fullText || "").slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX);
  let franc;
  try {
    franc = await loadFranc();
  } catch {
    return null;
  }
  if (typeof franc !== "function") return null;
  let code3 = franc(snippet, { minLength: 10 }) || "und";
  if (code3 !== "und") {
    code3 = resolveFrancCode3ForPrompt(snippet, code3) ?? "und";
    if (code3 === "und") code3 = "eng";
  } else {
    code3 = "eng";
  }
  code3 = resolveFrancCode3HinglishPreference(snippet, code3) ?? code3;
  if (!code3 || code3 === "und") return null;
  const toBcp47 = (resolved) => resolved === "hinglish" ? "hinglish" : FRANC_ISO639_3_TO_BCP47[resolved];
  return toBcp47(code3) || null;
}
function runPromptLangDetectAsync(runToken, options) {
  void (async () => {
    if (!languageSelect) return;
    if (runToken !== promptLangDetectToken) return;
    const currentText = input.value.trim();
    if (currentText.length < PROMPT_LANG_DETECT_MIN_CHARS) return;
    if (runToken !== promptLangDetectToken) return;
    const bcp47 = await detectSnippetLanguageBcp47(
      currentText.slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX)
    );
    if (!bcp47) return;
    if (runToken !== promptLangDetectToken) return;
    if (input.value.trim().length < PROMPT_LANG_DETECT_MIN_CHARS) return;
    if (options?.skipIfUnchanged) {
      const hasOption = Array.from(languageSelect.options).some(
        (option) => option.value === bcp47
      );
      if (languageSelect.value === bcp47 && hasOption) return;
    }
    mergeLanguageOptionsSelect(bcp47);
    savePreferredLanguage(bcp47);
    if (submitButtonLabel) {
      submitButtonLabel.textContent = getGenerateCtaLabel(bcp47);
      playSubmitCtaShake();
    }
    const tag = getLogoTaglineText(bcp47);
    if (tag) playLogoTaglineIn(tag);
    else resetLogoTagline();
  })();
}
function schedulePromptLanguageDetect() {
  if (!languageSelect) return;
  const text = input.value.trim();
  if (text.length < PROMPT_LANG_DETECT_MIN_CHARS) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer);
      promptLangDetectTimer = null;
    }
    promptLangDetectToken += 1;
    return;
  }
  if (promptLangDetectTimer !== null) {
    clearTimeout(promptLangDetectTimer);
    promptLangDetectTimer = null;
  }
  const runToken = ++promptLangDetectToken;
  promptLangDetectTimer = window.setTimeout(() => {
    promptLangDetectTimer = null;
    runPromptLangDetectAsync(runToken, { skipIfUnchanged: true });
  }, PROMPT_LANG_DETECT_DEBOUNCE_MS);
}
var promptSuggestTimer = null;
var promptSuggestToken = 0;
var promptSuggestAbort = null;
var promptSuggestActive = -1;
var promptSuggestRows = [];
var promptSuggestOpen = false;
function escapeSuggestHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatSuggestRowHtml(full, qLen) {
  return `${escapeSuggestHtml(full.slice(0, qLen))}<mark>${escapeSuggestHtml(full.slice(qLen))}</mark>`;
}
function setPromptSuggestActive(next) {
  if (!promptSuggestionsList) return;
  const items = promptSuggestionsList.querySelectorAll(".prompt-suggestions-item");
  const n = items.length;
  if (n === 0) return;
  const idx = (next % n + n) % n;
  promptSuggestActive = idx;
  items.forEach((el, i) => el.classList.toggle("is-active", i === idx));
  input.setAttribute("aria-activedescendant", `prompt-suggest-${idx}`);
}
function closePromptSuggestions() {
  promptSuggestOpen = false;
  promptSuggestActive = -1;
  promptSuggestRows = [];
  if (promptSuggestions) {
    promptSuggestions.classList.remove("is-open");
    promptSuggestions.hidden = true;
  }
  if (promptSuggestionsList) promptSuggestionsList.innerHTML = "";
  input.removeAttribute("aria-activedescendant");
}
function renderPromptSuggestions(rows, queryLen) {
  if (!promptSuggestions || !promptSuggestionsList) return;
  if (rows.length === 0) {
    closePromptSuggestions();
    return;
  }
  promptSuggestRows = rows;
  promptSuggestOpen = true;
  promptSuggestions.hidden = false;
  promptSuggestionsList.innerHTML = "";
  rows.forEach((text, i) => {
    const li = document.createElement("li");
    li.className = "prompt-suggestions-item";
    li.setAttribute("role", "option");
    li.id = `prompt-suggest-${i}`;
    li.innerHTML = formatSuggestRowHtml(text, queryLen);
    li.addEventListener("mousedown", (event) => {
      event.preventDefault();
      applyPromptSuggestion(text);
    });
    promptSuggestionsList.appendChild(li);
  });
  setPromptSuggestActive(0);
  requestAnimationFrame(() => promptSuggestions.classList.add("is-open"));
}
function applyPromptSuggestion(fullText) {
  closePromptSuggestions();
  input.value = fullText;
  hidePolicyViolation();
  validatePrompt(false);
  syncSamplePromptVisibility();
  syncSubmitButtonState();
  const prev = lastPromptTrimLen;
  const t = input.value.trim();
  const crossed = prev < PROMPT_LANG_DETECT_MIN_CHARS && t.length >= PROMPT_LANG_DETECT_MIN_CHARS;
  lastPromptTrimLen = t.length;
  syncPromptLanguageRowVisibility();
  if (crossed) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer);
      promptLangDetectTimer = null;
    }
    const runToken = ++promptLangDetectToken;
    requestAnimationFrame(() => runPromptLangDetectAsync(runToken, { skipIfUnchanged: false }));
  } else {
    schedulePromptLanguageDetect();
  }
  input.focus();
}
async function fetchPromptSuggestionsFromApi(raw, runToken, signal) {
  const q = raw.trim();
  const qLen = q.length;
  if (qLen < PROMPT_SUGGEST_MIN_CHARS) {
    closePromptSuggestions();
    return;
  }
  if (document.activeElement !== input) {
    closePromptSuggestions();
    return;
  }
  try {
    const resp = await authFetch("/api/prompt-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partial: q }),
      signal
    });
    if (runToken !== promptSuggestToken) return;
    if (!resp.ok) {
      closePromptSuggestions();
      return;
    }
    const data = await resp.json();
    if (runToken !== promptSuggestToken) return;
    const rows = Array.isArray(data.suggestions) ? data.suggestions.filter((x) => typeof x === "string").slice(0, PROMPT_SUGGEST_MAX_SHOW) : [];
    renderPromptSuggestions(rows, qLen);
  } catch (err) {
    if (err?.name === "AbortError") return;
    if (runToken !== promptSuggestToken) return;
    closePromptSuggestions();
  }
}
function schedulePromptSuggestUpdate() {
  if (promptSuggestTimer !== null) {
    clearTimeout(promptSuggestTimer);
    promptSuggestTimer = null;
  }
  if (promptSuggestAbort) {
    promptSuggestAbort.abort();
    promptSuggestAbort = null;
  }
  const runToken = ++promptSuggestToken;
  const ac = new AbortController();
  promptSuggestAbort = ac;
  promptSuggestTimer = window.setTimeout(() => {
    promptSuggestTimer = null;
    if (runToken !== promptSuggestToken) return;
    if (document.activeElement !== input) {
      closePromptSuggestions();
      return;
    }
    const raw = input.value;
    const q = raw.trim();
    if (q.length < PROMPT_SUGGEST_MIN_CHARS) {
      closePromptSuggestions();
      return;
    }
    void fetchPromptSuggestionsFromApi(raw, runToken, ac.signal);
  }, PROMPT_SUGGEST_DEBOUNCE_MS);
}
var samplePromptIndex = 0;
var samplePromptLength = 0;
var samplePromptMode = "typing";
var samplePromptTimer = null;
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function renderSamplePrompt() {
  promptPlaceholderText.textContent = SAMPLE_PROMPTS2[samplePromptIndex].slice(0, samplePromptLength);
}
function stopSamplePromptAnimation() {
  if (samplePromptTimer !== null) {
    window.clearTimeout(samplePromptTimer);
    samplePromptTimer = null;
  }
}
function scheduleSamplePromptStep(delay) {
  stopSamplePromptAnimation();
  samplePromptTimer = window.setTimeout(stepSamplePromptAnimation, delay);
}
function syncSamplePromptVisibility() {
  const hasValue = input.value.length > 0;
  promptPlaceholder.classList.toggle("is-hidden", hasValue);
  if (hasValue) {
    stopSamplePromptAnimation();
    return;
  }
  if (samplePromptTimer === null) {
    scheduleSamplePromptStep(samplePromptLength === 0 ? 320 : 80);
  }
}
function resetPromptForNextGeneration() {
  if (!input) return;
  input.value = "";
  input.removeAttribute("aria-invalid");
  closePromptSuggestions();
  hidePolicyViolation();
  stopSamplePromptAnimation();
  samplePromptLength = 0;
  samplePromptMode = "typing";
  renderSamplePrompt();
  syncSamplePromptVisibility();
  syncPromptLanguageRowVisibility();
  resetSubmitCtaLabel();
  submitButton?.classList.remove("loading");
  syncSubmitButtonState();
}
function stepSamplePromptAnimation() {
  samplePromptTimer = null;
  if (input.value.length > 0) {
    syncSamplePromptVisibility();
    return;
  }
  const currentPrompt = SAMPLE_PROMPTS2[samplePromptIndex];
  if (samplePromptMode === "typing") {
    samplePromptLength += 1;
    renderSamplePrompt();
    if (samplePromptLength < currentPrompt.length) {
      scheduleSamplePromptStep(randomDelay(16, 30));
      return;
    }
    samplePromptMode = "holding";
    scheduleSamplePromptStep(1800);
    return;
  }
  if (samplePromptMode === "holding") {
    samplePromptMode = "deleting";
    scheduleSamplePromptStep(640);
    return;
  }
  samplePromptLength = Math.max(0, samplePromptLength - 1);
  renderSamplePrompt();
  if (samplePromptLength > 0) {
    scheduleSamplePromptStep(randomDelay(10, 18));
    return;
  }
  samplePromptIndex = (samplePromptIndex + 1) % SAMPLE_PROMPTS2.length;
  samplePromptMode = "typing";
  scheduleSamplePromptStep(260);
}
var showPolicyViolation = (message) => {
  if (!policyBlock) return;
  policyBlock.textContent = message || CONTENT_POLICY_CLIENT_MESSAGE;
  policyBlock.hidden = false;
  policyBlock.classList.add("is-visible");
  policyBlock.scrollIntoView({ block: "nearest", behavior: "smooth" });
};
var hidePolicyViolation = () => {
  if (!policyBlock) return;
  policyBlock.textContent = "";
  policyBlock.hidden = true;
  policyBlock.classList.remove("is-visible");
};
function validatePrompt(showError = false) {
  const promptLength = input.value.trim().length;
  if (showError && promptLength < MIN_PROMPT_LENGTH) {
    input.setAttribute("aria-invalid", "true");
    return false;
  }
  input.removeAttribute("aria-invalid");
  return promptLength >= MIN_PROMPT_LENGTH;
}
var shareBonusClaimed = false;
function hasShareBonus() {
  return shareBonusClaimed;
}
function getEffectiveLimit() {
  return shareBonusClaimed ? GENERATION_LIMIT_WITH_BONUS : GENERATION_LIMIT;
}
async function claimShareBonus() {
  if (shareBonusClaimed) return;
  try {
    const resp = await fetch("/api/share-bonus", { method: "POST" });
    if (resp.ok) shareBonusClaimed = true;
  } catch {
  }
  updateGenerationCounter();
  syncSubmitButtonState();
}
function isGenerationLimitReached() {
  if (isLocalDevHost) return false;
  if (authResolved && currentUser) return false;
  if (!authResolved) return false;
  return getGenerationCount() >= getEffectiveLimit();
}
function syncSubmitButtonState() {
  if (!submitButton) return;
  submitButton.disabled = submitButton.classList.contains("loading") || isGenerationLimitReached() || input.value.trim().length < MIN_PROMPT_LENGTH;
}
function getGenerationCount() {
  return parseInt(localStorage.getItem("sf_generation_count") || "0", 10);
}
function updateGenerationCounter() {
  const shareBonusPanel = getTypedElement("share-bonus-panel");
  const hideAll = () => {
    generationCounter.style.display = "none";
    privateGenRow.style.display = "none";
    if (shareBonusPanel) shareBonusPanel.style.display = "none";
  };
  if (isLocalDevHost || !authResolved || currentUser) {
    hideAll();
    syncSubmitButtonState();
    return;
  }
  const count = getGenerationCount();
  if (count === 0) {
    hideAll();
    syncSubmitButtonState();
    return;
  }
  const limit = getEffectiveLimit();
  generationCounter.style.display = "block";
  privateGenRow.style.display = "none";
  if (isGenerationLimitReached()) {
    if (!hasShareBonus()) {
      generationCounter.innerHTML = `${GENERATION_LIMIT}/${GENERATION_LIMIT} free previews used`;
      generationCounter.classList.add("limit-reached");
      if (shareBonusPanel) {
        shareBonusPanel.style.display = "flex";
        initShareBonusPanel();
      }
    } else {
      generationCounter.innerHTML = `${limit}/${limit} free previews used \u2014 <a href="#" id="gen-signup-link" style="color:inherit;text-decoration:underline;">sign up instead</a>`;
      generationCounter.classList.add("limit-reached");
      if (shareBonusPanel) shareBonusPanel.style.display = "none";
      getTypedElement("gen-signup-link")?.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          openAuthOverlay();
        }
      );
    }
  } else {
    generationCounter.textContent = `${count} / ${limit} free previews used`;
    generationCounter.classList.remove("limit-reached");
    if (shareBonusPanel) shareBonusPanel.style.display = "none";
  }
  syncSubmitButtonState();
}
var shareBonusPanelInitialized = false;
function initShareBonusPanel() {
  if (shareBonusPanelInitialized) return;
  shareBonusPanelInitialized = true;
  const siteUrl = "https://ship-fast.io";
  const byLang = {
    en: `I just built a site in minutes with Ship Fast \u2014 try it free: ${siteUrl}`,
    hi: `\u092E\u0948\u0902\u0928\u0947 Ship Fast \u0938\u0947 \u092E\u093F\u0928\u091F\u094B\u0902 \u092E\u0947\u0902 \u0938\u093E\u0907\u091F \u092C\u0928\u093E\u0908 \u2014 \u0906\u092A \u092D\u0940 \u092C\u0928\u093E\u090F\u0902: ${siteUrl}`,
    ta: `Ship Fast \u0BAE\u0BC2\u0BB2\u0BAE\u0BCD \u0BA8\u0BBF\u0BAE\u0BBF\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BBF\u0BB2\u0BCD \u0BA4\u0BB3\u0BAE\u0BCD \u0B89\u0BB0\u0BC1\u0BB5\u0BBE\u0B95\u0BCD\u0B95\u0BBF\u0BA9\u0BC7\u0BA9\u0BCD \u2014 \u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BC1\u0BAE\u0BCD \u0BAE\u0BC1\u0BAF\u0BB1\u0BCD\u0B9A\u0BBF\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD: ${siteUrl}`,
    te: `Ship Fast \u0C24\u0C4B \u0C28\u0C3F\u0C2E\u0C3F\u0C37\u0C3E\u0C32\u0C4D\u0C32\u0C4B \u0C38\u0C48\u0C1F\u0C4D \u0C1A\u0C47\u0C36\u0C3E\u0C28\u0C41 \u2014 \u0C2E\u0C40\u0C30\u0C42 \u0C1F\u0C4D\u0C30\u0C48 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F: ${siteUrl}`,
    bn: `Ship Fast \u09A6\u09BF\u09AF\u09BC\u09C7 \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u09B8\u09BE\u0987\u099F \u09AC\u09BE\u09A8\u09BF\u09AF\u09BC\u09C7\u099B\u09BF \u2014 \u0986\u09AA\u09A8\u09BF\u0993 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8: ${siteUrl}`,
    mr: `Ship Fast \u0928\u0947 \u092E\u093F\u0928\u093F\u091F\u093E\u0902\u0924 \u0938\u093E\u0907\u091F \u092C\u0928\u0935\u0932\u0940 \u2014 \u0924\u0941\u092E\u094D\u0939\u0940\u0939\u0940 \u092C\u0928\u0935\u093E: ${siteUrl}`,
    kn: `Ship Fast \u0CA8\u0CBF\u0C82\u0CA6 \u0CA8\u0CBF\u0CAE\u0CBF\u0CB7\u0C97\u0CB3\u0CB2\u0CCD\u0CB2\u0CBF \u0CB8\u0CC8\u0C9F\u0CCD \u0CAE\u0CBE\u0CA1\u0CBF\u0CA6\u0CC6 \u2014 \u0CA8\u0CC0\u0CB5\u0CC2 \u0CAE\u0CBE\u0CA1\u0CBF: ${siteUrl}`,
    ml: `Ship Fast \u0D09\u0D2A\u0D2F\u0D4B\u0D17\u0D3F\u0D1A\u0D4D\u0D1A\u0D4D \u0D2E\u0D3F\u0D28\u0D3F\u0D31\u0D4D\u0D31\u0D41\u0D15\u0D33\u0D3F\u0D7D \u0D38\u0D48\u0D31\u0D4D\u0D31\u0D4D \u0D09\u0D23\u0D4D\u0D1F\u0D3E\u0D15\u0D4D\u0D15\u0D3F \u2014 \u0D28\u0D3F\u0D19\u0D4D\u0D19\u0D33\u0D41\u0D02 \u0D1A\u0D46\u0D2F\u0D4D\u0D2F\u0D42: ${siteUrl}`,
    pa: `Ship Fast \u0A28\u0A3E\u0A32 \u0A2E\u0A3F\u0A70\u0A1F\u0A3E\u0A02 '\u0A1A \u0A38\u0A3E\u0A08\u0A1F \u0A2C\u0A23\u0A3E\u0A08 \u2014 \u0A24\u0A41\u0A38\u0A40\u0A02 \u0A35\u0A40 \u0A2C\u0A23\u0A3E\u0A13: ${siteUrl}`,
    gu: `Ship Fast \u0AB5\u0AA1\u0AC7 \u0AAE\u0ABF\u0AA8\u0ABF\u0A9F\u0ACB\u0AAE\u0ABE\u0A82 \u0AB8\u0ABE\u0A87\u0A9F \u0AAC\u0AA8\u0ABE\u0AB5\u0AC0 \u2014 \u0AA4\u0AAE\u0AC7 \u0AAA\u0AA3 \u0AAC\u0AA8\u0ABE\u0AB5\u0ACB: ${siteUrl}`
  };
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  let locale = "en";
  for (const L of langs) {
    const c = String(L || "").toLowerCase().split("-")[0];
    if (c && c !== "en" && byLang[c]) {
      locale = c;
      break;
    }
  }
  const msg = byLang[locale] || byLang.en;
  const encUrl = encodeURIComponent(siteUrl);
  const encMsg = encodeURIComponent(msg);
  const targets = {
    "bonus-share-wa": `https://api.whatsapp.com/send?text=${encMsg}`,
    "bonus-share-fb": `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    "bonus-share-tw": `https://twitter.com/intent/tweet?text=${encMsg}`,
    "bonus-share-tg": `https://t.me/share/url?url=${encUrl}&text=${encMsg}`,
    "bonus-share-li": `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`
  };
  for (const [id, href] of Object.entries(targets)) {
    const el = getTypedElement(id);
    if (!el) continue;
    el.href = href;
    el.addEventListener("click", () => claimShareBonus());
  }
  const nativeBtn = getTypedElement("bonus-share-native");
  if (nativeBtn) {
    nativeBtn.hidden = typeof navigator.share !== "function";
    nativeBtn.addEventListener("click", () => {
      claimShareBonus();
      navigator.share({ title: "Ship Fast", text: msg, url: siteUrl }).catch(() => {
      });
    });
  }
  const signupLink = getTypedElement("share-bonus-signup-link");
  if (signupLink) {
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      openAuthOverlay();
    });
  }
}
function openPrivateGenModal() {
  privateGenCheckbox.checked = false;
  privateGenModal.classList.add("is-open");
  privateGenModal.setAttribute("aria-hidden", "false");
}
function closePrivateGenModal() {
  privateGenModal.classList.remove("is-open");
  privateGenModal.setAttribute("aria-hidden", "true");
}
privateGenCheckbox.addEventListener("change", () => {
  if (privateGenCheckbox.checked) openPrivateGenModal();
});
getTypedElement("private-gen-modal-close")?.addEventListener(
  "click",
  closePrivateGenModal
);
getTypedElement("private-gen-modal-backdrop")?.addEventListener(
  "click",
  closePrivateGenModal
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && privateGenModal.classList.contains("is-open")) closePrivateGenModal();
});
syncPromptLanguageRowVisibility();
updateGenerationCounter();
renderSamplePrompt();
syncSamplePromptVisibility();
syncSubmitButtonState();
var applyPromptChip = (text) => {
  input.value = text;
  validatePrompt(false);
  syncSamplePromptVisibility();
  syncSubmitButtonState();
  lastPromptTrimLen = input.value.trim().length;
  syncPromptLanguageRowVisibility();
  schedulePromptLanguageDetect();
};
var homeDevPromptsEnabled = isHomeDevPromptsEnabled();
var deleteDevSessionsWithPrompt = null;
if (homeDevPromptsEnabled) {
  deleteDevSessionsWithPrompt = async (target) => {
    const want = target.trim();
    if (!want) return;
    try {
      if (currentUser) {
        const r = await authFetch(`/api/sessions?page=1&limit=50`);
        if (!r.ok) return;
        const raw = await r.json();
        const items = Array.isArray(raw?.items) ? raw.items : [];
        const matches = items.filter(
          (s) => (s.prompt || "").trim() === want
        );
        await Promise.all(
          matches.map(
            (s) => authFetch(`/api/sessions/${s.id}`, { method: "DELETE" }).catch(() => null)
          )
        );
      } else {
        const stored = JSON.parse(
          localStorage.getItem(ANON_SESSIONS_KEY) || "[]"
        );
        if (!Array.isArray(stored)) return;
        const matches = stored.filter((s) => (s?.prompt || "").trim() === want);
        await Promise.all(
          matches.map(
            (s) => fetch(`/api/sessions/${s.id}`, {
              method: "DELETE",
              headers: s.secret ? { "x-ship-fast-anon-owner": String(s.secret) } : {}
            }).then(() => removeAnonSession(s.id)).catch(() => null)
          )
        );
      }
    } catch {
    }
  };
  document.addEventListener(
    "keydown",
    (event) => {
      if (!event.metaKey && !event.ctrlKey) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const text = LOCAL_DEV_PROMPT_SHORTCUTS[Number(event.key) - 1];
      if (!text) return;
      event.preventDefault();
      event.stopPropagation();
      applyPromptChip(text);
      input.focus();
    },
    true
  );
}
var IMAGE_STUDIO_PROMPT = "This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a mocked version (no backend). It should be dark mode. Focus on making it beautiful.";
var chipDefs = [
  { label: "Image studio", text: IMAGE_STUDIO_PROMPT },
  { label: "Pet wellness", text: LOCAL_DEV_PROMPT_SHORTCUTS[1] },
  { label: "SaaS dashboard", text: LOCAL_DEV_PROMPT_SHORTCUTS[2] },
  { label: "Hindi gym site", text: LOCAL_DEV_PROMPT_SHORTCUTS[0] }
];
var chipBar = document.createElement("div");
chipBar.className = "dev-prompt-chips dev-prompt-chips--glass";
chipBar.setAttribute("aria-label", "Example prompts");
chipDefs.forEach((def, i) => {
  if (!def.text) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dev-prompt-chip";
  btn.title = def.text;
  btn.innerHTML = `<span class="dev-prompt-chip-num">${i + 1}</span><span class="dev-prompt-chip-label">${def.label}</span>`;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      if (deleteDevSessionsWithPrompt) await deleteDevSessionsWithPrompt(def.text);
      applyPromptChip(def.text);
      form.requestSubmit();
    } finally {
      btn.disabled = false;
    }
  });
  chipBar.appendChild(btn);
});
var heroCard = document.getElementById("hero-card");
heroCard?.parentElement?.insertBefore(chipBar, heroCard.nextSibling);
if (heroCard) {
  const setHeroGlow = (x, y) => {
    heroCard.style.setProperty("--hero-glow-x", x);
    heroCard.style.setProperty("--hero-glow-y", y);
  };
  heroCard.addEventListener("pointermove", (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;
    setHeroGlow(`${Math.max(0, Math.min(100, x)).toFixed(1)}%`, `${Math.max(0, Math.min(100, y)).toFixed(1)}%`);
  });
  heroCard.addEventListener("pointerleave", () => {
    setHeroGlow("30%", "20%");
  });
}
input.addEventListener("input", () => {
  hidePolicyViolation();
  validatePrompt(false);
  syncSamplePromptVisibility();
  syncSubmitButtonState();
  const prev = lastPromptTrimLen;
  const t = input.value.trim();
  const crossed = prev < PROMPT_LANG_DETECT_MIN_CHARS && t.length >= PROMPT_LANG_DETECT_MIN_CHARS;
  lastPromptTrimLen = t.length;
  syncPromptLanguageRowVisibility();
  if (crossed) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer);
      promptLangDetectTimer = null;
    }
    const runToken = ++promptLangDetectToken;
    requestAnimationFrame(() => runPromptLangDetectAsync(runToken, { skipIfUnchanged: false }));
  } else {
    schedulePromptLanguageDetect();
  }
  schedulePromptSuggestUpdate();
});
input.addEventListener("blur", () => {
  window.setTimeout(() => {
    if (document.activeElement === input) return;
    closePromptSuggestions();
  }, 120);
});
logoTagline?.addEventListener("animationend", (event) => {
  if (event.animationName !== "logo-tagline-scale-in") return;
  logoTagline.classList.remove("logo-tagline--in");
  logoTagline.classList.add("logo-tagline--settled");
});
submitButton?.addEventListener("animationend", (event) => {
  if (event.animationName !== "submit-cta-wiggle") return;
  submitButton.classList.remove("submit-btn--cta-shake");
});
languageSelect?.addEventListener("change", () => {
  if (languageSelect) savePreferredLanguage(languageSelect.value);
  syncPreferredLanguageUi();
});
input.addEventListener("keydown", (event) => {
  if (promptSuggestOpen && promptSuggestRows.length > 0) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setPromptSuggestActive(promptSuggestActive + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setPromptSuggestActive(promptSuggestActive - 1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closePromptSuggestions();
      return;
    }
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      applyPromptSuggestion(promptSuggestRows[promptSuggestActive]);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      applyPromptSuggestion(promptSuggestRows[promptSuggestActive]);
      return;
    }
  }
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!submitButton) return;
  if (!validatePrompt(true)) {
    syncSubmitButtonState();
    return;
  }
  const prompt = input.value.trim();
  if (!checkPromptContentPolicy(prompt).ok) {
    showPolicyViolation(CONTENT_POLICY_CLIENT_MESSAGE);
    syncSubmitButtonState();
    return;
  }
  const preferredLanguage = languageSelect?.value || "en";
  savePreferredLanguage(preferredLanguage);
  if (isGenerationLimitReached()) {
    openAuthOverlay();
    return;
  }
  submitButton.classList.add("loading");
  syncSubmitButtonState();
  const ref1 = getTypedElement("design-ref-url-1")?.value?.trim() || "";
  const ref2 = getTypedElement("design-ref-url-2")?.value?.trim() || "";
  const designReferenceUrls = [ref1, ref2].filter(Boolean);
  const designReferenceNotes = getTypedElement("design-ref-notes")?.value?.trim() || "";
  try {
    const response = await authFetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        preferredLanguage,
        ...designReferenceUrls.length ? {
          designReferenceUrls,
          ...designReferenceNotes ? { designReferenceNotes } : {}
        } : {}
      })
    });
    const data = await response.json().catch(() => ({}));
    if (data.id) {
      if (!currentUser) saveAnonSession(data.id, prompt, data.anonOwnerSecret);
      localStorage.setItem("sf_generation_count", String(getGenerationCount() + 1));
      if (isMarketingHomePath()) {
        localStorage.setItem(`sf_openui_prompt_${data.id}`, prompt);
        openEmbeddedSession(data.id);
        submitButton.classList.remove("loading");
        syncSubmitButtonState();
        return;
      }
      sessionStorage.setItem("sf_return_home", "1");
      localStorage.setItem(`sf_openui_prompt_${data.id}`, prompt);
      sessionStorage.setItem("sf_openui_prompt", prompt);
      window.location.href = `/session/${data.id}`;
      return;
    }
    if (data.code === "CONTENT_POLICY" || response.status === 422) {
      showPolicyViolation(data.error || CONTENT_POLICY_CLIENT_MESSAGE);
    } else if (!currentUser && response.status === 429) {
      if (data.shareBonusClaimed !== void 0) shareBonusClaimed = data.shareBonusClaimed;
      updateGenerationCounter();
      if (shareBonusClaimed) {
        openAuthOverlay();
      }
    } else {
      alert(data.error || "Failed to create session");
    }
  } catch (error) {
    alert(`Connection error: ${error.message}`);
  }
  submitButton.classList.remove("loading");
  syncSubmitButtonState();
});
var ANON_SESSIONS_KEY = "sf_anon_sessions";
function invalidateAnonSessionEntriesCache() {
  anonSessionEntriesCacheT = 0;
  anonSessionEntriesCacheV = null;
}
function saveAnonSession(id, prompt, ownerSecret) {
  const stored = JSON.parse(
    localStorage.getItem(ANON_SESSIONS_KEY) || "[]"
  );
  const entry = { id, prompt };
  if (ownerSecret) entry.secret = String(ownerSecret);
  stored.unshift(entry);
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.slice(0, 20)));
  invalidateAnonSessionEntriesCache();
}
function removeAnonSession(id) {
  const stored = JSON.parse(
    localStorage.getItem(ANON_SESSIONS_KEY) || "[]"
  );
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.filter((s) => s.id !== id)));
  invalidateAnonSessionEntriesCache();
}
function clearAnonSessions() {
  localStorage.removeItem(ANON_SESSIONS_KEY);
  invalidateAnonSessionEntriesCache();
}
function getAnonOwnerSecretForSession(sessionId) {
  try {
    const stored = JSON.parse(
      localStorage.getItem(ANON_SESSIONS_KEY) || "[]"
    );
    if (!Array.isArray(stored)) return "";
    const hit = stored.find((s) => s && s.id === sessionId);
    return hit?.secret ? String(hit.secret) : "";
  } catch {
    return "";
  }
}
var sessionItemPointerDown = null;
var sessionListNavTimer = null;
var SESSION_OPEN_DRAG_THRESHOLD_SQ = 64;
var selectionSpansSessionItem = (item) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
  if (!sel.toString().trim()) return false;
  return item.contains(sel.anchorNode) && item.contains(sel.focusNode);
};
var openSessionFromList = (id) => {
  sessionStorage.setItem(GALLERY_RESTORE_PAGE_KEY, String(publicGalleryPage));
  sessionStorage.setItem(GALLERY_RESTORE_SOURCE_KEY, gallerySource);
  if (isMarketingHomePath()) {
    openEmbeddedSession(id);
    return;
  }
  sessionStorage.setItem("sf_return_home", "1");
  location.href = `/session/${id}`;
};
var hideGalleryPagination = () => {
  galleryMeta = null;
  if (sessionPagination) sessionPagination.hidden = true;
  if (sessionPageStatus) sessionPageStatus.textContent = "";
  if (sessionPagePrev) {
    sessionPagePrev.hidden = true;
    sessionPagePrev.disabled = true;
  }
  if (sessionPageNext) {
    sessionPageNext.hidden = true;
    sessionPageNext.disabled = true;
  }
  if (sessionPaginationActions) sessionPaginationActions.hidden = true;
};
var updateGalleryPagination = (meta) => {
  if (!sessionPagination || !sessionPagePrev || !sessionPageNext || !sessionPageStatus) return;
  if (!meta || meta.total === 0) {
    sessionPagination.hidden = true;
    sessionPageStatus.textContent = "";
    return;
  }
  const showPrev = Boolean(meta.hasPrev);
  const showNext = Boolean(meta.hasNext);
  if (!showPrev && !showNext) {
    sessionPagination.hidden = true;
    sessionPageStatus.textContent = "";
    sessionPagePrev.hidden = true;
    sessionPageNext.hidden = true;
    sessionPagePrev.disabled = true;
    sessionPageNext.disabled = true;
    if (sessionPaginationActions) sessionPaginationActions.hidden = true;
    return;
  }
  sessionPagination.hidden = false;
  if (sessionPaginationActions) sessionPaginationActions.hidden = false;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  sessionPageStatus.textContent = `Page ${meta.page} of ${meta.totalPages} \xB7 ${from}\u2013${to} of ${meta.total}`;
  sessionPagePrev.hidden = !showPrev;
  sessionPageNext.hidden = !showNext;
  sessionPagePrev.disabled = !showPrev;
  sessionPageNext.disabled = !showNext;
};
sessionPagePrev?.addEventListener("click", async () => {
  if (!galleryMeta?.hasPrev) return;
  const cur = Number(galleryMeta.page) || 1;
  const p = cur - 1;
  if (gallerySource === "public") await loadRecentPublicSessions(p);
  else if (gallerySource === "user") {
    userGalleryPage = p;
    await loadUserSessionsPage();
  }
});
sessionPageNext?.addEventListener("click", async () => {
  if (!galleryMeta?.hasNext) return;
  const cur = Number(galleryMeta.page) || 1;
  const p = cur + 1;
  if (gallerySource === "public") await loadRecentPublicSessions(p);
  else if (gallerySource === "user") {
    userGalleryPage = p;
    await loadUserSessionsPage();
  }
});
getTypedElement("session-list")?.addEventListener(
  "pointerdown",
  (event) => {
    if (event.button !== 0) return;
    const item = event.target?.closest(
      ".session-item"
    );
    sessionItemPointerDown = item ? { id: item.dataset.id, x: event.clientX, y: event.clientY } : null;
  }
);
getTypedElement("session-list")?.addEventListener("click", (event) => {
  if (sessionListNavTimer !== null) window.clearTimeout(sessionListNavTimer);
  sessionListNavTimer = null;
  const item = event.target?.closest(".session-item");
  if (!item) return;
  const id = item.dataset.id;
  if (!id) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey) {
    window.open(`/session/${id}`, "_blank", "noopener,noreferrer");
    return;
  }
  if (event.target?.closest("a[href]")) return;
  if (event.target?.closest("button")) return;
  if (selectionSpansSessionItem(item)) return;
  if (sessionItemPointerDown?.id === id && (event.clientX - sessionItemPointerDown.x) ** 2 + (event.clientY - sessionItemPointerDown.y) ** 2 > SESSION_OPEN_DRAG_THRESHOLD_SQ) {
    return;
  }
  if (event.target?.closest(".session-info")) {
    sessionListNavTimer = window.setTimeout(() => {
      sessionListNavTimer = null;
      const live = document.querySelector(`.session-item[data-id="${id}"]`);
      if (!live) return;
      if (selectionSpansSessionItem(live)) return;
      openSessionFromList(id);
    }, 320);
    return;
  }
  openSessionFromList(id);
});
function renderSessions(sessions) {
  const section = getTypedElement("sessions-section");
  const list = getTypedElement("session-list");
  if (sessions.length === 0) {
    list.innerHTML = "";
    section.style.display = "none";
    document.body.classList.remove("has-sessions");
    list.classList.remove("single-col", "two-col");
    return;
  }
  document.body.classList.add("has-sessions");
  list.classList.remove("single-col", "two-col");
  if (sessions.length === 1) list.classList.add("single-col");
  else if (sessions.length === 2) list.classList.add("two-col");
  const placeholderSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
  const eagerThumbnailCount = 6;
  list.innerHTML = sessions.map(
    (session, index) => `
        <li class="session-item" data-id="${session.id}">
          <div class="session-thumbnail">
            ${session.homepageReady ? index < eagerThumbnailCount ? `<iframe src="/preview/${session.id}/" loading="eager" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>` : `<iframe data-src="/preview/${session.id}/" loading="lazy" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>` : `<div class="session-placeholder">${placeholderSvg}</div>`}
            <div class="session-badges">
              ${session.elapsed ? `<span class="session-badge badge-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>${session.elapsed}s</span>` : ""}
              ${session.cost != null ? `<span class="session-badge badge-cost session-cost" style="display:none">$${session.cost.toFixed(4)}</span>` : ""}
            </div>
          </div>
          <div class="session-info">
            <span class="session-prompt">${session.prompt.replace(/</g, "&lt;")}</span>
          </div>
        </li>
      `
  ).join("");
  section.style.display = "block";
  const scaleIframes = () => {
    list.querySelectorAll(".session-thumbnail iframe").forEach((iframe) => {
      const parent = iframe.parentElement;
      const containerWidth = parent?.offsetWidth || 0;
      if (!containerWidth) return;
      const scale = containerWidth / 1280;
      iframe.style.transform = `scale(${scale})`;
    });
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scaleIframes();
    });
  });
  if (!hasSessionResizeListener) {
    window.addEventListener("resize", scaleIframes);
    hasSessionResizeListener = true;
  }
  const iframes = list.querySelectorAll("iframe[data-src]");
  if (iframes.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            const src = iframe.dataset.src;
            if (!src) return;
            iframe.src = src;
            iframe.addEventListener("load", scaleIframes, { once: true });
            observer.unobserve(iframe);
            requestAnimationFrame(scaleIframes);
          }
        });
      },
      { rootMargin: "200px" }
    );
    iframes.forEach((iframe) => observer.observe(iframe));
  } else {
    iframes.forEach((iframe) => {
      const src = iframe.dataset.src;
      if (!src) return;
      iframe.src = src;
      iframe.addEventListener("load", scaleIframes, { once: true });
    });
    requestAnimationFrame(scaleIframes);
  }
  list.querySelectorAll(".session-thumbnail iframe[src]:not([data-src])").forEach((iframe) => {
    iframe.addEventListener("load", scaleIframes, { once: true });
  });
  if (localStorage.getItem("sf_show_cost") === "1") {
    list.querySelectorAll(".session-cost").forEach((element) => {
      ;
      element.style.display = "flex";
    });
  }
}
async function fetchPublicGalleryPageFromNetwork(page) {
  const r = await fetch(`/api/sessions/recent?page=${page}&limit=${GALLERY_PAGE_SIZE}`);
  if (!r.ok) throw new Error("recent-sessions");
  const data = await r.json();
  return { ok: true, items: Array.isArray(data.items) ? data.items : [], data };
}
async function fetchPublicGalleryPage(page) {
  const qc = window.__sfQueryClient;
  if (qc) {
    try {
      return await qc.fetchQuery({
        queryKey: ["sf-public-gallery", page, GALLERY_PAGE_SIZE],
        queryFn: () => fetchPublicGalleryPageFromNetwork(page),
        staleTime: SF_PUBLIC_GALLERY_STALE_MS
      });
    } catch {
      return { ok: false, items: [], data: null };
    }
  }
  try {
    return await fetchPublicGalleryPageFromNetwork(page);
  } catch {
    return { ok: false, items: [], data: null };
  }
}
async function loadAnonymousSessionEntries() {
  const now = Date.now();
  if (anonSessionEntriesCacheV && now - anonSessionEntriesCacheT < ANON_SESSION_ENTRIES_TTL_MS) {
    return anonSessionEntriesCacheV;
  }
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || "[]");
    if (stored.length === 0) {
      anonSessionEntriesCacheT = now;
      anonSessionEntriesCacheV = [];
      return [];
    }
    const results = await Promise.all(
      stored.map(async ({ id, prompt }) => {
        try {
          const res = await fetch(`/api/sessions/${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.id,
            prompt: data.prompt || prompt,
            homepageReady: data.homepageReady,
            elapsed: data.elapsed,
            cost: data.cost
          };
        } catch {
          return { id, prompt, homepageReady: false, elapsed: null, cost: null };
        }
      })
    );
    const valid = results.filter((x) => Boolean(x));
    const validIds = new Set(valid.map((s) => s.id));
    const pruned = stored.filter((s) => validIds.has(s.id));
    if (pruned.length !== stored.length) {
      localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(pruned));
    }
    anonSessionEntriesCacheT = Date.now();
    anonSessionEntriesCacheV = valid;
    return valid;
  } catch {
    return [];
  }
}
async function loadRecentPublicSessions(page = 1) {
  gallerySource = "public";
  publicGalleryPage = page;
  try {
    const [anonExtras, { ok, items, data }] = await Promise.all([
      page === 1 ? loadAnonymousSessionEntries() : Promise.resolve([]),
      fetchPublicGalleryPage(page)
    ]);
    if (!ok) {
      renderSessions([]);
      hideGalleryPagination();
      return;
    }
    galleryMeta = data;
    const ids = new Set(items.map((s) => s.id));
    const merged = page === 1 ? [...anonExtras.filter((s) => s && !ids.has(s.id)), ...items] : items;
    if (merged.length === 0) {
      renderSessions([]);
      hideGalleryPagination();
      return;
    }
    renderSessions(merged);
    updateGalleryPagination(data);
  } catch {
    renderSessions([]);
    hideGalleryPagination();
  }
}
async function loadUserSessionsPage() {
  gallerySource = "user";
  try {
    const response = await authFetch(
      `/api/sessions?page=${userGalleryPage}&limit=${GALLERY_PAGE_SIZE}`
    );
    if (!response.ok) return false;
    const raw = await response.json();
    if (!raw.items || !Array.isArray(raw.items)) return false;
    galleryMeta = raw;
    renderSessions(raw.items);
    updateGalleryPagination(raw);
    return true;
  } catch {
    return false;
  }
}
async function loadSessions() {
  const { page, source } = consumeGalleryRestore();
  if (source === "user" && currentUser) {
    gallerySource = "user";
    userGalleryPage = page;
    publicGalleryPage = 1;
    await loadUserSessionsPage();
    return;
  }
  if (source === "public" && page > 1) {
    gallerySource = "public";
    publicGalleryPage = page;
    userGalleryPage = 1;
    await loadRecentPublicSessions(page);
    return;
  }
  userGalleryPage = 1;
  publicGalleryPage = 1;
  gallerySource = "public";
  await loadRecentPublicSessions(1);
}
async function hydrateAnonymousOrPublicGallery() {
  const { page, source } = consumeGalleryRestore();
  if (source === "public" && page > 1) {
    gallerySource = "public";
    publicGalleryPage = page;
    await loadRecentPublicSessions(page);
    return;
  }
  if (source === "user" && currentUser) {
    gallerySource = "user";
    userGalleryPage = page;
    await loadUserSessionsPage();
    return;
  }
  publicGalleryPage = 1;
  gallerySource = "public";
  try {
    const [{ ok, items, data }, anonExtras] = await Promise.all([
      fetchPublicGalleryPage(1),
      loadAnonymousSessionEntries()
    ]);
    if (!ok) {
      if (anonExtras.length === 0) {
        renderSessions([]);
        hideGalleryPagination();
        return;
      }
      renderSessions(anonExtras);
      hideGalleryPagination();
      return;
    }
    const ids = new Set(items.map((s) => s.id));
    const merged = [...anonExtras.filter((s) => s && !ids.has(s.id)), ...items];
    galleryMeta = data;
    if (merged.length === 0) {
      renderSessions([]);
      hideGalleryPagination();
      return;
    }
    renderSessions(merged);
    updateGalleryPagination(data);
  } catch {
    renderSessions([]);
    hideGalleryPagination();
  }
}
var reloadHomeGalleryIfReady = () => {
  if (!authResolved) return;
  if (currentUser) void loadSessions();
  else void hydrateAnonymousOrPublicGallery();
};
function activeElementIsTextEntry() {
  const tagName = document.activeElement?.tagName;
  return tagName === "TEXTAREA" || tagName === "INPUT";
}
var galleryDeleteTargetId = () => document.querySelector(".session-item:hover")?.dataset?.id || null;
document.addEventListener("keydown", async (event) => {
  if (event.repeat) return;
  if (event.code !== "KeyD" && event.code !== "PageDown") return;
  const id = galleryDeleteTargetId();
  if (!id) return;
  if (activeElementIsTextEntry()) event.preventDefault();
  if (event.code === "PageDown") event.preventDefault();
  const card = document.querySelector(
    `.session-item[data-id="${id}"]`
  );
  if (card) card.style.opacity = "0.3";
  if (currentUser) {
    const r = await authFetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!r.ok) {
      if (card) card.style.opacity = "";
      return;
    }
  } else {
    const secret = getAnonOwnerSecretForSession(id);
    const r = await fetch(`/api/sessions/${id}`, {
      method: "DELETE",
      headers: secret ? { "x-ship-fast-anon-owner": secret } : {}
    });
    if (!r.ok) {
      if (card) card.style.opacity = "";
      return;
    }
    removeAnonSession(id);
  }
  if (card) card.remove();
  const remaining = document.querySelectorAll(".session-item");
  if (remaining.length === 0) {
    getTypedElement("sessions-section").style.display = "none";
    document.body.classList.remove("has-sessions");
    return;
  }
  const list = document.getElementById("session-list");
  list.classList.remove("single-col", "two-col");
  if (remaining.length === 1) list.classList.add("single-col");
  else if (remaining.length === 2) list.classList.add("two-col");
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "p" || activeElementIsTextEntry()) return;
  const visible = localStorage.getItem("sf_show_cost") === "1";
  localStorage.setItem("sf_show_cost", visible ? "0" : "1");
  document.querySelectorAll(".session-cost").forEach((element) => {
    element.style.display = visible ? "none" : "flex";
  });
});
var deletePresses = [];
document.addEventListener("keydown", async (event) => {
  if (event.code !== "KeyD" || activeElementIsTextEntry()) return;
  const now = Date.now();
  deletePresses.push(now);
  deletePresses = deletePresses.filter((timestamp) => now - timestamp < 1500);
  if (deletePresses.length < 5) return;
  deletePresses = [];
  document.querySelectorAll(".session-item").forEach((card) => {
    ;
    card.style.opacity = "0.3";
  });
  if (currentUser) {
    const r = await authFetch("/api/sessions", { method: "DELETE" });
    if (!r.ok) {
      document.querySelectorAll(".session-item").forEach((c) => {
        ;
        c.style.opacity = "";
      });
      return;
    }
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || "[]");
      if (Array.isArray(stored)) {
        await Promise.all(
          stored.map((s) => {
            if (!s?.id || !s?.secret) return Promise.resolve();
            return fetch(`/api/sessions/${s.id}`, {
              method: "DELETE",
              headers: { "x-ship-fast-anon-owner": String(s.secret) }
            });
          })
        );
      }
    } catch {
    }
    clearAnonSessions();
  }
  getTypedElement("session-list").innerHTML = "";
  getTypedElement("sessions-section").style.display = "none";
  document.body.classList.remove("has-sessions");
});
var stitchGrid = getTypedElement("stitch-grid");
var stitchGridLit = getTypedElement("stitch-grid-lit");
var prefersReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduceMotion && stitchGrid && stitchGridLit) {
  let glowState = null;
  let glowRaf = 0;
  const clearGlow = () => {
    stitchGridLit.style.maskImage = "linear-gradient(transparent, transparent)";
    stitchGridLit.style.webkitMaskImage = "linear-gradient(transparent, transparent)";
    stitchGridLit.style.opacity = "0";
  };
  const paintGlow = () => {
    if (!glowState || glowState.alpha <= 0.01) {
      clearGlow();
      return;
    }
    const alpha = Math.min(glowState.alpha, 1);
    const radius = getComputedStyle(document.documentElement).getPropertyValue("--stitch-glow-radius").trim();
    const mask = `radial-gradient(circle ${radius} at ${glowState.x}px ${glowState.y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,${alpha * 0.8}) 25%, rgba(0,0,0,${alpha * 0.4}) 55%, transparent 100%)`;
    stitchGridLit.style.opacity = "1";
    stitchGridLit.style.maskImage = mask;
    stitchGridLit.style.webkitMaskImage = mask;
  };
  const fadeGlow = () => {
    if (!glowState) {
      glowRaf = 0;
      return;
    }
    const fadeMs = Number(
      getComputedStyle(document.documentElement).getPropertyValue("--stitch-glow-fade-ms").trim()
    );
    const elapsed = performance.now() - glowState.lastMoveTime;
    glowState.alpha = 1 - Math.min(elapsed / fadeMs, 1);
    paintGlow();
    if (glowState.alpha > 0.01) {
      glowRaf = requestAnimationFrame(fadeGlow);
      return;
    }
    glowState = null;
    glowRaf = 0;
    clearGlow();
  };
  const queueFade = () => {
    if (!glowRaf) glowRaf = requestAnimationFrame(fadeGlow);
  };
  window.addEventListener("mousemove", (event) => {
    const rect = stitchGrid.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
      return;
    glowState = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      alpha: 1,
      lastMoveTime: performance.now()
    };
    queueFade();
  });
}
var designRefToggle = getTypedElement("design-ref-toggle");
var designRefPanel = getTypedElement("design-ref-panel");
var designRefSearch = getTypedElement("design-ref-search");
var designRefPreview = getTypedElement("design-ref-preview");
var designRefPreviewFavicon = getTypedElement("design-ref-preview-favicon");
var designRefPreviewTitle = getTypedElement("design-ref-preview-title");
var designRefPreviewUrl = getTypedElement("design-ref-preview-url");
var designRefPreviewRemove = getTypedElement("design-ref-preview-remove");
var designRefUrl1 = getTypedElement("design-ref-url-1");
var SITE_SEARCH_DB = [
  { k: "stripe", u: "https://stripe.com", t: "Stripe" },
  { k: "linear", u: "https://linear.app", t: "Linear" },
  { k: "vercel", u: "https://vercel.com", t: "Vercel" },
  { k: "notion", u: "https://notion.so", t: "Notion" },
  { k: "figma", u: "https://figma.com", t: "Figma" },
  { k: "github", u: "https://github.com", t: "GitHub" },
  { k: "slack", u: "https://slack.com", t: "Slack" },
  { k: "discord", u: "https://discord.com", t: "Discord" },
  { k: "spotify", u: "https://spotify.com", t: "Spotify" },
  { k: "airbnb", u: "https://airbnb.com", t: "Airbnb" },
  { k: "shopify", u: "https://shopify.com", t: "Shopify" },
  { k: "apple", u: "https://apple.com", t: "Apple" },
  { k: "tesla", u: "https://tesla.com", t: "Tesla" },
  { k: "netflix", u: "https://netflix.com", t: "Netflix" },
  { k: "dribbble", u: "https://dribbble.com", t: "Dribbble" },
  { k: "behance", u: "https://behance.net", t: "Behance" },
  { k: "twitch", u: "https://twitch.tv", t: "Twitch" },
  { k: "supabase", u: "https://supabase.com", t: "Supabase" },
  { k: "tailwind", u: "https://tailwindcss.com", t: "Tailwind CSS" },
  { k: "nextjs", u: "https://nextjs.org", t: "Next.js" },
  { k: "next", u: "https://nextjs.org", t: "Next.js" },
  { k: "framer", u: "https://framer.com", t: "Framer" },
  { k: "raycast", u: "https://raycast.com", t: "Raycast" },
  { k: "cal", u: "https://cal.com", t: "Cal.com" },
  { k: "resend", u: "https://resend.com", t: "Resend" },
  { k: "openai", u: "https://openai.com", t: "OpenAI" },
  { k: "anthropic", u: "https://anthropic.com", t: "Anthropic" },
  { k: "midjourney", u: "https://midjourney.com", t: "Midjourney" },
  { k: "uber", u: "https://uber.com", t: "Uber" },
  { k: "google", u: "https://google.com", t: "Google" },
  { k: "twitter", u: "https://x.com", t: "X (Twitter)" },
  { k: "instagram", u: "https://instagram.com", t: "Instagram" },
  { k: "youtube", u: "https://youtube.com", t: "YouTube" },
  { k: "amazon", u: "https://amazon.com", t: "Amazon" },
  { k: "dropbox", u: "https://dropbox.com", t: "Dropbox" },
  { k: "intercom", u: "https://intercom.com", t: "Intercom" },
  { k: "loom", u: "https://loom.com", t: "Loom" },
  { k: "arc", u: "https://arc.net", t: "Arc Browser" },
  { k: "revolut", u: "https://revolut.com", t: "Revolut" },
  { k: "monzo", u: "https://monzo.com", t: "Monzo" },
  { k: "wise", u: "https://wise.com", t: "Wise" }
];
var setDesignRefPreview = (url, title) => {
  if (!designRefPreview) return;
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  designRefPreviewFavicon.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  designRefPreviewTitle.textContent = title || hostname;
  designRefPreviewUrl.textContent = url;
  designRefPreview.classList.add("is-visible");
  designRefUrl1.value = url;
};
var clearDesignRefPreview = () => {
  if (!designRefPreview) return;
  designRefPreview.classList.remove("is-visible");
  designRefPreviewFavicon.src = "";
  designRefPreviewTitle.textContent = "";
  designRefPreviewUrl.textContent = "";
  designRefUrl1.value = "";
  if (designRefSearch) designRefSearch.value = "";
};
var designRefSearchTimer = null;
var handleDesignRefSearch = (value) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    clearDesignRefPreview();
    return;
  }
  if (/^https?:\/\//i.test(trimmed) || /^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i.test(trimmed)) {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const hostname = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return trimmed;
      }
    })();
    const title = hostname.split(".")[0];
    setDesignRefPreview(url, title.charAt(0).toUpperCase() + title.slice(1));
    return;
  }
  const match = SITE_SEARCH_DB.find(
    (s) => s.k.startsWith(trimmed) || s.t.toLowerCase().startsWith(trimmed)
  );
  if (match) {
    setDesignRefPreview(match.u, match.t);
  } else {
    clearDesignRefPreview();
  }
};
designRefToggle?.addEventListener("change", () => {
  designRefPanel?.classList.toggle("is-visible", designRefToggle.checked);
  if (!designRefToggle.checked) clearDesignRefPreview();
  else designRefSearch?.focus();
});
designRefSearch?.addEventListener("input", () => {
  if (designRefSearchTimer !== null) clearTimeout(designRefSearchTimer);
  designRefSearchTimer = window.setTimeout(() => {
    designRefSearchTimer = null;
    handleDesignRefSearch(designRefSearch.value);
  }, 200);
});
designRefSearch?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (designRefSearchTimer !== null) {
      clearTimeout(designRefSearchTimer);
      designRefSearchTimer = null;
    }
    handleDesignRefSearch(designRefSearch.value);
  }
});
designRefPreviewRemove?.addEventListener("click", clearDesignRefPreview);
try {
  fetch("chrome-extension://gppongmhjkpfnbhagpmjfkannfbllamg/js/js.js").then(() => {
    getTypedElement("wappalyzer-banner").style.display = "block";
  }).catch(() => {
  });
} catch {
}
var applyHomeTabTitle = () => {
  const tabMeta = document.querySelector('meta[name="sf-home-tab-title"]');
  const tabTitle = tabMeta?.getAttribute("content");
  if (tabTitle) document.title = tabTitle;
};
applyHomeTabTitle();
var _autoOpenId = new URLSearchParams(location.search).get("s");
if (_autoOpenId) {
  history.replaceState(null, "", "/");
  openEmbeddedSession(_autoOpenId);
}
window.addEventListener("sf-sync-home-gallery", reloadHomeGalleryIfReady);
window.addEventListener("pageshow", (event) => {
  applyHomeTabTitle();
  const nav = performance.getEntriesByType("navigation")[0];
  const navType = nav && "type" in nav ? nav.type : "";
  const fromCachedPage = Boolean(event.persisted);
  const isBackNav = navType === "back_forward";
  if (fromCachedPage || isBackNav) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    });
  }
  const cameFromSession = fromCachedPage || isBackNav || sessionStorage.getItem("sf_return_home") === "1";
  if (!cameFromSession) return;
  if (sessionStorage.getItem("sf_return_home") === "1") {
    sessionStorage.removeItem("sf_return_home");
  }
  resetPromptForNextGeneration();
  const scheduleGalleryReload = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void reloadHomeGalleryIfReady();
      });
    });
  };
  if (authResolved) scheduleGalleryReload();
  else {
    window.addEventListener(
      "sf-home-auth-state",
      () => {
        scheduleGalleryReload();
      },
      { once: true }
    );
  }
});
window.addEventListener("sf-home-auth-state", (e) => {
  currentUser = e.detail.user;
  authResolved = true;
  if (currentUser) void showApp();
  else void showAnonymousApp();
});
window.__sfHomeScriptReady = true;
window.dispatchEvent(new CustomEvent("sf-home-script-ready"));
