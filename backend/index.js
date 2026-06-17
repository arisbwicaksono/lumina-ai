import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MEMORY CHAT SEMENTARA
const conversationMemory = new Map();

// GEMINI AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend Lumina AI Running");
});

// CHAT ROUTE
app.post("/api/chat", async (req, res) => {

  try {

    const { message, sessionId, level = 'beginner' } = req.body;

    // IDENTITAS USER
    const memoryKey =
      sessionId ||
      `${req.ip}-${req.headers["user-agent"] || "unknown"}`;

    // AMBIL HISTORY
    const history =
      conversationMemory.get(memoryKey) || [];

    // BATASI MEMORY
    const historyContext = history
      .slice(-4)
      .map(
        (item) =>
          `${item.sender === "user" ? "User" : "AI"}: ${item.text}`
      )
      .join("\n");

    // LEVEL-SPECIFIC INSTRUCTIONS
    let levelInstructions = "";
    
    if (level === 'beginner') {
      levelInstructions = `
MODE: BEGINNER - Format Jawaban Terstruktur

Jawab pertanyaan dengan struktur berikut:

📘 Penjelasan Sederhana
Jelaskan konsep menggunakan bahasa sehari-hari yang mudah dipahami.

🧠 Analogi
Berikan analogi yang dekat dengan kehidupan sehari-hari.

💡 Contoh Nyata
Berikan contoh sederhana yang mudah dibayangkan.

🎯 Inti Penting
Ringkas poin utama dalam 1-3 kalimat.

Aturan:
- Anggap pengguna belum pernah mengenal topik ini.
- Hindari jargon teknis sepenuhnya. Jika terpaksa, jelaskan dengan bahasa sehari-hari.
- Gunakan kalimat pendek dan jelas.
- Fokus pada pemahaman dasar, bukan detail kompleks.
- Total jawaban singkat dan mudah dicerna, maksimal 2-3 paragraf.
  `;
    } else if (level === 'intermediate') {
      levelInstructions = `
MODE: INTERMEDIATE - Format Jawaban Terstruktur

Jawab pertanyaan dengan struktur berikut:

📘 Gambaran Umum
Jelaskan konsep secara ringkas dan jelas.

⚙️ Cara Kerja
Jelaskan mekanisme atau proses utama.

💼 Aplikasi Praktis
Jelaskan bagaimana konsep digunakan di dunia nyata.

✅ Kelebihan
Sebutkan manfaat utama dari konsep ini.

⚠️ Keterbatasan
Sebutkan kelemahan atau tantangan yang umum dijumpai.

🚀 Topik Lanjutan
Sebutkan 1-2 konsep terkait yang layak dipelajari berikutnya.

Aturan:
- Gunakan istilah industri yang umum dan mudah dipahami.
- Seimbangkan antara teori dan praktik dengan baik.
- Berikan contoh penggunaan nyata yang relevan.
- Cocok untuk mahasiswa atau profesional pemula.
- Jawaban detail namun tetap terstruktur dengan baik.
  `;
    } else if (level === 'expert') {
      levelInstructions = `
MODE: EXPERT - Format Jawaban Terstruktur

Jawab pertanyaan dengan struktur berikut:

📘 Definisi Formal
Berikan definisi teknis dan ilmiah yang presisi.

⚙️ Mekanisme Internal
Jelaskan proses atau arsitektur secara mendalam dengan detail teknis.

🔬 Dasar Teori
Jelaskan teori, model matematis, atau prinsip ilmiah yang mendasarinya.

📊 Implementasi dan Studi Kasus
Berikan contoh implementasi nyata, skala industri, atau penelitian yang relevan.

⚖️ Trade-off dan Keterbatasan
Bahas kompromi teknis, risiko, batasan performa, dan skalabilitas.

📈 Perkembangan Terkini
Sebutkan tren, penelitian terbaru, atau inovasi yang relevan di bidang ini.

🎯 Kesimpulan Profesional
Berikan ringkasan strategis yang relevan bagi praktisi atau pengambil keputusan teknis.

Aturan:
- Gunakan terminologi teknis dan ilmiah yang tepat dan presisi.
- Bahas konsep secara mendalam dan komprehensif.
- Fokus pada akurasi, analisis kritis, dan pemahaman fundamental.
- Asumsikan pengguna memiliki pengetahuan dasar yang kuat di bidangnya.
- Sertakan referensi ke standar industri, penelitian, atau publikasi jika relevan.
- Jawaban lengkap dengan kedalaman tingkat profesional/akademik.
  `;
    }

    // PROMPT AI
    const prompt = `
  Kamu adalah Lumina AI.
  ${levelInstructions}
  
  Aturan umum:
  - Selalu jawab seluruh pesan menggunakan bahasa Indonesia yang natural dan santai. Jangan gunakan bahasa lain.
  - Fokus langsung ke inti jawaban.
  - Di akhir jawaban, tanyakan apakah ada lagi yang ingin ditanyakan atau tawarkan topik terkait yang masih berhubungan.

  ${historyContext ? `Percakapan sebelumnya:\n${historyContext}\n\n` : ""}

  Pertanyaan user:
  ${message}
  `;

    // TIMEOUT PROTECTION
    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 15000);

    // REQUEST KE GEMINI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      signal: controller.signal,
    });

    // AMBIL TEXT RESPONSE
    const replyText =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, terjadi kesalahan saat memproses jawaban AI.";

    // SIMPAN HISTORY
    history.push({
      sender: "user",
      text: message,
    });

    history.push({
      sender: "ai",
      text: replyText,
    });

    // BATASI TOTAL MEMORY
    if (history.length > 8) {
      history.splice(0, history.length - 8);
    }

    // UPDATE MEMORY
    conversationMemory.set(memoryKey, history);

    // RESPONSE KE FRONTEND
    res.json({
      reply: replyText,
    });

  } catch (error) {

    // LOG ERROR DETAIL
    console.error(
      "AI request error:",
      JSON.stringify(error, null, 2)
    );

    // DEFAULT ERROR
    let statusCode = 500;
    let clientMessage = "Terjadi error pada AI";

    let details =
      error?.message ||
      String(error) ||
      "Unknown error";

    // DETEKSI QUOTA ERROR
    try {

      const errStr =
        typeof error === "string"
          ? error
          : JSON.stringify(error);

      if (
        (errStr &&
          errStr.includes("RESOURCE_EXHAUSTED")) ||
        (errStr &&
          errStr.toLowerCase().includes("quota exceeded")) ||
        error?.code === 429
      ) {

        statusCode = 429;

        clientMessage =
          "Kuota AI habis. Silakan coba lagi nanti.";

      }

    } catch (e) {
      // ignore
    }

    // KIRIM ERROR KE FRONTEND
    res.status(statusCode).json({
      error: clientMessage,
      details,
    });

  }

});

// JALANKAN SERVER
app.listen(3000, () => {
  console.log("Server berjalan di port 3000");
});