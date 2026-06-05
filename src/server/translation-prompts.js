// Translation prompt builder for the /api/translate endpoint.
//
// The upstream model is llama3.1-8B (chatjimmy) — small and literal. It needs
// heavy, opinionated, highly-constrained system prompts WITH concrete English→target
// few-shot pairs, or it (a) leaves text in English, (b) emits the wrong script,
// (c) invents broken words, or (d) falls into repetition loops. Each writing STYLE
// gets its own builder:
//
//   native     hi, mr, ml, ne, fr …   → full translation in the native script
//   romanized  xx-latn (hi-latn …)    → full translation, written in Latin letters
//   codemix    hinglish, xx-en        → natural Lang+English code-mix in Latin letters
//
// classifyLocale() picks the style; buildTranslationMessages() returns the exact
// { system, user } pair to send upstream.
//
// The *_EXAMPLES maps below are the single most important quality lever. Each entry
// is an array of { en, out } few-shot pairs — keep ~3 diverse pairs per code
// (a heading, a short button/label, a multi-clause sentence). They are curated +
// expanded by the translation-quality workflow.

import {
  lookupKnownLanguage,
  isRomanizedIndicCode,
  isMixedEnglishIndicCode,
} from '../config/languages.js'

const langNames = new Intl.DisplayNames(['en'], { type: 'language' })

// Base 2-letter code → human script name (for the native-script instruction).
const BASE_SCRIPT = {
  hi: 'Devanagari', mr: 'Devanagari', ne: 'Devanagari', mai: 'Devanagari',
  kok: 'Devanagari', doi: 'Devanagari', brx: 'Devanagari', sa: 'Devanagari',
  ks: 'Devanagari',
  ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
  bn: 'Bengali', as: 'Bengali', gu: 'Gujarati', pa: 'Gurmukhi',
  or: 'Odia', ur: 'Perso-Arabic (Nastaliq)', sd: 'Perso-Arabic',
  mni: 'Meetei Mayek', sat: 'Ol Chiki',
}

// === Few-shot example banks: code -> [{ en, out }] ===========================

const NATIVE_EXAMPLES = {
  hi: [
    { en: 'Welcome to the official Government Services Portal.', out: 'आधिकारिक सरकारी सेवा पोर्टल में आपका स्वागत है।' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'कुछ ही मिनटों में अपने करों का ऑनलाइन भुगतान करें और रसीद तुरंत डाउनलोड करें।' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'सेवाएँ देखें, पात्रता जाँचें, और अपने दस्तावेज़ सुरक्षित रूप से अपलोड करें।' },
    { en: 'Apply Now', out: 'अभी आवेदन करें' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'अपने खाते से जुड़ी सहायता के लिए हमारी सहायता टीम से चौबीसों घंटे, सातों दिन संपर्क करें।' },
    { en: 'Your application has been submitted successfully.', out: 'आपका आवेदन सफलतापूर्वक जमा कर दिया गया है।' },
  ],
  mr: [
    { en: 'Welcome to the official Government Services Portal.', out: 'अधिकृत सरकारी सेवा पोर्टलवर आपले स्वागत आहे.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'अवघ्या काही मिनिटांत आपला कर ऑनलाइन भरा आणि पावती तत्काळ डाउनलोड करा.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'सेवा पाहा, पात्रता तपासा आणि आपली कागदपत्रे सुरक्षितपणे अपलोड करा.' },
    { en: 'Apply Now', out: 'आता अर्ज करा' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'आपल्या खात्याशी संबंधित मदतीसाठी आमच्या सहाय्य पथकाशी 24/7 संपर्क साधा.' },
    { en: 'Your application has been submitted successfully.', out: 'तुमचा अर्ज यशस्वीरीत्या सादर झाला आहे.' },
  ],
  ml: [
    { en: 'Welcome to the official Government Services Portal.', out: 'ഔദ്യോഗിക സർക്കാർ സേവന പോർട്ടലിലേക്ക് സ്വാഗതം.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'ഏതാനും മിനിറ്റുകൾ കൊണ്ട് നിങ്ങളുടെ നികുതികൾ ഓൺലൈനായി അടയ്ക്കുകയും രസീത് തൽക്ഷണം ഡൗൺലോഡ് ചെയ്യുകയും ചെയ്യുക.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'സേവനങ്ങൾ പരിശോധിക്കുക, യോഗ്യത ഉറപ്പാക്കുക, നിങ്ങളുടെ രേഖകൾ സുരക്ഷിതമായി അപ്‌ലോഡ് ചെയ്യുക.' },
    { en: 'Apply Now', out: 'ഇപ്പോൾ അപേക്ഷിക്കുക' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'നിങ്ങളുടെ അക്കൗണ്ട് സംബന്ധിച്ച സഹായത്തിനായി ഞങ്ങളുടെ പിന്തുണാ ടീമിനെ 24x7 ബന്ധപ്പെടുക.' },
    { en: 'Your application has been submitted successfully.', out: 'നിങ്ങളുടെ അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു.' },
  ],
  ne: [
    { en: 'Welcome to the official Government Services Portal.', out: 'आधिकारिक सरकारी सेवा पोर्टलमा स्वागत छ।' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'केही मिनेटमै अनलाइन कर तिर्नुहोस् र रसिद तुरुन्तै डाउनलोड गर्नुहोस्।' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'सेवाहरू हेर्नुहोस्, योग्यता जाँच गर्नुहोस्, र आफ्ना कागजातहरू सुरक्षित रूपमा अपलोड गर्नुहोस्।' },
    { en: 'Apply Now', out: 'अहिले नै आवेदन दिनुहोस्' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'आफ्नो खातासम्बन्धी सहयोगका लागि हाम्रो सहायता टोलीलाई दिनको २४ घन्टा, हप्ताको सातै दिन सम्पर्क गर्नुहोस्।' },
    { en: 'Your application has been submitted successfully.', out: 'तपाईंको आवेदन सफलतापूर्वक पेस गरिएको छ।' },
  ],
  ta: [
    { en: 'Welcome to the official Government Services Portal.', out: 'அரசு சேவைகள் அதிகாரப்பூர்வ வலைவாயிலுக்கு வரவேற்கிறோம்.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'உங்கள் வரிகளை சில நிமிடங்களில் இணையதளம் வழியாக செலுத்தி, ரசீதை உடனடியாகப் பதிவிறக்கம் செய்யுங்கள்.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'சேவைகளை உலாவுங்கள், தகுதியைச் சரிபார்க்கவும், மேலும் உங்கள் ஆவணங்களைப் பாதுகாப்பாகப் பதிவேற்றவும்.' },
    { en: 'Apply Now', out: 'இப்போதே விண்ணப்பிக்கவும்' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'உங்கள் கணக்கு தொடர்பான உதவிக்கு எங்கள் ஆதரவு குழுவை 24/7 தொடர்பு கொள்ளுங்கள்.' },
    { en: 'Your application has been submitted successfully.', out: 'உங்கள் விண்ணப்பம் வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது.' },
  ],
  bn: [
    { en: 'Welcome to the official Government Services Portal.', out: 'সরকারি সেবা পোর্টালের অফিশিয়াল ওয়েবসাইটে আপনাকে স্বাগতম।' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'মাত্র কয়েক মিনিটে অনলাইনে আপনার কর পরিশোধ করুন এবং সঙ্গে সঙ্গে রসিদ ডাউনলোড করুন।' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'বিভিন্ন সেবা দেখুন, যোগ্যতা যাচাই করুন এবং নিরাপদে আপনার নথিপত্র আপলোড করুন।' },
    { en: 'Apply Now', out: 'এখনই আবেদন করুন' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'আপনার অ্যাকাউন্ট সংক্রান্ত সহায়তার জন্য আমাদের সাপোর্ট টিমের সঙ্গে দিনরাত ২৪ ঘণ্টা যোগাযোগ করুন।' },
    { en: 'Your application has been submitted successfully.', out: 'আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে।' },
  ],
}

const ROMAN_EXAMPLES = {
  hi: [
    { en: 'Welcome to the official Government Services Portal.', out: 'Aadhikaarik Sarkaari Sevaayein portal mein aapka swaagat hai.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'Apne kar online sirf kuch minaton mein bharein aur raseed turant download karein.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'Sevaayein dekhein, paatrata jaanchein, aur apne dastaavez surakshit roop se upload karein.' },
    { en: 'Apply Now', out: 'Abhi aavedan karein' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'Apne account mein madad ke liye hamaari support team se 24/7 sampark karein.' },
    { en: 'Your application has been submitted successfully.', out: 'Aapka aavedan safaltapoorvak jama ho gaya hai.' },
  ],
  ne: [
    { en: 'Welcome to the official Government Services Portal.', out: 'Aadhikarik Sarkari Sewa Portal ma swagat cha.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'Kehi minet mai online aafno kar tirnuhos ra turuntai rasid download garnuhos.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'Sewaharu herchaha garnuhos, yogyata jaachnuhos, ra aafna kagajatharu surakshit tarikale upload garnuhos.' },
    { en: 'Apply Now', out: 'Ahile nai aavedan dinuhos' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'Aafno account sambandhi maddat ko lagi hamro support team lai 24/7 sampark garnuhos.' },
    { en: 'Your application has been submitted successfully.', out: 'Tapaiko aavedan saphalataapurwak pesh gariyeko cha.' },
  ],
  mr: [
    { en: 'Welcome to the official Government Services Portal.', out: 'Adhikrut Sarkari Seva Portal madhye tumche svagat aahe.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'Tumche kar online phakt kahi minitanmadhye bhara aani lagech pavti download kara.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'Seva pahaa, patrata tapasa, aani tumchi kagadpatre surakshitpane upload kara.' },
    { en: 'Apply Now', out: 'Aataach arj kara' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'Tumchya account sambandhi madatisathi aamchya support team shi 24/7 sampark kara.' },
    { en: 'Your application has been submitted successfully.', out: 'Tumcha arj yashasvirityaa sader zaala aahe.' },
  ],
}

const CODEMIX_EXAMPLES = {
  hi: [
    { en: 'Welcome to the official Government Services Portal.', out: 'Official Government Services Portal mein aapka swagat hai.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'Apne taxes sirf kuch minute mein online pay karein aur receipt turant download kar lein.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'Services browse karein, eligibility check karein, aur apne documents securely upload karein.' },
    { en: 'Apply Now', out: 'Abhi apply karein' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'Apne account ki madad ke liye hamari support team se 24/7 contact karein.' },
    { en: 'Your application has been submitted successfully.', out: 'Aapka application successfully submit ho gaya hai.' },
  ],
  ta: [
    { en: 'Welcome to the official Government Services Portal.', out: 'Official Government Services Portal-ku ungalai varaverkirom.' },
    { en: 'Pay your taxes online in just a few minutes and download the receipt instantly.', out: 'Unga taxes-a konja minutes-la online-la pay pannunga, appuramey receipt-a instant-a download pannidunga.' },
    { en: 'Browse services, check eligibility, and upload your documents securely.', out: 'Services-a browse pannunga, eligibility-a check pannunga, appuram unga documents-a securely upload pannunga.' },
    { en: 'Apply Now', out: 'Ippodey apply pannunga' },
    { en: 'Contact our support team 24/7 for help with your account.', out: 'Unga help-kaga engaloda support team-a 24/7 contact pannunga.' },
    { en: 'Your application has been submitted successfully.', out: 'Unga application successful-a submit aagiruchu.' },
  ],
}

// === Locale → style classification ==========================================

export function classifyLocale(locale) {
  const c = String(locale || '').trim().toLowerCase()
  if (!c || c === 'en') return { style: 'none', base: 'en' }
  if (isRomanizedIndicCode(c)) return { style: 'romanized', base: c.replace(/-latn$/i, '') }
  if (c === 'hinglish') return { style: 'codemix', base: 'hi' }
  if (isMixedEnglishIndicCode(c)) return { style: 'codemix', base: c.replace(/-en$/i, '') }
  return { style: 'native', base: c.split(/[-_]/)[0] }
}

function langDisplayName(base) {
  const known = lookupKnownLanguage(base)
  if (known?.name) return known.name.replace(/\s*\(Roman\)$/i, '')
  return langNames.of(base) ?? base
}

// Output discipline — the weak 8B otherwise echoes example labels, adds "Note:"
// commentary, or appends extra example pairs. Few-shot is delivered as real
// user/assistant message TURNS (see buildTranslationMessages), so these rules just
// have to forbid meta output.
const OUTPUT_RULES = [
  `Output ONLY the translation of the user's message — nothing else.`,
  `NEVER write labels like "English:", "Hindi:", "Translation:", or "(Roman)".`,
  `NEVER add notes, explanations, parentheticals, quotes, or extra examples.`,
  `Preserve the full meaning, tone and EVERY part of the content. Do not omit, summarize, shorten, or add anything.`,
  `Keep brand names, proper nouns, URLs, emails and numbers exactly as given.`,
  `Write each word ONCE — never repeat a word or phrase, never loop.`,
].join('\n- ')

function nativePrompt(base) {
  const lang = langDisplayName(base)
  const script = BASE_SCRIPT[base] || `the native ${lang} script`
  return {
    system:
      `You are a native ${lang} copywriter and professional translator. ` +
      `Translate website interface text into natural, fluent, grammatically correct ${lang}, written ENTIRELY in the ${script} script.\n` +
      `HARD RULES:\n- Write 100% in ${script}. NEVER use Latin/English letters or romanization.\n` +
      `- Translate EVERY English word into ${lang}. Do not leave any English word untranslated.\n` +
      `- Use everyday ${lang} that real native speakers use on official/government websites — natural phrasing, not literal word-for-word.\n` +
      `- If a tech word has no common ${lang} equivalent (e.g. "online"), write it phonetically in ${script}; prefer a real ${lang} word when one exists.\n` +
      `- Keep it complete and grammatical. Do not drop or truncate any part.\n- ${OUTPUT_RULES}`,
    examples: NATIVE_EXAMPLES[base] || [],
  }
}

function romanizedPrompt(base) {
  const lang = langDisplayName(base)
  return {
    system:
      `You are a professional ${lang} translator who writes ${lang} in the Latin/English alphabet (romanization). ` +
      `First fully translate the text into ${lang}, then write that ${lang} translation phonetically using ONLY the English alphabet (a-z).\n` +
      `HARD RULES:\n- The WORDS and MEANING must be ${lang}, NOT English. Example: English "Welcome" must become the ${lang} word for welcome spelled in Latin letters, not the English word "Welcome".\n` +
      `- Use casual phone-keyboard spelling the way ${lang} speakers text in Latin letters. NO diacritics or accent marks (write "aa" not "ā", "sh" not "ṣ").\n` +
      `- NEVER use native/${BASE_SCRIPT[base] || 'non-Latin'} script characters. Latin letters only.\n` +
      `- Do NOT leave English words, EXCEPT globally common loanwords that ${lang} speakers normally say in English (online, email, portal, PDF, OTP, app).\n` +
      `- Translate everything; keep it complete and grammatical.\n- ${OUTPUT_RULES}`,
    examples: ROMAN_EXAMPLES[base] || [],
  }
}

function codemixPrompt(base) {
  const lang = langDisplayName(base)
  return {
    system:
      `You are a bilingual ${lang}+English copywriter. Rewrite website text the way urban, bilingual ${lang} speakers naturally talk and text — a smooth ${lang}-English code-mix, written ONLY in the Latin/English alphabet.\n` +
      `HARD RULES:\n- GENUINELY MIX both languages in most sentences: use ${lang} for verbs, connectors and sentence structure, and keep common English nouns and tech terms in English.\n` +
      `- The result MUST NOT be pure English and MUST NOT be pure ${lang} — almost every sentence should blend both.\n` +
      `- Write the ${lang} words in casual Latin spelling (NO native script, NO diacritics).\n` +
      `- Keep it natural and conversational, but still suitable for a real website.\n` +
      `- Adapt everything; keep it complete.\n- ${OUTPUT_RULES}`,
    examples: CODEMIX_EXAMPLES[base] || [],
  }
}

// Returns { system, messages } or null when no translation is needed.
// Few-shot pairs are delivered as alternating user/assistant turns so the model
// continues the pattern with a bare translation (no echoed labels or notes).
export function buildTranslationMessages(text, locale) {
  const { style, base } = classifyLocale(locale)
  if (style === 'none') return null
  const tmpl =
    style === 'romanized' ? romanizedPrompt(base)
    : style === 'codemix' ? codemixPrompt(base)
    : nativePrompt(base)
  const messages = []
  for (const p of tmpl.examples) {
    messages.push({ role: 'user', content: p.en })
    messages.push({ role: 'assistant', content: p.out })
  }
  messages.push({ role: 'user', content: String(text) })
  return { system: tmpl.system, messages }
}

// Exposed so the quality workflow can merge in generated golds without re-parsing.
export const EXAMPLE_BANKS = {
  native: NATIVE_EXAMPLES,
  romanized: ROMAN_EXAMPLES,
  codemix: CODEMIX_EXAMPLES,
}
