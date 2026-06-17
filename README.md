# Lumina AI 🤖

Lumina AI adalah chatbot pembelajaran AI yang dirancang untuk membantu kamu memahami topik teknis atau konsep baru dengan penjelasan yang jelas, terstruktur, dan ramah.

## 🚀 Fitur Utama

- AI Chatbot berbasis Google Gemini API
- 3 tingkat mode pembelajaran: Beginner, Intermediate, Expert
- Jawaban otomatis dalam format terstruktur sesuai mode pilihan
- Dukungan Markdown untuk pesan AI agar tampil rapi dan berwarna
- Tombol copy per pesan untuk menyalin jawaban dengan cepat
- Indikator mengetik animasi saat AI sedang menjawab
- Avatar untuk AI dan pengguna agar percakapan lebih hidup
- Riwayat percakapan tersimpan otomatis di `localStorage`
- Kuota harian dengan informasi total, terpakai, sisa, dan reset waktu
- Tampilan antarmuka modern, responsif, dan lebih rapi
- Penanganan error dan loading state yang jelas

## 🧩 Teknologi

### Frontend
- React.js
- Vite
- CSS custom
- react-markdown

### Backend
- Node.js
- Express.js
- Google Gemini API

## 📚 Cara Kerja Fitur Mode

- `Beginner`: jawaban dengan bahasa sederhana, analogi hidup, contoh nyata, dan ringkasan inti.
- `Intermediate`: jawaban dengan gambaran umum, cara kerja, aplikasi praktis, kelebihan, keterbatasan, dan topik lanjutan.
- `Expert`: jawaban teknis mendalam dengan definisi formal, mekanisme internal, teori, implementasi, trade-off, dan perkembangan terbaru.

## 💻 Instalasi

### 1. Clone repository

```bash
git clone https://github.com/arisbwicaksono/Lumina_AI.git
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Siapkan environment

Buat file `.env` di folder `backend` dengan:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Jalankan aplikasi

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run dev
```

Buka browser ke `http://localhost:5174`.

## ⚠️ Catatan

- Quota yang ditampilkan adalah sistem lokal sementara untuk membantu pengguna memantau penggunaan.
- Pastikan API key Google Gemini valid agar backend dapat bekerja.
- UI menggunakan bahasa Inggris untuk menu dan kontrol, sedangkan jawaban AI tetap dalam bahasa Indonesia.

---

## 📌 Tips Penggunaan

- Pilih mode sesuai kebutuhan tingkat pemahaman.
- Gunakan tombol copy untuk menyimpan jawaban cepat.
- Jika respons terlalu panjang, bisa minta AI untuk "ringkas" atau "jelaskan dengan contoh lebih sederhana".
- Refresh halaman tidak akan menghapus percakapan selama data masih tersimpan di browser.
