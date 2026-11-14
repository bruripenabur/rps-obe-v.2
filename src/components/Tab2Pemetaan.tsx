import {
  Sparkles,
  Plus,
  Trash2,
  GitBranch,
  Layers,
  Target,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { CplItem, CpmkItem, SubCpmkItem } from "../types/rps";

interface Tab2PemetaanProps {
  daftarCpl: CplItem[];
  daftarCpmk: CpmkItem[];
  daftarSubCpmk: SubCpmkItem[];
  isFromModul0: boolean;
  aiLoading: boolean;
  aiError: string | null;
  onGenerateAi: () => void;
  onUpdateCpl: (list: CplItem[]) => void;
  onUpdateCpmk: (list: CpmkItem[]) => void;
  onUpdateSubCpmk: (list: SubCpmkItem[]) => void;
  onNextTab: () => void;
}

const UNSUR_OPTIONS = [
  "Sikap",
  "Pengetahuan",
  "Keterampilan Umum",
  "Keterampilan Khusus",
];

const TAKSONOMI_OPTIONS = [
  "C2 - Memahami",
  "C3 - Mengaplikasikan",
  "C4 - Menganalisis",
  "C5 - Mengevaluasi",
  "C6 - Mencipta",
  "A3 - Menghargai",
  "A4 - Mengorganisasi",
  "P3 - Presisi",
  "P4 - Artikulasi",
  "P5 - Naturalisasi",
];

export function Tab2Pemetaan({
  daftarCpl,
  daftarCpmk,
  daftarSubCpmk,
  isFromModul0,
  aiLoading,
  aiError,
  onGenerateAi,
  onUpdateCpl,
  onUpdateCpmk,
  onUpdateSubCpmk,
  onNextTab,
}: Tab2PemetaanProps) {
  const totalSubBobot = daftarSubCpmk.reduce(
    (sum, s) => sum + (Number(s.bobot_penilaian) || 0),
    0
  );

  // CPL handlers
  const handleAddCpl = () => {
    const nextNum = daftarCpl.length + 1;
    onUpdateCpl([
      ...daftarCpl,
      {
        id: `cpl-${Date.now()}-${nextNum}`,
        kode_cpl: `CPL-${String(nextNum).padStart(2, "0")}`,
        unsur: "Pengetahuan",
        deskripsi: "",
      },
    ]);
  };

  const handlePatchCpl = (id: string, patch: Partial<CplItem>) => {
    onUpdateCpl(daftarCpl.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleRemoveCpl = (id: string) => {
    onUpdateCpl(daftarCpl.filter((c) => c.id !== id));
  };

  // CPMK handlers
  const handleAddCpmk = () => {
    const nextNum = daftarCpmk.length + 1;
    const defaultCpl = daftarCpl[0]?.kode_cpl ? [daftarCpl[0].kode_cpl] : [];
    onUpdateCpmk([
      ...daftarCpmk,
      {
        id: `cpmk-${Date.now()}-${nextNum}`,
        kode_cpmk: `CPMK-${nextNum}`,
        cpl_terkait: defaultCpl,
        level_taksonomi: "C4 - Menganalisis",
        deskripsi: "",
      },
    ]);
  };

  const handlePatchCpmk = (id: string, patch: Partial<CpmkItem>) => {
    onUpdateCpmk(daftarCpmk.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const handleToggleCplOnCpmk = (cpmkId: string, kodeCpl: string) => {
    onUpdateCpmk(
      daftarCpmk.map((m) => {
        if (m.id !== cpmkId) return m;
        const exists = m.cpl_terkait.includes(kodeCpl);
        return {
          ...m,
          cpl_terkait: exists
            ? m.cpl_terkait.filter((x) => x !== kodeCpl)
            : [...m.cpl_terkait, kodeCpl],
        };
      })
    );
  };

  const handleRemoveCpmk = (id: string) => {
    onUpdateCpmk(daftarCpmk.filter((m) => m.id !== id));
  };

  // Sub-CPMK handlers
  const handleAddSubCpmk = () => {
    const nextNum = daftarSubCpmk.length + 1;
    const defaultCpmk = daftarCpmk[0]?.kode_cpmk || "CPMK-1";
    onUpdateSubCpmk([
      ...daftarSubCpmk,
      {
        id: `sub-${Date.now()}-${nextNum}`,
        kode_sub_cpmk: `Sub-CPMK ${nextNum}`,
        cpmk_terkait: defaultCpmk,
        deskripsi: "",
        indikator_pencapaian: "",
        bentuk_penilaian: "Tugas / Studi Kasus",
        bobot_penilaian: 10,
      },
    ]);
  };

  const handlePatchSubCpmk = (id: string, patch: Partial<SubCpmkItem>) => {
    onUpdateSubCpmk(
      daftarSubCpmk.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const handleRemoveSubCpmk = (id: string) => {
    onUpdateSubCpmk(daftarSubCpmk.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* AI Pola B Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#0b3d91]/20 bg-[#0b3d91] p-5 text-white shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-wide text-[#ffcc00]">
            Asisten Constructive Alignment OBE (Gemini AI)
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-white">
            Penurunan CPL → CPMK → Sub-CPMK Berbasis Taksonomi Bloom
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-blue-100">
            AI akan merumuskan Deskripsi MK, Bahan Kajian Utama, daftar CPMK yang terhubung ke CPL, serta Sub-CPMK beserta indikator dan bobot penilaiannya secara otomatis.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateAi}
          disabled={aiLoading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#ffcc00] px-5 text-sm font-bold text-[#0f172a] shadow-sm transition-colors hover:bg-[#eab308] disabled:opacity-60"
        >
          {aiLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyusun Rumusan OBE...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>✨ Generate Rumusan CPMK, Sub-CPMK &amp; Deskripsi MK dengan AI</span>
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Gagal memproses permintaan AI</p>
            <p className="mt-0.5">{aiError}</p>
          </div>
        </div>
      )}

      {/* Section A: Daftar CPL yang Dibebankan pada MK */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b3d91]/10 text-[#0b3d91]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#0f172a]">
                1. CPL yang Dibebankan pada Mata Kuliah
              </h3>
              <p className="text-xs text-slate-500">
                {isFromModul0
                  ? "Terisi otomatis dari Master Kurikulum (Modul 0) — dapat disesuaikan bila diperlukan."
                  : "Tambahkan CPL Prodi yang dibebankan pada MK ini secara manual atau ditarik dari Modul 0."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCpl}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0b3d91]/30 bg-[#0b3d91]/5 px-3.5 text-xs font-semibold text-[#0b3d91] transition-colors hover:bg-[#0b3d91]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah CPL</span>
          </button>
        </div>

        {daftarCpl.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada CPL yang dibebankan pada mata kuliah ini.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tarik mata kuliah dari Bilah Sinkronisasi Modul 0 di atas, klik &ldquo;Tambah CPL&rdquo;, atau gunakan tombol AI untuk menyusun otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {daftarCpl.map((cpl) => (
              <div
                key={cpl.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 md:grid-cols-12 md:items-start"
              >
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Kode CPL
                  </label>
                  <input
                    type="text"
                    value={cpl.kode_cpl}
                    onChange={(e) =>
                      handlePatchCpl(cpl.id, { kode_cpl: e.target.value })
                    }
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 font-mono text-xs font-semibold text-[#0b3d91] focus:border-[#0b3d91] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Unsur SN-Dikti
                  </label>
                  <select
                    value={cpl.unsur}
                    onChange={(e) =>
                      handlePatchCpl(cpl.id, { unsur: e.target.value })
                    }
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                  >
                    {UNSUR_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Rumusan CPL
                  </label>
                  <textarea
                    rows={2}
                    value={cpl.deskripsi}
                    onChange={(e) =>
                      handlePatchCpl(cpl.id, { deskripsi: e.target.value })
                    }
                    placeholder="Tuliskan rumusan CPL-Prodi..."
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end md:col-span-1 md:pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveCpl(cpl.id)}
                    title="Hapus CPL"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section B: Manajemen CPMK */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b3d91]/10 text-[#0b3d91]">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#0f172a]">
                2. Capaian Pembelajaran Mata Kuliah (CPMK)
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan setiap CPMK langsung ke satu atau lebih kode CPL yang dibebankan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCpmk}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0b3d91]/30 bg-[#0b3d91]/5 px-3.5 text-xs font-semibold text-[#0b3d91] transition-colors hover:bg-[#0b3d91]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah CPMK</span>
          </button>
        </div>

        {daftarCpmk.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada rumusan CPMK.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Klik &ldquo;Tambah CPMK&rdquo; atau gunakan tombol AI di atas untuk menurunkan CPL menjadi CPMK.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {daftarCpmk.map((cpmk) => (
              <div
                key={cpmk.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                      Kode CPMK
                    </label>
                    <input
                      type="text"
                      value={cpmk.kode_cpmk}
                      onChange={(e) =>
                        handlePatchCpmk(cpmk.id, { kode_cpmk: e.target.value })
                      }
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-[#0b3d91] focus:border-[#0b3d91] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                      Level Taksonomi Bloom
                    </label>
                    <select
                      value={cpmk.level_taksonomi}
                      onChange={(e) =>
                        handlePatchCpmk(cpmk.id, {
                          level_taksonomi: e.target.value,
                        })
                      }
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                    >
                      {TAKSONOMI_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      {!TAKSONOMI_OPTIONS.includes(cpmk.level_taksonomi) &&
                        cpmk.level_taksonomi && (
                          <option value={cpmk.level_taksonomi}>
                            {cpmk.level_taksonomi}
                          </option>
                        )}
                    </select>
                  </div>

                  <div className="md:col-span-6">
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                      Rumusan CPMK
                    </label>
                    <textarea
                      rows={2}
                      value={cpmk.deskripsi}
                      onChange={(e) =>
                        handlePatchCpmk(cpmk.id, { deskripsi: e.target.value })
                      }
                      placeholder="Contoh: Mahasiswa mampu menganalisis rancangan penelitian eksperimental..."
                      className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end md:col-span-1 md:pt-5">
                    <button
                      type="button"
                      onClick={() => handleRemoveCpmk(cpmk.id)}
                      title="Hapus CPMK"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Mapping to CPL */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-2.5">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Terhubung ke CPL:
                  </span>
                  {daftarCpl.length > 0 ? (
                    daftarCpl.map((cpl) => {
                      const active = cpmk.cpl_terkait.includes(cpl.kode_cpl);
                      return (
                        <button
                          key={cpl.id}
                          type="button"
                          onClick={() =>
                            handleToggleCplOnCpmk(cpmk.id, cpl.kode_cpl)
                          }
                          className={`h-7 rounded-md border px-2.5 font-mono text-[11px] font-semibold transition-colors ${
                            active
                              ? "border-[#0b3d91] bg-[#0b3d91] text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:border-[#0b3d91]/50"
                          }`}
                        >
                          {cpl.kode_cpl}
                        </button>
                      );
                    })
                  ) : (
                    <input
                      type="text"
                      value={cpmk.cpl_terkait.join(", ")}
                      onChange={(e) =>
                        handlePatchCpmk(cpmk.id, {
                          cpl_terkait: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Ketik kode CPL (misal: CPL-01, CPL-02)"
                      className="h-7 rounded border border-slate-300 bg-white px-2 font-mono text-xs text-slate-800"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section C: Manajemen Sub-CPMK */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffcc00]/25 text-[#0b3d91]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#0f172a]">
                3. Sub-CPMK (Kemampuan Akhir Tiap Tahapan Belajar)
              </h3>
              <p className="text-xs text-slate-500">
                Terhubung langsung ke CPMK terkait beserta indikator pencapaian, bentuk penilaian, dan bobot (%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-xs font-bold tabular-nums ${
                totalSubBobot === 100 ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              Total Bobot Sub-CPMK: {totalSubBobot}%
            </span>
            <button
              type="button"
              onClick={handleAddSubCpmk}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0b3d91]/30 bg-[#0b3d91]/5 px-3.5 text-xs font-semibold text-[#0b3d91] transition-colors hover:bg-[#0b3d91]/10"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Sub-CPMK</span>
            </button>
          </div>
        </div>

        {daftarSubCpmk.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada rumusan Sub-CPMK.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Sub-CPMK di sini akan otomatis menjadi pilihan pada dropdown Matriks 16 Pertemuan di Tab 3.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {daftarSubCpmk.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 lg:grid-cols-12 lg:items-start"
              >
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Kode Sub-CPMK
                  </label>
                  <input
                    type="text"
                    value={sub.kode_sub_cpmk}
                    onChange={(e) =>
                      handlePatchSubCpmk(sub.id, {
                        kode_sub_cpmk: e.target.value,
                      })
                    }
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-[#0b3d91] focus:border-[#0b3d91] focus:outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    CPMK Terkait
                  </label>
                  {daftarCpmk.length > 0 ? (
                    <select
                      value={sub.cpmk_terkait}
                      onChange={(e) =>
                        handlePatchSubCpmk(sub.id, {
                          cpmk_terkait: e.target.value,
                        })
                      }
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 font-mono text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                    >
                      <option value="">-- Pilih CPMK --</option>
                      {daftarCpmk.map((c) => (
                        <option key={c.id} value={c.kode_cpmk}>
                          {c.kode_cpmk}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={sub.cpmk_terkait}
                      onChange={(e) =>
                        handlePatchSubCpmk(sub.id, {
                          cpmk_terkait: e.target.value,
                        })
                      }
                      placeholder="CPMK-1"
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                    />
                  )}
                </div>

                <div className="lg:col-span-3">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Rumusan Sub-CPMK
                  </label>
                  <textarea
                    rows={2}
                    value={sub.deskripsi}
                    onChange={(e) =>
                      handlePatchSubCpmk(sub.id, { deskripsi: e.target.value })
                    }
                    placeholder="Kemampuan akhir yang diharapkan..."
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Indikator Pencapaian
                  </label>
                  <textarea
                    rows={2}
                    value={sub.indikator_pencapaian}
                    onChange={(e) =>
                      handlePatchSubCpmk(sub.id, {
                        indikator_pencapaian: e.target.value,
                      })
                    }
                    placeholder="Ketepatan menjelaskan..."
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Bentuk &amp; Bobot (%)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={sub.bentuk_penilaian}
                      onChange={(e) =>
                        handlePatchSubCpmk(sub.id, {
                          bentuk_penilaian: e.target.value,
                        })
                      }
                      placeholder="Tugas/CBL"
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={sub.bobot_penilaian}
                      onChange={(e) =>
                        handlePatchSubCpmk(sub.id, {
                          bobot_penilaian: Math.max(
                            0,
                            Number(e.target.value) || 0
                          ),
                        })
                      }
                      className="h-9 w-16 shrink-0 rounded-md border border-slate-300 bg-white px-2 text-right font-mono text-xs font-semibold tabular-nums text-slate-900 focus:border-[#0b3d91] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end lg:col-span-1 lg:pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveSubCpmk(sub.id)}
                    title="Hapus Sub-CPMK"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constructive Alignment Matrix Preview */}
        {daftarCpmk.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="mb-2.5 text-xs font-bold text-slate-700">
              Ringkasan Peta Constructive Alignment (CPL → CPMK → Sub-CPMK)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                      CPMK
                    </th>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                      CPL Terkait
                    </th>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                      Taksonomi
                    </th>
                    <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                      Sub-CPMK Turunan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daftarCpmk.map((m) => {
                    const children = daftarSubCpmk.filter(
                      (s) => s.cpmk_terkait === m.kode_cpmk
                    );
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 font-mono font-bold text-[#0b3d91]">
                          {m.kode_cpmk}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-700">
                          {m.cpl_terkait.length > 0
                            ? m.cpl_terkait.join(", ")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {m.level_taksonomi}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {children.length > 0
                            ? children.map((c) => c.kode_sub_cpmk).join(", ")
                            : "Belum ada Sub-CPMK terhubung"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onNextTab}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b3d91] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#09327a]"
          >
            <span>Lanjut ke Matriks Rencana 16 Pertemuan</span>
            <ArrowRight className="h-4 w-4 text-[#ffcc00]" />
          </button>
        </div>
      </section>
    </div>
  );
}
