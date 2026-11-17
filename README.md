# کسان دوست · Kisan Dost

Pakistani kisanon ke liye app: patte ki photo se bimari pehchanein, mandi rates dekhein, mausam ka alert lein, aur expert se baat karein.
Un logon ke liye bhi jo padhna nahi jaante: bade tasveeron wale buttons, har cheez awaaz mein, aur mic se bol kar chalana.

**Kisi bahar ki API ki zaroorat nahi** — photo ka analysis phone par hota hai, aur saara data aapki apni files mein save hota hai.

## Chalana

```bash
npm install
npm run build
npm start          # http://localhost:3000      admin: http://localhost:3000/#admin
```

- Pehla admin password: **`admin123`** → admin panel → **Settings** mein foran badlein
- Kisan login: koi bhi number → WhatsApp code (keys lagne ke baad) ya admin ka **demo code** (default `1234`)
- `npm run dev` sirf design dekhne ke liye hai (server nahi chalta, data browser mein rehta hai)

## Data kahan save hota hai — `data/` folder

| File | Kya hai |
|---|---|
| `settings.json` | OTP / demo code settings (admin se) |
| `admin.json` | Admin password (hash — saaf text nahi) |
| `rates.json` | Mandi rates (admin se) |
| `farmers.json` | Login karne wale kisan |
| `scans.json` | Har photo check ka record |
| `uploads/*.jpg` | Kisanon ki photos |
| `labels.json` | Expert ne photo ko jo sahi bimari batayi (model training) |

Folder badalna ho to `DATA_DIR=/path npm start`. **Backup ke liye bas `data/` folder copy karein.**

> Hosting: koi bhi jagah jahan Node chal sake aur files save rahein — VPS (DigitalOcean / Hostinger VPS), Render (disk ke saath), Railway (volume ke saath), ya apna PC.
> Vercel / Netlify jaisi "serverless" hosting par files save **nahi** rehti.

## Photo ka analysis (apna, phone par)

1. **Apna AI model** (`public/model/`) ho → woh bimari aur fasal dono pehchanta hai (nateeje par "AI")
2. Model na ho → **rang ki jaanch**: hara / peela / bhure dhabbe / naranji daane gin kar alamat aur mumkina bimariyan batata hai (nateeje par "رنگ"), aur photo expert review mein jaati hai
3. Har photo `data/uploads/` mein save → admin **Expert Review** mein sahi bimari chunta hai → `labels.json`
4. `npm run dataset` → [training notebook](training/) (Google Colab, free) → model → `public/model/` → `npm run build`

Is tarah jitna app chalegi, utna model behtar hota jaayega.

## Kisan app
- Zubaan: Urdu / Punjabi / Saraiki
- Login: number → WhatsApp code; na aaye to admin ka demo code
- Home: bada "fasal check" card, mandi, mausam, madad; neeche bar mein mic (bol kar "mandi", "mausam")
- Fasal check: photo → dhundli/andheri photo par wapas → nateeja, nishaniyan, ilaaj, bachao — sab awaaz mein
- Phone mein install ho sakti hai (PWA), poori screen

## Admin panel (`/#admin`)
- Dashboard: asli kisan, scans, photos, sab se zyada bimariyan
- Expert Review: photo dekh kar sahi bimari → training data
- Disease Library, Voice (recordings), Mandi Rates
- Settings: WhatsApp OTP on/off, demo code on/off + code, kisan ko dikhayein ya nahi, admin password

## Baad mein (env variables)

| Variable | Kis liye |
|---|---|
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TEMPLATE` | WhatsApp par asli OTP (Meta Cloud API, "Authentication" template) |
| `WHATSAPP_TEMPLATE_LANG` | Template ki zubaan (default `en`) |
| `PORT`, `DATA_DIR` | Server port, data folder |
| `GOOGLE_TTS_KEY` | `npm run audio:google` se Urdu awaaz ki MP3 |

## Awaaz
| Tareeqa | Kya karna hai |
|---|---|
| Insaani | `npm run audio:list` → CSV voice artist ko → files `public/audio/ur/` mein |
| Admin panel | Voice page → Record → Download |
| Google | `GOOGLE_TTS_KEY=... npm run audio:google` |

Tafseel: [docs/DATA.md](docs/DATA.md)

## Zaroori
- `src/diseases.js` ki har bimari launch se pehle zarai expert se verify karwayein (`verified: true`)
- Rang ki jaanch sirf ishara deti hai, pakka faisla nahi — is liye har aisa nateeja expert ke paas bhi jaata hai

## Tech
React 19 + Vite · Node server (koi extra package nahi) · TensorFlow.js (phone par AI) · Web Speech API
