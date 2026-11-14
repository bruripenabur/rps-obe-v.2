import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookMarked,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Scale,
} from "lucide-react";
import type {
  KategoriAsesmen,
  PertemuanItem,
  PustakaRps,
  SubCpmkItem,
} from "../types/rps";
import { computeRekapBobot, formatEstimasiWaktu } from "../utils/rpsDefaults";

interface Tab3Rencana16MingguProps {
  sksTeori: number;
  sksPraktikum: number;
  daftarSubCpmk: SubCpmkItem[];
  rencana16Minggu: PertemuanItem[];
  pustaka: PustakaRps;
  aiLoading: boolean;
  aiError: string | null;
  onGenerateAiWeeks: () => void;
  onUpdateWeeks: (weeks: PertemuanItem[]) => void;
  onUpdatePustaka: (pustaka: PustakaRps) => void;
  onNextTab: () => void;
}

const KATEGORI_LABELS: Record<KategoriAsesmen, string> = {
  tugas_kuis: "Tugas / Kuis",
  cbl_pbl_praktikum: "CBL / PBL / Praktikum",
  uts: "UTS",
  uas: "UAS",
};

export function Tab3Rencana16Minggu({
  sksTeori,
  sksPraktikum,
  daftarSubCpmk,
  rencana16Minggu,
  pustaka,
  aiLoading,
  aiError,
  onGenerateAiWeeks,
  onUpdateWeeks,
  onUpdatePustaka,
  onNextTab,
}: Tab3Rencana16MingguProps) {
  const [newUtama, setNewUtama] = useState("");
  const [newPendukung, setNewPendukung] = useState("");

  const rekap = computeRekapBobot(rencana16Minggu);
  const isValidTotal = rekap.total === 100;

  const handlePatchWeek = (
    mingguKe: number,
    patch: Partial<PertemuanItem>
  ) => {
    onUpdateWeeks(
      rencana16Minggu.map((w) =>
        w.minggu_ke === mingguKe ? { ...w, ...patch } : w
      )
    );
  };

  const handleApplySksTimeAll = () => {
    const timeStr = formatEstimasiWaktu(sksTeori, sksPraktikum);
    onUpdateWeeks(
      rencana16Minggu.map((w) => ({ ...w, estimasi_waktu: timeStr }))
    );
  };

  const handleBalanceTo100 = () => {
    if (rekap.total === 100) return;
    const diff = 100 - rekap.total;
    const updated = [...rencana16Minggu];
    // Prefer adjusting UAS (week 16) if it keeps UAS >= 10, otherwise distribute cleanly
    const uasIdx = updated.findIndex((w) => w.minggu_ke === 16);
    if (uasIdx >= 0 && updated[uasIdx].bobot_persen + diff >= 10) {
      updated[uasIdx] = {
        ...updated[uasIdx],
        bobot_persen: updated[uasIdx].bobot_persen + diff,
      };
      onUpdateWeeks(updated);
      return;
    }

    if (rekap.total === 0) {
      onUpdateWeeks(
        updated.map((w) => {
          if (w.minggu_ke === 4) return { ...w, kategori_asesmen: "tugas_kuis", bobot_persen: 10 };
          if (w.minggu_ke === 6) return { ...w, kategori_asesmen: "cbl_pbl_praktikum", bobot_persen: 15 };
          if (w.minggu_ke === 8) return { ...w, kategori_asesmen: "uts", bobot_persen: 25 };
          if (w.minggu_ke === 12) return { ...w, kategori_asesmen: "tugas_kuis", bobot_persen: 10 };
          if (w.minggu_ke === 14) return { ...w, kategori_asesmen: "cbl_pbl_praktikum", bobot_persen: 15 };
          if (w.minggu_ke === 16) return { ...w, kategori_asesmen: "uas", bobot_persen: 25 };
          return { ...w, bobot_persen: 0 };
        })
      );
      return;
    }

    let running = 0;
    const scaled = updated.map((w, i) => {
      if (i === updated.length - 1) {
        return { ...w, bobot_persen: Math.max(0, 100 - running) };
      }
      const val = Math.round((w.bobot_persen / rekap.total) * 100);
      running += val;
      return { ...w, bobot_persen: val };
    });
    onUpdateWeeks(scaled);
  };

  const handleAddUtama = () => {
    const val = newUtama.trim();
    if (!val) return;
    onUpdatePustaka({ ...pustaka, utama: [...pustaka.utama, val] });
    setNewUtama("");
  };

  const handleAddPendukung = () => {
    const val = newPendukung.trim();
    if (!val) return;
    onUpdatePustaka({ ...pustaka, pendukung: [...pustaka.pendukung, val] });
    setNewPendukung("");
  };

  const WeightValidatorBar = () => (
    <div
      className={`rounded-xl border p-4 ${
        isValidTotal
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-amber-300 bg-amber-50/80"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-2.5 sm:items-center">
          {isValidTotal ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
          )}
          <div>
            <p
              className={`text-sm font-bold tabular-nums ${
                isValidTotal ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              Total Bobot Penilaian: {rekap.total}%{" "}
              {isValidTotal
                ? "— Valid (Tepat 100%)"
                : rekap.total < 100
                ? `— Kurang ${100 - rekap.total}% untuk mencapai 100%`
                : `— Kelebihan ${rekap.total - 100}% (Harus tepat 100%)`}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 tabular-nums">
              <span>
                Tugas / Kuis: <strong className="font-mono">{rekap.tugas_kuis}%</strong>
              </span>
              <span>
                CBL / PBL / Praktikum:{" "}
                <strong className="font-mono">{rekap.cbl_pbl_praktikum}%</strong>
              </span>
              <span>
                UTS (Minggu 8): <strong className="font-mono">{rekap.uts}%</strong>
              </span>
              <span>
                UAS (Minggu 16): <strong className="font-mono">{rekap.uas}%</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleApplySksTimeAll}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Clock className="h-3.5 w-3.5 text-[#0b3d91]" />
            <span>Sinkronkan Estimasi Waktu ({sksTeori}T/{sksPraktikum}P)</span>
          </button>

          {!isValidTotal && (
            <button
              type="button"
              onClick={handleBalanceTo100}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-amber-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Seimbangkan ke 100%</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* AI Pola B Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#0b3d91]/20 bg-[#0b3d91] p-5 text-white shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-wide text-[#ffcc00]">
            Generator Peta Pembelajaran 16 Minggu (Gemini AI)
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-white">
            Rencana Pembelajaran Semester (Minggu 1–16) &amp; Daftar Pustaka
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-blue-100">
            Menyusun pertemuan 1–7, UTS (Minggu 8), pertemuan 9–15 berbasis Case-Based / Project-Based Learning, UAS (Minggu 16), lengkap dengan bobot tepat 100% dan referensi pustaka.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateAiWeeks}
          disabled={aiLoading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#ffcc00] px-5 text-sm font-bold text-[#0f172a] shadow-sm transition-colors hover:bg-[#eab308] disabled:opacity-60"
        >
          {aiLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyusun Matriks 16 Minggu...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>✨ Generate Rencana Pembelajaran 16 Minggu Otomatis dengan AI</span>
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Gagal menghasilkan matriks 16 minggu</p>
            <p className="mt-0.5">{aiError}</p>
          </div>
        </div>
      )}

      {/* Top Validator */}
      <WeightValidatorBar />

      {/* Interactive 16-Week Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="w-16 px-3 py-3 text-center font-semibold">
                  Minggu Ke-
                </th>
                <th className="w-48 px-3 py-3 font-semibold">
                  Sub-CPMK (dari Tab 2)
                </th>
                <th className="w-56 px-3 py-3 font-semibold">
                  Indikator &amp; Kriteria Penilaian
                </th>
                <th className="w-56 px-3 py-3 font-semibold">
                  Bentuk, Metode Pembelajaran &amp; Estimasi Waktu
                </th>
                <th className="w-60 px-3 py-3 font-semibold">
                  Bahan Kajian / Materi Pembelajaran
                </th>
                <th className="w-40 px-3 py-3 font-semibold">
                  Kategori &amp; Bobot (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rencana16Minggu.map((week) => {
                const isUts = week.minggu_ke === 8;
                const isUas = week.minggu_ke === 16;
                const isExam = isUts || isUas;

                return (
                  <tr
                    key={week.minggu_ke}
                    className={
                      isExam
                        ? "bg-[#ffcc00]/15"
                        : "bg-white hover:bg-slate-50/70"
                    }
                  >
                    {/* Minggu Ke- */}
                    <td className="px-3 py-3 text-center align-top">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b3d91] font-mono text-xs font-bold text-white tabular-nums">
                        {week.minggu_ke}
                      </div>
                      {isUts && (
                        <div className="mt-1 font-mono text-[10px] font-bold text-[#0b3d91]">
                          UTS
                        </div>
                      )}
                      {isUas && (
                        <div className="mt-1 font-mono text-[10px] font-bold text-[#0b3d91]">
                          UAS
                        </div>
                      )}
                    </td>

                    {/* Sub-CPMK */}
                    <td className="px-3 py-3 align-top">
                      <select
                        value={week.sub_cpmk_kode}
                        onChange={(e) =>
                          handlePatchWeek(week.minggu_ke, {
                            sub_cpmk_kode: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                      >
                        <option value="">-- Pilih Sub-CPMK --</option>
                        <option value="UTS (Evaluasi Tengah Semester)">
                          UTS (Evaluasi Tengah Semester)
                        </option>
                        <option value="UAS (Evaluasi Akhir Semester)">
                          UAS (Evaluasi Akhir Semester)
                        </option>
                        {daftarSubCpmk.map((s) => (
                          <option key={s.id} value={s.kode_sub_cpmk}>
                            {s.kode_sub_cpmk} ({s.cpmk_terkait})
                          </option>
                        ))}
                        {week.sub_cpmk_kode &&
                          week.sub_cpmk_kode !== "UTS (Evaluasi Tengah Semester)" &&
                          week.sub_cpmk_kode !== "UAS (Evaluasi Akhir Semester)" &&
                          !daftarSubCpmk.some(
                            (s) => s.kode_sub_cpmk === week.sub_cpmk_kode
                          ) && (
                            <option value={week.sub_cpmk_kode}>
                              {week.sub_cpmk_kode}
                            </option>
                          )}
                      </select>
                      {week.sub_cpmk_kode &&
                        daftarSubCpmk.find(
                          (s) => s.kode_sub_cpmk === week.sub_cpmk_kode
                        )?.deskripsi && (
                          <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                            {
                              daftarSubCpmk.find(
                                (s) => s.kode_sub_cpmk === week.sub_cpmk_kode
                              )?.deskripsi
                            }
                          </p>
                        )}
                    </td>

                    {/* Indikator & Kriteria */}
                    <td className="px-3 py-3 align-top">
                      <textarea
                        rows={3}
                        value={week.indikator_kriteria}
                        onChange={(e) =>
                          handlePatchWeek(week.minggu_ke, {
                            indikator_kriteria: e.target.value,
                          })
                        }
                        placeholder="Indikator pencapaian & kriteria rubrik..."
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs leading-snug text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                      />
                    </td>

                    {/* Bentuk, Metode & Estimasi Waktu */}
                    <td className="px-3 py-3 align-top">
                      <div className="space-y-1.5">
                        <textarea
                          rows={2}
                          value={week.metode_pembelajaran}
                          onChange={(e) =>
                            handlePatchWeek(week.minggu_ke, {
                              metode_pembelajaran: e.target.value,
                            })
                          }
                          placeholder="CBL / PjBL / SCL / Diskusi..."
                          className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs leading-snug text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={week.estimasi_waktu}
                          onChange={(e) =>
                            handlePatchWeek(week.minggu_ke, {
                              estimasi_waktu: e.target.value,
                            })
                          }
                          placeholder="PB: 2x50'; PT: 2x60'; BM: 2x60'"
                          className="h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 font-mono text-[11px] text-slate-700 focus:border-[#0b3d91] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </td>

                    {/* Bahan Kajian / Materi */}
                    <td className="px-3 py-3 align-top">
                      <textarea
                        rows={3}
                        value={week.materi_pembelajaran}
                        onChange={(e) =>
                          handlePatchWeek(week.minggu_ke, {
                            materi_pembelajaran: e.target.value,
                          })
                        }
                        placeholder={`Topik bahasan minggu ke-${week.minggu_ke}...`}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs leading-snug text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                      />
                    </td>

                    {/* Kategori & Bobot (%) */}
                    <td className="px-3 py-3 align-top">
                      <div className="space-y-1.5">
                        <select
                          value={week.kategori_asesmen}
                          onChange={(e) =>
                            handlePatchWeek(week.minggu_ke, {
                              kategori_asesmen: e.target.value as KategoriAsesmen,
                            })
                          }
                          className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px] text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                        >
                          {(
                            Object.keys(KATEGORI_LABELS) as KategoriAsesmen[]
                          ).map((k) => (
                            <option key={k} value={k}>
                              {KATEGORI_LABELS[k]}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={week.bobot_persen}
                            onChange={(e) =>
                              handlePatchWeek(week.minggu_ke, {
                                bobot_persen: Math.max(
                                  0,
                                  Number(e.target.value) || 0
                                ),
                              })
                            }
                            className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-right font-mono text-xs font-bold tabular-nums text-[#0b3d91] focus:border-[#0b3d91] focus:outline-none"
                          />
                          <span className="font-mono text-xs font-semibold text-slate-600">
                            %
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Validator */}
      <WeightValidatorBar />

      {/* Daftar Pustaka Utama & Pendukung */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b3d91]/10 text-[#0b3d91]">
            <BookMarked className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#0f172a]">
              Daftar Pustaka (Utama &amp; Pendukung)
            </h3>
            <p className="text-xs text-slate-500">
              Referensi buku teks, artikel jurnal mutakhir, dan modul ajar yang dirujuk dalam perkuliahan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pustaka Utama */}
          <div>
            <h4 className="mb-2 text-xs font-bold text-slate-800">
              Pustaka Utama
            </h4>
            <div className="mb-2.5 flex gap-2">
              <input
                type="text"
                value={newUtama}
                onChange={(e) => setNewUtama(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUtama()}
                placeholder="Penulis (Tahun). Judul Buku/Artikel. Penerbit."
                className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-xs focus:border-[#0b3d91] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddUtama}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#0b3d91] px-3 text-xs font-semibold text-white hover:bg-[#09327a]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {pustaka.utama.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Belum ada pustaka utama.
              </p>
            ) : (
              <ul className="space-y-2">
                {pustaka.utama.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800"
                  >
                    <span className="leading-relaxed">
                      <strong className="font-mono text-[#0b3d91]">
                        {idx + 1}.
                      </strong>{" "}
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePustaka({
                          ...pustaka,
                          utama: pustaka.utama.filter((_, i) => i !== idx),
                        })
                      }
                      className="shrink-0 text-red-500 hover:text-red-700"
                      title="Hapus referensi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pustaka Pendukung */}
          <div>
            <h4 className="mb-2 text-xs font-bold text-slate-800">
              Pustaka Pendukung
            </h4>
            <div className="mb-2.5 flex gap-2">
              <input
                type="text"
                value={newPendukung}
                onChange={(e) => setNewPendukung(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPendukung()}
                placeholder="Penulis (Tahun). Judul Artikel Jurnal / Referensi Tambahan."
                className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-xs focus:border-[#0b3d91] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPendukung}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#0b3d91] px-3 text-xs font-semibold text-white hover:bg-[#09327a]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {pustaka.pendukung.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Belum ada pustaka pendukung.
              </p>
            ) : (
              <ul className="space-y-2">
                {pustaka.pendukung.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800"
                  >
                    <span className="leading-relaxed">
                      <strong className="font-mono text-[#0b3d91]">
                        {idx + 1}.
                      </strong>{" "}
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePustaka({
                          ...pustaka,
                          pendukung: pustaka.pendukung.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                      className="shrink-0 text-red-500 hover:text-red-700"
                      title="Hapus referensi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onNextTab}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b3d91] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#09327a]"
          >
            <span>Lanjut ke Pratinjau Dokumen Resmi &amp; Ekspor</span>
            <ArrowRight className="h-4 w-4 text-[#ffcc00]" />
          </button>
        </div>
      </section>
    </div>
  );
}
