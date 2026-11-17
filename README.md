# کسان دوست · Kisan Dost

Pakistani kisanon ke liye app: fasal ki photo se bimari pehchanein, mandi rates dekhein, mausam ka alert lein, aur expert se baat karein.
Yeh app un logon ke liye bhi bani hai jo padhna nahi jaante: bade tasveeron wale buttons, har cheez awaaz mein sunne ka option, aur mic se bol kar chalane ki suvidha.

## Kya kya bana hua hai (MVP / demo)

**Kisan app** (mobile, Urdu, RTL)
- Zubaan chunein: Urdu / Punjabi / Saraiki
- Login: sirf mobile number + 4 digit code (bade number pad ke saath, kuch likhna nahi padta). Demo code: `1234`
- Home: 4 bade rangeen buttons — Fasal check, Mandi rate, Mausam, Expert se madad — aur mic button (bol kar "mandi" ya "mausam" kahein)
- Fasal check: camera se photo → nateeja (laal = bimari, hara = theek) → ilaaj awaaz mein
- Mandi rates: fasal ki tasveer, bada rate, upar/neeche ka rang wala nishan; dabane par rate bol kar sunata hai
- Mausam: aaj ka mausam, 5 din, "aaj spray kar sakte hain / nahi"
- Madad: expert ko phone ya WhatsApp

**Admin panel** — `/#admin`
- Demo login: `admin@kisandost.pk` / `admin123`
- Dashboard: kisan, scans, district ke hisaab se bimari, alert bhejna, data sources, partners
- Mandi rates update (save karte hi kisan app mein nazar aate hain)
- Expert review: jin scans par AI ka confidence 70% se kam ho

> Sab numbers aur AI nateeja abhi **demo** hain. Backend lagna baaki hai.

## Chalane ka tareeqa

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ folder bana dega (kisi bhi static hosting par daal dein)
```

## Agle qadam (asli app banane ke liye)

1. **Backend:** Firebase ya Supabase — Phone OTP login, database (kisan, scans, rates), photo storage
2. **AI:** plant disease model (PlantVillage dataset par trained) → baad mein Pakistani kheton ki photos se behtar
3. **Mausam:** Open-Meteo API (free) district ke hisaab se
4. **Mandi rates:** sarkari market data + har mandi mein ek local reporter (admin panel se update)
5. **Awaaz:** abhi browser ki TTS; behtar Urdu awaaz ke liye Google Cloud Text-to-Speech
6. **Android app:** isi React code ko Capacitor se APK bana kar Play Store par

## Tech
React 19 + Vite · Noto Naskh Arabic font · Web Speech API (bolna/sunna)
