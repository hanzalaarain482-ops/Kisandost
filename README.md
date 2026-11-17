# کسان دوست · Kisan Dost

Pakistani kisanon ke liye app: fasal ki photo se bimari pehchanein, mandi rates dekhein, mausam ka alert lein, aur expert se baat karein.
Yeh app un logon ke liye bhi bani hai jo padhna nahi jaante: bade tasveeron wale buttons, har cheez awaaz mein sunne ka option, aur mic se bol kar chalane ki suvidha.

## Kya kya bana hua hai (MVP / demo)

**Kisan app** (mobile, Urdu, RTL)
- Zubaan chunein: Urdu / Punjabi / Saraiki
- Login: sirf mobile number + 4 digit code (bade number pad ke saath, kuch likhna nahi padta). Demo code: `1234`
- Home: 4 bade rangeen buttons — Fasal check, Mandi rate, Mausam, Expert se madad — aur mic button (bol kar "mandi" ya "mausam" kahein)
- Fasal check: fasal chunein (gandum / kapaas / chawal) → photo → dhundli/andheri photo par wapas → AI nateeja (laal = bimari, hara = theek, peela = expert ko bheja) → nishaniyan, ilaaj, bachao — sab awaaz mein
- Bimariyon ki Urdu library: 13 bimariyan/keede (`src/diseases.js`)
- Awaaz: pehle insaani recording, na ho to machine awaaz — poori tafseel [docs/DATA.md](docs/DATA.md)
- Mandi rates: fasal ki tasveer, bada rate, upar/neeche ka rang wala nishan; dabane par rate bol kar sunata hai
- Mausam: aaj ka mausam, 5 din, "aaj spray kar sakte hain / nahi"
- Madad: expert ko phone ya WhatsApp

**Admin panel** — `/#admin`
- Demo login: `admin@kisandost.pk` / `admin123`
- Dashboard: kisan, scans, district ke hisaab se bimari, alert bhejna, data sources, partners
- Mandi rates update (save karte hi kisan app mein nazar aate hain)
- Expert review: jin scans par AI ka confidence 70% se kam ho
- Disease Library: saari bimariyan + "verified" status
- Voice: har paighaam sunein, apni awaaz mein record karein, voice artist ke liye script download

## Asli AI aur awaaz chalu karna

| Cheez | Kya karna hai |
|---|---|
| Photo AI | admin.kindwise.com se key → Vercel env var `KINDWISE_API_KEY` |
| Awaaz (Google) | `GOOGLE_TTS_KEY=... npm run audio:google` |
| Awaaz (insaani) | `npm run audio:list` → CSV voice artist ko → files `public/audio/ur/` mein |

> Sab numbers aur AI nateeja abhi **demo** hain. Backend lagna baaki hai.

## Chalane ka tareeqa

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ folder bana dega (kisi bhi static hosting par daal dein)
```

## Agle qadam (asli app banane ke liye)

1. **Expert verification:** `src/diseases.js` ki har entry zarai expert se check karwayein
2. **Backend:** Firebase ya Supabase — Phone OTP login, database (kisan, scans, rates), photo storage
3. **Apna AI model:** jama shuda photos + Pakistani datasets se (docs/DATA.md)
4. **Mausam:** Open-Meteo API (free) district ke hisaab se
5. **Mandi rates:** sarkari market data + har mandi mein ek local reporter (admin panel se update)
6. **Android app:** isi React code ko Capacitor se APK bana kar Play Store par

## Tech
React 19 + Vite · Noto Naskh Arabic font · Web Speech API (bolna/sunna)
