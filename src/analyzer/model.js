// =====================================================================
// APNA AI MODEL (TensorFlow.js) — phone ke andar chalta hai, internet nahi chahiye
// ---------------------------------------------------------------------
// Model files `public/model/` mein:
//   meta.json   { "format": "graph"|"layers", "size": 224, "labels": [...], "normalize": "mobilenet_v2" }
//   model.json + *.bin   (training/ notebook se banti hain)
// Labels = bimari ki IDs (src/diseases.js) ya "healthy_wheat" jaise.
// Model na ho to app khud rang ki jaanch (color.js) par chalti hai.
// =====================================================================

let state = null // { tf, model, meta } | false (model nahi)

export async function loadModel() {
  if (state !== null) return state
  try {
    const r = await fetch('./model/meta.json', { cache: 'no-cache' })
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error('no model')
    const meta = await r.json()
    if (!Array.isArray(meta.labels) || !meta.labels.length) throw new Error('bad meta')
    const tf = await import('@tensorflow/tfjs') // sirf tab download hota hai jab model ho
    const url = './model/model.json'
    const model = meta.format === 'layers' ? await tf.loadLayersModel(url) : await tf.loadGraphModel(url)
    state = { tf, model, meta }
  } catch {
    state = false
  }
  return state
}

export async function hasModel() {
  return !!(await loadModel())
}

export async function predict(img) {
  const s = await loadModel()
  if (!s) return null
  const { tf, model, meta } = s
  const size = meta.size || 224
  const probs = tf.tidy(() => {
    let x = tf.browser.fromPixels(img).toFloat()
    // beech ka square kaat kar size x size
    const [h, w] = x.shape
    const m = Math.min(h, w)
    x = x.slice([Math.floor((h - m) / 2), Math.floor((w - m) / 2), 0], [m, m, 3])
    x = tf.image.resizeBilinear(x, [size, size])
    if (meta.normalize === 'mobilenet_v2') x = x.div(127.5).sub(1)
    else if (meta.normalize === 'zero_one') x = x.div(255)
    const out = model.predict(x.expandDims(0))
    const t = Array.isArray(out) ? out[0] : out
    return meta.softmax === false ? t.softmax().dataSync() : t.dataSync()
  })
  return Array.from(probs)
    .map((p, i) => ({ label: meta.labels[i], p }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3)
}
