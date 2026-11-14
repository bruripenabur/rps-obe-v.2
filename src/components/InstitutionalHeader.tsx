import { useState } from "react";
import {
  GraduationCap,
  Save,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { UNPATTI_LOGO_URL } from "../utils/rpsDefaults";

interface InstitutionalHeaderProps {
  kodeMk: string;
  namaMk: string;
  prodi: string;
  totalSks: number;
  activeRpsId: string | null;
  activeKurikulumId: string | null;
  totalBobot: number;
  saving: boolean;
  userFullName: string;
  userProdi: string;
  onBackToPortal: () => void;
  onSignOut: () => void;
  onSaveOnly: () => void;
  onSaveAndRelay: () => void;
}

export function InstitutionalHeader({
  kodeMk,
  namaMk,
  prodi,
  totalSks,
  activeRpsId,
  activeKurikulumId,
  totalBobot,
  saving,
  userFullName,
  userProdi,
  onBackToPortal,
  onSignOut,
  onSaveOnly,
  onSaveAndRelay,
}: InstitutionalHeaderProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="no-print border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
        {/* Top-right SSO Identity & Portal Navigation Bar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="text-xs font-medium text-slate-500">
            Ekosistem Digital OBE · <span className="font-mono text-[#0b3d91]">rps.simpatti.site</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <UserCircle2 className="h-4 w-4 shrink-0 text-[#0b3d91]" />
              <div className="leading-tight">
                <span className="font-bold text-[#0f172a]">
                  {userFullName || "Dosen Pengampu"}
                </span>
                {userProdi && (
                  <span className="ml-1.5 text-slate-500">· {userProdi}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToPortal}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-[#0b3d91] transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>← Kembali ke Portal OBE</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Institutional Branding */}
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-1.5">
              {!logoFailed ? (
                <img
                  src={UNPATTI_LOGO_URL}
                  alt="Logo Universitas Pattimura"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <GraduationCap className="h-9 w-9 text-[#0b3d91]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold tracking-wide text-[#0b3d91]">
                  Pusat Kurikulum dan Inovasi Pembelajaran · Universitas Pattimura
                </span>
                <span className="inline-flex items-center rounded-md border border-[#eab308]/60 bg-[#ffcc00]/20 px-2.5 py-0.5 text-xs font-bold text-[#0f172a] whitespace-nowrap">
                  Tahap 1 • Penetapan (Plan)
                </span>
              </div>
              <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight text-[#0f172a] sm:text-2xl">
                SIMPEL-OBE 01: DESAIN RPS OBE
              </h1>
              <p className="mt-0.5 text-sm text-slate-600">
                Perumusan CPMK, Sub-CPMK, Peta Pembelajaran 16 Minggu &amp; Bobot Asesmen Berbasis OBE
              </p>
            </div>
          </div>

          {/* Right Quick Save & Relay Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onSaveOnly}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <Save className="h-4 w-4 text-[#0b3d91]" />
              <span>{saving ? "Menyimpan..." : "Simpan Saja (Tetap di Modul RPS)"}</span>
            </button>

            <button
              type="button"
              onClick={onSaveAndRelay}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-[#0b3d91] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#09327a] disabled:opacity-60"
            >
              <span>Simpan RPS ke Ekosistem &amp; Lanjut ke Modul Buku Ajar</span>
              <ArrowRight className="h-4 w-4 text-[#ffcc00]" />
            </button>
          </div>
        </div>

        {/* Active Course Context Summary Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              <strong className="text-slate-900">MK Aktif:</strong>{" "}
              {kodeMk || namaMk ? (
                <span className="font-mono font-semibold text-[#0b3d91]">
                  {kodeMk || "KODE"} — {namaMk || "Belum diberi nama"}
                </span>
              ) : (
                <span className="italic text-slate-400">Belum diisi (Mode Manual)</span>
              )}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-slate-900">Prodi:</strong> {prodi || "-"}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              <strong className="text-slate-900">Bobot:</strong> {totalSks} SKS
            </span>
            {activeKurikulumId && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#0b3d91]">
                  Sumber Modul 0: {activeKurikulumId.slice(0, 8)}…
                </span>
              </>
            )}
            {activeRpsId && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-mono text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  ID RPS: {activeRpsId.slice(0, 8)}…
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 tabular-nums">
            <span className="text-slate-500">Total Bobot Asesmen:</span>
            <span
              className={`font-mono font-bold ${
                totalBobot === 100 ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {totalBobot}% {totalBobot === 100 ? "(Valid)" : "(Target 100%)"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
