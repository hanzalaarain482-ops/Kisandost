// =====================================================================
// RANG KI JAANCH (Color analysis) — 100% phone par, koi API / internet nahi
// ---------------------------------------------------------------------
// Patte ke pixels ko gin kar dekhta hai: kitna hara (sehatmand), kitna peela,
// kitna bhura (dhabbe), kitna naranji (kungi ka powder).
// Yeh AI model jitna pakka nahi — is liye nateeja "ممکنہ" (possible) kehlata hai
// aur photo expert review mein bhi jaati hai. Model train hone ke baad woh pehle chalega.
// =====================================================================

function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, max ? d / max : 0, max]
}

// Hadd (thresholds) — asli khet ki photos dekh kar adjust karein
export const COLOR_LIMITS = {
  minLeaf: 0.2, // photo ka kam az kam 20% patta ho
  rust: 0.02, // naranji dhabbe (patte ka 2%)
  yellow: 0.15, // peelahat
  brown: 0.07, // bhure/kaale dhabbe
}

export function analyzeColors(img) {
  const S = 320 // zyada resolution taake chhote dhabbe gum na hon
  const scale = S / Math.max(img.width, img.height)
  const w = Math.max(16, Math.round(img.width * scale))
  const h = Math.max(16, Math.round(img.height * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  let green = 0, yellow = 0, brown = 0, rust = 0, total = 0
  for (let i = 0; i < data.length; i += 4) {
    const [hh, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2])
    total++
    if (v < 0.12 || s < 0.15) continue // saya, aasman, mitti ka safed/grey
    if (hh >= 70 && hh <= 170 && v > 0.18) green++
    else if (hh >= 42 && hh < 70 && s > 0.3 && v > 0.35) yellow++
    else if (hh >= 15 && hh < 42 && s > 0.55 && v > 0.55) rust++
    else if (hh >= 5 && hh < 42 && v <= 0.6) brown++
  }
  const leaf = green + yellow + brown + rust
  const leafShare = leaf / total
  const r = (n) => (leaf ? n / leaf : 0)
  return {
    leafShare,
    green: r(green),
    yellow: r(yellow),
    brown: r(brown),
    rust: r(rust),
  }
}

// Rang se "alamat" (symptom) ka faisla
export function colorVerdict(c) {
  const L = COLOR_LIMITS
  if (c.leafShare < L.minLeaf) return { symptom: 'no_leaf', score: 0 }
  const scores = [
    ['rust', c.rust / L.rust],
    ['yellowing', c.yellow / L.yellow],
    ['spots', c.brown / L.brown],
  ].sort((a, b) => b[1] - a[1])
  const [symptom, score] = scores[0]
  if (score < 1) return { symptom: 'healthy', score: Math.min(0.9, 0.6 + c.green * 0.3) }
  // score 1 → ~55%, 3+ → ~80% (rang se itna hi yaqeen theek hai)
  return { symptom, score: Math.min(0.8, 0.45 + 0.12 * score) }
}
