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

## 📊 Free Tier Limits / Batas Free Tier

**EN:** Here's what you get for free, per day:

**ID:** Ini yang kamu dapat secara gratis, per hari:

| Service | Free Quota | Resets / Reset |
|---|---|---|
| Gemini 1.5 Flash | 1,000 requests/day | Daily — midnight PT / Harian — tengah malam PT |
| Firestore reads | 50,000 reads/day | Daily — midnight PT / Harian — tengah malam PT |
| Firestore writes | 20,000 writes/day | Daily — midnight PT / Harian — tengah malam PT |
| Firebase Auth | 50,000 users/month | Monthly / Bulanan |

**EN:** For a solo daily study session, these limits are more than sufficient.

**ID:** Untuk sesi belajar harian personal, limit ini lebih dari cukup.

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
