# Lumina AI 🤖

<p align="center">
  <img src="https://github.com/arisbwicaksono/lumina-ai/blob/b410cd18bd06eccbaebe4be7633df6df3f7fc020/Layout%20Lumina%20Ai.jpg?raw=true" width="900"/>
</p>

## 📌 Deskripsi
Lumina AI adalah chatbot pembelajaran berbasis AI yang dirancang untuk membantu pengguna memahami berbagai topik teknis maupun konsep baru dengan cara yang sederhana, interaktif, dan mudah dipahami.

Project ini menggabungkan frontend modern dan backend AI untuk memberikan pengalaman belajar yang cepat, responsif, dan terstruktur.

## 🚀 Fitur Utama
- AI Chatbot berbasis Google Gemini API
- 3 mode pembelajaran: Beginner, Intermediate, Expert
- Jawaban AI terstruktur sesuai tingkat pemahaman
- Support Markdown untuk tampilan jawaban yang rapi
- Tombol copy setiap pesan AI
- Animasi typing saat AI merespon
- Avatar user & AI
- Riwayat chat tersimpan di `localStorage`
- Sistem kuota harian (local tracking)
- UI modern, clean, dan responsive
- Loading & error handling yang jelas

## 🧩 Teknologi
Frontend:
- React.js
- Vite
- CSS Custom
- react-markdown

Backend:
- Node.js
- Express.js
- Google Gemini API

## 📚 Cara Kerja Mode AI
- Beginner → penjelasan sederhana, analogi, contoh nyata
- Intermediate → konsep, cara kerja, aplikasi praktis
- Expert → teknis mendalam, teori, implementasi, trade-off

## 💻 Instalasi & Setup
git clone https://github.com/arisbwicaksono/lumina-ai.git
cd lumina-ai

cd backend
npm install

cd ../frontend
npm install

## 🔐 Environment
Buat file `.env` di folder backend:
GEMINI_API_KEY=your_google_gemini_api_key

## ▶️ Jalankan Aplikasi
Backend:
cd backend
npm start

Frontend:
cd frontend
npm run dev

## 🌐 Akses Aplikasi
http://localhost:5174

## ⚠️ Catatan Penting
- API Key Google Gemini wajib valid
- Perhitungan quota hanya tersimpan di browser (localStorage), tidak tersimpan di server
- Data chat tidak disimpan di server
- UI English, response AI Bahasa Indonesia

## 📌 Tips Penggunaan
- Gunakan mode sesuai kebutuhan
- Gunakan tombol copy untuk menyimpan jawaban cepat
- Jika jawaban terlalu panjang, minta AI untuk “ringkas”
- Data chat tetap tersimpan di browser selama tidak dihapus

## ✨ Penutup
Lumina AI adalah project pembelajaran AI modern yang menggabungkan UX sederhana dengan kemampuan AI generatif untuk membantu proses belajar menjadi lebih cepat, jelas, dan efektif.