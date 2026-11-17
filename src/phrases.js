// =====================================================================
// APP KE SAARE BOLE JAANE WALE PAIGHAAM
// ---------------------------------------------------------------------
// Har paighaam ki ek ID hai. Agar `public/audio/<lang>/<ID>.mp3` (ya .webm)
// maujood ho to app woh recording chalati hai, warna phone ki awaaz (TTS).
//
// Recording ke 3 tareeqe:
//  1. Admin panel → "Voice" page par khud record karein
//  2. `npm run audio:list` → CSV voice artist ko dein, woh isi ID naam se record kare
//  3. `npm run audio:google` → Google Cloud TTS se khud-ba-khud MP3 ban jaayein
// =====================================================================
import { DISEASES, HEALTHY, UNKNOWN, SYMPTOMS, NO_LEAF, resultSpeech } from './diseases.js'

export const SCREEN_PHRASES = {
  welcome: 'کسان دوست میں خوش آمدید۔ تصویر لینے کے لیے سبز بٹن دبائیں',
  pick_language_ur: 'آپ نے اردو چنی ہے',
  pick_language_pa: 'تسی پنجابی چنی اے',
  pick_language_sk: 'تساں سرائیکی چنی اے',
  enter_phone: 'اپنا موبائل نمبر لکھیں',
  enter_code: 'آپ کے فون پر آیا ہوا چار نمبر کا کوڈ لکھیں',
  wrong_code: 'کوڈ غلط ہے، دوبارہ لکھیں',
  code_resent: 'کوڈ دوبارہ بھیج دیا گیا ہے',
  whatsapp_sent: 'کوڈ آپ کے واٹس ایپ پر بھیج دیا گیا ہے۔ وہ چار نمبر یہاں لکھیں',
  whatsapp_failed: 'واٹس ایپ پر کوڈ نہیں جا سکا۔ تھوڑی دیر بعد دوبارہ بھیجیں',
  demo_code_used: 'ڈیمو کوڈ لگا دیا گیا ہے',
  ask_admin_code: 'ڈیمو کوڈ ایڈمن سے لے کر یہاں لکھیں',
  login_ok: 'خوش آمدید',
  pick_crop: 'کون سی فصل ہے؟ تصویر پر انگلی رکھیں',
  take_photo: 'بیمار پتے کے قریب جا کر تصویر لیں',
  auto_scan: 'پتے کی تصویر لیں۔ فصل اور بیماری خود پہچانی جائے گی',
  checking: 'تصویر چیک ہو رہی ہے، انتظار کریں',
  photo_dark: 'تصویر اندھیری ہے۔ روشنی میں دوبارہ تصویر لیں',
  photo_bright: 'تصویر میں روشنی بہت زیادہ ہے۔ سائے میں دوبارہ تصویر لیں',
  photo_blurry: 'تصویر دھندلی ہے۔ فون کو ہلائے بغیر دوبارہ تصویر لیں',
  sent_to_expert: 'آپ کی تصویر ماہر کو بھیج دی گئی ہے۔ وہ جلد جواب دیں گے',
  mandi_intro: 'منڈی کے ریٹ۔ کسی بھی فصل کو دبائیں تو ریٹ سنیں',
  help_intro:
    'زرعی ماہر سے بات کرنے کے لیے نارنجی بٹن دبائیں۔ واٹس ایپ پر تصویر بھیجنے کے لیے سبز بٹن دبائیں',
  tap_speaker: 'ہر بٹن کے ساتھ سپیکر کا نشان ہے، اسے دبائیں تو آواز میں سنیں',
  not_understood: 'سمجھ نہیں آیا، دوبارہ بولیں',
  use_buttons: 'بٹن دبا کر استعمال کریں',
  nav_scan: 'فصل کی تصویر لیں',
  nav_mandi: 'منڈی کے ریٹ',
  nav_weather: 'موسم',
  nav_help: 'ماہر سے مدد',
}

// Bimariyon ke paighaam: ID = bimari ki ID (jaise wheat_yellow_rust)
export const DISEASE_PHRASES = Object.fromEntries(
  [...DISEASES, HEALTHY, UNKNOWN, NO_LEAF, ...Object.values(SYMPTOMS)].map((d) => [d.id, resultSpeech(d)]),
)

export const ALL_PHRASES = { ...SCREEN_PHRASES, ...DISEASE_PHRASES }
