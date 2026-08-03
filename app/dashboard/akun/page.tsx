"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Field, TextInput } from "@/components/dashboard/Field";
import Toast from "@/components/dashboard/Toast";

export default function AkunPage() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordBaru !== konfirmasi) {
      setToast({ message: "Konfirmasi password baru tidak cocok", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordLama, passwordBaru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengubah password");

      setToast({ message: "Password berhasil diubah", type: "success" });
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasi("");
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Gagal mengubah password", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Ganti Password</h1>
          <p className="text-xs text-gray-400">Ubah kata sandi akun dashboard Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-4">
        <Field label="Password Lama" wajib>
          <TextInput
            type="password"
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        <Field label="Password Baru" wajib petunjuk="Minimal 8 karakter">
          <TextInput
            type="password"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Konfirmasi Password Baru" wajib>
          <TextInput
            type="password"
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Simpan Password Baru
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
