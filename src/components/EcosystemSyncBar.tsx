import { RefreshCw, Database, FolderSync, RotateCcw, AlertTriangle } from "lucide-react";
import type { KurikulumProdiRecord, ObeRpsRecord } from "../types/rps";
import { isSupabaseConfigured } from "../lib/supabase";

interface EcosystemSyncBarProps {
  kurikulumList: KurikulumProdiRecord[];
  savedRpsList: Array<
    Pick<
      ObeRpsRecord,
      "id" | "kode_mk" | "nama_mk" | "prodi" | "tahun_akademik" | "dosen_pengampu" | "status_siklus"
    >
  >;
  selectedKurikulumId: string;
  selectedRpsId: string;
  loadingLists: boolean;
  syncError: string | null;
  onSelectKurikulum: (id: string) => void;
  onSelectRps: (id: string) => void;
  onRefresh: () => void;
  onResetManual: () => void;
}

export function EcosystemSyncBar({
  kurikulumList,
  savedRpsList,
  selectedKurikulumId,
  selectedRpsId,
  loadingLists,
  syncError,
  onSelectKurikulum,
  onSelectRps,
  onRefresh,
  onResetManual,
}: EcosystemSyncBarProps) {
  return (
    <div className="no-print sticky top-0 z-40 border-b-2 border-[#ffcc00] bg-[#0b3d91] text-white shadow-md">
      <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Left label */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ffcc00] text-[#0b3d91]">
              <FolderSync className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-[#ffcc00]">
                Bilah Sinkronisasi Ekosistem
              </p>
              <p className="text-[11px] text-blue-100">
                Jembatan Data Modul 0 (Kurikulum) &amp; Database RPS Terpusat
              </p>
            </div>
          </div>

          {/* Two Dropdowns + Actions */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-3">
            {/* Dropdown A: Tarik dari Modul 0 */}
            <div className="flex flex-col gap-0.5 lg:w-[320px]">
              <label
                htmlFor="dropdown-modul-0"
                className="flex items-center gap-1.5 text-[11px] font-medium text-blue-100"
              >
                <Database className="h-3 w-3 text-[#ffcc00]" />
                <span>Tarik Mata Kuliah &amp; CPL dari Master Kurikulum (Modul 0)</span>
              </label>
              <select
                id="dropdown-modul-0"
                value={selectedKurikulumId}
                onChange={(e) => onSelectKurikulum(e.target.value)}
                disabled={loadingLists}
                className="h-9 w-full rounded-md border border-blue-400/40 bg-[#0f172a]/75 px-2.5 text-xs text-white focus:border-[#ffcc00] focus:outline-none disabled:opacity-60"
              >
                <option value="">
                  {loadingLists
                    ? "Memuat daftar MK Modul 0..."
                    : kurikulumList.length > 0
                    ? `-- Pilih MK dari Modul 0 (${kurikulumList.length} MK) --`
                    : "-- Input Manual / Modul 0 Kosong --"}
                </option>
                {kurikulumList.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    [{mk.kode_mk || "MK"}] {mk.nama_mk || "Tanpa Nama"} — Sem {mk.semester ?? "-"} ({mk.sks ?? "-"} SKS) · {mk.nama_prodi || mk.kode_prodi || "Prodi"}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown B: Muat / Edit RPS Tersimpan */}
            <div className="flex flex-col gap-0.5 lg:w-[320px]">
              <label
                htmlFor="dropdown-rps-tersimpan"
                className="flex items-center gap-1.5 text-[11px] font-medium text-blue-100"
              >
                <FolderSync className="h-3 w-3 text-[#ffcc00]" />
                <span>Muat / Edit RPS Tersimpan (dari Supabase)</span>
              </label>
              <select
                id="dropdown-rps-tersimpan"
                value={selectedRpsId}
                onChange={(e) => onSelectRps(e.target.value)}
                disabled={loadingLists}
                className="h-9 w-full rounded-md border border-blue-400/40 bg-[#0f172a]/75 px-2.5 text-xs text-white focus:border-[#ffcc00] focus:outline-none disabled:opacity-60"
              >
                <option value="">
                  {loadingLists
                    ? "Memuat RPS tersimpan..."
                    : savedRpsList.length > 0
                    ? `-- Pilih RPS Tersimpan (${savedRpsList.length} RPS) --`
                    : "-- Buat RPS Baru --"}
                </option>
                {savedRpsList.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.kode_mk}] {r.nama_mk} — {r.prodi} ({r.tahun_akademik})
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1 lg:pt-4">
              <button
                type="button"
                onClick={onRefresh}
                disabled={loadingLists}
                title="Segarkan data dari Supabase"
                className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-300/30 bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingLists ? "animate-spin" : ""}`} />
                <span>Segarkan</span>
              </button>
              <button
                type="button"
                onClick={onResetManual}
                title="Mulai form kosong dalam mode input manual bebas"
                className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-[#ffcc00]/60 bg-[#ffcc00]/15 px-3 text-xs font-semibold text-[#ffcc00] transition-colors hover:bg-[#ffcc00]/25"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Input Manual Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status / Warning strip if Supabase key not set or error occurred */}
        {(!isSupabaseConfigured || syncError) && (
          <div className="mt-2 flex items-center gap-2 rounded bg-[#0f172a]/60 px-3 py-1.5 text-[11px] text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#ffcc00]" />
            <span>
              {!isSupabaseConfigured
                ? "Mode Input Manual Aktif: Publishable Key Supabase belum diisi pada src/lib/supabase.ts (VITE_SUPABASE_ANON_KEY). Anda tetap dapat menyusun RPS, menggunakan AI Gemini, serta mengekspor ke PDF/Word."
                : `Koneksi Supabase: ${syncError}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
