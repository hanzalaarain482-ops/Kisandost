// DEMO DATA — asli app mein yeh sab server (Firebase/Supabase) se aayega.

export const crops = [
  { id: 'wheat', name: 'گندم', emoji: '🌾', price: 3950, change: 'up', unit: '40 کلو' },
  { id: 'cotton', name: 'کپاس', emoji: '☁️', price: 8200, change: 'down', unit: '40 کلو' },
  { id: 'rice', name: 'چاول', emoji: '🍚', price: 6400, change: 'same', unit: '40 کلو' },
  { id: 'maize', name: 'مکئی', emoji: '🌽', price: 2300, change: 'up', unit: '40 کلو' },
  { id: 'potato', name: 'آلو', emoji: '🥔', price: 1600, change: 'down', unit: '40 کلو' },
  { id: 'onion', name: 'پیاز', emoji: '🧅', price: 2900, change: 'up', unit: '40 کلو' },
]

export const weather = {
  city: 'ساہیوال',
  today: { type: 'sun', temp: 24, text: 'دھوپ' },
  sprayOk: true,
  days: [
    { day: 'آج', type: 'sun', temp: 24 },
    { day: 'کل', type: 'cloud', temp: 22 },
    { day: 'جمعرات', type: 'rain', temp: 19 },
    { day: 'جمعہ', type: 'cloud', temp: 21 },
    { day: 'ہفتہ', type: 'sun', temp: 23 },
  ],
  alert: 'جمعرات کو بارش ہوگی۔ اس دن اسپرے نہ کریں۔',
}

export const HELPLINE = '0300-0000000' // [APNA HELPLINE NUMBER]

export function formatPrice(n) {
  return n.toLocaleString('en-PK')
}
