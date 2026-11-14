import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { checkSupabaseConnection } from "../lib/supabase";

export function SupabaseStatusBadge() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [message, setMessage] = useState("Memeriksa Supabase...");

  const verify = useCallback(async () => {
    setStatus("checking");
    const res = await checkSupabaseConnection();
    if (res.connected) {
      setStatus("connected");
      setMessage("Supabase Connected (SIMPEL-OBE DB)");
    } else {
      setStatus("error");
      setMessage(`Supabase Error: ${res.message}`);
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <button
      type="button"
      onClick={verify}
      title="Klik untuk memeriksa ulang koneksi database Supabase"
      className={`no-print fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-md transition-colors ${
        status === "connected"
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : status === "checking"
          ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          : "border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
      }`}
    >
      {status === "checking" ? (
        <RefreshCw className="h-3 w-3 animate-spin text-[#0b3d91]" />
      ) : (
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${
            status === "connected" ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
      )}
      <span className="max-w-[280px] truncate">{message}</span>
    </button>
  );
}
