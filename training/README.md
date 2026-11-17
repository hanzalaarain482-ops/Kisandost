# Apna AI model banana

1. Kisan app se photos aati hain → `data/uploads/` mein save hoti hain
2. Admin panel → **Expert Review** → har photo par sahi bimari chunein → `data/labels.json`
3. `npm run dataset` → `dataset/<bimari>/*.jpg` ban jaata hai → `dataset` folder zip karein
4. [`train_kisan_dost.ipynb`](train_kisan_dost.ipynb) Google Colab mein kholein (File → Upload notebook), GPU on, cells chalayein
5. `kisan_model.zip` → unzip → `public/model/` mein (`meta.json`, `model.json`, `*.bin`)
6. `npm run build` → app ab **AI model** se jawab degi (nateeje par "AI" likha aayega)

Jab tak model nahi, app **rang ki jaanch** (`src/analyzer/color.js`) se kaam karti hai.

**Kitni photos?** Har bimari ki kam az kam 50–100, alag alag khet, roshni aur fasal ki umar se.
Jitni zyada photos, utna sahi model. Har mahine naye labels ke saath dobara train karein.

**Muft datasets (shuru karne ke liye):** PlantCity (Pakistan, 52 classes), Cotton leaf disease (2,137 photos),
Rice (Chenab) — photos ko upar wale label naamon ke folders mein rakh kar `dataset` mein shamil karein.
