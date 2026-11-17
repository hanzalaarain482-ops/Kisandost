# Data aur Awaaz — kahan se, kaise

## 1. Photo se bimari kaise pehchani jaati hai (sab phone par, koi API nahi)

```
Photo → (phone) dhundli / andheri / bohat roshan? → dobara photo
      → (phone) apna AI model hai? (public/model/meta.json)
            haan, yaqeen ≥ 70% → bimari + fasal  ("AI")
      → warna rang ki jaanch (src/analyzer/color.js):
            hara / peela / bhure dhabbe / naranji daane ka hissa
            → alamat (kungi jaise daane / peelahat / dhabbe) + mumkina bimariyan ("رنگ")
            → photo expert review mein
      → photo + nateeja server par: data/uploads + data/scans.json
      → expert Admin → Expert Review mein sahi bimari chunta hai → data/labels.json
      → npm run dataset → Colab notebook → naya model → public/model
```

- Rang ki hadd (thresholds): `src/analyzer/color.js` → `COLOR_LIMITS` — asli photos dekh kar adjust karein.
- Model: `src/analyzer/model.js` (TensorFlow.js; library sirf tab download hoti hai jab model maujood ho).
- Training: [`training/`](../training/README.md).

### Shuruaati photos ke free datasets
- **PlantVillage** — 54,303 photos, 38 classes (zyada tar tamatar/aalu/makai; lab jaisi photos).
- **PlantCity (Pakistan)** — 10,667 photos, 52 classes.
- **Cotton leaf disease dataset** — 2,137 field photos.
- **Rice (Chenab ke qareeb)** — ~1,700 mobile photos.

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
