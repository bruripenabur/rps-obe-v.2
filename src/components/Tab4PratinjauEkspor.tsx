import { useState } from "react";
import {
  Printer,
  FileDown,
  Save,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { RpsPayload } from "../types/rps";
import {
  UNPATTI_LOGO_URL,
  computeRekapBobot,
  exportRpsToWord,
} from "../utils/rpsDefaults";

interface Tab4PratinjauEksporProps {
  payload: RpsPayload;
  saving: boolean;
  onSaveOnly: () => void;
  onSaveAndRelay: () => void;
}

export function Tab4PratinjauEkspor({
  payload,
  saving,
  onSaveOnly,
  onSaveAndRelay,
}: Tab4PratinjauEksporProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  const {
    identitas,
    otorisasi,
    deskripsi_mk,
    bahan_kajian_utama,
    daftar_cpl,
    daftar_cpmk,
    daftar_sub_cpmk,
    rencana_16_minggu,
    pustaka,
  } = payload;

  const totalSks =
    (Number(identitas.sks_teori) || 0) + (Number(identitas.sks_praktikum) || 0);
  const rekap = computeRekapBobot(rencana_16_minggu);

  return (
    <div className="space-y-6">
      {/* Export Toolbar (hidden when printing) */}
      <div className="no-print flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-[#0f172a]">
            Pratinjau Dokumen Resmi RPS OBE (Standar SN-Dikti / Universitas Pattimura)
          </h2>
          <p className="text-xs text-slate-500">
            Periksa kelengkapan identitas, pemetaan CPL–CPMK–Sub-CPMK, matriks 16 minggu, dan blok otorisasi sebelum mencetak atau menyimpan ke ekosistem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-slate-50"
          >
            <Printer className="h-4 w-4 text-[#0b3d91]" />
            <span>Cetak / Simpan PDF RPS</span>
          </button>
          <button
            type="button"
            onClick={() => exportRpsToWord(payload)}
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-[#0b3d91] bg-[#0b3d91]/5 px-4 text-sm font-semibold text-[#0b3d91] transition-colors hover:bg-[#0b3d91]/10"
          >
            <FileDown className="h-4 w-4" />
            <span>Ekspor ke Word (.doc)</span>
          </button>
        </div>
      </div>

      {/* Weight Reminder if not 100% */}
      {rekap.total !== 100 && (
        <div className="no-print flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
          <span>
            Perhatian: Total bobot penilaian pada Matriks 16 Pertemuan saat ini{" "}
            <strong className="font-mono">{rekap.total}%</strong> (disarankan tepat 100% sebelum finalisasi).
          </span>
        </div>
      )}

      {/* Official RPS Sheet */}
      <div className="print-only-container rounded-xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
        {/* Institution Kop / Header */}
        <table className="w-full border-collapse border border-slate-800 text-xs">
          <tbody>
            <tr>
              <td className="w-24 border border-slate-800 p-3 text-center align-middle">
                {!logoFailed ? (
                  <img
                    src={UNPATTI_LOGO_URL}
                    alt="Logo Universitas Pattimura"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoFailed(true)}
                    className="mx-auto h-16 w-16 object-contain"
                  />
                ) : (
                  <GraduationCap className="mx-auto h-12 w-12 text-[#0b3d91]" />
                )}
              </td>
              <td className="border border-slate-800 p-3 text-center align-middle">
                <p className="text-sm font-bold tracking-wide text-[#0b3d91]">
                  UNIVERSITAS PATTIMURA
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {identitas.fakultas || "PUSAT KURIKULUM DAN INOVASI PEMBELAJARAN"}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  PROGRAM STUDI {identitas.prodi ? identitas.prodi.toUpperCase() : "-"}
                </p>
                <p className="mt-1.5 border-t border-slate-300 pt-1 text-sm font-extrabold tracking-wide text-[#0f172a]">
                  RENCANA PEMBELAJARAN SEMESTER (RPS) OBE
                </p>
              </td>
              <td className="w-48 border border-slate-800 p-3 align-top text-[11px]">
                <p>
                  <strong>Kode Dokumen:</strong>{" "}
                  <span className="font-mono">RPS-{identitas.kode_mk || "MK"}</span>
                </p>
                <p className="mt-1">
                  <strong>Tahun Akademik:</strong> {identitas.tahun_akademik || "-"}
                </p>
                <p className="mt-1">
                  <strong>Tanggal Penyusunan:</strong>{" "}
                  <span className="font-mono">{identitas.tanggal_penyusunan || "-"}</span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Course Identity Grid */}
        <table className="mt-3 w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr className="bg-[#0b3d91] text-white">
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                MATA KULIAH (MK)
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                KODE
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                RUMPUN MK
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                BOBOT (SKS)
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-center">
                SEMESTER
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                MK PRASYARAT
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-800 px-2.5 py-2 font-bold">
                {identitas.nama_mk || "-"}
              </td>
              <td className="border border-slate-800 px-2.5 py-2 font-mono">
                {identitas.kode_mk || "-"}
              </td>
              <td className="border border-slate-800 px-2.5 py-2">
                {identitas.rumpun_mk || "-"}
              </td>
              <td className="border border-slate-800 px-2.5 py-2 font-mono tabular-nums">
                T={identitas.sks_teori}, P={identitas.sks_praktikum} (Total {totalSks} SKS)
              </td>
              <td className="border border-slate-800 px-2.5 py-2 text-center font-mono tabular-nums">
                {identitas.semester}
              </td>
              <td className="border border-slate-800 px-2.5 py-2">
                {identitas.prasyarat || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* CPL & CPMK & Sub-CPMK */}
        <table className="mt-3 w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr className="bg-[#0b3d91] text-white">
              <th colSpan={3} className="border border-slate-800 px-2.5 py-2 text-left">
                CAPAIAN PEMBELAJARAN (CPL-PRODI, CPMK &amp; SUB-CPMK)
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-900">
              <th className="w-28 border border-slate-800 px-2.5 py-1.5 text-left">
                Kode
              </th>
              <th className="w-40 border border-slate-800 px-2.5 py-1.5 text-left">
                Klasifikasi / Pemetaan
              </th>
              <th className="border border-slate-800 px-2.5 py-1.5 text-left">
                Rumusan Capaian Pembelajaran
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-50 font-bold text-[#0b3d91]">
              <td colSpan={3} className="border border-slate-800 px-2.5 py-1.5">
                A. CPL-Prodi yang Dibebankan pada Mata Kuliah
              </td>
            </tr>
            {daftar_cpl.length > 0 ? (
              daftar_cpl.map((c) => (
                <tr key={c.id}>
                  <td className="border border-slate-800 px-2.5 py-1.5 font-mono font-bold">
                    {c.kode_cpl}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-1.5">
                    {c.unsur}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-1.5">
                    {c.deskripsi}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border border-slate-800 px-2.5 py-2 italic text-slate-500"
                >
                  Belum ada CPL yang ditetapkan.
                </td>
              </tr>
            )}

            <tr className="bg-slate-50 font-bold text-[#0b3d91]">
              <td colSpan={3} className="border border-slate-800 px-2.5 py-1.5">
                B. Capaian Pembelajaran Mata Kuliah (CPMK)
              </td>
            </tr>
            {daftar_cpmk.length > 0 ? (
              daftar_cpmk.map((m) => (
                <tr key={m.id}>
                  <td className="border border-slate-800 px-2.5 py-1.5 font-mono font-bold">
                    {m.kode_cpmk}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-1.5">
                    <span className="font-mono font-semibold">
                      {m.cpl_terkait.join(", ") || "-"}
                    </span>
                    <br />
                    <span className="text-[11px] text-slate-600">
                      {m.level_taksonomi}
                    </span>
                  </td>
                  <td className="border border-slate-800 px-2.5 py-1.5">
                    {m.deskripsi}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border border-slate-800 px-2.5 py-2 italic text-slate-500"
                >
                  Belum ada CPMK yang ditetapkan.
                </td>
              </tr>
            )}

            <tr className="bg-slate-50 font-bold text-[#0b3d91]">
              <td colSpan={3} className="border border-slate-800 px-2.5 py-1.5">
                C. Kemampuan Akhir Tiap Tahapan Belajar (Sub-CPMK)
              </td>
            </tr>
            {daftar_sub_cpmk.length > 0 ? (
              daftar_sub_cpmk.map((s) => (
                <tr key={s.id}>
                  <td className="border border-slate-800 px-2.5 py-1.5 font-mono font-bold">
                    {s.kode_sub_cpmk}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-1.5">
                    <span className="font-mono font-semibold">
                      {s.cpmk_terkait || "-"}
                    </span>
                    <br />
                    <span className="text-[11px] text-slate-600">
                      {s.bentuk_penilaian} ({s.bobot_penilaian}%)
                    </span>
                  </td>
                  <td className="border border-slate-800 px-2.5 py-1.5">
                    <p>{s.deskripsi}</p>
                    {s.indikator_pencapaian && (
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        <strong>Indikator:</strong> {s.indikator_pencapaian}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border border-slate-800 px-2.5 py-2 italic text-slate-500"
                >
                  Belum ada Sub-CPMK yang ditetapkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Deskripsi MK, Bahan Kajian & Pustaka */}
        <table className="mt-3 w-full border-collapse border border-slate-800 text-xs">
          <tbody>
            <tr>
              <th
                colSpan={2}
                className="border border-slate-800 bg-[#0b3d91] px-2.5 py-2 text-left text-white"
              >
                DESKRIPSI SINGKAT MK, BAHAN KAJIAN &amp; PUSTAKA
              </th>
            </tr>
            <tr>
              <td className="w-44 border border-slate-800 bg-slate-50 px-2.5 py-2 font-bold align-top">
                Deskripsi Singkat MK
              </td>
              <td className="border border-slate-800 px-2.5 py-2 whitespace-pre-line">
                {deskripsi_mk || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-800 bg-slate-50 px-2.5 py-2 font-bold align-top">
                Bahan Kajian Utama
              </td>
              <td className="border border-slate-800 px-2.5 py-2 whitespace-pre-line">
                {bahan_kajian_utama || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-800 bg-slate-50 px-2.5 py-2 font-bold align-top">
                Pustaka Utama
              </td>
              <td className="border border-slate-800 px-2.5 py-2">
                {pustaka.utama.length > 0 ? (
                  <ol className="list-decimal pl-4 space-y-0.5">
                    {pustaka.utama.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-800 bg-slate-50 px-2.5 py-2 font-bold align-top">
                Pustaka Pendukung
              </td>
              <td className="border border-slate-800 px-2.5 py-2">
                {pustaka.pendukung.length > 0 ? (
                  <ol className="list-decimal pl-4 space-y-0.5">
                    {pustaka.pendukung.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Matriks Rencana 16 Pertemuan */}
        <table className="mt-3 w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr className="bg-[#0b3d91] text-white">
              <th
                colSpan={6}
                className="border border-slate-800 px-2.5 py-2 text-left"
              >
                MATRIKS RENCANA PEMBELAJARAN SEMESTER (16 PERTEMUAN)
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-900">
              <th className="w-14 border border-slate-800 px-2 py-2 text-center">
                Mg Ke-
              </th>
              <th className="w-36 border border-slate-800 px-2.5 py-2 text-left">
                Sub-CPMK
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                Indikator &amp; Kriteria Penilaian
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                Bentuk, Metode Pembelajaran &amp; Estimasi Waktu
              </th>
              <th className="border border-slate-800 px-2.5 py-2 text-left">
                Bahan Kajian / Materi Pembelajaran
              </th>
              <th className="w-20 border border-slate-800 px-2 py-2 text-center">
                Bobot (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {rencana_16_minggu.map((w) => {
              const isExam = w.minggu_ke === 8 || w.minggu_ke === 16;
              return (
                <tr
                  key={w.minggu_ke}
                  className={isExam ? "bg-[#ffcc00]/20 font-semibold" : ""}
                >
                  <td className="border border-slate-800 px-2 py-2 text-center font-mono font-bold tabular-nums">
                    {w.minggu_ke}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-2 font-mono text-[11px]">
                    {w.sub_cpmk_kode || "-"}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-2">
                    {w.indikator_kriteria || "-"}
                  </td>
                  <td className="border border-slate-800 px-2.5 py-2">
                    <p>{w.metode_pembelajaran || "-"}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-600">
                      {w.estimasi_waktu}
                    </p>
                  </td>
                  <td className="border border-slate-800 px-2.5 py-2">
                    {w.materi_pembelajaran || "-"}
                  </td>
                  <td className="border border-slate-800 px-2 py-2 text-center font-mono font-bold tabular-nums">
                    {w.bobot_persen}%
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-100 font-bold">
              <td
                colSpan={5}
                className="border border-slate-800 px-3 py-2 text-right tabular-nums"
              >
                TOTAL BOBOT PENILAIAN (Tugas/Kuis: {rekap.tugas_kuis}% · CBL/PBL/Praktikum: {rekap.cbl_pbl_praktikum}% · UTS: {rekap.uts}% · UAS: {rekap.uas}%)
              </td>
              <td className="border border-slate-800 px-2 py-2 text-center font-mono text-sm tabular-nums text-[#0b3d91]">
                {rekap.total}%
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature Block */}
        <table className="mt-4 w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900">
              <th className="w-1/4 border border-slate-800 px-3 py-2 text-center">
                Dosen Pengampu / Pengembang RPS
              </th>
              <th className="w-1/4 border border-slate-800 px-3 py-2 text-center">
                Koordinator Rumpun MK
              </th>
              <th className="w-1/4 border border-slate-800 px-3 py-2 text-center">
                Menyetujui, Ketua Program Studi
              </th>
              <th className="w-1/4 border border-slate-800 px-3 py-2 text-center">
                Mengetahui, Ketua GJM
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="h-24 border border-slate-800 px-3 py-2 text-center align-bottom font-semibold">
                {otorisasi.dosen_pengampu || "(.......................................)"}
              </td>
              <td className="h-24 border border-slate-800 px-3 py-2 text-center align-bottom font-semibold">
                {otorisasi.koordinator_rmk || "(.......................................)"}
              </td>
              <td className="h-24 border border-slate-800 px-3 py-2 text-center align-bottom font-semibold">
                {otorisasi.ketua_prodi || "(.......................................)"}
              </td>
              <td className="h-24 border border-slate-800 px-3 py-2 text-center align-bottom font-semibold">
                {otorisasi.ketua_gjm || "(.......................................)"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Relay Action Card (Hidden when printing) */}
      <div className="no-print rounded-xl border-2 border-[#ffcc00] bg-[#0b3d91] p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#ffcc00]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Estafet Ekosistem Digital OBE (Modul 1 → Modul 2)</span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              Simpan RPS Terpusat ke Supabase &amp; Lanjutkan Penyusunan Buku Ajar
            </h3>
            <p className="mt-1 text-xs text-blue-100">
              Seluruh struktur identitas, pemetaan CPL–CPMK–Sub-CPMK, matriks 16 minggu, dan rekap bobot akan disimpan ke tabel{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[#ffcc00]">
                obe_rps
              </code>{" "}
              untuk dibaca oleh Modul 2 (Buku Ajar), Modul 3 (SIRUBRIK), Modul 4, dan Modul 5.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onSaveOnly}
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Saja (Tetap di Modul RPS)"}</span>
            </button>

            <button
              type="button"
              onClick={onSaveAndRelay}
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-[#ffcc00] px-5 text-sm font-bold text-[#0f172a] shadow-sm transition-colors hover:bg-[#eab308] disabled:opacity-60"
            >
              <span>Simpan RPS ke Ekosistem &amp; Lanjut ke Modul Buku Ajar →</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
