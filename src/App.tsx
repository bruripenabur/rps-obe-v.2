import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  BookOpen,
  GitBranch,
  CalendarRange,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import type {
  CplItem,
  CpmkItem,
  IdentitasMk,
  KurikulumProdiRecord,
  ObeRpsRecord,
  OtorisasiRps,
  PertemuanItem,
  PustakaRps,
  RpsPayload,
  SubCpmkItem,
} from "./types/rps";
import {
  MODUL_2_BUKU_AJAR_URL,
  PORTAL_OBE_URL,
  fetchKurikulumById,
  fetchKurikulumList,
  fetchRpsById,
  fetchSavedRpsList,
  isSupabaseConfigured,
  parseCplDibebankan,
  supabase,
  upsertObeRps,
} from "./lib/supabase";
import {
  buildSsoRelayUrl,
  detectSsoSession,
  getUserProfileMetadata,
  signOutSso,
  writeSsoCookie,
} from "./lib/ssoAuth";
import {
  computeRekapBobot,
  createDefault16Weeks,
  createInitialRpsPayload,
  formatEstimasiWaktu,
} from "./utils/rpsDefaults";
import { EcosystemSyncBar } from "./components/EcosystemSyncBar";
import { InstitutionalHeader } from "./components/InstitutionalHeader";
import { Tab1Identitas } from "./components/Tab1Identitas";
import { Tab2Pemetaan } from "./components/Tab2Pemetaan";
import { Tab3Rencana16Minggu } from "./components/Tab3Rencana16Minggu";
import { Tab4PratinjauEkspor } from "./components/Tab4PratinjauEkspor";
import { SsoLockScreen } from "./components/SsoLockScreen";
import { SupabaseStatusBadge } from "./components/SupabaseStatusBadge";

type ActiveTab = "tab1" | "tab2" | "tab3" | "tab4";

interface ToastState {
  type: "success" | "error";
  title: string;
  message: string;
  relayUrl?: string;
}

function parseSksPair(sksVal: number | string | null): {
  teori: number;
  praktikum: number;
} {
  if (typeof sksVal === "number" && !Number.isNaN(sksVal)) {
    return { teori: Math.max(1, sksVal), praktikum: 0 };
  }
  const str = String(sksVal ?? "").trim();
  if (!str) return { teori: 2, praktikum: 0 };

  const slashMatch = str.match(/(\d+)\s*[/+]\s*(\d+)/);
  if (slashMatch) {
    return {
      teori: Number(slashMatch[1]) || 0,
      praktikum: Number(slashMatch[2]) || 0,
    };
  }
  const singleNum = parseInt(str, 10);
  if (!Number.isNaN(singleNum) && singleNum > 0) {
    return { teori: singleNum, praktikum: 0 };
  }
  return { teori: 2, praktikum: 0 };
}

export default function App() {
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [ssoSession, setSsoSession] = useState<Session | null>(null);
  const [ssoUser, setSsoUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("tab1");
  const [payload, setPayload] = useState<RpsPayload>(() =>
    createInitialRpsPayload()
  );

  // Supabase ecosystem state
  const [kurikulumList, setKurikulumList] = useState<KurikulumProdiRecord[]>([]);
  const [savedRpsList, setSavedRpsList] = useState<
    Array<
      Pick<
        ObeRpsRecord,
        "id" | "kode_mk" | "nama_mk" | "prodi" | "tahun_akademik" | "dosen_pengampu" | "status_siklus"
      >
    >
  >([]);
  const [selectedKurikulumId, setSelectedKurikulumId] = useState<string>("");
  const [selectedRpsId, setSelectedRpsId] = useState<string>("");
  const [activeRpsId, setActiveRpsId] = useState<string | null>(null);
  const [activeKurikulumId, setActiveKurikulumId] = useState<string | null>(
    null
  );

  const [loadingLists, setLoadingLists] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // AI loading & error states
  const [aiCpmkLoading, setAiCpmkLoading] = useState<boolean>(false);
  const [aiCpmkError, setAiCpmkError] = useState<string | null>(null);
  const [aiWeeksLoading, setAiWeeksLoading] = useState<boolean>(false);
  const [aiWeeksError, setAiWeeksError] = useState<string | null>(null);

  // Save & toast state
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const userProfile = getUserProfileMetadata(ssoUser);

  const applyAutoFillFromUser = useCallback(
    (user: User | null) => {
      const meta = getUserProfileMetadata(user);
      if (!meta.fullName && !meta.prodi) return;
      setPayload((prev) => ({
        ...prev,
        identitas: {
          ...prev.identitas,
          prodi: prev.identitas.prodi.trim() ? prev.identitas.prodi : meta.prodi,
        },
        otorisasi: {
          ...prev.otorisasi,
          dosen_pengampu: prev.otorisasi.dosen_pengampu.trim()
            ? prev.otorisasi.dosen_pengampu
            : meta.fullName,
        },
      }));
    },
    []
  );

  const applyKurikulumRecord = useCallback(
    (mk: KurikulumProdiRecord) => {
      const { teori, praktikum } = parseSksPair(mk.sks);
      const parsedCpls = parseCplDibebankan(mk.cpl_dibebankan);
      const timeStr = formatEstimasiWaktu(teori, praktikum);

      setPayload((prev) => ({
        ...prev,
        identitas: {
          ...prev.identitas,
          prodi:
            mk.nama_prodi ||
            mk.kode_prodi ||
            prev.identitas.prodi ||
            userProfile.prodi,
          kode_mk: mk.kode_mk || "",
          nama_mk: mk.nama_mk || "",
          sks_teori: teori,
          sks_praktikum: praktikum,
          semester: Number(mk.semester) || 1,
          tahun_akademik: mk.tahun_kurikulum
            ? `${mk.tahun_kurikulum}`
            : prev.identitas.tahun_akademik,
        },
        otorisasi: {
          ...prev.otorisasi,
          dosen_pengampu:
            prev.otorisasi.dosen_pengampu.trim() || userProfile.fullName,
        },
        daftar_cpl: parsedCpls,
        rencana_16_minggu: prev.rencana_16_minggu.map((w) => ({
          ...w,
          estimasi_waktu: timeStr,
        })),
      }));

      setSelectedKurikulumId(mk.id);
      setActiveKurikulumId(mk.id);
      setSelectedRpsId("");
      setActiveRpsId(null);
    },
    [userProfile.fullName, userProfile.prodi]
  );

  const applySavedRpsRecord = useCallback((rec: ObeRpsRecord) => {
    const fallback = createInitialRpsPayload();
    const loaded = rec.payload_rps || fallback;
    const weeks =
      Array.isArray(loaded.rencana_16_minggu) &&
      loaded.rencana_16_minggu.length === 16
        ? loaded.rencana_16_minggu
        : createDefault16Weeks(
            loaded.identitas?.sks_teori ?? 2,
            loaded.identitas?.sks_praktikum ?? 0
          );

    setPayload({
      identitas: {
        ...fallback.identitas,
        ...(loaded.identitas || {}),
        kode_mk: loaded.identitas?.kode_mk || rec.kode_mk || "",
        nama_mk: loaded.identitas?.nama_mk || rec.nama_mk || "",
        prodi: loaded.identitas?.prodi || rec.prodi || "",
        tahun_akademik:
          loaded.identitas?.tahun_akademik || rec.tahun_akademik || "",
      },
      otorisasi: {
        ...fallback.otorisasi,
        ...(loaded.otorisasi || {}),
        dosen_pengampu:
          loaded.otorisasi?.dosen_pengampu || rec.dosen_pengampu || "",
      },
      deskripsi_mk: loaded.deskripsi_mk || "",
      bahan_kajian_utama: loaded.bahan_kajian_utama || "",
      daftar_cpl: Array.isArray(loaded.daftar_cpl) ? loaded.daftar_cpl : [],
      daftar_cpmk: Array.isArray(loaded.daftar_cpmk) ? loaded.daftar_cpmk : [],
      daftar_sub_cpmk: Array.isArray(loaded.daftar_sub_cpmk)
        ? loaded.daftar_sub_cpmk
        : [],
      rencana_16_minggu: weeks,
      rekap_bobot: computeRekapBobot(weeks),
      pustaka: {
        utama: Array.isArray(loaded.pustaka?.utama) ? loaded.pustaka.utama : [],
        pendukung: Array.isArray(loaded.pustaka?.pendukung)
          ? loaded.pustaka.pendukung
          : [],
      },
    });

    setSelectedRpsId(rec.id);
    setActiveRpsId(rec.id);
    setSelectedKurikulumId(rec.kurikulum_mk_id || "");
    setActiveKurikulumId(rec.kurikulum_mk_id || null);
  }, []);

  const loadEcosystemLists = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSyncError(null);
      return;
    }
    setLoadingLists(true);
    setSyncError(null);
    try {
      const [kurRes, rpsRes] = await Promise.allSettled([
        fetchKurikulumList(),
        fetchSavedRpsList(),
      ]);

      const errors: string[] = [];
      if (kurRes.status === "fulfilled") {
        setKurikulumList(kurRes.value);
      } else {
        errors.push(`Modul 0: ${kurRes.reason?.message || "Gagal memuat"}`);
      }

      if (rpsRes.status === "fulfilled") {
        setSavedRpsList(rpsRes.value);
      } else {
        errors.push(`RPS: ${rpsRes.reason?.message || "Gagal memuat"}`);
      }

      if (errors.length > 0) {
        setSyncError(errors.join(" | "));
      }
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : "Gagal terhubung ke Supabase."
      );
    } finally {
      setLoadingLists(false);
    }
  }, []);

  const refreshAuthSession = useCallback(async () => {
    setAuthChecking(true);
    const result = await detectSsoSession();
    setSsoSession(result.session);
    setSsoUser(result.user);
    if (result.user) {
      applyAutoFillFromUser(result.user);
    }
    setAuthChecking(false);
  }, [applyAutoFillFromUser]);

  // SSO detection & Supabase Auth listener on mount
  useEffect(() => {
    refreshAuthSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSsoSession(session);
      setSsoUser(session?.user ?? null);
      if (session) {
        writeSsoCookie(session);
        applyAutoFillFromUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuthSession, applyAutoFillFromUser]);

  // Initial data load + URL params (?rps_id=... or ?kurikulum_mk_id=...) once SSO session is active
  useEffect(() => {
    if (!ssoSession) return;
    loadEcosystemLists();

    const params = new URLSearchParams(window.location.search);
    const urlRpsId = params.get("rps_id");
    const urlKurikulumId = params.get("kurikulum_mk_id");

    if (!isSupabaseConfigured) return;

    if (urlRpsId) {
      fetchRpsById(urlRpsId)
        .then((rec) => {
          if (rec) {
            applySavedRpsRecord(rec);
            setToast({
              type: "success",
              title: "RPS Berhasil Dimuat",
              message: `Melanjutkan pengeditan RPS ${rec.kode_mk} — ${rec.nama_mk} (ID: ${rec.id}).`,
            });
          }
        })
        .catch((err) => {
          setSyncError(
            err instanceof Error ? err.message : "Gagal memuat rps_id dari URL."
          );
        });
    } else if (urlKurikulumId) {
      fetchKurikulumById(urlKurikulumId)
        .then((mk) => {
          if (mk) {
            applyKurikulumRecord(mk);
            setToast({
              type: "success",
              title: "Data Modul 0 Ditarik Otomatis",
              message: `Mata kuliah ${mk.kode_mk || ""} — ${mk.nama_mk || ""} beserta CPL berhasil dimuat.`,
            });
          }
        })
        .catch((err) => {
          setSyncError(
            err instanceof Error
              ? err.message
              : "Gagal memuat kurikulum_mk_id dari URL."
          );
        });
    }
  }, [ssoSession, applyKurikulumRecord, applySavedRpsRecord, loadEcosystemLists]);

  const handleSelectKurikulum = async (id: string) => {
    if (!id) {
      setSelectedKurikulumId("");
      setActiveKurikulumId(null);
      return;
    }
    const found = kurikulumList.find((k) => k.id === id);
    if (found) {
      applyKurikulumRecord(found);
      setToast({
        type: "success",
        title: "Master Kurikulum (Modul 0) Ditarik",
        message: `MK ${found.kode_mk || ""} — ${found.nama_mk || ""} dan CPL berhasil diisikan ke form.`,
      });
      return;
    }
    try {
      const fetched = await fetchKurikulumById(id);
      if (fetched) applyKurikulumRecord(fetched);
    } catch (err) {
      setToast({
        type: "error",
        title: "Gagal Menarik Data Modul 0",
        message: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    }
  };

  const handleSelectRps = async (id: string) => {
    if (!id) {
      setSelectedRpsId("");
      setActiveRpsId(null);
      return;
    }
    try {
      const rec = await fetchRpsById(id);
      if (rec) {
        applySavedRpsRecord(rec);
        setToast({
          type: "success",
          title: "RPS Tersimpan Dimuat",
          message: `Siap melanjutkan pengeditan RPS ${rec.kode_mk} — ${rec.nama_mk}.`,
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        title: "Gagal Memuat RPS",
        message: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    }
  };

  const handleResetManual = () => {
    const fresh = createInitialRpsPayload();
    if (userProfile.prodi) fresh.identitas.prodi = userProfile.prodi;
    if (userProfile.fullName)
      fresh.otorisasi.dosen_pengampu = userProfile.fullName;
    setPayload(fresh);
    setSelectedKurikulumId("");
    setSelectedRpsId("");
    setActiveRpsId(null);
    setActiveKurikulumId(null);
    setAiCpmkError(null);
    setAiWeeksError(null);
    setToast({
      type: "success",
      title: "Mode Input Manual Aktif",
      message:
        "Form RPS telah direset dan kolom Dosen Pengampu & Program Studi diisi otomatis dari profil SSO.",
    });
  };

  const handleBackToPortal = async () => {
    const { data } = await supabase.auth.getSession();
    const activeSession = data.session ?? ssoSession;
    if (activeSession) {
      writeSsoCookie(activeSession);
    }
    window.location.href = buildSsoRelayUrl(PORTAL_OBE_URL, activeSession);
  };

  const handleSignOut = async () => {
    await signOutSso();
    setSsoSession(null);
    setSsoUser(null);
  };

  // Updaters
  const handleChangeIdentitas = (patch: Partial<IdentitasMk>) => {
    setPayload((prev) => ({
      ...prev,
      identitas: { ...prev.identitas, ...patch },
    }));
  };

  const handleChangeOtorisasi = (patch: Partial<OtorisasiRps>) => {
    setPayload((prev) => ({
      ...prev,
      otorisasi: { ...prev.otorisasi, ...patch },
    }));
  };

  const handleUpdateCpl = (list: CplItem[]) => {
    setPayload((prev) => ({ ...prev, daftar_cpl: list }));
  };

  const handleUpdateCpmk = (list: CpmkItem[]) => {
    setPayload((prev) => ({ ...prev, daftar_cpmk: list }));
  };

  const handleUpdateSubCpmk = (list: SubCpmkItem[]) => {
    setPayload((prev) => ({ ...prev, daftar_sub_cpmk: list }));
  };

  const handleUpdateWeeks = (weeks: PertemuanItem[]) => {
    setPayload((prev) => ({
      ...prev,
      rencana_16_minggu: weeks,
      rekap_bobot: computeRekapBobot(weeks),
    }));
  };

  const handleUpdatePustaka = (pustaka: PustakaRps) => {
    setPayload((prev) => ({ ...prev, pustaka }));
  };

  // Gemini Pola B: Generate CPMK, Sub-CPMK & Deskripsi MK
  const handleGenerateAiCpmk = async () => {
    if (!payload.identitas.nama_mk.trim()) {
      setAiCpmkError(
        "Nama Mata Kuliah pada Tab 1 wajib diisi sebelum menggunakan generator AI."
      );
      return;
    }
    setAiCpmkLoading(true);
    setAiCpmkError(null);
    try {
      const res = await fetch("/api/ai/generate-cpmk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_mk: payload.identitas.kode_mk,
          nama_mk: payload.identitas.nama_mk,
          prodi: payload.identitas.prodi,
          sks_teori: payload.identitas.sks_teori,
          sks_praktikum: payload.identitas.sks_praktikum,
          semester: payload.identitas.semester,
          rumpun_mk: payload.identitas.rumpun_mk,
          bahan_kajian_utama: payload.bahan_kajian_utama,
          daftar_cpl: payload.daftar_cpl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memanggil layanan Gemini AI.");
      }

      const now = Date.now();
      const nextCpl: CplItem[] =
        payload.daftar_cpl.length > 0
          ? payload.daftar_cpl
          : Array.isArray(data.suggested_cpl)
          ? data.suggested_cpl.map(
              (
                c: { kode_cpl?: string; unsur?: string; deskripsi?: string },
                idx: number
              ) => ({
                id: `cpl-ai-${now}-${idx}`,
                kode_cpl: c.kode_cpl || `CPL-${String(idx + 1).padStart(2, "0")}`,
                unsur: c.unsur || "Pengetahuan",
                deskripsi: c.deskripsi || "",
              })
            )
          : [];

      const nextCpmk: CpmkItem[] = Array.isArray(data.daftar_cpmk)
        ? data.daftar_cpmk.map(
            (
              m: {
                kode_cpmk?: string;
                cpl_terkait?: string[];
                level_taksonomi?: string;
                deskripsi?: string;
              },
              idx: number
            ) => ({
              id: `cpmk-ai-${now}-${idx}`,
              kode_cpmk: m.kode_cpmk || `CPMK-${idx + 1}`,
              cpl_terkait: Array.isArray(m.cpl_terkait) ? m.cpl_terkait : [],
              level_taksonomi: m.level_taksonomi || "C4 - Menganalisis",
              deskripsi: m.deskripsi || "",
            })
          )
        : [];

      const nextSubCpmk: SubCpmkItem[] = Array.isArray(data.daftar_sub_cpmk)
        ? data.daftar_sub_cpmk.map(
            (
              s: {
                kode_sub_cpmk?: string;
                cpmk_terkait?: string;
                deskripsi?: string;
                indikator_pencapaian?: string;
                bentuk_penilaian?: string;
                bobot_penilaian?: number;
              },
              idx: number
            ) => ({
              id: `sub-ai-${now}-${idx}`,
              kode_sub_cpmk: s.kode_sub_cpmk || `Sub-CPMK ${idx + 1}`,
              cpmk_terkait: s.cpmk_terkait || "CPMK-1",
              deskripsi: s.deskripsi || "",
              indikator_pencapaian: s.indikator_pencapaian || "",
              bentuk_penilaian: s.bentuk_penilaian || "Tugas / CBL",
              bobot_penilaian: Number(s.bobot_penilaian) || 0,
            })
          )
        : [];

      setPayload((prev) => ({
        ...prev,
        deskripsi_mk: data.deskripsi_mk || prev.deskripsi_mk,
        bahan_kajian_utama: data.bahan_kajian_utama || prev.bahan_kajian_utama,
        daftar_cpl: nextCpl,
        daftar_cpmk: nextCpmk,
        daftar_sub_cpmk: nextSubCpmk,
      }));

      setToast({
        type: "success",
        title: "Constructive Alignment Berhasil Disusun AI",
        message: `${nextCpmk.length} CPMK, ${nextSubCpmk.length} Sub-CPMK, Deskripsi MK & Bahan Kajian berhasil dibuat.`,
      });
    } catch (err) {
      setAiCpmkError(
        err instanceof Error ? err.message : "Gagal menghasilkan CPMK dengan AI."
      );
    } finally {
      setAiCpmkLoading(false);
    }
  };

  // Gemini Pola B: Generate Rencana 16 Minggu
  const handleGenerateAiWeeks = async () => {
    if (!payload.identitas.nama_mk.trim()) {
      setAiWeeksError(
        "Nama Mata Kuliah pada Tab 1 wajib diisi sebelum menggunakan generator AI."
      );
      return;
    }
    setAiWeeksLoading(true);
    setAiWeeksError(null);
    try {
      const res = await fetch("/api/ai/generate-rps-weeks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_mk: payload.identitas.kode_mk,
          nama_mk: payload.identitas.nama_mk,
          prodi: payload.identitas.prodi,
          sks_teori: payload.identitas.sks_teori,
          sks_praktikum: payload.identitas.sks_praktikum,
          deskripsi_mk: payload.deskripsi_mk,
          bahan_kajian_utama: payload.bahan_kajian_utama,
          daftar_cpl: payload.daftar_cpl,
          daftar_cpmk: payload.daftar_cpmk,
          daftar_sub_cpmk: payload.daftar_sub_cpmk,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memanggil layanan Gemini AI.");
      }

      const weeks: PertemuanItem[] = Array.isArray(data.rencana_16_minggu)
        ? data.rencana_16_minggu
        : [];

      if (weeks.length !== 16) {
        throw new Error("Respons AI tidak menghasilkan 16 pertemuan lengkap.");
      }

      setPayload((prev) => ({
        ...prev,
        rencana_16_minggu: weeks,
        rekap_bobot: computeRekapBobot(weeks),
        pustaka: {
          utama:
            Array.isArray(data.pustaka_utama) && data.pustaka_utama.length > 0
              ? data.pustaka_utama
              : prev.pustaka.utama,
          pendukung:
            Array.isArray(data.pustaka_pendukung) &&
            data.pustaka_pendukung.length > 0
              ? data.pustaka_pendukung
              : prev.pustaka.pendukung,
        },
      }));

      setToast({
        type: "success",
        title: "Matriks 16 Pertemuan Berhasil Dibuat AI",
        message:
          "Rencana Minggu 1–16 (termasuk UTS Minggu 8, UAS Minggu 16, bobot tepat 100%, & pustaka) telah diisi.",
      });
    } catch (err) {
      setAiWeeksError(
        err instanceof Error
          ? err.message
          : "Gagal menghasilkan matriks 16 minggu dengan AI."
      );
    } finally {
      setAiWeeksLoading(false);
    }
  };

  // Save to Supabase obe_rps & optionally relay to Modul 2
  const handleSaveRps = async (relayToModul2: boolean) => {
    if (!payload.identitas.kode_mk.trim() || !payload.identitas.nama_mk.trim()) {
      setActiveTab("tab1");
      setToast({
        type: "error",
        title: "Data Identitas Belum Lengkap",
        message:
          "Kode Mata Kuliah dan Nama Mata Kuliah pada Tab 1 wajib diisi sebelum menyimpan ke Supabase.",
      });
      return;
    }

    setSaving(true);
    try {
      const normalizedPayload: RpsPayload = {
        ...payload,
        rekap_bobot: computeRekapBobot(payload.rencana_16_minggu),
      };

      const saved = await upsertObeRps({
        id: activeRpsId,
        kurikulum_mk_id: activeKurikulumId,
        kode_mk: normalizedPayload.identitas.kode_mk.trim(),
        nama_mk: normalizedPayload.identitas.nama_mk.trim(),
        prodi: normalizedPayload.identitas.prodi.trim() || "-",
        tahun_akademik: normalizedPayload.identitas.tahun_akademik.trim() || "-",
        dosen_pengampu:
          normalizedPayload.otorisasi.dosen_pengampu.trim() || "-",
        payload_rps: normalizedPayload,
      });

      setActiveRpsId(saved.id);
      setSelectedRpsId(saved.id);
      loadEcosystemLists();

      const targetUrl = buildSsoRelayUrl(MODUL_2_BUKU_AJAR_URL, ssoSession, {
        rps_id: saved.id,
      });

      if (relayToModul2) {
        setToast({
          type: "success",
          title: "RPS Tersimpan ke Ekosistem Supabase!",
          message: `RPS berhasil disimpan (ID: ${saved.id}). Mengalihkan ke Modul 2 (Buku Ajar)...`,
          relayUrl: targetUrl,
        });

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1000);
      } else {
        setToast({
          type: "success",
          title: "RPS Berhasil Disimpan",
          message: `Data RPS tersimpan di tabel obe_rps dengan ID: ${saved.id}`,
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        title: "Gagal Menyimpan ke Supabase",
        message:
          err instanceof Error
            ? err.message
            : "Periksa koneksi atau Publishable Key Supabase Anda.",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSks =
    (Number(payload.identitas.sks_teori) || 0) +
    (Number(payload.identitas.sks_praktikum) || 0);
  const rekapBobot = computeRekapBobot(payload.rencana_16_minggu);

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    shortDesc: string;
    icon: typeof BookOpen;
  }> = [
    {
      id: "tab1",
      label: "1. Identitas MK & Otorisasi",
      shortDesc: "Data MK, SKS & Tim",
      icon: BookOpen,
    },
    {
      id: "tab2",
      label: "2. Pemetaan CPL, CPMK & Sub-CPMK",
      shortDesc: `${payload.daftar_cpmk.length} CPMK · ${payload.daftar_sub_cpmk.length} Sub`,
      icon: GitBranch,
    },
    {
      id: "tab3",
      label: "3. Matriks 16 Pertemuan",
      shortDesc: `Bobot ${rekapBobot.total}%`,
      icon: CalendarRange,
    },
    {
      id: "tab4",
      label: "4. Pratinjau Resmi & Ekspor",
      shortDesc: "Cetak PDF / Word",
      icon: FileCheck2,
    },
  ];

  if (authChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffcc00]" />
        <p className="mt-3 text-sm font-medium text-blue-100">
          Memeriksa Sesi SSO Ekosistem SIMPEL-OBE...
        </p>
        <SupabaseStatusBadge />
      </div>
    );
  }

  if (!ssoSession) {
    return (
      <>
        <SsoLockScreen onSuccessLogin={refreshAuthSession} />
        <SupabaseStatusBadge />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Bilah Sinkronisasi Ekosistem (Sticky Top Navy + Gold) */}
      <EcosystemSyncBar
        kurikulumList={kurikulumList}
        savedRpsList={savedRpsList}
        selectedKurikulumId={selectedKurikulumId}
        selectedRpsId={selectedRpsId}
        loadingLists={loadingLists}
        syncError={syncError}
        onSelectKurikulum={handleSelectKurikulum}
        onSelectRps={handleSelectRps}
        onRefresh={loadEcosystemLists}
        onResetManual={handleResetManual}
      />

      {/* Institutional Header */}
      <InstitutionalHeader
        kodeMk={payload.identitas.kode_mk}
        namaMk={payload.identitas.nama_mk}
        prodi={payload.identitas.prodi}
        totalSks={totalSks}
        activeRpsId={activeRpsId}
        activeKurikulumId={activeKurikulumId}
        totalBobot={rekapBobot.total}
        saving={saving}
        userFullName={userProfile.fullName}
        userProdi={userProfile.prodi}
        onBackToPortal={handleBackToPortal}
        onSignOut={handleSignOut}
        onSaveOnly={() => handleSaveRps(false)}
        onSaveAndRelay={() => handleSaveRps(true)}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="no-print mx-auto mt-4 max-w-[1400px] px-4 sm:px-6">
          <div
            className={`flex items-start justify-between gap-4 rounded-xl border p-4 shadow-xs ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <div>
                <p className="text-sm font-bold">{toast.title}</p>
                <p className="mt-0.5 text-xs">{toast.message}</p>
                {toast.relayUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = toast.relayUrl!;
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#0b3d91] px-3 py-1.5 font-mono text-xs font-semibold text-white hover:bg-[#09327a]"
                  >
                    <span>Buka {toast.relayUrl}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#ffcc00]" />
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded p-1 hover:bg-black/5"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4-Tab Navigation */}
      <nav
        aria-label="Tahapan Penyusunan RPS"
        className="no-print mx-auto mt-5 max-w-[1400px] px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-[#0b3d91] text-white shadow-xs"
                    : "bg-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    isActive
                      ? "bg-[#ffcc00] text-[#0b3d91]"
                      : "bg-slate-100 text-[#0b3d91]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{t.label}</p>
                  <p
                    className={`truncate font-mono text-[11px] tabular-nums ${
                      isActive ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {t.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {activeTab === "tab1" && (
          <Tab1Identitas
            identitas={payload.identitas}
            otorisasi={payload.otorisasi}
            deskripsiMk={payload.deskripsi_mk}
            bahanKajianUtama={payload.bahan_kajian_utama}
            onChangeIdentitas={handleChangeIdentitas}
            onChangeOtorisasi={handleChangeOtorisasi}
            onChangeDeskripsi={(val) =>
              setPayload((prev) => ({ ...prev, deskripsi_mk: val }))
            }
            onChangeBahanKajian={(val) =>
              setPayload((prev) => ({ ...prev, bahan_kajian_utama: val }))
            }
            onNextTab={() => setActiveTab("tab2")}
          />
        )}

        {activeTab === "tab2" && (
          <Tab2Pemetaan
            daftarCpl={payload.daftar_cpl}
            daftarCpmk={payload.daftar_cpmk}
            daftarSubCpmk={payload.daftar_sub_cpmk}
            isFromModul0={Boolean(activeKurikulumId)}
            aiLoading={aiCpmkLoading}
            aiError={aiCpmkError}
            onGenerateAi={handleGenerateAiCpmk}
            onUpdateCpl={handleUpdateCpl}
            onUpdateCpmk={handleUpdateCpmk}
            onUpdateSubCpmk={handleUpdateSubCpmk}
            onNextTab={() => setActiveTab("tab3")}
          />
        )}

        {activeTab === "tab3" && (
          <Tab3Rencana16Minggu
            sksTeori={payload.identitas.sks_teori}
            sksPraktikum={payload.identitas.sks_praktikum}
            daftarSubCpmk={payload.daftar_sub_cpmk}
            rencana16Minggu={payload.rencana_16_minggu}
            pustaka={payload.pustaka}
            aiLoading={aiWeeksLoading}
            aiError={aiWeeksError}
            onGenerateAiWeeks={handleGenerateAiWeeks}
            onUpdateWeeks={handleUpdateWeeks}
            onUpdatePustaka={handleUpdatePustaka}
            onNextTab={() => setActiveTab("tab4")}
          />
        )}

        {activeTab === "tab4" && (
          <Tab4PratinjauEkspor
            payload={payload}
            saving={saving}
            onSaveOnly={() => handleSaveRps(false)}
            onSaveAndRelay={() => handleSaveRps(true)}
          />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        SIMPEL-OBE 01 · Pusat Kurikulum dan Inovasi Pembelajaran · Universitas Pattimura
      </footer>

      {/* Indikator Diagnostik Koneksi Supabase (Pojok Kanan Bawah) */}
      <SupabaseStatusBadge />
    </div>
  );
}
