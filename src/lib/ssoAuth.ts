import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const SSO_COOKIE_NAME = "simpatti_sso_session";

export interface SsoTokenPayload {
  access_token: string;
  refresh_token: string;
}

function parseTokenPayload(raw: string): SsoTokenPayload | null {
  if (!raw) return null;
  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // ignore decode failure
  }

  for (const candidate of candidates) {
    // 1. Direct JSON object
    try {
      const obj = JSON.parse(candidate) as Record<string, unknown>;
      if (
        typeof obj.access_token === "string" &&
        typeof obj.refresh_token === "string"
      ) {
        return {
          access_token: obj.access_token,
          refresh_token: obj.refresh_token,
        };
      }
    } catch {
      // not raw JSON
    }

    // 2. Base64-encoded JSON
    try {
      const decoded = atob(candidate);
      const obj = JSON.parse(decoded) as Record<string, unknown>;
      if (
        typeof obj.access_token === "string" &&
        typeof obj.refresh_token === "string"
      ) {
        return {
          access_token: obj.access_token,
          refresh_token: obj.refresh_token,
        };
      }
    } catch {
      // not base64 JSON
    }
  }
  return null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  const prefix = `${name}=`;
  for (const c of cookies) {
    const trimmed = c.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

export function writeSsoCookie(session: Session | null) {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const domainAttr = host.endsWith("simpatti.site")
    ? "; domain=.simpatti.site"
    : "";

  if (!session) {
    document.cookie = `${SSO_COOKIE_NAME}=; path=/${domainAttr}; max-age=0; SameSite=Lax`;
    return;
  }

  const value = encodeURIComponent(
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })
  );
  const secureAttr = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SSO_COOKIE_NAME}=${value}; path=/${domainAttr}; max-age=604800; SameSite=Lax${secureAttr}`;
}

function extractHashSsoTokens(): SsoTokenPayload | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return null;

  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleanHash);

  const ssoTokenRaw = params.get("sso_token");
  if (ssoTokenRaw) {
    const parsed = parseTokenPayload(ssoTokenRaw);
    if (parsed) return parsed;

    const refreshToken = params.get("refresh_token");
    if (refreshToken) {
      return { access_token: ssoTokenRaw, refresh_token: refreshToken };
    }
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  return null;
}

function clearUrlHash() {
  if (typeof window === "undefined") return;
  if (window.location.hash) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }
}

/**
 * Urutan deteksi sesi SSO otomatis:
 * 1. Sesi aktif bawaan supabase.auth.getSession()
 * 2. Hash URL #sso_token=... -> setSession + bersihkan hash URL
 * 3. Cookie lintas subdomain simpatti_sso_session (.simpatti.site) -> setSession
 */
export async function detectSsoSession(): Promise<{
  session: Session | null;
  user: User | null;
  source: "supabase" | "hash" | "cookie" | "none";
  error?: string;
}> {
  try {
    // 1. Cek sesi aktif bawaan Supabase
    const { data: currentData } = await supabase.auth.getSession();
    if (currentData.session) {
      // Jika kebetulan masih ada hash sso_token di URL, bersihkan
      if (window.location.hash.includes("sso_token")) {
        clearUrlHash();
      }
      return {
        session: currentData.session,
        user: currentData.session.user,
        source: "supabase",
      };
    }

    // 2. Cek Hash URL #sso_token=...
    const hashTokens = extractHashSsoTokens();
    if (hashTokens) {
      const { data, error } = await supabase.auth.setSession({
        access_token: hashTokens.access_token,
        refresh_token: hashTokens.refresh_token,
      });
      clearUrlHash();
      if (!error && data.session) {
        writeSsoCookie(data.session);
        return {
          session: data.session,
          user: data.session.user,
          source: "hash",
        };
      }
    }

    // 3. Cek Cookie lintas subdomain simpatti_sso_session
    const cookieRaw = readCookie(SSO_COOKIE_NAME);
    if (cookieRaw) {
      const cookieTokens = parseTokenPayload(cookieRaw);
      if (cookieTokens) {
        const { data, error } = await supabase.auth.setSession({
          access_token: cookieTokens.access_token,
          refresh_token: cookieTokens.refresh_token,
        });
        if (!error && data.session) {
          return {
            session: data.session,
            user: data.session.user,
            source: "cookie",
          };
        }
      }
    }

    return { session: null, user: null, source: "none" };
  } catch (err) {
    return {
      session: null,
      user: null,
      source: "none",
      error: err instanceof Error ? err.message : "Gagal memeriksa sesi SSO.",
    };
  }
}

export async function signInInPlace(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  if (data.session) {
    writeSsoCookie(data.session);
  }
  return data.session;
}

export async function signOutSso() {
  writeSsoCookie(null);
  await supabase.auth.signOut();
}

export function buildSsoRelayUrl(
  baseUrl: string,
  session: Session | null,
  queryParams?: Record<string, string>
): string {
  const url = new URL(baseUrl);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  if (session) {
    const tokenPayload = encodeURIComponent(
      JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })
    );
    url.hash = `sso_token=${tokenPayload}`;
  }
  return url.toString();
}

export function getUserProfileMetadata(user: User | null): {
  fullName: string;
  prodi: string;
  email: string;
} {
  if (!user) return { fullName: "", prodi: "", email: "" };
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = String(
    meta.full_name || meta.nama_lengkap || meta.name || user.email || ""
  );
  const prodi = String(meta.prodi || meta.program_studi || "");
  return {
    fullName,
    prodi,
    email: user.email || "",
  };
}
