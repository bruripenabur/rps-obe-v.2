import { BookOpen, UserCheck, FileText, ArrowRight } from "lucide-react";
import type { IdentitasMk, OtorisasiRps } from "../types/rps";

interface Tab1IdentitasProps {
  identitas: IdentitasMk;
  otorisasi: OtorisasiRps;
  deskripsiMk: string;
  bahanKajianUtama: string;
  onChangeIdentitas: (patch: Partial<IdentitasMk>) => void;
  onChangeOtorisasi: (patch: Partial<OtorisasiRps>) => void;
  onChangeDeskripsi: (val: string) => void;
  onChangeBahanKajian: (val: string) => void;
  onNextTab: () => void;
}

export function Tab1Identitas({
  identitas,
  otorisasi,
  deskripsiMk,
  bahanKajianUtama,
  onChangeIdentitas,
  onChangeOtorisasi,
  onChangeDeskripsi,
  onChangeBahanKajian,
  onNextTab,
}: Tab1IdentitasProps) {
  const totalSks =
    (Number(identitas.sks_teori) || 0) + (Number(identitas.sks_praktikum) || 0);

  return (
    <div className="space-y-6">
      {/* Section 1: Identitas Mata Kuliah */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b3d91]/10 text-[#0b3d91]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#0f172a]">
                Identitas Mata Kuliah
              </h2>
              <p className="text-xs text-slate-500">
                Data administratif mata kuliah sesuai struktur kurikulum SN-Dikti Universitas Pattimura
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 tabular-nums">
            Total Beban SKS:{" "}
            <span className="font-mono font-bold text-[#0b3d91]">{totalSks} SKS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Program Studi <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={identitas.prodi}
              onChange={(e) => onChangeIdentitas({ prodi: e.target.value })}
              placeholder="Contoh: S1 Pendidikan Biologi / S1 Teknik Informatika"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Fakultas / Unit Pengelola
            </label>
            <input
              type="text"
              value={identitas.fakultas}
              onChange={(e) => onChangeIdentitas({ fakultas: e.target.value })}
              placeholder="Contoh: FKIP / Fakultas Teknik — Universitas Pattimura"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Tahun Akademik <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={identitas.tahun_akademik}
              onChange={(e) => onChangeIdentitas({ tahun_akademik: e.target.value })}
              placeholder="Contoh: 2025/2026 - Ganjil"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Kode Mata Kuliah <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={identitas.kode_mk}
              onChange={(e) => onChangeIdentitas({ kode_mk: e.target.value })}
              placeholder="Contoh: MKU-204"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Nama Mata Kuliah <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={identitas.nama_mk}
              onChange={(e) => onChangeIdentitas({ nama_mk: e.target.value })}
              placeholder="Contoh: Metodologi Penelitian Pendidikan"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Bobot SKS Teori
            </label>
            <input
              type="number"
              min={0}
              max={6}
              value={identitas.sks_teori}
              onChange={(e) =>
                onChangeIdentitas({ sks_teori: Math.max(0, Number(e.target.value) || 0) })
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 tabular-nums focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Bobot SKS Praktikum / Studio
            </label>
            <input
              type="number"
              min={0}
              max={6}
              value={identitas.sks_praktikum}
              onChange={(e) =>
                onChangeIdentitas({
                  sks_praktikum: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 tabular-nums focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Semester (1–8)
            </label>
            <select
              value={identitas.semester}
              onChange={(e) =>
                onChangeIdentitas({ semester: Number(e.target.value) || 1 })
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Rumpun Mata Kuliah
            </label>
            <input
              type="text"
              value={identitas.rumpun_mk}
              onChange={(e) => onChangeIdentitas({ rumpun_mk: e.target.value })}
              placeholder="Contoh: Keilmuan Inti Program Studi"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Mata Kuliah Prasyarat
            </label>
            <input
              type="text"
              value={identitas.prasyarat}
              onChange={(e) => onChangeIdentitas({ prasyarat: e.target.value })}
              placeholder="Contoh: Statistika Dasar (atau -)"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Tanggal Penyusunan
            </label>
            <input
              type="date"
              value={identitas.tanggal_penyusunan}
              onChange={(e) =>
                onChangeIdentitas({ tanggal_penyusunan: e.target.value })
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Otorisasi & Penjaminan Mutu */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffcc00]/25 text-[#0f172a]">
            <UserCheck className="h-5 w-5 text-[#0b3d91]" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-[#0f172a]">
              Otorisasi &amp; Pengesahan Dokumen RPS
            </h2>
            <p className="text-xs text-slate-500">
              Pejabat akademik dan tim pengampu yang tercantum pada blok tanda tangan resmi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Dosen Pengampu / Pengembang RPS <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={otorisasi.dosen_pengampu}
              onChange={(e) => onChangeOtorisasi({ dosen_pengampu: e.target.value })}
              placeholder="Nama lengkap & gelar, misal: Dr. Ir. Hendra Patty, M.Sc."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Koordinator Rumpun Mata Kuliah (RMK)
            </label>
            <input
              type="text"
              value={otorisasi.koordinator_rmk}
              onChange={(e) => onChangeOtorisasi({ koordinator_rmk: e.target.value })}
              placeholder="Nama lengkap & gelar Koordinator RMK"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Ketua Program Studi
            </label>
            <input
              type="text"
              value={otorisasi.ketua_prodi}
              onChange={(e) => onChangeOtorisasi({ ketua_prodi: e.target.value })}
              placeholder="Nama lengkap & gelar Ketua Program Studi"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Ketua Gugus Jaminan Mutu (GJM)
            </label>
            <input
              type="text"
              value={otorisasi.ketua_gjm}
              onChange={(e) => onChangeOtorisasi({ ketua_gjm: e.target.value })}
              placeholder="Nama lengkap & gelar Ketua GJM"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Deskripsi Singkat & Bahan Kajian */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b3d91]/10 text-[#0b3d91]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-[#0f172a]">
              Deskripsi Singkat Mata Kuliah &amp; Bahan Kajian Utama
            </h2>
            <p className="text-xs text-slate-500">
              Dapat diisi manual atau dihasilkan otomatis oleh AI Gemini pada Tab 2 berdasarkan CPL
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Deskripsi Singkat Mata Kuliah
            </label>
            <textarea
              rows={5}
              value={deskripsiMk}
              onChange={(e) => onChangeDeskripsi(e.target.value)}
              placeholder="Jelaskan ruang lingkup, pendekatan pembelajaran (CBL/PjBL), dan kompetensi akhir yang dicapai mahasiswa melalui mata kuliah ini..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Bahan Kajian / Materi Pembelajaran Utama
            </label>
            <textarea
              rows={5}
              value={bahanKajianUtama}
              onChange={(e) => onChangeBahanKajian(e.target.value)}
              placeholder="Tuliskan pokok-pokok bahan kajian utama (pisahkan per baris), misal:&#10;1. Konsep Dasar dan Paradigma Keilmuan&#10;2. Perumusan Masalah dan Kajian Pustaka..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onNextTab}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b3d91] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#09327a]"
          >
            <span>Lanjut ke Pemetaan CPL, CPMK &amp; Sub-CPMK</span>
            <ArrowRight className="h-4 w-4 text-[#ffcc00]" />
          </button>
        </div>
      </section>
    </div>
  );
}
