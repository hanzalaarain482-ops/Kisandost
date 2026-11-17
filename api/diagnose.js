// =====================================================================
// /api/diagnose — Server function (Vercel par khud chalta hai)
// ---------------------------------------------------------------------
// Phone photo yahan bhejta hai → hum Crop.health (Kindwise) AI ko bhejte hain
// → jawab wapas. API KEY server par rehti hai, phone mein kabhi nahi.
//
// Setup: Vercel → Project → Settings → Environment Variables
//   KINDWISE_API_KEY = (admin.kindwise.com se mili hui key)
// Key na ho to { mode: 'demo' } wapas jaata hai aur app demo nateeja dikhati hai.
//
// Docs: https://crop.kindwise.com  (request/response check kar lein,
// field names API version ke saath badal sakte hain)
// =====================================================================

const ENDPOINT = 'https://crop.kindwise.com/api/v1/identification'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' })
    return
  }

  const key = process.env.KINDWISE_API_KEY
  if (!key) {
    res.status(200).json({ mode: 'demo' })
    return
  }

  try {
    const { image, latitude, longitude } = req.body || {}
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'image (base64) required' })
      return
    }

    const body = { images: [image], similar_images: false }
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      body.latitude = latitude
      body.longitude = longitude
    }

    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': key },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      res.status(502).json({ error: 'AI service error', status: r.status })
      return
    }
    const data = await r.json()
    const result = data.result || {}

    const diseases = (result.disease?.suggestions || []).slice(0, 3).map((s) => ({
      name: s.name || '',
      scientific: s.scientific_name || s.details?.scientific_name || '',
      probability: typeof s.probability === 'number' ? s.probability : 0,
    }))
    const crops = (result.crop?.suggestions || []).slice(0, 2).map((s) => ({
      name: s.name || '',
      probability: s.probability || 0,
    }))
    const healthy =
      result.is_healthy?.binary ??
      (typeof result.is_healthy?.probability === 'number' ? result.is_healthy.probability > 0.5 : null)

    res.status(200).json({ mode: 'live', healthy, diseases, crops })
  } catch (e) {
    res.status(500).json({ error: 'server error' })
  }
}

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } }
