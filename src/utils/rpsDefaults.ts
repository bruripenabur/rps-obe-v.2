import type {
  KategoriAsesmen,
  PertemuanItem,
  RekapBobot,
  RpsPayload,
} from "../types/rps";

export const UNPATTI_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Logo_Universitas_Pattimura_Terbaru.png/330px-Logo_Universitas_Pattimura_Terbaru.png";

export function formatEstimasiWaktu(
  sksTeori: number,
  sksPraktikum: number
): string {
  const t = Math.max(0, Number(sksTeori) || 0);
  const p = Math.max(0, Number(sksPraktikum) || 0);
  const parts: string[] = [];
  if (t > 0) {
    parts.push(`PB: ${t}x50' (${t * 50}')`);
    parts.push(`PT: ${t}x60' (${t * 60}')`);
    parts.push(`BM: ${t}x60' (${t * 60}')`);
  }
  if (p > 0) {
    parts.push(`Prak: ${p}x170' (${p * 170}')`);
  }
  return parts.length > 0 ? parts.join("; ") : "PB: 2x50'; PT: 2x60'; BM: 2x60'";
}

export function createDefault16Weeks(
  sksTeori = 2,
  sksPraktikum = 0
): PertemuanItem[] {
  const defaultTime = formatEstimasiWaktu(sksTeori, sksPraktikum);
  const defaultWeights: Record<number, { cat: KategoriAsesmen; w: number }> = {
    3: { cat: "tugas_kuis", w: 10 },
    6: { cat: "cbl_pbl_praktikum", w: 15 },
    8: { cat: "uts", w: 25 },
    11: { cat: "tugas_kuis", w: 10 },
    14: { cat: "cbl_pbl_praktikum", w: 15 },
    16: { cat: "uas", w: 25 },
  };

  return Array.from({ length: 16 }, (_, idx) => {
    const week = idx + 1;
    const preset = defaultWeights[week];
    if (week === 8) {
      return {
        minggu_ke: 8,
        sub_cpmk_kode: "UTS (Evaluasi Tengah Semester)",
        indikator_kriteria:
          "Ketepatan analisis, penguasaan konsep pertemuan 1–7, dan kejelasan argumentasi tertulis.",
        metode_pembelajaran: "Ujian Tengah Semester (Tertulis / Studi Kasus)",
        estimasi_waktu: defaultTime,
        materi_pembelajaran: "Evaluasi Tengah Semester (Materi Minggu 1–7)",
        kategori_asesmen: "uts",
        bobot_persen: preset?.w ?? 25,
      };
    }
    if (week === 16) {
      return {
        minggu_ke: 16,
        sub_cpmk_kode: "UAS (Evaluasi Akhir Semester)",
        indikator_kriteria:
          "Ketuntasan capaian seluruh CPMK, orisinalitas solusi proyek/kasus, dan ketepatan metodologi.",
        metode_pembelajaran:
          "Ujian Akhir Semester / Presentasi Akhir Proyek",
        estimasi_waktu: defaultTime,
        materi_pembelajaran: "Evaluasi Akhir Semester (Materi Minggu 9–15)",
        kategori_asesmen: "uas",
        bobot_persen: preset?.w ?? 25,
      };
    }
    return {
      minggu_ke: week,
      sub_cpmk_kode: "",
      indikator_kriteria: "",
      metode_pembelajaran:
        week % 3 === 0
          ? "Case-Based Learning (CBL) & Presentasi Kelompok"
          : "Kuliah Interaktif (SCL) & Diskusi Terbimbing",
      estimasi_waktu: defaultTime,
      materi_pembelajaran: "",
      kategori_asesmen: preset?.cat ?? "tugas_kuis",
      bobot_persen: preset?.w ?? 0,
    };
  });
}

export function computeRekapBobot(weeks: PertemuanItem[]): RekapBobot {
  let tugas_kuis = 0;
  let cbl_pbl_praktikum = 0;
  let uts = 0;
  let uas = 0;

  for (const w of weeks) {
    const val = Math.max(0, Number(w.bobot_persen) || 0);
    if (w.kategori_asesmen === "tugas_kuis") tugas_kuis += val;
    else if (w.kategori_asesmen === "cbl_pbl_praktikum") cbl_pbl_praktikum += val;
    else if (w.kategori_asesmen === "uts") uts += val;
    else if (w.kategori_asesmen === "uas") uas += val;
  }

  return {
    tugas_kuis,
    cbl_pbl_praktikum,
    uts,
    uas,
    total: tugas_kuis + cbl_pbl_praktikum + uts + uas,
  };
}

export function createInitialRpsPayload(): RpsPayload {
  const today = new Date().toISOString().slice(0, 10);
  const weeks = createDefault16Weeks(2, 0);
  return {
    identitas: {
      prodi: "",
      fakultas: "Universitas Pattimura",
      tahun_akademik: "2025/2026 - Ganjil",
      kode_mk: "",
      nama_mk: "",
      sks_teori: 2,
      sks_praktikum: 0,
      semester: 1,
      prasyarat: "-",
      rumpun_mk: "",
      tanggal_penyusunan: today,
    },
    otorisasi: {
      dosen_pengampu: "",
      koordinator_rmk: "",
      ketua_prodi: "",
      ketua_gjm: "",
    },
    deskripsi_mk: "",
    bahan_kajian_utama: "",
    daftar_cpl: [],
    daftar_cpmk: [],
    daftar_sub_cpmk: [],
    rencana_16_minggu: weeks,
    rekap_bobot: computeRekapBobot(weeks),
    pustaka: {
      utama: [],
      pendukung: [],
    },
  };
}

function escHtml(str: string | number | undefined | null): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportRpsToWord(payload: RpsPayload) {
  const { identitas, otorisasi, daftar_cpl, daftar_cpmk, daftar_sub_cpmk, rencana_16_minggu, pustaka } =
    payload;
  const rekap = computeRekapBobot(rencana_16_minggu);
  const totalSks =
    (Number(identitas.sks_teori) || 0) + (Number(identitas.sks_praktikum) || 0);

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>RPS ${escHtml(identitas.kode_mk)} - ${escHtml(identitas.nama_mk)}</title>
<style>
  @page { size: A4 landscape; margin: 1.5cm; }
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 10pt; color: #111827; }
  h1, h2, h3 { color: #0b3d91; margin: 0 0 6pt 0; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 10pt; }
  th, td { border: 1px solid #334155; padding: 5pt 6pt; vertical-align: top; text-align: left; font-size: 9.5pt; }
  th { background-color: #0b3d91; color: #ffffff; font-weight: bold; }
  .sub-header { background-color: #e2e8f0; font-weight: bold; color: #0f172a; }
  .center { text-align: center; }
  .uts-row { background-color: #fef9c3; font-weight: bold; }
</style>
</head>
<body>
  <table>
    <tr>
      <td style="width:15%; text-align:center; vertical-align:middle;">
        <strong>UNIVERSITAS<br/>PATTIMURA</strong>
      </td>
      <td style="width:65%; text-align:center; vertical-align:middle;">
        <div style="font-size:12pt; font-weight:bold; color:#0b3d91;">UNIVERSITAS PATTIMURA</div>
        <div style="font-size:10pt; font-weight:bold;">PUSAT KURIKULUM DAN INOVASI PEMBELAJARAN</div>
        <div style="font-size:11pt; font-weight:bold; margin-top:4pt;">RENCANA PEMBELAJARAN SEMESTER (RPS) OBE</div>
      </td>
      <td style="width:20%; font-size:8.5pt;">
        <strong>Kode Dokumen:</strong><br/>RPS-${escHtml(identitas.kode_mk || "MK")}<br/>
        <strong>Tahun Akademik:</strong><br/>${escHtml(identitas.tahun_akademik)}
      </td>
    </tr>
  </table>

  <table>
    <tr class="sub-header">
      <th>MATA KULIAH</th>
      <th>KODE</th>
      <th>RUMPUN MK</th>
      <th>BOBOT (SKS)</th>
      <th>SEMESTER</th>
      <th>TGL PENYUSUNAN</th>
    </tr>
    <tr>
      <td><strong>${escHtml(identitas.nama_mk || "-")}</strong></td>
      <td>${escHtml(identitas.kode_mk || "-")}</td>
      <td>${escHtml(identitas.rumpun_mk || "-")}</td>
      <td>T=${identitas.sks_teori}, P=${identitas.sks_praktikum} (Total ${totalSks} SKS)</td>
      <td class="center">${identitas.semester}</td>
      <td>${escHtml(identitas.tanggal_penyusunan)}</td>
    </tr>
    <tr>
      <td><strong>Program Studi</strong></td>
      <td colspan="2">${escHtml(identitas.prodi || "-")}</td>
      <td><strong>MK Prasyarat</strong></td>
      <td colspan="2">${escHtml(identitas.prasyarat || "-")}</td>
    </tr>
  </table>

  <table>
    <tr class="sub-header">
      <th style="width:25%;">Dosen Pengampu</th>
      <th style="width:25%;">Koordinator RMK</th>
      <th style="width:25%;">Ketua Program Studi</th>
      <th style="width:25%;">Ketua GJM</th>
    </tr>
    <tr>
      <td style="height:45pt;">${escHtml(otorisasi.dosen_pengampu || "-")}</td>
      <td>${escHtml(otorisasi.koordinator_rmk || "-")}</td>
      <td>${escHtml(otorisasi.ketua_prodi || "-")}</td>
      <td>${escHtml(otorisasi.ketua_gjm || "-")}</td>
    </tr>
  </table>

  <table>
    <tr><th colspan="3">CAPAIAN PEMBELAJARAN LULUSAN (CPL) YANG DIBEBANKAN PADA MK</th></tr>
    <tr class="sub-header">
      <td style="width:14%;">Kode CPL</td>
      <td style="width:18%;">Unsur</td>
      <td style="width:68%;">Rumusan CPL</td>
    </tr>
    ${
      daftar_cpl.length > 0
        ? daftar_cpl
            .map(
              (c) => `<tr>
                <td><strong>${escHtml(c.kode_cpl)}</strong></td>
                <td>${escHtml(c.unsur)}</td>
                <td>${escHtml(c.deskripsi)}</td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="3">Belum ada CPL yang ditetapkan.</td></tr>`
    }
  </table>

  <table>
    <tr><th colspan="4">CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)</th></tr>
    <tr class="sub-header">
      <td style="width:14%;">Kode CPMK</td>
      <td style="width:18%;">CPL Terkait</td>
      <td style="width:13%;">Taksonomi</td>
      <td style="width:55%;">Deskripsi CPMK</td>
    </tr>
    ${
      daftar_cpmk.length > 0
        ? daftar_cpmk
            .map(
              (m) => `<tr>
                <td><strong>${escHtml(m.kode_cpmk)}</strong></td>
                <td>${escHtml(m.cpl_terkait.join(", "))}</td>
                <td>${escHtml(m.level_taksonomi)}</td>
                <td>${escHtml(m.deskripsi)}</td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="4">Belum ada CPMK.</td></tr>`
    }
  </table>

  <table>
    <tr><th colspan="6">SUB-CPMK (KEMAMPUAN AKHIR TIAP TAHAPAN BELAJAR)</th></tr>
    <tr class="sub-header">
      <td style="width:13%;">Kode</td>
      <td style="width:12%;">CPMK</td>
      <td style="width:28%;">Rumusan Sub-CPMK</td>
      <td style="width:25%;">Indikator Pencapaian</td>
      <td style="width:14%;">Bentuk Penilaian</td>
      <td style="width:8%;">Bobot</td>
    </tr>
    ${
      daftar_sub_cpmk.length > 0
        ? daftar_sub_cpmk
            .map(
              (s) => `<tr>
                <td><strong>${escHtml(s.kode_sub_cpmk)}</strong></td>
                <td>${escHtml(s.cpmk_terkait)}</td>
                <td>${escHtml(s.deskripsi)}</td>
                <td>${escHtml(s.indikator_pencapaian)}</td>
                <td>${escHtml(s.bentuk_penilaian)}</td>
                <td class="center">${s.bobot_penilaian}%</td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="6">Belum ada Sub-CPMK.</td></tr>`
    }
  </table>

  <table>
    <tr><th colspan="2">DESKRIPSI SINGKAT MK &amp; BAHAN KAJIAN</th></tr>
    <tr>
      <td style="width:22%;"><strong>Deskripsi Singkat MK</strong></td>
      <td>${escHtml(payload.deskripsi_mk || "-").replace(/\n/g, "<br/>")}</td>
    </tr>
    <tr>
      <td><strong>Bahan Kajian Utama</strong></td>
      <td>${escHtml(payload.bahan_kajian_utama || "-").replace(/\n/g, "<br/>")}</td>
    </tr>
    <tr>
      <td><strong>Pustaka Utama</strong></td>
      <td>${pustaka.utama.length ? pustaka.utama.map((p, i) => `${i + 1}. ${escHtml(p)}`).join("<br/>") : "-"}</td>
    </tr>
    <tr>
      <td><strong>Pustaka Pendukung</strong></td>
      <td>${pustaka.pendukung.length ? pustaka.pendukung.map((p, i) => `${i + 1}. ${escHtml(p)}`).join("<br/>") : "-"}</td>
    </tr>
  </table>

  <table>
    <tr><th colspan="6">RENCANA PEMBELAJARAN SEMESTER (MATRIKS 16 PERTEMUAN)</th></tr>
    <tr class="sub-header">
      <td style="width:6%;" class="center">Mg Ke-</td>
      <td style="width:16%;">Sub-CPMK</td>
      <td style="width:22%;">Indikator &amp; Kriteria Penilaian</td>
      <td style="width:22%;">Bentuk, Metode &amp; Estimasi Waktu</td>
      <td style="width:26%;">Bahan Kajian / Materi Pembelajaran</td>
      <td style="width:8%;" class="center">Bobot (%)</td>
    </tr>
    ${rencana_16_minggu
      .map((w) => {
        const isExam = w.minggu_ke === 8 || w.minggu_ke === 16;
        return `<tr class="${isExam ? "uts-row" : ""}">
          <td class="center">${w.minggu_ke}</td>
          <td>${escHtml(w.sub_cpmk_kode || "-")}</td>
          <td>${escHtml(w.indikator_kriteria || "-")}</td>
          <td><strong>${escHtml(w.metode_pembelajaran)}</strong><br/><span style="font-size:8.5pt; color:#475569;">${escHtml(w.estimasi_waktu)}</span></td>
          <td>${escHtml(w.materi_pembelajaran || "-")}</td>
          <td class="center">${w.bobot_persen}%</td>
        </tr>`;
      })
      .join("")}
    <tr class="sub-header">
      <td colspan="5" style="text-align:right;">TOTAL BOBOT PENILAIAN (Tugas/Kuis: ${rekap.tugas_kuis}% | CBL/PBL/Prak: ${rekap.cbl_pbl_praktikum}% | UTS: ${rekap.uts}% | UAS: ${rekap.uas}%)</td>
      <td class="center">${rekap.total}%</td>
    </tr>
  </table>
</body>
</html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeCode = (identitas.kode_mk || "MK").replace(/[^a-zA-Z0-9_-]/g, "_");
  link.href = url;
  link.download = `RPS_OBE_${safeCode}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
