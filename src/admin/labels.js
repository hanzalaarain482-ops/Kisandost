import { DISEASES, SYMPTOMS } from '../diseases.js'

const cropEn = { wheat: 'Wheat', cotton: 'Cotton', rice: 'Rice' }

// Bimari / label ID → admin ke liye English naam
export function labelName(id) {
  if (!id) return '—'
  if (id === 'healthy') return 'Healthy'
  if (id.startsWith('healthy_')) return 'Healthy (' + (cropEn[id.slice(8)] || id.slice(8)) + ')'
  if (id === 'sym_no_leaf') return 'Leaf not visible'
  const d = DISEASES.find((x) => x.id === id) || Object.values(SYMPTOMS).find((x) => x.id === id)
  return d ? d.english : id
}
