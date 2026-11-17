# Data aur Awaaz — kahan se, kaise

## 1. Photo se bimari kaise pehchani jaati hai

```
Kisan fasal chunta hai → photo leta hai
   → (phone par) photo dhundli / andheri / bohat roshan? → dobara photo
   → (phone par) photo chhoti (1024px JPEG)
   → /api/diagnose (server)  → Crop.health AI (Kindwise)
   → AI ka jawab: bimari ka English/scientific naam + yaqeen (%)
   → src/diseases.js mein `keywords` se Urdu entry dhoondi jaati hai
   → yaqeen 70% se kam ya match nahi → "Expert Review" (admin panel)
   → warna: Urdu naam, nishaniyan, ilaaj, bachao + awaaz
```

- Code: `src/imageTools.js` (quality check), `src/diagnose.js` (faisla), `api/diagnose.js` (server).
- **API key:** admin.kindwise.com se lein → Vercel → Settings → Environment Variables → `KINDWISE_API_KEY`.
  Key na ho to app **demo nateeja** dikhati hai (screen par "ڈیمو نتیجہ" likha aata hai).
- `npm run dev` mein server function nahi chalta (demo mode). Asli test: `npx vercel dev` ya Vercel par deploy.

### Baad mein apna AI model (API ka kharcha khatam)
Photos ke free datasets:
- **PlantVillage** — 54,303 photos, 38 classes (zyada tar tamatar/aalu/makai; lab jaisi photos).
- **PlantCity (Pakistan)** — 10,667 photos, 52 classes.
- **Cotton leaf disease dataset** — 2,137 field photos (experts ki nigrani mein).
- **Rice (Chenab ke qareeb)** — ~1,700 mobile photos.
- **Apna data:** har scan ki photo save karein; expert admin panel mein sahi label lagaye.

Tareeqa: MobileNet / EfficientNet (pehle se trained) + transfer learning, Google Colab par →
TensorFlow Lite → phone ke andar (internet ke baghair chalega).

## 2. Bimariyon ki maloomat (ilaaj)

- File: `src/diseases.js` — gandum (4), kapaas (4), chawal (5).
- Har entry **`verified: false`** hai. Launch se pehle zarai expert check kare.
- Dawai ka naam/miqdaar jaan boojh kar nahi likha — local expert batayega.
- Hawale: Mehkma Zaraat Punjab ki Crop Advisory (agripunjab.punjab.gov.pk), zarai university experts.

## 3. Awaaz

App ka har bola jaane wala paighaam `src/phrases.js` mein ek **ID** ke saath hai (40 paighaam).

Chalne ka order:
1. `public/audio/<zubaan>/<ID>.mp3` (ya .webm) maujood → **woh recording**
2. warna Urdu recording
3. warna **phone ki machine awaaz** (TTS)

Recording banane ke 3 tareeqe:

| Tareeqa | Kaise | Kab |
|---|---|---|
| Insaani awaaz (behtareen) | `npm run audio:list` → `voice-script.csv` voice artist ko dein; woh har line `file_name` ke naam se record kare | Gaon ke logon ke liye sabse samajh mein aane wali |
| Admin panel | `/#admin` → **Voice** → Record → Download | Khud jaldi test karne ke liye |
| Google Cloud TTS | `GOOGLE_TTS_KEY=... npm run audio:google` (ur-IN voice) | Fauran saari files chahiye hon |

Files `public/audio/ur/` (ya `pa/`, `sk/`) mein daalein → `npm run audio:manifest`
(`npm run build` yeh khud bhi chalata hai).

Mandi ke badalte rates jaisi cheezein seedha TTS se boli jaati hain.
