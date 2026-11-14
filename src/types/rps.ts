export type UnsurCpl =
  | "Sikap"
  | "Pengetahuan"
  | "Keterampilan Umum"
  | "Keterampilan Khusus";

export interface CplItem {
  id: string;
  kode_cpl: string;
  unsur: UnsurCpl | string;
  deskripsi: string;
}

export interface CpmkItem {
  id: string;
  kode_cpmk: string;
  cpl_terkait: string[];
  level_taksonomi: string;
  deskripsi: string;
}

export interface SubCpmkItem {
  id: string;
  kode_sub_cpmk: string;
  cpmk_terkait: string;
  deskripsi: string;
  indikator_pencapaian: string;
  bentuk_penilaian: string;
  bobot_penilaian: number;
}

export type KategoriAsesmen =
  | "tugas_kuis"
  | "cbl_pbl_praktikum"
  | "uts"
  | "uas";

export interface PertemuanItem {
  minggu_ke: number;
  sub_cpmk_kode: string;
  indikator_kriteria: string;
  metode_pembelajaran: string;
  estimasi_waktu: string;
  materi_pembelajaran: string;
  kategori_asesmen: KategoriAsesmen;
  bobot_persen: number;
}

export interface IdentitasMk {
  prodi: string;
  fakultas: string;
  tahun_akademik: string;
  kode_mk: string;
  nama_mk: string;
  sks_teori: number;
  sks_praktikum: number;
  semester: number;
  prasyarat: string;
  rumpun_mk: string;
  tanggal_penyusunan: string;
}

export interface OtorisasiRps {
  dosen_pengampu: string;
  koordinator_rmk: string;
  ketua_prodi: string;
  ketua_gjm: string;
}

export interface PustakaRps {
  utama: string[];
  pendukung: string[];
}

export interface RekapBobot {
  tugas_kuis: number;
  cbl_pbl_praktikum: number;
  uts: number;
  uas: number;
  total: number;
}

export interface RpsPayload {
  identitas: IdentitasMk;
  otorisasi: OtorisasiRps;
  deskripsi_mk: string;
  bahan_kajian_utama: string;
  daftar_cpl: CplItem[];
  daftar_cpmk: CpmkItem[];
  daftar_sub_cpmk: SubCpmkItem[];
  rencana_16_minggu: PertemuanItem[];
  rekap_bobot: RekapBobot;
  pustaka: PustakaRps;
}

export interface KurikulumProdiRecord {
  id: string;
  kode_prodi: string | null;
  nama_prodi: string | null;
  tahun_kurikulum: string | null;
  kode_mk: string | null;
  nama_mk: string | null;
  sks: number | string | null;
  semester: number | string | null;
  cpl_dibebankan: unknown;
}

export interface ObeRpsRecord {
  id: string;
  kurikulum_mk_id: string | null;
  kode_mk: string;
  nama_mk: string;
  prodi: string;
  tahun_akademik: string;
  dosen_pengampu: string;
  status_siklus: string;
  payload_rps: RpsPayload;
  created_at?: string;
  updated_at?: string;
}
