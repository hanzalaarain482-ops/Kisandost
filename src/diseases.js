// =====================================================================
// BIMARIYON KI LIBRARY — Gandum, Kapaas, Chawal
// ---------------------------------------------------------------------
// Yeh aam maloomat hai. LAUNCH SE PEHLE kisi zarai expert (Mehkma Zaraat /
// zarai university) se har entry verify karwa kar `verified: true` karein.
// Dawai ka NAAM aur MIQDAAR jaan boojh kar nahi likhi gayi — woh local expert
// batayega, kyunke yeh ilaqe, mausam aur registered dawaiyon par depend karta hai.
//
// `keywords`: AI (Crop.health API) ke English / scientific naam se match karne ke liye.
// =====================================================================

export const CROPS = [
  { id: 'wheat', name: 'گندم', emoji: '🌾' },
  { id: 'cotton', name: 'کپاس', emoji: '☁️' },
  { id: 'rice', name: 'چاول', emoji: '🍚' },
]

const ASK_EXPERT = 'دوا کا نام اور مقدار اپنے علاقے کے محکمہ زراعت کے افسر یا ماہر سے پوچھیں'

export const DISEASES = [
  // ---------------- GANDUM ----------------
  {
    id: 'wheat_yellow_rust',
    crop: 'wheat',
    type: 'fungus',
    name: 'پیلی کنگی',
    english: 'Yellow (stripe) rust',
    scientific: 'Puccinia striiformis',
    keywords: ['puccinia striiformis', 'yellow rust', 'stripe rust'],
    severity: 'high',
    symptoms: 'پتوں پر پیلے رنگ کی لمبی دھاریاں بنتی ہیں۔ ہاتھ لگائیں تو پیلا پاؤڈر لگ جاتا ہے۔',
    steps: [
      'صرف متاثرہ حصے پر فنگس کش دوا کا اسپرے کریں',
      ASK_EXPERT,
      'اسپرے صبح یا شام کو کریں، بارش سے پہلے نہ کریں',
    ],
    prevention: 'اگلی بار کنگی سے محفوظ قسم کاشت کریں اور نائٹروجن کھاد زیادہ نہ ڈالیں۔',
    verified: false,
  },
  {
    id: 'wheat_brown_rust',
    crop: 'wheat',
    type: 'fungus',
    name: 'بھوری کنگی',
    english: 'Brown (leaf) rust',
    scientific: 'Puccinia triticina',
    keywords: ['puccinia triticina', 'puccinia recondita', 'brown rust', 'leaf rust'],
    severity: 'medium',
    symptoms: 'پتوں پر چھوٹے گول بھورے یا نارنجی دانے بکھرے ہوتے ہیں۔',
    steps: ['کھیت کا روز معائنہ کریں', 'حملہ بڑھے تو فنگس کش اسپرے کریں', ASK_EXPERT],
    prevention: 'کنگی سے محفوظ قسم اور وقت پر کاشت کریں۔',
    verified: false,
  },
  {
    id: 'wheat_loose_smut',
    crop: 'wheat',
    type: 'fungus',
    name: 'کانگیاری',
    english: 'Loose smut',
    scientific: 'Ustilago tritici',
    keywords: ['ustilago', 'loose smut', 'smut'],
    severity: 'medium',
    symptoms: 'سٹے دانوں کی بجائے کالا پاؤڈر بن جاتے ہیں۔',
    steps: [
      'متاثرہ پودے احتیاط سے نکال کر کھیت سے دور تلف کریں',
      'اس کھیت کا بیج اگلے سال استعمال نہ کریں',
      'اگلی بار بیج کو دوا لگا کر کاشت کریں، ماہر سے پوچھیں',
    ],
    prevention: 'ہمیشہ تصدیق شدہ اور دوا لگا ہوا بیج استعمال کریں۔',
    verified: false,
  },
  {
    id: 'wheat_aphid',
    crop: 'wheat',
    type: 'pest',
    name: 'سست تیلا',
    english: 'Aphid',
    scientific: 'Aphididae',
    keywords: ['aphid', 'aphididae', 'sitobion', 'schizaphis', 'rhopalosiphum'],
    severity: 'medium',
    symptoms: 'پتوں اور سٹوں پر چھوٹے سبز یا کالے کیڑے، پتے چپچپے ہو جاتے ہیں۔',
    steps: [
      'کھیت میں کئی جگہ سے دیکھیں کہ حملہ کتنا ہے',
      'تھوڑا حملہ ہو تو اسپرے نہ کریں، دوست کیڑے خود کھا لیتے ہیں',
      'زیادہ حملہ ہو تو ' + ASK_EXPERT,
    ],
    prevention: 'لیڈی برڈ جیسے دوست کیڑوں کو بچائیں، بلا ضرورت اسپرے نہ کریں۔',
    verified: false,
  },

  // ---------------- KAPAAS ----------------
  {
    id: 'cotton_leaf_curl',
    crop: 'cotton',
    type: 'virus',
    name: 'پتا مروڑ وائرس',
    english: 'Cotton leaf curl virus',
    scientific: 'Cotton leaf curl virus (CLCuV)',
    keywords: ['leaf curl', 'clcuv', 'begomovirus', 'curl virus'],
    severity: 'high',
    symptoms: 'پتے اوپر یا نیچے کی طرف مڑ جاتے ہیں، رگیں موٹی ہو جاتی ہیں، پودا چھوٹا رہ جاتا ہے۔',
    steps: [
      'اس وائرس کی کوئی دوا نہیں',
      'یہ سفید مکھی پھیلاتی ہے، اس لیے سفید مکھی کو کنٹرول کریں',
      'شروع میں متاثرہ پودے نکال دیں',
    ],
    prevention: 'وائرس برداشت کرنے والی قسم لگائیں اور کھیت کے آس پاس جڑی بوٹیاں صاف رکھیں۔',
    verified: false,
  },
  {
    id: 'cotton_whitefly',
    crop: 'cotton',
    type: 'pest',
    name: 'سفید مکھی',
    english: 'Whitefly',
    scientific: 'Bemisia tabaci',
    keywords: ['whitefly', 'bemisia', 'aleyrodidae'],
    severity: 'high',
    symptoms: 'پتوں کے نیچے چھوٹی سفید مکھیاں، پتے چپچپے اور کالے ہو جاتے ہیں۔',
    steps: [
      'پتوں کی نچلی طرف دیکھ کر گنتی کریں',
      'پیلے چپکنے والے کارڈ کھیت میں لگائیں',
      'حملہ حد سے بڑھے تو ' + ASK_EXPERT,
    ],
    prevention: 'ایک ہی دوا بار بار استعمال نہ کریں، کھیت صاف رکھیں۔',
    verified: false,
  },
  {
    id: 'cotton_jassid',
    crop: 'cotton',
    type: 'pest',
    name: 'سبز تیلا',
    english: 'Jassid (leafhopper)',
    scientific: 'Amrasca biguttula',
    keywords: ['jassid', 'leafhopper', 'amrasca', 'cicadellidae'],
    severity: 'medium',
    symptoms: 'پتوں کے کنارے پیلے یا سرخ ہو کر نیچے مڑ جاتے ہیں، پتوں کے نیچے چھوٹے سبز کیڑے۔',
    steps: ['صبح کے وقت پتوں کے نیچے دیکھیں', 'حملہ زیادہ ہو تو ' + ASK_EXPERT],
    prevention: 'روئیں دار پتوں والی برداشت کرنے والی قسم بہتر ہے۔',
    verified: false,
  },
  {
    id: 'cotton_pink_bollworm',
    crop: 'cotton',
    type: 'pest',
    name: 'گلابی سنڈی',
    english: 'Pink bollworm',
    scientific: 'Pectinophora gossypiella',
    keywords: ['pink bollworm', 'pectinophora', 'bollworm'],
    severity: 'high',
    symptoms: 'پھول گلاب کی کلی کی طرح بند رہتے ہیں، ٹینڈے کے اندر گلابی سنڈی ہوتی ہے۔',
    steps: [
      'متاثرہ پھول اور ٹینڈے توڑ کر تلف کریں',
      'جنسی پھندے (فیرومون ٹریپ) لگائیں',
      ASK_EXPERT,
    ],
    prevention: 'چنائی کے بعد چھڑیاں اور باقیات تلف کریں، اگیتی کاشت سے بچیں۔',
    verified: false,
  },

  // ---------------- CHAWAL ----------------
  {
    id: 'rice_blast',
    crop: 'rice',
    type: 'fungus',
    name: 'بلاسٹ (جھلساؤ)',
    english: 'Rice blast',
    scientific: 'Magnaporthe oryzae',
    keywords: ['blast', 'magnaporthe', 'pyricularia'],
    severity: 'high',
    symptoms: 'پتوں پر آنکھ یا کشتی جیسے دھبے، درمیان سے سرمئی اور کنارے بھورے۔',
    steps: ['نائٹروجن کھاد فی الحال روک دیں', 'فنگس کش اسپرے کے لیے ' + ASK_EXPERT],
    prevention: 'برداشت والی قسم اور متوازن کھاد استعمال کریں۔',
    verified: false,
  },
  {
    id: 'rice_blb',
    crop: 'rice',
    type: 'bacteria',
    name: 'پتوں کا جھلساؤ (بیکٹیریا)',
    english: 'Bacterial leaf blight',
    scientific: 'Xanthomonas oryzae',
    keywords: ['bacterial leaf blight', 'xanthomonas', 'bacterial blight'],
    severity: 'high',
    symptoms: 'پتوں کے کنارے اوپر سے پیلے ہو کر سفید اور خشک ہو جاتے ہیں۔',
    steps: [
      'کھیت سے زائد پانی نکالیں',
      'نائٹروجن کھاد کم کریں',
      ASK_EXPERT,
    ],
    prevention: 'صحت مند بیج اور برداشت والی قسم لگائیں۔',
    verified: false,
  },
  {
    id: 'rice_brown_spot',
    crop: 'rice',
    type: 'fungus',
    name: 'بھورے دھبے',
    english: 'Brown spot',
    scientific: 'Bipolaris oryzae',
    keywords: ['brown spot', 'bipolaris', 'cochliobolus', 'helminthosporium'],
    severity: 'medium',
    symptoms: 'پتوں پر تل جیسے گول بھورے دھبے۔ کمزور زمین میں زیادہ ہوتے ہیں۔',
    steps: ['متوازن کھاد ڈالیں، خاص کر پوٹاش', ASK_EXPERT],
    prevention: 'زمین کی صحت بہتر رکھیں اور صاف بیج لگائیں۔',
    verified: false,
  },
  {
    id: 'rice_stem_borer',
    crop: 'rice',
    type: 'pest',
    name: 'تنے کی سنڈی',
    english: 'Stem borer',
    scientific: 'Scirpophaga incertulas',
    keywords: ['stem borer', 'scirpophaga', 'chilo', 'dead heart'],
    severity: 'high',
    symptoms: 'درمیان والا پتا سوکھ جاتا ہے، بعد میں سٹے سفید اور خالی رہتے ہیں۔',
    steps: ['متاثرہ پودے کھینچیں تو آسانی سے نکل آتے ہیں، انہیں تلف کریں', ASK_EXPERT],
    prevention: 'کٹائی کے بعد مڈھ (باقیات) تلف کریں۔',
    verified: false,
  },
  {
    id: 'rice_leaf_folder',
    crop: 'rice',
    type: 'pest',
    name: 'پتا لپیٹ سنڈی',
    english: 'Leaf folder',
    scientific: 'Cnaphalocrocis medinalis',
    keywords: ['leaf folder', 'leaf roller', 'cnaphalocrocis'],
    severity: 'medium',
    symptoms: 'پتے لمبائی میں لپٹ جاتے ہیں اور ان پر سفید دھاریاں بن جاتی ہیں۔',
    steps: ['دیکھیں کہ کتنے پودوں پر حملہ ہے', 'حد سے زیادہ ہو تو ' + ASK_EXPERT],
    prevention: 'نائٹروجن کھاد ضرورت سے زیادہ نہ ڈالیں۔',
    verified: false,
  },
]

export const HEALTHY = {
  id: 'healthy',
  type: 'healthy',
  name: 'فصل صحت مند ہے',
  english: 'Healthy',
  severity: 'none',
  symptoms: 'کوئی بیماری نظر نہیں آئی۔',
  steps: ['پانی اور کھاد وقت پر دیتے رہیں', 'ہفتے میں ایک بار تصویر لے کر چیک کریں'],
  prevention: '',
}

export const UNKNOWN = {
  id: 'unknown',
  type: 'unknown',
  name: 'پکا پتا نہیں چلا',
  english: 'Not sure',
  severity: 'unknown',
  symptoms: 'کمپیوٹر کو پکا یقین نہیں۔ آپ کی تصویر ماہر کو بھیج دی گئی ہے۔',
  steps: ['ماہر جلد آپ کو جواب دے گا', 'ابھی کے لیے ماہر کو فون بھی کر سکتے ہیں'],
  prevention: '',
}

export const typeLabel = {
  fungus: 'پھپھوندی',
  pest: 'کیڑا',
  virus: 'وائرس',
  bacteria: 'بیکٹیریا',
  healthy: 'صحت مند',
  unknown: '',
}

export function diseasesFor(crop) {
  return DISEASES.filter((d) => d.crop === crop)
}

// AI ke English/scientific naam ko hamari Urdu library se milana
export function matchDisease(apiName = '', apiScientific = '', crop) {
  const text = (apiName + ' ' + apiScientific).toLowerCase()
  const pool = crop ? [...diseasesFor(crop), ...DISEASES] : DISEASES
  return pool.find((d) => d.keywords.some((k) => text.includes(k))) || null
}

// Bolne ke liye poora paighaam
export function resultSpeech(d) {
  if (d.id === 'healthy') return `${d.name}۔ ${d.steps.join('۔ ')}`
  if (d.id === 'unknown') return `${d.symptoms} ${d.steps.join('۔ ')}`
  return `آپ کی فصل میں ${d.name} ہے۔ ${d.symptoms} کیا کریں: ${d.steps.join('۔ ')}`
}
