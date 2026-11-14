import { useState, type FormEvent } from "react";
import {
  Lock,
  ExternalLink,
  LogIn,
  GraduationCap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { SIMPATTI_PORTAL_URL } from "../lib/supabase";
import { signInInPlace } from "../lib/ssoAuth";
import { UNPATTI_LOGO_URL } from "../utils/rpsDefaults";

interface SsoLockScreenProps {
  onSuccessLogin: () => void;
}

export function SsoLockScreen({ onSuccessLogin }: SsoLockScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const handlePortalLogin = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${SIMPATTI_PORTAL_URL}?redirect=${returnUrl}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Masukkan email dan kata sandi akun OBE Anda.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInInPlace(email.trim(), password);
      onSuccessLogin();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal masuk. Periksa kredensial Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#ffcc00] bg-white shadow-xl">
        {/* Navy Header */}
        <div className="bg-[#0b3d91] px-6 py-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
            {!logoFailed ? (
              <img
                src={UNPATTI_LOGO_URL}
                alt="Logo Universitas Pattimura"
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <GraduationCap className="h-8 w-8 text-[#0b3d91]" />
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#ffcc00] px-2.5 py-0.5 text-[11px] font-bold text-[#0f172a]">
            <Lock className="h-3 w-3" />
            <span>SIMPEL-OBE 01 · Universitas Pattimura</span>
          </div>
          <h1 className="mt-3 font-display text-lg font-bold leading-snug text-white">
            Sesi SSO Diperlukan — Silakan Login Terlebih Dahulu melalui Portal Ekosistem OBE
          </h1>
          <p className="mt-1.5 text-xs text-blue-100">
            Autentikasi terpusat melindungi data kurikulum, RPS, dan portofolio akademik pada ekosistem{" "}
            <span className="font-mono text-[#ffcc00]">*.simpatti.site</span>.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <button
            type="button"
            onClick={handlePortalLogin}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ffcc00] px-4 text-sm font-bold text-[#0f172a] shadow-sm transition-colors hover:bg-[#eab308]"
          >
            <span>Login via Portal Utama (obe.simpatti.site)</span>
            <ExternalLink className="h-4 w-4" />
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium text-slate-400">
              atau masuk langsung di tempat
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="sso-email"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Email Institusi / Akun OBE
              </label>
              <input
                id="sso-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dosen@unpatti.ac.id"
                required
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sso-password"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Kata Sandi
              </label>
              <input
                id="sso-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-[#0b3d91] focus:ring-2 focus:ring-[#0b3d91]/15 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0b3d91] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#09327a] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi Sesi...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 text-[#ffcc00]" />
                  <span>Masuk ke Modul RPS OBE</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
