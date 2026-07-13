import { PROMPT_PARTIAL_MAX } from './-prompt-suggestions-contract.js'

const OUT_MAX = 4
const LINE_MAX = 380
const MIN_TAIL = 6
const LANGUAGE_MAX = 32

const LANGUAGE_NAMES = {
  en: 'English',
  hinglish: 'mixed Hindi-English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
  or: 'Odia',
  as: 'Assamese',
  ur: 'Urdu',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ar: 'Arabic',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
}

const FALLBACK_TAILS = {
  en: [
    'for a modern homepage with a clear hero, benefits, pricing, testimonials, and a fast contact flow.',
    'with polished sections for the audience, services, trust signals, FAQs, and conversion-focused calls to action.',
    'that feels premium and practical, with mobile-first layout, strong visuals, and simple lead capture.',
    'for a launch-ready site with product story, feature highlights, social proof, and a direct signup path.',
  ],
  hinglish: [
    'ke liye modern homepage banao jisme hero, services, pricing, reviews aur clear contact flow ho.',
    'ke liye ek premium website chahiye jisme audience, benefits, FAQs aur strong call to action ho.',
    'ke liye mobile-friendly landing page banao jisme trust signals, gallery aur enquiry form ho.',
    'ke liye clean aur fast site banao jisme brand story, sections aur booking flow simple rahe.',
  ],
  hi: [
    'के लिए एक आधुनिक होमपेज बनाएं जिसमें हीरो सेक्शन, सेवाएं, कीमतें, समीक्षाएं और संपर्क फॉर्म हों।',
    'के लिए प्रीमियम वेबसाइट बनाएं जिसमें ग्राहकों के लाभ, भरोसे के संकेत, FAQ और स्पष्ट कॉल टू एक्शन हों।',
    'के लिए मोबाइल-फ्रेंडली लैंडिंग पेज बनाएं जिसमें गैलरी, ऑफर और आसान बुकिंग फ्लो हो।',
    'के लिए साफ और तेज वेबसाइट बनाएं जिसमें ब्रांड कहानी, सेक्शन और लीड फॉर्म शामिल हों।',
  ],
  ta: [
    'க்கு நவீன முகப்புப்பக்கம் உருவாக்கவும்; ஹீரோ பகுதி, சேவைகள், விலை, மதிப்புரைகள் மற்றும் தொடர்பு படிவம் இருக்கட்டும்.',
    'க்கு பிரீமியம் இணையதளம் உருவாக்கவும்; பயன்கள், நம்பிக்கை சான்றுகள், FAQ மற்றும் தெளிவான செயல் அழைப்பு சேர்க்கவும்.',
    'க்கு மொபைல் நட்பு லாண்டிங் பக்கம் உருவாக்கவும்; கேலரி, சலுகைகள் மற்றும் எளிய முன்பதிவு ஓட்டம் இருக்கட்டும்.',
    'க்கு சுத்தமான வேகமான தளம் உருவாக்கவும்; பிராண்ட் கதை, பிரிவுகள் மற்றும் லீட் படிவம் சேர்க்கவும்.',
  ],
  te: [
    'కోసం ఆధునిక హోమ్‌పేజ్ రూపొందించండి; హీరో సెక్షన్, సేవలు, ధరలు, సమీక్షలు మరియు సంప్రదింపు ఫారమ్ ఉండాలి.',
    'కోసం ప్రీమియం వెబ్‌సైట్ కావాలి; ప్రయోజనాలు, నమ్మకం సూచనలు, FAQ మరియు స్పష్టమైన కాల్ టు యాక్షన్ ఉండాలి.',
    'కోసం మొబైల్ ఫ్రెండ్లీ ల్యాండింగ్ పేజ్ రూపొందించండి; గ్యాలరీ, ఆఫర్లు మరియు సులభమైన బుకింగ్ ఫ్లో ఉండాలి.',
    'కోసం శుభ్రమైన వేగమైన సైట్ రూపొందించండి; బ్రాండ్ కథ, విభాగాలు మరియు లీడ్ ఫారమ్ చేర్చండి.',
  ],
  kn: [
    'ಗಾಗಿ ಆಧುನಿಕ ಹೋಮ್‌ಪೇಜ್ ರಚಿಸಿ; ಹೀರೋ ವಿಭಾಗ, ಸೇವೆಗಳು, ಬೆಲೆ, ವಿಮರ್ಶೆಗಳು ಮತ್ತು ಸಂಪರ್ಕ ಫಾರ್ಮ್ ಇರಲಿ.',
    'ಗಾಗಿ ಪ್ರೀಮಿಯಂ ವೆಬ್‌ಸೈಟ್ ಬೇಕು; ಪ್ರಯೋಜನಗಳು, ವಿಶ್ವಾಸ ಸೂಚನೆಗಳು, FAQ ಮತ್ತು ಸ್ಪಷ್ಟ ಕರೆ-ಟು-ಆಕ್ಷನ್ ಸೇರಿಸಿ.',
    'ಗಾಗಿ ಮೊಬೈಲ್ ಸ್ನೇಹಿ ಲ್ಯಾಂಡಿಂಗ್ ಪುಟ ರಚಿಸಿ; ಗ್ಯಾಲರಿ, ಆಫರ್‌ಗಳು ಮತ್ತು ಸರಳ ಬುಕ್ಕಿಂಗ್ ಹರಿವು ಇರಲಿ.',
    'ಗಾಗಿ ಸ್ವಚ್ಛ ಮತ್ತು ವೇಗವಾದ ಸೈಟ್ ರಚಿಸಿ; ಬ್ರಾಂಡ್ ಕಥೆ, ವಿಭಾಗಗಳು ಮತ್ತು ಲೀಡ್ ಫಾರ್ಮ್ ಸೇರಿಸಿ.',
  ],
  ml: [
    'ക്കായി ആധുനിക ഹോംപേജ് സൃഷ്ടിക്കുക; ഹീറോ വിഭാഗം, സേവനങ്ങൾ, വില, റിവ്യൂകൾ, കോൺടാക്റ്റ് ഫോം എന്നിവ ഉൾപ്പെടുത്തുക.',
    'ക്കായി പ്രീമിയം വെബ്‌സൈറ്റ് വേണം; ഗുണങ്ങൾ, വിശ്വാസ സൂചനകൾ, FAQ, വ്യക്തമായ കോൾ ടു ആക്ഷൻ എന്നിവ ചേർക്കുക.',
    'ക്കായി മൊബൈൽ സൗഹൃദ ലാൻഡിംഗ് പേജ് സൃഷ്ടിക്കുക; ഗാലറി, ഓഫറുകൾ, ലളിതമായ ബുക്കിംഗ് ഫ്ലോ എന്നിവ ഉണ്ടാകട്ടെ.',
    'ക്കായി വൃത്തിയുള്ള വേഗത്തിലുള്ള സൈറ്റ് സൃഷ്ടിക്കുക; ബ്രാൻഡ് കഥ, സെക്ഷനുകൾ, ലീഡ് ഫോം എന്നിവ ചേർക്കുക.',
  ],
  bn: [
    'এর জন্য একটি আধুনিক হোমপেজ বানান, যেখানে হিরো সেকশন, পরিষেবা, মূল্য, রিভিউ এবং যোগাযোগ ফর্ম থাকবে।',
    'এর জন্য প্রিমিয়াম ওয়েবসাইট চাই, যেখানে সুবিধা, বিশ্বাসের সংকেত, FAQ এবং স্পষ্ট কল টু অ্যাকশন থাকবে।',
    'এর জন্য মোবাইল-ফ্রেন্ডলি ল্যান্ডিং পেজ বানান, যেখানে গ্যালারি, অফার এবং সহজ বুকিং ফ্লো থাকবে।',
    'এর জন্য পরিষ্কার ও দ্রুত সাইট বানান, যেখানে ব্র্যান্ড গল্প, সেকশন এবং লিড ফর্ম থাকবে।',
  ],
  mr: [
    'साठी आधुनिक होमपेज तयार करा ज्यात हिरो सेक्शन, सेवा, किंमत, समीक्षा आणि संपर्क फॉर्म असतील.',
    'साठी प्रीमियम वेबसाइट हवी ज्यात फायदे, विश्वासाचे संकेत, FAQ आणि स्पष्ट कॉल टू अॅक्शन असेल.',
    'साठी मोबाइल-फ्रेंडली लँडिंग पेज तयार करा ज्यात गॅलरी, ऑफर आणि सोपा बुकिंग फ्लो असेल.',
    'साठी स्वच्छ आणि जलद साइट तयार करा ज्यात ब्रँड कथा, सेक्शन्स आणि लीड फॉर्म असतील.',
  ],
  gu: [
    'માટે આધુનિક હોમપેજ બનાવો જેમાં હીરો સેક્શન, સેવાઓ, કિંમત, સમીક્ષાઓ અને સંપર્ક ફોર્મ હોય.',
    'માટે પ્રીમિયમ વેબસાઇટ જોઈએ જેમાં લાભો, વિશ્વાસ સંકેતો, FAQ અને સ્પષ્ટ કોલ ટુ એક્શન હોય.',
    'માટે મોબાઇલ-ફ્રેન્ડલી લેન્ડિંગ પેજ બનાવો જેમાં ગેલેરી, ઓફર અને સરળ બુકિંગ ફ્લો હોય.',
    'માટે સ્વચ્છ અને ઝડપી સાઇટ બનાવો જેમાં બ્રાન્ડ સ્ટોરી, વિભાગો અને લીડ ફોર્મ હોય.',
  ],
  pa: [
    'ਲਈ ਆਧੁਨਿਕ ਹੋਮਪੇਜ ਬਣਾਓ ਜਿਸ ਵਿੱਚ ਹੀਰੋ ਸੈਕਸ਼ਨ, ਸੇਵਾਵਾਂ, ਕੀਮਤਾਂ, ਸਮੀਖਿਆਵਾਂ ਅਤੇ ਸੰਪਰਕ ਫਾਰਮ ਹੋਣ।',
    'ਲਈ ਪ੍ਰੀਮੀਅਮ ਵੈੱਬਸਾਈਟ ਚਾਹੀਦੀ ਹੈ ਜਿਸ ਵਿੱਚ ਲਾਭ, ਭਰੋਸੇ ਦੇ ਸੰਕੇਤ, FAQ ਅਤੇ ਸਪਸ਼ਟ ਕਾਲ ਟੂ ਐਕਸ਼ਨ ਹੋਵੇ।',
    'ਲਈ ਮੋਬਾਈਲ-ਫ੍ਰੈਂਡਲੀ ਲੈਂਡਿੰਗ ਪੇਜ ਬਣਾਓ ਜਿਸ ਵਿੱਚ ਗੈਲਰੀ, ਆਫਰ ਅਤੇ ਆਸਾਨ ਬੁਕਿੰਗ ਫਲੋ ਹੋਵੇ।',
    'ਲਈ ਸਾਫ਼ ਅਤੇ ਤੇਜ਼ ਸਾਈਟ ਬਣਾਓ ਜਿਸ ਵਿੱਚ ਬ੍ਰਾਂਡ ਕਹਾਣੀ, ਸੈਕਸ਼ਨ ਅਤੇ ਲੀਡ ਫਾਰਮ ਸ਼ਾਮਲ ਹੋਣ।',
  ],
  or: [
    'ପାଇଁ ଏକ ଆଧୁନିକ ହୋମପେଜ୍ ତିଆରି କରନ୍ତୁ, ଯେଉଁଥିରେ ହିରୋ ସେକ୍ସନ୍, ସେବା, ମୂଲ୍ୟ, ସମୀକ୍ଷା ଏବଂ ଯୋଗାଯୋଗ ଫର୍ମ ରହିବ।',
    'ପାଇଁ ପ୍ରିମିୟମ୍ ୱେବସାଇଟ୍ ତିଆରି କରନ୍ତୁ, ଯେଉଁଥିରେ ଲାଭ, ବିଶ୍ୱାସ ସଙ୍କେତ, FAQ ଏବଂ ସ୍ପଷ୍ଟ କଲ୍ ଟୁ ଆକ୍ସନ୍ ରହିବ।',
    'ପାଇଁ ମୋବାଇଲ୍-ଫ୍ରେଣ୍ଡଲି ଲ୍ୟାଣ୍ଡିଂ ପେଜ୍ ତିଆରି କରନ୍ତୁ, ଯେଉଁଥିରେ ଗ୍ୟାଲେରୀ, ଅଫର୍ ଏବଂ ସହଜ ବୁକିଂ ଫ୍ଲୋ ରହିବ।',
    'ପାଇଁ ସଫା ଏବଂ ଦ୍ରୁତ ସାଇଟ୍ ତିଆରି କରନ୍ତୁ, ଯେଉଁଥିରେ ବ୍ରାଣ୍ଡ କଥା, ସେକ୍ସନ୍ ଏବଂ ଲିଡ୍ ଫର୍ମ ରହିବ।',
  ],
  as: [
    'ৰ বাবে আধুনিক হোমপেজ সৃষ্টি কৰক, য’ত হিৰো অংশ, সেৱা, মূল্য, সমালোচনা আৰু যোগাযোগ ফৰ্ম থাকে।',
    'ৰ বাবে প্ৰিমিয়াম ৱেবছাইট লাগে, য’ত সুবিধা, বিশ্বাসৰ সংকেত, FAQ আৰু স্পষ্ট কল টু একশ্যন থাকে।',
    'ৰ বাবে মোবাইল-বন্ধু লেণ্ডিং পেজ সৃষ্টি কৰক, য’ত গেলাৰী, অফাৰ আৰু সহজ বুকিং ফ্ল’ থাকে।',
    'ৰ বাবে পৰিষ্কাৰ আৰু দ্ৰুত ছাইট সৃষ্টি কৰক, য’ত ব্ৰেণ্ড গল্প, অংশ আৰু লীড ফৰ্ম থাকে।',
  ],
  ur: [
    'کے لیے ایک جدید ہوم پیج بنائیں جس میں ہیرو سیکشن، خدمات، قیمتیں، جائزے اور رابطہ فارم شامل ہوں۔',
    'کے لیے پریمیم ویب سائٹ چاہیے جس میں فوائد، اعتماد کے اشارے، FAQ اور واضح کال ٹو ایکشن ہو۔',
    'کے لیے موبائل فرینڈلی لینڈنگ پیج بنائیں جس میں گیلری، آفرز اور آسان بکنگ فلو ہو۔',
    'کے لیے صاف اور تیز سائٹ بنائیں جس میں برانڈ کہانی، سیکشنز اور لیڈ فارم شامل ہوں۔',
  ],
  fr: [
    'pour une page d’accueil moderne avec une section héros, les services, les tarifs, des avis et un formulaire de contact.',
    'avec des sections claires pour le public cible, les bénéfices, la preuve sociale, la FAQ et un appel à l’action.',
    'pour un site premium et mobile avec une galerie, des offres, une histoire de marque et un parcours de réservation simple.',
    'avec une mise en page élégante, des visuels forts, des témoignages et une capture de leads directe.',
  ],
  es: [
    'para una página de inicio moderna con héroe, servicios, precios, reseñas y formulario de contacto.',
    'con secciones claras para la audiencia, beneficios, prueba social, FAQ y una llamada a la acción.',
    'para un sitio premium y móvil con galería, ofertas, historia de marca y reserva sencilla.',
    'con diseño elegante, visuales fuertes, testimonios y captación directa de leads.',
  ],
  de: [
    'für eine moderne Startseite mit Hero-Bereich, Leistungen, Preisen, Bewertungen und Kontaktformular.',
    'mit klaren Abschnitten für Zielgruppe, Vorteile, Vertrauenssignale, FAQ und Call-to-Action.',
    'für eine mobile Premium-Seite mit Galerie, Angeboten, Markengeschichte und einfachem Buchungsfluss.',
    'mit elegantem Layout, starken Bildern, Kundenstimmen und direkter Lead-Erfassung.',
  ],
  it: [
    'per una homepage moderna con hero, servizi, prezzi, recensioni e modulo di contatto.',
    'con sezioni chiare per pubblico, benefici, prova sociale, FAQ e call to action.',
    'per un sito premium mobile con galleria, offerte, storia del brand e prenotazione semplice.',
    'con layout elegante, immagini forti, testimonianze e acquisizione lead diretta.',
  ],
  pt: [
    'para uma página inicial moderna com hero, serviços, preços, avaliações e formulário de contato.',
    'com seções claras para público, benefícios, prova social, FAQ e chamada para ação.',
    'para um site premium mobile com galeria, ofertas, história da marca e reserva simples.',
    'com layout elegante, visuais fortes, depoimentos e captação direta de leads.',
  ],
  ar: [
    'لصفحة رئيسية حديثة تتضمن قسم بطل، الخدمات، الأسعار، التقييمات ونموذج تواصل واضح.',
    'مع أقسام واضحة للجمهور المستهدف، الفوائد، إشارات الثقة، الأسئلة الشائعة ودعوة لاتخاذ إجراء.',
    'لموقع فاخر ومتوافق مع الجوال يتضمن معرضًا، عروضًا، قصة العلامة ومسار حجز بسيط.',
    'بتصميم أنيق، صور قوية، شهادات عملاء ونموذج مباشر لجمع العملاء المحتملين.',
  ],
  ja: [
    '向けに、魅力的なメインビジュアル、特徴紹介、利用者の声、よくある質問、購入までの明確な導線を備えた現代的なページを作成してください。',
    'に合う上質なサイトを作り、対象のお客様、商品の魅力、信頼できる実績、問い合わせへの流れを分かりやすく伝えてください。',
    'を紹介する、携帯端末でも見やすいページを作り、写真一覧、おすすめ商品、予約や購入の流れを整えてください。',
    'の物語と価値を伝える清潔で高速なサイトを作り、安心材料と分かりやすい申し込み方法を用意してください。',
  ],
  zh: [
    '，打造现代化首页，清晰展示核心亮点、服务内容、价格信息、用户评价和联系入口。',
    '，制作精致的网站，说明目标人群、主要优势、信任依据、常见问题和明确的行动指引。',
    '，设计适合移动设备的页面，加入图片展示、优惠信息和简洁顺畅的预约流程。',
    '，创建清爽快速的网站，讲述品牌故事，组织关键内容，并提供便捷的咨询入口。',
  ],
  ko: [
    '을 위한 현대적인 홈페이지를 만들고 핵심 소개, 서비스, 가격, 이용 후기와 문의 흐름을 명확하게 구성해 주세요.',
    '에 어울리는 고급스러운 웹사이트를 만들고 대상 고객, 주요 혜택, 신뢰 요소, 자주 묻는 질문과 행동 유도 문구를 담아 주세요.',
    '을 소개하는 모바일 친화적인 페이지를 만들고 사진 모음, 추천 상품과 간단한 예약 절차를 구성해 주세요.',
    '의 이야기와 가치를 전하는 빠르고 깔끔한 사이트를 만들고 상담 신청으로 이어지는 경로를 분명하게 보여 주세요.',
  ],
}

const SCRIPT_LANGUAGE_PATTERNS = [
  [/[\u0900-\u097f]/, 'hi'],
  [/[\u0b80-\u0bff]/, 'ta'],
  [/[\u0c00-\u0c7f]/, 'te'],
  [/[\u0c80-\u0cff]/, 'kn'],
  [/[\u0d00-\u0d7f]/, 'ml'],
  [/[\u0980-\u09ff]/, 'bn'],
  [/[\u0a80-\u0aff]/, 'gu'],
  [/[\u0a00-\u0a7f]/, 'pa'],
  [/[\u0b00-\u0b7f]/, 'or'],
  [/[\u0600-\u06ff]/, 'ur'],
  [/[\u3040-\u30ff]/, 'ja'],
  [/[\u4e00-\u9fff]/, 'zh'],
  [/[\uac00-\ud7af]/, 'ko'],
]

const HINGLISH_MARKERS = new Set(
  'ke liye ka ki ko se pe par aur banao bana chahiye mere meri mera apna apni aapka aapki nahi nhi hai hain'.split(
    ' ',
  ),
)

const FRENCH_MARKERS = new Set(
  'un une des du de la le les et ou pour avec dans sur sous ce cette ces cet votre vos notre nos leur leurs au aux par est sont etre être été avoir avez nous vous ils elles qui que quoi dont quand comment pourquoi parce plus moins tres très site page accueil boutique produit produits service services client clients formulaire contact prix offre offres blog article articles galerie reservation réservation equipe équipe créer cree crée creez créez generer générer français francaise française moderne responsive mobile entreprise association école ecole hôtel hotel immobilier portfolio evenement événement familles astuces pratiques incluant guides alimentation tests histoires inspirantes rédigés rédigées ton informatif convivial'.split(
    ' ',
  ),
)

function inferFrenchFromPartial(partial) {
  const lower = String(partial || '').toLowerCase()
  const words = lower.match(/\b[a-zàâçéèêëîïôûùüÿœæ]{2,}\b/g) || []
  if (words.length < 4) return false
  const accented = /[àâçéèêëîïôûùüÿœæ]/i.test(lower)
  const hits =
    words.filter((word) => FRENCH_MARKERS.has(word)).length + (accented ? 2 : 0)
  return hits >= 3 && hits / words.length >= 0.16
}

function extractJsonObject(text) {
  const s = String(text || '').trim()
  if (s.length > 50000) return null // Size limit

  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end <= start) return null

  try {
    const jsonStr = s.slice(start, end + 1)
    if (jsonStr.length > 10000) return null // Additional size check
    return JSON.parse(jsonStr)
  } catch (error) {
    console.warn('JSON parse error in extractJsonObject:', error)
    return null
  }
}

const hasGroqApiKey = () =>
  typeof process !== 'undefined' &&
  typeof process.env?.GROQ_API_KEY === 'string' &&
  process.env.GROQ_API_KEY.trim().length > 0

const loadGroqPromptSuggestionRuntime = async () => {
  const [{ groq }, { trimInlineAiText }] = await Promise.all([
    import('@ship-fast/engine/llm/groq.js'),
    import('@ship-fast/engine/llm/utils.js'),
  ])
  return { groq, trimInlineAiText }
}

export function normalizePromptSuggestionLanguage(language) {
  const raw = String(language || '')
    .trim()
    .toLowerCase()
  if (!raw || raw.length > LANGUAGE_MAX) return ''
  if (raw === 'hinglish') return 'hinglish'
  if (/^[a-z]{2,8}-en$/.test(raw)) return 'hinglish'
  if (!/^[a-z]{2,8}(?:[-_][a-z0-9]{2,8})?$/.test(raw)) return ''
  return raw.split(/[-_]/)[0]
}

function inferLanguageFromPartial(partial, language) {
  const normalized = normalizePromptSuggestionLanguage(language)
  if (normalized && normalized !== 'en') return normalized
  const text = String(partial || '')
  for (const [pattern, code] of SCRIPT_LANGUAGE_PATTERNS) {
    if (pattern.test(text)) return code
  }
  const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || []
  const hinglishHits = words.filter((word) => HINGLISH_MARKERS.has(word)).length
  if (hinglishHits >= 1 && words.length <= 6) return 'hinglish'
  if (hinglishHits >= 2) return 'hinglish'
  if (inferFrenchFromPartial(text)) return 'fr'
  return normalized || 'en'
}

function joinPartialTail(partial, tail) {
  const prefix = String(partial ?? '').trim()
  const suffix = String(tail ?? '').trim()
  if (!prefix || !suffix) return prefix
  if (/\s$/.test(prefix) || /^[,.;:!?।،۔，。！？；：]/.test(suffix))
    return `${prefix}${suffix}`
  return `${prefix} ${suffix}`
}

export function getFallbackPromptSuggestions(partial, language) {
  const p = String(partial ?? '').trim()
  if (p.length < 2) return []
  if (p.length > PROMPT_PARTIAL_MAX) return []
  const inferred = inferLanguageFromPartial(p, language)
  const tails = FALLBACK_TAILS[inferred] || FALLBACK_TAILS.en
  const seen = new Set()
  const out = []
  for (const tail of tails) {
    const suggestion = joinPartialTail(p, tail).replace(/\s+/g, ' ').trim()
    if (!suggestion.startsWith(p)) continue
    if (suggestion.length > LINE_MAX) continue
    if (suggestion.length < p.length + MIN_TAIL) continue
    const key = suggestion.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(suggestion)
    if (out.length >= OUT_MAX) break
  }
  return out
}

function languageInstructionFor(partial, language) {
  const inferred = inferLanguageFromPartial(partial, language)
  if (!inferred || inferred === 'en')
    return 'Match the user language and script.'
  const label = LANGUAGE_NAMES[inferred] || inferred
  if (inferred === 'hinglish') {
    return 'Continue in mixed Hindi-English/Hinglish when the partial uses that style, preserving code-switching and the exact prefix.'
  }
  return `Continue in ${label}; preserve the user script and exact prefix.`
}

export async function getPartialPromptSuggestions(partial, options = {}) {
  const p = String(partial ?? '').trim()
  if (p.length < 2) return []
  if (p.length > PROMPT_PARTIAL_MAX) return []
  if (!hasGroqApiKey()) return getFallbackPromptSuggestions(p, options.language)

  const system = [
    'You complete partial prompts for an AI that generates marketing websites.',
    `Output only valid JSON: {"suggestions":["..."]} with at most ${OUT_MAX} strings.`,
    'Each string must begin with the user partial copied verbatim from the user message (same characters and spacing).',
    `Then continue into one flowing sentence describing the site (audience, sections, tone).`,
    `Each full string under ${LINE_MAX} characters; add at least ${MIN_TAIL} new characters after the prefix.`,
    `Vary the angles across suggestions. ${languageInstructionFor(p, options.language)}`,
    'No markdown, no numbering, no explanation outside the JSON.',
  ].join(' ')

  const { groq, trimInlineAiText } = await loadGroqPromptSuggestionRuntime()
  const r = await groq(`Partial prompt:\n${p}`, {
    system,
    temperature: 0.35,
    maxTokens: 700,
  })

  if (r.error || !r.content)
    return getFallbackPromptSuggestions(p, options.language)

  const cleaned = trimInlineAiText(r.content)
  const data = extractJsonObject(cleaned)
  if (!data || !Array.isArray(data.suggestions)) {
    return getFallbackPromptSuggestions(p, options.language)
  }

  const seen = new Set()
  const out = []
  for (const item of data.suggestions) {
    if (typeof item !== 'string') continue
    const s = item.replace(/\s+/g, ' ').trim()
    if (!s.startsWith(p)) continue
    if (s.length > LINE_MAX) continue
    if (s.length < p.length + MIN_TAIL) continue
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= OUT_MAX) break
  }
  return out.length > 0
    ? out
    : getFallbackPromptSuggestions(p, options.language)
}
