# ECBA Prep AI 🎓

**[English]** An AI-powered web app to help you prepare for the **ECBA (Entry Certificate in Business Analysis)** exam by IIBA — completely free.

**[Bahasa Indonesia]** Aplikasi web berbasis AI untuk membantu kamu mempersiapkan ujian **ECBA (Entry Certificate in Business Analysis)** dari IIBA — sepenuhnya gratis.

---

## ✨ Features / Fitur

| | English | Bahasa Indonesia |
|---|---|---|
| 📚 | Practice by Domain — Generate situational MCQs for each of the 9 ECBA blueprint domains | Latihan per Domain — Generate soal situasional untuk masing-masing dari 9 domain blueprint ECBA |
| 🎯 | Full Exam Simulation — 50 questions, 75-minute countdown, all domains proportionally covered | Simulasi Ujian Penuh — 50 soal, hitung mundur 75 menit, semua domain proporsional |
| 🌐 | Bilingual Explanations — Toggle between English and Bahasa Indonesia for every answer | Penjelasan Bilingual — Toggle antara Bahasa Inggris dan Indonesia untuk setiap jawaban |
| 📊 | Session History — Track your progress and spot weak areas per domain | Riwayat Sesi — Lacak progres dan temukan domain yang masih lemah |
| ⚡ | Zero prompting — Just pick a domain and hit Generate | Tanpa prompt — Pilih domain, klik Generate, selesai |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| AI | Google Gemini API (free tier) |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |

**EN:** Everything runs on free tiers. Both Gemini API and Firestore quotas reset daily at midnight Pacific Time — more than enough for a daily study session.

**ID:** Semua berjalan di free tier. Kuota Gemini API dan Firestore sama-sama reset setiap hari tengah malam waktu Pacific — lebih dari cukup untuk sesi belajar harian.

---

## 🚀 How to Run / Cara Menjalankan

### Prerequisites / Prasyarat

- Node.js 18+
- A Google account / Akun Google

---

### Step 1 — Clone the repo / Clone repositori

**EN:**
Clone this repository to your local computer. Make sure you have [Git](https://git-scm.com/downloads) and [Node.js 18+](https://nodejs.org) installed first.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/ecba-prep.git
cd ecba-prep
npm install
```

> 💡 Replace `YOUR_GITHUB_USERNAME` with the actual GitHub username of whoever shared this repo. For example, if the repo link is `github.com/brodanazis/ecba-prep`, run:
> ```bash
> git clone https://github.com/brodanazis/ecba-prep.git
> cd ecba-prep
> npm install
> ```
> Each person uses **their own API keys** in Step 2–4, so your usage limits are completely separate from anyone else's.

**ID:**
Clone repositori ini ke komputer lokal kamu. Pastikan [Git](https://git-scm.com/downloads) dan [Node.js 18+](https://nodejs.org) sudah terinstall terlebih dahulu.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/ecba-prep.git
cd ecba-prep
npm install
```

> 💡 Ganti `YOUR_GITHUB_USERNAME` dengan username GitHub milik orang yang membagikan repo ini. Contoh, kalau link repo-nya `github.com/brodanazis/ecba-prep`, maka jalankan:
> ```bash
> git clone https://github.com/brodanazis/ecba-prep.git
> cd ecba-prep
> npm install
> ```
> Setiap orang menggunakan **API key milik mereka sendiri** di Step 2–4, jadi limit penggunaan kamu tidak akan terpengaruh oleh orang lain.

---

### Step 2 — Get your Gemini API Key / Dapatkan Gemini API Key

**EN:**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy the key

**ID:**
1. Buka [aistudio.google.com](https://aistudio.google.com)
2. Login dengan akun Google kamu
3. Klik **"Get API Key"** → **"Create API Key"**
4. Copy key-nya

---

### Step 3 — Set up Firebase / Setup Firebase

**EN:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it any name → create
3. **Enable Firestore:**
   - Left sidebar → Build → Firestore Database → Create database
   - Choose **"Start in test mode"**
   - Select location: `asia-southeast1 (Singapore)`
4. **Enable Authentication:**
   - Left sidebar → Build → Authentication → Get started
   - Tab "Sign-in method" → Enable **Email/Password**
5. **Get your config:**
   - Click gear icon ⚙️ → Project Settings → General
   - Scroll to "Your apps" → click `</>` (Web app)
   - Register app (any nickname) → copy the `firebaseConfig` values

**ID:**
1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **"Add project"** → beri nama bebas → buat
3. **Aktifkan Firestore:**
   - Sidebar kiri → Build → Firestore Database → Create database
   - Pilih **"Start in test mode"**
   - Pilih lokasi: `asia-southeast1 (Singapore)`
4. **Aktifkan Authentication:**
   - Sidebar kiri → Build → Authentication → Get started
   - Tab "Sign-in method" → Aktifkan **Email/Password**
5. **Ambil config:**
   - Klik ikon gear ⚙️ → Project Settings → General
   - Scroll ke "Your apps" → klik `</>` (Web app)
   - Daftarkan app (nama bebas) → copy nilai `firebaseConfig`-nya

---

### Step 4 — Create `.env.local` / Buat file `.env.local`

**EN:** Create a file named `.env.local` in the root folder of the project:

**ID:** Buat file bernama `.env.local` di folder root project:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=paste_your_gemini_key_here

NEXT_PUBLIC_FIREBASE_API_KEY=paste_from_firebaseConfig
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **EN:** Never share your `.env.local` file or commit it to GitHub. It's already listed in `.gitignore`.
>
> ⚠️ **ID:** Jangan pernah membagikan file `.env.local` atau meng-commit-nya ke GitHub. File ini sudah terdaftar di `.gitignore`.

---

### Step 5 — Run / Jalankan

```bash
npm run dev
```

**EN:** Open [http://localhost:3000](http://localhost:3000) — you're good to go!

**ID:** Buka [http://localhost:3000](http://localhost:3000) — siap digunakan!

---

## 📊 Free Tier Limits & Estimasi Penggunaan / Free Tier Limits & Usage Estimate

---

### 🤖 Gemini API — Model & Limit Harian

**EN:** This app uses 3 Gemini models as a fallback chain. If one is overloaded, it automatically retries the next one.

**ID:** App ini menggunakan 3 model Gemini sebagai rantai fallback. Jika satu model sedang overload, app otomatis mencoba model berikutnya.

| Priority | Model | RPD (Requests/Day) | Speed | Quality |
|---|---|---|---|---|
| 1st (utama) | `gemini-2.5-flash-lite` | **1,000 RPD** | ⚡ Paling cepat | ⭐⭐⭐ |
| 2nd (fallback) | `gemini-2.5-flash` | **250 RPD** | 🚀 Cepat | ⭐⭐⭐⭐ |
| 3rd (last resort) | `gemini-2.5-pro` | **100 RPD** | 🐢 Lebih lambat | ⭐⭐⭐⭐⭐ |

> 💡 **EN:** All quotas reset daily at **midnight Pacific Time (PT)**. No credit card required.
>
> 💡 **ID:** Semua kuota reset setiap hari pukul **tengah malam waktu Pacific (PT)**. Tidak perlu kartu kredit.

---

### 🔄 Auto-Retry & Fallback Logic

**EN:** The app handles Gemini overload **completely automatically** — you never need to do anything manually. If a model is busy, it silently retries and escalates to the next model without interrupting your experience.

**ID:** App menangani overload Gemini secara **otomatis penuh** — kamu tidak perlu melakukan apa pun secara manual. Jika satu model sedang sibuk, app diam-diam mencoba ulang dan beralih ke model berikutnya tanpa mengganggu pengalaman kamu.

**EN — How it works:**
**ID — Cara kerjanya:**

```
You click "Generate" / Kamu klik "Generate"
      ↓
[Step 1] Try gemini-2.5-flash-lite (fastest, highest quota)
  ├── 503/overloaded → wait 2s → retry #1
  ├── Still failing  → wait 4s → retry #2
  ├── Still failing  → wait 8s → retry #3
  └── Still failing  → auto switch to next model ↓

[Step 2] Try gemini-2.5-flash (more powerful)
  ├── 503/overloaded → wait 2s → retry #1
  ├── Still failing  → wait 4s → retry #2
  ├── Still failing  → wait 8s → retry #3
  └── Still failing  → auto switch to next model ↓

[Step 3] Try gemini-2.5-pro (most capable)
  ├── 503/overloaded → wait 2s → retry #1
  ├── Still failing  → wait 4s → retry #2
  ├── Still failing  → wait 8s → retry #3
  └── Still failing  → show clear error message to user
```

| | English | Bahasa Indonesia |
|---|---|---|
| Max retries | **12 attempts** (4 per model × 3 models) | **12 percobaan** (4 per model × 3 model) |
| Max wait time | ~28 seconds per model | ~28 detik per model |
| Total max wait | ~84 seconds before giving up | ~84 detik sebelum menyerah |
| Triggered by | 503, 429, overload, quota errors | 503, 429, overload, error kuota |
| Not retried | Invalid API key, auth errors | API key salah, error autentikasi |

> 💡 **EN:** In practice, most overload errors resolve within the first 1–2 retries. The full 84-second wait is extremely rare.
>
> 💡 **ID:** Dalam praktiknya, sebagian besar error overload selesai dalam 1–2 retry pertama. Waktu tunggu penuh 84 detik sangat jarang terjadi.

---

### 📈 Estimasi Soal per Hari / Daily Question Estimate

**EN:** Here's a breakdown of how many questions you can generate per day using the free tier.

**ID:** Berikut rincian berapa soal yang bisa kamu generate per hari menggunakan free tier.

---

#### 🔢 API Calls per Aksi / API Calls per Action

| Aksi / Action | Soal / Questions | API Calls | Keterangan / Notes |
|---|---|---|---|
| Practice 1 domain | 5 soal | **1 call** | Generate langsung / Direct generate |
| Practice semua 9 domain | 45 soal | **9 calls** | 1 call per domain |
| Full Simulation | 50 soal | **9 calls** | 1 call per domain, lalu diacak / then shuffled |

---

#### 📊 Kapasitas per Model (per hari) / Capacity per Model (per day)

| Model | Priority | RPD | Max Practice | Max Simulation | Max Soal/Hari |
|---|---|---|---|---|---|
| `gemini-2.5-flash-lite` | 1st (utama) | **1,000** | ~1,000 sesi | ~111 simulasi penuh | **~5,000 soal** |
| `gemini-2.5-flash` | 2nd (fallback) | **250** | ~250 sesi | ~27 simulasi penuh | **~1,250 soal** |
| `gemini-2.5-pro` | 3rd (last resort) | **100** | ~100 sesi | ~11 simulasi penuh | **~500 soal** |
| **Total Gabungan** | all 3 models | **1,350** | ~1,350 sesi | ~150 simulasi penuh | **~6,750 soal** |

> ⚠️ **EN:** The app always starts from `flash-lite` (highest quota). The other models only kick in if `flash-lite` is overloaded. In normal conditions, you'll rarely consume more than the `flash-lite` quota alone.
>
> ⚠️ **ID:** App selalu mulai dari `flash-lite` (kuota tertinggi). Model lain hanya dipakai jika `flash-lite` overload. Dalam kondisi normal, kamu jarang mengonsumsi lebih dari kuota `flash-lite` saja.

---

#### 👤 Skenario Penggunaan Harian (1 orang) / Daily Usage Scenarios (1 person)

| Skenario / Scenario | API Calls | Soal Didapat | Kuota Terpakai | Sisa Kuota |
|---|---|---|---|---|
| Santai: 2 domain practice | 2 calls | 10 soal | 0.2% | 998 calls 😄 |
| Normal: 5 domain + 1 simulasi | 14 calls | 75 soal | 1.4% | 986 calls |
| Intensif: semua domain + 2 simulasi | 27 calls | 145 soal | 2.7% | 973 calls |
| Marathon: semua domain + 5 simulasi | 54 calls | 270 soal | 5.4% | 946 calls |

> ✅ **EN:** Even the most intensive solo marathon session uses only **~5% of the daily free quota**. The limit is effectively unlimited for individual daily use. All quotas reset every day at midnight PT — so you always start fresh.
>
> ✅ **ID:** Bahkan sesi marathon solo paling intensif sekalipun hanya menggunakan **~5% kuota harian gratis**. Limitnya secara praktis tidak terbatas untuk penggunaan individual harian. Semua kuota reset setiap hari tengah malam PT — jadi kamu selalu mulai dengan penuh.

---

### 🗄️ Firebase Free Tier (Spark Plan)

| Service | Free Quota | Resets / Reset |
|---|---|---|
| Firestore reads | **50,000 reads/day** | Daily — midnight PT / Harian |
| Firestore writes | **20,000 writes/day** | Daily — midnight PT / Harian |
| Firebase Auth | **50,000 users/month** | Monthly / Bulanan |

**EN:** Here's how Firebase usage maps to real actions in the app:

**ID:** Begini cara penggunaan Firebase terpetakan ke aksi nyata di app:

| Aksi / Action | Firestore Reads | Firestore Writes |
|---|---|---|
| Login / Register | 0 | 0 |
| Load practice history | ~5 reads | 0 |
| Save 1 practice session | 0 | **1 write** |
| Load simulation history | ~10 reads | 0 |
| Save 1 simulation session | 0 | **1 write** |

**EN:** With 20,000 free writes/day, you can save approximately **20,000 sessions per day** — more than enough for any individual or small group.

**ID:** Dengan 20,000 free writes/hari, kamu bisa menyimpan sekitar **20.000 sesi per hari** — lebih dari cukup untuk penggunaan individu maupun kelompok kecil.

> 💡 **EN:** Firebase limits are far more generous relative to Gemini API for this app's use case. You'll almost never hit Firebase limits before Gemini limits.
>
> 💡 **ID:** Limit Firebase jauh lebih longgar dibanding Gemini API untuk kasus penggunaan app ini. Kamu hampir tidak akan pernah mencapai limit Firebase sebelum limit Gemini.

---

## 📁 Project Structure / Struktur Project

```
ecba-prep/
├── app/
│   ├── page.tsx                  # Login & Register
│   ├── dashboard/page.tsx        # Domain selection home / Halaman pilih domain
│   ├── practice/[domainId]/      # Practice mode per domain / Mode latihan per domain
│   └── simulation/page.tsx       # Full exam simulation / Simulasi ujian penuh
├── contexts/
│   └── AuthContext.tsx           # Firebase auth state
├── lib/
│   ├── domains.ts                # ECBA blueprint data (9 domains)
│   ├── gemini.ts                 # AI question generation / Generator soal AI
│   ├── firestore.ts              # Session history storage / Penyimpanan riwayat
│   └── firebase.ts               # Firebase initialization / Inisialisasi Firebase
```

---

## 📋 ECBA Domain Coverage / Cakupan Domain ECBA

| # | Domain | Exam Weight / Bobot Ujian |
|---|---|---|
| 1 | Understanding Business Analysis | 20% |
| 2 | Mindset for Effective Business Analysis | 14% |
| 3 | Implementing Business Analysis | 6% |
| 4 | Change | 10% |
| 5 | Need | 10% |
| 6 | Solution | 10% |
| 7 | Stakeholder | 10% |
| 8 | Value | 10% |
| 9 | Context | 10% |

**EN:** Question distribution in simulation mode follows the exact weighting from the official ECBA Exam Blueprint v1.1.

**ID:** Distribusi soal di mode simulasi mengikuti bobot resmi dari ECBA Exam Blueprint v1.1.

---

## 🤝 Contributing / Kontribusi

**EN:** Feel free to open issues or pull requests. If you're also preparing for ECBA and want to improve the question quality, prompt logic, or add new features — PRs are welcome!

**ID:** Silakan buka issues atau pull request. Kalau kamu juga sedang mempersiapkan ECBA dan ingin meningkatkan kualitas soal, logika prompt, atau menambahkan fitur baru — PR sangat disambut!

---

## 📄 License

MIT — use it, fork it, share it freely. / Gunakan, fork, dan bagikan secara bebas.

---

*🇬🇧 Built by a Business Analysis student, for Business Analysis students. Good luck on your ECBA! 💪*

*🇮🇩 Dibuat oleh mahasiswa Bisnis, untuk sesama pejuang ECBA. Semangat ujiannya! 💪*