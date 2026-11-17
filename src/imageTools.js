// Photo ko chhota karna aur check karna ke dhundli ya andheri to nahi.
// Sab kuch phone par hi hota hai, internet nahi chahiye.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = reject
    img.src = url
  })
}

// Photo ko max 1024px kar ke JPEG base64 banana (upload chhota aur tez)
function toJpeg(img, max = 1024) {
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d').drawImage(img, 0, 0, w, h)
  return c.toDataURL('image/jpeg', 0.85)
}

// Roshni aur sharpness check (Laplacian variance)
function quality(img) {
  const S = 256
  const scale = S / Math.max(img.width, img.height)
  const w = Math.max(8, Math.round(img.width * scale))
  const h = Math.max(8, Math.round(img.height * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const gray = new Float32Array(w * h)
  let sum = 0
  let green = 0
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const y = 0.299 * r + 0.587 * g + 0.114 * b
    gray[p] = y
    sum += y
    if (g > r && g > b) green++
  }
  const brightness = sum / (w * h)

  let lapSum = 0
  let lapSq = 0
  let n = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const v = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w]
      lapSum += v
      lapSq += v * v
      n++
    }
  }
  const mean = lapSum / n
  const sharpness = lapSq / n - mean * mean

  return { brightness, sharpness, greenShare: green / (w * h) }
}

// Hadd (thresholds) — asli photos dekh kar baad mein adjust karein
export const LIMITS = { dark: 45, bright: 235, blurry: 60 }

export async function preparePhoto(file) {
  const { img, url } = await loadImage(file)
  const q = quality(img)
  let problem = null
  if (q.brightness < LIMITS.dark) problem = 'dark'
  else if (q.brightness > LIMITS.bright) problem = 'bright'
  else if (q.sharpness < LIMITS.blurry) problem = 'blurry'
  return { previewUrl: url, img, base64: toJpeg(img), quality: q, problem }
}
