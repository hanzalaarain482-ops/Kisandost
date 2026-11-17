// Voice artist ke liye script: har line = file ka naam + kya bolna hai
// Chalayein: npm run audio:list  →  voice-script.csv
import { writeFileSync } from 'node:fs'
import { ALL_PHRASES } from '../src/phrases.js'

const q = (s) => '"' + String(s).replace(/"/g, '""') + '"'
const lines = ['file_name,text_to_read']
for (const [id, text] of Object.entries(ALL_PHRASES)) lines.push(`${q(id + '.mp3')},${q(text)}`)
writeFileSync('voice-script.csv', '﻿' + lines.join('\n') + '\n')
console.log(`voice-script.csv: ${lines.length - 1} lines`)
