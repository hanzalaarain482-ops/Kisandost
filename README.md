# کسان دوست · Kisan Dost

Pakistani kisanon ke liye app: fasal ki photo se bimari pehchanein, mandi rates dekhein, mausam ka alert lein, aur expert se baat karein.
Yeh app un logon ke liye bhi bani hai jo padhna nahi jaante: bade tasveeron wale buttons, har cheez awaaz mein sunne ka option, aur mic se bol kar chalane ki suvidha.

## Kya kya bana hua hai (MVP / demo)

**Kisan app** (mobile, Urdu, RTL, phone mein install ho sakti hai — PWA)
- Zubaan chunein: Urdu / Punjabi / Saraiki
- Login: mobile number → **WhatsApp par 4 digit code**; na aaye to admin ka demo code (default `1234`)
- Home: 4 bade rangeen buttons — Fasal check, Mandi rate, Mausam, Expert se madad — aur mic button (bol kar "mandi" ya "mausam" kahein)
- Fasal check: photo → **fasal aur bimari dono AI khud pehchanta hai** (chahein to fasal khud bhi chun sakte hain) → photo → dhundli/andheri photo par wapas → AI nateeja (laal = bimari, hara = theek, peela = expert ko bheja) → nishaniyan, ilaaj, bachao — sab awaaz mein
- Bimariyon ki Urdu library: 13 bimariyan/keede (`src/diseases.js`)
- Awaaz: pehle insaani recording, na ho to machine awaaz — poori tafseel [docs/DATA.md](docs/DATA.md)
- Mandi rates: fasal ki tasveer, bada rate, upar/neeche ka rang wala nishan; dabane par rate bol kar sunata hai
- Mausam: aaj ka mausam, 5 din, "aaj spray kar sakte hain / nahi"
- Madad: expert ko phone ya WhatsApp

**Admin panel** — `/#admin`
- Login: live par `ADMIN_PASSWORD`, local demo par `admin123`
- **Login / OTP** settings: WhatsApp OTP aur demo code ka control
- Dashboard: kisan, scans, district ke hisaab se bimari, alert bhejna, data sources, partners
- Mandi rates update (save karte hi kisan app mein nazar aate hain)
- Expert review: jin scans par AI ka confidence 70% se kam ho
- Disease Library: saari bimariyan + "verified" status
- Voice: har paighaam sunein, apni awaaz mein record karein, voice artist ke liye script download

## Live karna (Vercel) — Environment Variables

Vercel → Project → Settings → Environment Variables:

| Variable | Kis liye | Kahan se |
|---|---|---|
| `ADMIN_PASSWORD` | Admin panel ka password | Khud rakhein (mazboot) |
| `OTP_SECRET` | OTP code ko sign karna | Koi bhi lamba random text |
| `WHATSAPP_TOKEN` | WhatsApp par OTP | Meta for Developers → WhatsApp → API Setup (permanent token) |
| `WHATSAPP_PHONE_ID` | Bhejne wala number | Wahi page: "Phone number ID" |
| `WHATSAPP_TEMPLATE` | Approved **Authentication** template ka naam | WhatsApp Manager → Message templates (copy-code button) |
| `WHATSAPP_TEMPLATE_LANG` | Template ki zubaan (default `en`) | Template ki language code |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Admin settings save karna (demo code on/off) | upstash.com (free Redis) |
| `DEMO_OTP_CODE`, `DEMO_OTP_ENABLED`, `SHOW_DEMO_CODE` | Upstash na ho to default demo settings | Khud |
| `KINDWISE_API_KEY` | Photo se fasal + bimari (asli AI) | admin.kindwise.com |

### Login kaise chalta hai
1. Kisan number daalta hai → `/api/otp-send` WhatsApp par 4 digit code bhejta hai
2. Kisan code likhta hai → `/api/otp-verify` check karta hai → login
3. Code na aaye → **"کوڈ نہیں آیا؟ ڈیمو کوڈ لگائیں"** (sirf jab admin ne on kiya ho)
4. Admin → **Login / OTP** page: WhatsApp on/off, demo code on/off, code badlein, kisan ko dikhayein ya nahi

### Awaaz
| Tareeqa | Kya karna hai |
|---|---|
| Google | `GOOGLE_TTS_KEY=... npm run audio:google` |
| Insaani | `npm run audio:list` → CSV voice artist ko → files `public/audio/ur/` mein |

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
