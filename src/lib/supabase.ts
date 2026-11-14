import { createClient } from "@supabase/supabase-js";
import type {
  CplItem,
  KurikulumProdiRecord,
  ObeRpsRecord,
  RpsPayload,
} from "../types/rps";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://eysccwxpgdcoqfvaalye.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "[MASUKKAN_PUBLISHABLE_KEY_SUPABASE_ANDA]";

export const MODUL_2_BUKU_AJAR_URL =
  import.meta.env.VITE_MODUL_2_BUKU_AJAR_URL ||
  "[MASUKKAN_URL_MODUL_2_BUKU_AJAR]";

export const isSupabaseConfigured =
  Boolean(SUPABASE_ANON_KEY) &&
  !SUPABASE_ANON_KEY.includes("[MASUKKAN_");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function parseCplDibebankan(raw: unknown): CplItem[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return raw
        .split(/\r?\n|;/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, idx) => ({
          id: `cpl-${idx + 1}-${Date.now()}`,
          kode_cpl: `CPL-${String(idx + 1).padStart(2, "0")}`,
          unsur: "Pengetahuan",
          deskripsi: line,
        }));
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item, idx) => {
    if (typeof item === "string") {
      return {
        id: `cpl-${idx + 1}-${Date.now()}`,
        kode_cpl: `CPL-${String(idx + 1).padStart(2, "0")}`,
        unsur: "Pengetahuan",
        deskripsi: item,
      };
    }
    const obj = item as Record<string, unknown>;
    return {
      id: String(obj.id || `cpl-${idx + 1}-${Date.now()}`),
      kode_cpl: String(
        obj.kode_cpl || obj.kode || obj.code || `CPL-${String(idx + 1).padStart(2, "0")}`
      ),
      unsur: String(obj.unsur || obj.kategori || obj.domain || "Pengetahuan"),
      deskripsi: String(obj.deskripsi || obj.rumusan || obj.description || ""),
    };
  });
}

export async function fetchKurikulumList(): Promise<KurikulumProdiRecord[]> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Publishable/Anon Key Supabase belum dikonfigurasi pada src/lib/supabase.ts."
    );
  }
  const { data, error } = await supabase
    .from("obe_kurikulum_prodi")
    .select(
      "id, kode_prodi, nama_prodi, tahun_kurikulum, kode_mk, nama_mk, sks, semester, cpl_dibebankan"
    )
    .order("semester", { ascending: true })
    .order("kode_mk", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as KurikulumProdiRecord[];
}

export async function fetchKurikulumById(
  id: string
): Promise<KurikulumProdiRecord | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("obe_kurikulum_prodi")
    .select(
      "id, kode_prodi, nama_prodi, tahun_kurikulum, kode_mk, nama_mk, sks, semester, cpl_dibebankan"
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return (data as KurikulumProdiRecord) || null;
}

export async function fetchSavedRpsList(): Promise<
  Array<Pick<ObeRpsRecord, "id" | "kode_mk" | "nama_mk" | "prodi" | "tahun_akademik" | "dosen_pengampu" | "status_siklus">>
> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Publishable/Anon Key Supabase belum dikonfigurasi pada src/lib/supabase.ts."
    );
  }
  const { data, error } = await supabase
    .from("obe_rps")
    .select("id, kode_mk, nama_mk, prodi, tahun_akademik, dosen_pengampu, status_siklus")
    .order("kode_mk", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchRpsById(id: string): Promise<ObeRpsRecord | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("obe_rps")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return (data as ObeRpsRecord) || null;
}

export interface UpsertRpsInput {
  id?: string | null;
  kurikulum_mk_id: string | null;
  kode_mk: string;
  nama_mk: string;
  prodi: string;
  tahun_akademik: string;
  dosen_pengampu: string;
  payload_rps: RpsPayload;
}

export async function upsertObeRps(
  input: UpsertRpsInput
): Promise<ObeRpsRecord> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Publishable/Anon Key Supabase belum diisi di src/lib/supabase.ts (SUPABASE_ANON_KEY)."
    );
  }

  const row: Record<string, unknown> = {
    kurikulum_mk_id: input.kurikulum_mk_id || null,
    kode_mk: input.kode_mk,
    nama_mk: input.nama_mk,
    prodi: input.prodi,
    tahun_akademik: input.tahun_akademik,
    dosen_pengampu: input.dosen_pengampu,
    status_siklus: "1_rps_selesai",
    payload_rps: input.payload_rps,
  };

  if (input.id) {
    row.id = input.id;
  }

  const { data, error } = await supabase
    .from("obe_rps")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ObeRpsRecord;
}
