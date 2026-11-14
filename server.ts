import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY belum tersedia. Silakan atur GEMINI_API_KEY pada panel Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  // Health endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Pola B AI Route 1: Generate CPMK, Sub-CPMK & Deskripsi MK
  app.post("/api/ai/generate-cpmk", async (req, res) => {
    try {
      const {
        kode_mk,
        nama_mk,
        prodi,
        sks_teori = 2,
        sks_praktikum = 0,
        semester = 1,
        rumpun_mk = "",
        bahan_kajian_utama = "",
        daftar_cpl = [],
      } = req.body ?? {};

      if (!nama_mk || typeof nama_mk !== "string" || !nama_mk.trim()) {
        return res.status(400).json({
          error: "Nama Mata Kuliah wajib diisi terlebih dahulu sebelum memanggil AI.",
        });
      }

      const ai = getGeminiClient();

      const cplContext =
        Array.isArray(daftar_cpl) && daftar_cpl.length > 0
          ? daftar_cpl
              .map(
                (c: { kode_cpl?: string; unsur?: string; deskripsi?: string }) =>
                  `- ${c.kode_cpl || "CPL"} (${c.unsur || "Umum"}): ${c.deskripsi || ""}`
              )
              .join("\n")
          : "Belum ada CPL dari Modul 0. Buatkan juga 3-4 rumusan CPL relevan (kode CPL-01 s.d. CPL-03/04) sesuai standar SN-Dikti.";

      const prompt = `Anda adalah Pakar Kurikulum Outcome-Based Education (OBE) SN-Dikti untuk Pusat Kurikulum dan Inovasi Pembelajaran Universitas Pattimura.

Susun rancangan Constructive Alignment lengkap untuk mata kuliah berikut:
- Program Studi: ${prodi || "Program Studi Universitas Pattimura"}
- Kode MK: ${kode_mk || "-"}
- Nama MK: ${nama_mk}
- Bobot SKS: ${Number(sks_teori) + Number(sks_praktikum)} SKS (Teori: ${sks_teori}, Praktikum: ${sks_praktikum})
- Semester: ${semester}
- Rumpun MK: ${rumpun_mk || "-"}
- Bahan Kajian Awal: ${bahan_kajian_utama || "Sesuaikan dengan keilmuan mata kuliah ini"}

Daftar CPL yang Dibebankan pada Mata Kuliah:
${cplContext}

Instruksi Wajib:
1. Buat "deskripsi_mk" yang akademik, ringkas, dan mencerminkan pendekatan OBE (Case-Based / Project-Based Learning jika relevan).
2. Buat "bahan_kajian_utama" berupa 5-7 topik inti mata kuliah dipisahkan baris baru atau poin bernomor.
3. Jika daftar CPL di atas kosong, isi "suggested_cpl" dengan 3 CPL standar OBE (Sikap/Pengetahuan/Keterampilan Umum/Keterampilan Khusus). Jika daftar CPL sudah ada, kembalikan daftar CPL yang sama pada "suggested_cpl".
4. Turunkan CPL tersebut menjadi 3 sampai 5 "daftar_cpmk" (kode: CPMK-1, CPMK-2, dst.) dengan kata kerja operasional Taksonomi Bloom revisi (C2-C6 / A2-A5 / P2-P5) yang terukur, dan setiap CPMK WAJIB mencantumkan kode CPL terkait pada array "cpl_terkait".
5. Turunkan setiap CPMK menjadi 2 sampai 3 "daftar_sub_cpmk" (total 8 sampai 12 Sub-CPMK, kode: Sub-CPMK 1.1, Sub-CPMK 1.2, dst.) dengan "cpmk_terkait", "indikator_pencapaian" yang spesifik dan terukur, "bentuk_penilaian" (misal: Tugas Terstruktur, Kuis, Case Study, Project-Based Assessment, Praktikum, UTS, UAS), dan "bobot_penilaian" berupa angka persentase sehingga jumlah seluruh bobot Sub-CPMK tepat 100.
6. Gunakan Bahasa Indonesia akademik baku dan presisi.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "Anda adalah asisten perancang kurikulum OBE Universitas Pattimura yang selalu menghasilkan struktur JSON valid sesuai skema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              deskripsi_mk: { type: Type.STRING },
              bahan_kajian_utama: { type: Type.STRING },
              suggested_cpl: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    kode_cpl: { type: Type.STRING },
                    unsur: { type: Type.STRING },
                    deskripsi: { type: Type.STRING },
                  },
                  required: ["kode_cpl", "unsur", "deskripsi"],
                },
              },
              daftar_cpmk: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    kode_cpmk: { type: Type.STRING },
                    cpl_terkait: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    level_taksonomi: { type: Type.STRING },
                    deskripsi: { type: Type.STRING },
                  },
                  required: ["kode_cpmk", "cpl_terkait", "level_taksonomi", "deskripsi"],
                },
              },
              daftar_sub_cpmk: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    kode_sub_cpmk: { type: Type.STRING },
                    cpmk_terkait: { type: Type.STRING },
                    deskripsi: { type: Type.STRING },
                    indikator_pencapaian: { type: Type.STRING },
                    bentuk_penilaian: { type: Type.STRING },
                    bobot_penilaian: { type: Type.NUMBER },
                  },
                  required: [
                    "kode_sub_cpmk",
                    "cpmk_terkait",
                    "deskripsi",
                    "indikator_pencapaian",
                    "bentuk_penilaian",
                    "bobot_penilaian",
                  ],
                },
              },
            },
            required: [
              "deskripsi_mk",
              "bahan_kajian_utama",
              "suggested_cpl",
              "daftar_cpmk",
              "daftar_sub_cpmk",
            ],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);

      // Normalize Sub-CPMK weights to sum exactly to 100
      if (Array.isArray(parsed.daftar_sub_cpmk) && parsed.daftar_sub_cpmk.length > 0) {
        const items = parsed.daftar_sub_cpmk;
        const sum = items.reduce((acc: number, s: { bobot_penilaian?: number }) => acc + (Number(s.bobot_penilaian) || 0), 0);
        if (sum !== 100 && sum > 0) {
          let running = 0;
          for (let i = 0; i < items.length; i++) {
            if (i === items.length - 1) {
              items[i].bobot_penilaian = Math.max(0, 100 - running);
            } else {
              const scaled = Math.round(((Number(items[i].bobot_penilaian) || 0) / sum) * 100);
              items[i].bobot_penilaian = scaled;
              running += scaled;
            }
          }
        }
      }

      return res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghasilkan CPMK dengan Gemini AI.";
      console.error("AI generate-cpmk error:", err);
      return res.status(500).json({ error: message });
    }
  });

  // Pola B AI Route 2: Generate Rencana Pembelajaran 16 Minggu
  app.post("/api/ai/generate-rps-weeks", async (req, res) => {
    try {
      const {
        kode_mk,
        nama_mk,
        prodi,
        sks_teori = 2,
        sks_praktikum = 0,
        deskripsi_mk = "",
        bahan_kajian_utama = "",
        daftar_cpl = [],
        daftar_cpmk = [],
        daftar_sub_cpmk = [],
      } = req.body ?? {};

      if (!nama_mk || typeof nama_mk !== "string" || !nama_mk.trim()) {
        return res.status(400).json({
          error: "Nama Mata Kuliah wajib diisi terlebih dahulu.",
        });
      }

      const ai = getGeminiClient();

      const totalSks = Number(sks_teori) + Number(sks_praktikum) || 2;
      const tmMinutes = Number(sks_teori) * 50;
      const ptMinutes = Number(sks_teori) * 60;
      const bmMinutes = Number(sks_teori) * 60;
      const prakMinutes = Number(sks_praktikum) * 170;
      const defaultTimeStr =
        Number(sks_praktikum) > 0
          ? `TM: ${sks_teori}x50' (${tmMinutes}'); PT+BM: ${ptMinutes + bmMinutes}'; Prak: ${sks_praktikum}x170' (${prakMinutes}')`
          : `PB: ${sks_teori}x50' (${tmMinutes}'); PT: ${sks_teori}x60' (${ptMinutes}'); BM: ${sks_teori}x60' (${bmMinutes}')`;

      const subList =
        Array.isArray(daftar_sub_cpmk) && daftar_sub_cpmk.length > 0
          ? daftar_sub_cpmk
              .map(
                (s: { kode_sub_cpmk?: string; cpmk_terkait?: string; deskripsi?: string; bobot_penilaian?: number }) =>
                  `- ${s.kode_sub_cpmk} (${s.cpmk_terkait || ""}): ${s.deskripsi} [Target bobot: ${s.bobot_penilaian ?? 0}%]`
              )
              .join("\n")
          : "Belum ada Sub-CPMK spesifik, buat penahapan materi logis 16 pertemuan.";

      const cpmkList =
        Array.isArray(daftar_cpmk) && daftar_cpmk.length > 0
          ? daftar_cpmk
              .map((c: { kode_cpmk?: string; deskripsi?: string }) => `- ${c.kode_cpmk}: ${c.deskripsi}`)
              .join("\n")
          : "";

      const cplList =
        Array.isArray(daftar_cpl) && daftar_cpl.length > 0
          ? daftar_cpl
              .map((c: { kode_cpl?: string; deskripsi?: string }) => `- ${c.kode_cpl}: ${c.deskripsi}`)
              .join("\n")
          : "";

      const prompt = `Anda adalah Pakar Kurikulum OBE Universitas Pattimura. Susun Matriks Rencana Pembelajaran Semester (RPS) tepat 16 Pertemuan (Minggu 1 sampai Minggu 16) beserta Pustaka Utama & Pendukung.

Identitas Mata Kuliah:
- Program Studi: ${prodi || "Universitas Pattimura"}
- Kode & Nama MK: ${kode_mk || "-"} — ${nama_mk}
- Total SKS: ${totalSks} SKS (Teori: ${sks_teori}, Praktikum: ${sks_praktikum})
- Format Estimasi Waktu Baku per Minggu: ${defaultTimeStr}
- Deskripsi MK: ${deskripsi_mk || "-"}
- Bahan Kajian Utama: ${bahan_kajian_utama || "-"}

CPL:
${cplList || "-"}

CPMK:
${cpmkList || "-"}

Sub-CPMK yang Harus Dipetakan:
${subList}

Aturan Mutlak Matriks 16 Minggu:
1. Hasilkan tepat 16 item dalam array "rencana_16_minggu" dengan "minggu_ke" berurutan 1 hingga 16.
2. Minggu 1–7 adalah perkuliahan aktif menggunakan variasi metode Student-Centered Learning (SCL), Case-Based Learning (CBL), Project-Based Learning (PjBL), Small Group Discussion, atau Praktikum.
3. Minggu 8 WAJIB Evaluasi Tengah Semester (UTS) dengan "sub_cpmk_kode": "UTS (Evaluasi Tengah Semester)" dan "kategori_asesmen": "uts".
4. Minggu 9–15 adalah perkuliahan lanjutan, studi kasus mendalam, proyek kelompok, atau praktikum terintegrasi.
5. Minggu 16 WAJIB Evaluasi Akhir Semester (UAS) dengan "sub_cpmk_kode": "UAS (Evaluasi Akhir Semester)" dan "kategori_asesmen": "uas".
6. Untuk minggu selain 8 dan 16, gunakan "sub_cpmk_kode" yang persis cocok dengan kode Sub-CPMK yang diberikan di atas (jika tersedia).
7. Nilai "kategori_asesmen" hanya boleh salah satu dari: "tugas_kuis", "cbl_pbl_praktikum", "uts", "uas".
8. Nilai "bobot_persen" adalah bilangan bulat >= 0. Jumlah total "bobot_persen" dari Minggu 1 sampai Minggu 16 HARUS TEPAT 100 (misal: Tugas/Kuis ~20%, CBL/PBL/Praktikum ~30%, UTS ~20%, UAS ~30%, atau proporsi wajar OBE lainnya, di mana sebagian minggu bernilai 0 jika asesmen digabung pada minggu proyek/ujian).
9. Sertakan juga 3 referensi pada "pustaka_utama" dan 3 referensi pada "pustaka_pendukung" (judul, penulis, tahun, penerbit yang realistis dan relevan dengan bidang ilmu mata kuliah ini).`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "Anda adalah perancang RPS SN-Dikti/OBE Universitas Pattimura. Keluarkan tepat 16 pertemuan dan daftar pustaka dalam format JSON valid.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rencana_16_minggu: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    minggu_ke: { type: Type.INTEGER },
                    sub_cpmk_kode: { type: Type.STRING },
                    indikator_kriteria: { type: Type.STRING },
                    metode_pembelajaran: { type: Type.STRING },
                    estimasi_waktu: { type: Type.STRING },
                    materi_pembelajaran: { type: Type.STRING },
                    kategori_asesmen: { type: Type.STRING },
                    bobot_persen: { type: Type.NUMBER },
                  },
                  required: [
                    "minggu_ke",
                    "sub_cpmk_kode",
                    "indikator_kriteria",
                    "metode_pembelajaran",
                    "estimasi_waktu",
                    "materi_pembelajaran",
                    "kategori_asesmen",
                    "bobot_persen",
                  ],
                },
              },
              pustaka_utama: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              pustaka_pendukung: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["rencana_16_minggu", "pustaka_utama", "pustaka_pendukung"],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);

      // Ensure exactly 16 weeks and exact 100% total bobot
      const weeks = Array.isArray(parsed.rencana_16_minggu) ? parsed.rencana_16_minggu : [];
      const validCats = new Set(["tugas_kuis", "cbl_pbl_praktikum", "uts", "uas"]);
      const normalized = Array.from({ length: 16 }, (_, idx) => {
        const weekNum = idx + 1;
        const found = weeks.find((w: { minggu_ke?: number }) => Number(w.minggu_ke) === weekNum) || weeks[idx] || {};
        let cat = String(found.kategori_asesmen || "tugas_kuis");
        if (weekNum === 8) cat = "uts";
        else if (weekNum === 16) cat = "uas";
        else if (!validCats.has(cat)) cat = "tugas_kuis";

        return {
          minggu_ke: weekNum,
          sub_cpmk_kode:
            weekNum === 8
              ? "UTS (Evaluasi Tengah Semester)"
              : weekNum === 16
              ? "UAS (Evaluasi Akhir Semester)"
              : String(found.sub_cpmk_kode || ""),
          indikator_kriteria: String(found.indikator_kriteria || "-"),
          metode_pembelajaran: String(found.metode_pembelajaran || "Diskusi Kelompok & Case Study"),
          estimasi_waktu: String(found.estimasi_waktu || defaultTimeStr),
          materi_pembelajaran: String(found.materi_pembelajaran || `Materi Pertemuan ${weekNum}`),
          kategori_asesmen: cat,
          bobot_persen: Math.max(0, Math.round(Number(found.bobot_persen) || 0)),
        };
      });

      const totalBobot = normalized.reduce((s, w) => s + w.bobot_persen, 0);
      if (totalBobot !== 100) {
        if (totalBobot === 0) {
          // Safe fallback distribution summing to 100
          normalized[3].bobot_persen = 10;
          normalized[6].bobot_persen = 15;
          normalized[7].bobot_persen = 25; // UTS
          normalized[11].bobot_persen = 10;
          normalized[14].bobot_persen = 15;
          normalized[15].bobot_persen = 25; // UAS
        } else {
          // Adjust UAS or largest weight so total is exactly 100
          const diff = 100 - totalBobot;
          const uasIdx = 15;
          if (normalized[uasIdx].bobot_persen + diff >= 5) {
            normalized[uasIdx].bobot_persen += diff;
          } else {
            let running = 0;
            for (let i = 0; i < normalized.length; i++) {
              if (i === normalized.length - 1) {
                normalized[i].bobot_persen = Math.max(0, 100 - running);
              } else {
                const scaled = Math.round((normalized[i].bobot_persen / totalBobot) * 100);
                normalized[i].bobot_persen = scaled;
                running += scaled;
              }
            }
          }
        }
      }

      return res.json({
        rencana_16_minggu: normalized,
        pustaka_utama: Array.isArray(parsed.pustaka_utama) ? parsed.pustaka_utama : [],
        pustaka_pendukung: Array.isArray(parsed.pustaka_pendukung) ? parsed.pustaka_pendukung : [],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghasilkan Rencana 16 Minggu dengan Gemini AI.";
      console.error("AI generate-rps-weeks error:", err);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIMPEL-OBE 01 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
