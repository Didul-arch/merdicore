# Project Roadmap Refactoring (KKN Solo Dev)

## Goal
Ngurangin bloat: dead code, dependency yang gak kepake, dan duplikasi — sambil benerin masalah nyata (race condition di dashboard, SQL mentah nyebar, halaman publik yang harusnya SSR). Prioritas: **cut dulu sebelum nambah struktur baru**. Plan didesain realistis untuk solo dev dengan deadline KKN.

## Urutan Prioritas & Alasan

1. **Prioritas 1 (Kritikal, Gratis): Dead Code & Duplikasi Cleanup**
   *Alasan:* Sebelum refactor apapun, buang yang jelas-jelas gak kepake. Zero risk, zero effort besar, langsung ngurangin LOC. `lib/data.ts` misalnya sudah gak diimport di manapun.
2. **Prioritas 2 (Kritikal): Foto ke `next/image` + Pastikan `next build` Beneran Jalan**
   *Alasan:* Ketauan pas ngobrol soal "jangan lemot" — situs pake `<img>` mentah di semua halaman publik (foto gak di-resize/lazy-load/convert format), DAN `next build` produksi ternyata gagal total gara-gara 1 file kosong + 2 type error lama. Ini lebih kritikal daripada SSR/backend karena: (a) paling kerasa dampaknya ke kecepatan yang dirasain pengunjung, (b) situs gak bisa di-deploy sama sekali sebelum dibenerin.
3. **Prioritas 3 (Kritikal): Benerin Fitur yang Keliatan Jalan Tapi Sebenernya Rusak**
   *Alasan:* Bukan soal overhead — ini bug fungsional. Form aspirasi di `/contact` nunjukkin pesan sukses tapi gak pernah ngirim data ke backend (hilang begitu aja). Halaman publik `/lembaga` 100% hardcoded, gak pernah kesambung ke tabel `lembaga` yang udah ada CRUD dashboard-nya. Ini harus dibenerin sebelum SSR/SWR — percuma optimize performa halaman yang datanya aja salah.
4. **Prioritas 4 (Tinggi, Quick Win): Server Component untuk Halaman Publik Statis**
   *Alasan:* `contact`, `lembaga`, `regulasi` masih `"use client"` padahal isinya statis. Effort kecil, risiko rendah, ngurangin bundle JS & naikin skor SEO/Lighthouse.
5. **Prioritas 5 (Tinggi): Migrasi Dashboard Fetching ke SWR + Extract Komponen Bersama**
   *Alasan:* `useEffect` + fetch manual rentan race condition (ngetik di search), waterfall loading, dan susah refresh data. SWR beresin ini. Sekalian tarik komponen yang literally copy-paste di 5 halaman (lihat Fase 2). Dikonfirmasi juga lewat `eslint`: rule `react-hooks/set-state-in-effect` nge-flag 10 pemanggilan `setState` langsung di `useEffect` persis di 5 file dashboard ini — bukti tambahan ini bug nyata, bukan cuma gaya kode.
6. **Prioritas 6 (Menengah, Opsional/Ringan): Rapikan Backend API**
   *Alasan:* SQL mentah di `route.ts` memang berantakan, tapi solusi penuh (service layer + validation layer terpisah) nambah ~18 file baru untuk solo dev — itu nambah beban, bukan ngurangin. Ambil versi ringan: helper query bersama + validasi cuma di titik yang beneran rawan (form publik).

---

## Evaluasi Pendekatan Form Submit (Dashboard)
**Rekomendasi:** Tetap gunakan **Client-Side Fetch ke API Route**.
*Alasan:* Aplikasi dashboard ini sangat bergantung pada UI Modal. Di Next.js App Router saat ini, mengurus UX modal (loading state spesifik, validasi error inline, form reset, dan auto-close modal) masih jauh lebih mulus menggunakan kombinasi React State + SWR `mutate()` dibanding memaksakan pemakaian Server Actions.

---

## Fase 0: Dead Code & Dependency Audit — ✅ SELESAI
**Fokus:** Buang yang gak kepake. Ini duluan karena gratis dan langsung ngurangin bloat.

* **Dihapus:**
  * `lib/data.ts` — mock data lama, gak ada import-nya di manapun, tipe yang dipakainya (`NewsItem`, dll) udah gak ada di `lib/types.ts`.
  * `lib/supabase.ts` — client Supabase JS yang gak diimport di manapun (project pakai `postgres` raw + S3, bukan Supabase SDK).
  * Dependency `@supabase/supabase-js` di `package.json` (satu-satunya pemakainya ya file yang barusan dihapus).
* **Dicek, aman (bukan bloat):** `lib/fetchers.ts`, `lib/utils.ts`, `motion`, `@aws-sdk/client-s3` — semua aktif dipakai. 9 file di `components/*` semua direferensikan, gak ada yang mati.
* **Kriteria Selesai:** ✅ `grep` konfirmasi nol referensi ke file yang dihapus. `tsc --noEmit` gak nambah error baru.

---

## Fase 0.5: Auth Helper & Dead Script Cleanup — ✅ SELESAI
**Fokus:** Ketemu pas audit — bukan bagian rencana awal, tapi murah dan langsung motong duplikasi gede. Ditaruh sebelum Fase 1 karena sama-sama "cut dulu" dan zero risk (murni ekstraksi, gak ubah behavior).

* **Ketemu:** fungsi `checkAdmin()`/`checkSuperAdmin()` dicopy-paste identik di **14 file** `route.ts` (`berita`, `umkm`, `lembaga`, `perangkat-desa`, `pesan`, `users` — masing-masing + varian `[id]` — plus `upload` dan `dashboard/summary`), masing-masing bawa `// @ts-ignore` sendiri padahal `session.user.role` udah ke-type lewat `types/next-auth.d.ts`.
* **Dilakukan:**
  * `lib/auth.ts` baru — 1 fungsi `requireRole(allowedRoles)`, return session kalau role cocok, `null` kalau nggak.
  * Semua 14 file diganti manggil `requireRole()`, fungsi lokal yang dicopy-paste dihapus.
  * `@ts-ignore` di `app/api/*`: 19 → 4 (sisa 4 ada di config NextAuth-nya sendiri, bukan duplikasi, dibiarkan).
  * `package.json`: hapus script `migrate` yang nunjuk ke `scripts/migrate.js` yang gak eksis (migrasi DB jalan lewat `supabase/migrations/`).
* **Hasil:** total baris `app/api/*/route.ts` 1638 → 1485 (-153 baris). `tsc --noEmit` bersih dari error baru.
* **Catatan:** `dashboard/summary` sebelumnya balas `403 Forbidden` khusus buat role salah, sekarang `401` kayak endpoint lain (lebih konsisten, tapi technically beda status code — cek kalau ada frontend yang gantung ke situ).

---

## Fase 0.75: Foto → `next/image` + Fix Build Blocker — ✅ SELESAI
**Fokus:** Ketemu pas diskusi soal performa — situs gak pernah pake `next/image` sama sekali, dan `next build` produksi ternyata gagal total. Ini digeser ke depan Fase 1 (SSR) karena dampaknya ke kecepatan riil jauh lebih gede dan situs gak bisa di-deploy sebelum ini beres.

* **`next.config.ts`:** tambah `images.remotePatterns` buat domain Supabase storage (`ixvaocjypafdlyexfcsl.supabase.co`) dan `images.unsplash.com` (dipakai buat foto placeholder di beberapa halaman) — wajib biar `next/image` boleh optimize gambar dari domain eksternal.
* **8 file publik dikonversi `<img>` → `<Image fill sizes>`:** `app/page.tsx` (3 gambar), `app/berita/[id]/page.tsx`, `app/umkm/[id]/page.tsx` (2 gambar), `app/lembaga/page.tsx`, `app/tentang/page.tsx`, `components/berita/BeritaSearchableList.tsx`, `components/umkm/UmkmSearchableList.tsx`, `components/tentang/OfficialCard.tsx`. Gambar detail utama (`berita/[id]`, `umkm/[id]`) dikasih `priority` karena itu LCP image-nya.
* **Sengaja di-skip:** 4 file `<img>` di dashboard admin (`perangkat`, `umkm`, `lembaga`, `berita` — list pages). Gak ngaruh ke kecepatan pengunjung publik, jadi bukan prioritas sekarang. Follow-up opsional, tinggal copy pola yang sama.
* **Ketemu blocker gak terduga saat verifikasi `next build`:**
  1. `app/dashboard/umkm/[id]/page.tsx` — file kosong (0 byte), gak ke-link dari manapun di app. Bikin build gagal total (`is not a module`). **Dihapus.**
  2. `app/dashboard/layout.tsx` — 2 type error (`session.user.role`/`session.user.name` bisa `undefined`/`null`, gak dihandle). **Diperbaiki** (guard eksplisit + `?? undefined`).
  3. `lib/fetchers.ts` — 3 cast `rows as X[]` gagal type-check (postgres.js `Row[]` vs tipe custom, gak cukup overlap). **Diperbaiki** pake `rows as unknown as X[]`.
* **Hasil:** `next build` sekarang sukses dari kosong — sebelumnya situs gak bisa di-deploy produksi sama sekali, independen dari refactor apapun. Ini temuan paling penting di sesi ini.
* **Kriteria Selesai:** ✅ `npx next build` exit 0, `tsc --noEmit` gak nambah error baru, `grep` konfirmasi 8 file publik nol `<img>` mentah tersisa.

---

## Fase 0.9: Fitur yang Keliatan Jalan Tapi Rusak — ✅ SELESAI
**Fokus:** Ketemu pas baca `contact`, `lembaga`, `regulasi` buat ngecek pola yang sama kayak Fase 0.75. Ini bukan cleanup/overhead — ini bug: pengguna (warga & admin) percaya sesuatu terjadi padahal enggak.

* **Bug 1 — Form Aspirasi (`app/contact/page.tsx`) gak pernah ngirim data, DAN dashboard buat bacanya juga belum ada:**
  `handleSubmit` cuma `setSuccess(true)` lokal, gak ada `fetch()` ke `POST /api/pesan` sama sekali. API-nya (`app/api/pesan`, publik/no-auth buat POST, admin-only buat GET) udah lengkap — tapi dicek, **`app/dashboard/pesan` gak eksis**. Warga isi form, liat "Aspirasi Sukses Terkirim!" padahal datanya hilang.
  **Dilakukan:**
  * `handleSubmit` sekarang `fetch('/api/pesan', ...)` beneran (kategori aspirasi digabung ke `isi_pesan` karena tabel `pesan` gak punya kolom kategori terpisah), tambah state `submitting`/`error`, tombol submit disable + tampilin pesan error kalau gagal.
  * `app/dashboard/pesan/page.tsx` baru — list pesan masuk, filter status (Semua/Belum Dibaca/Sudah Dibaca), search, modal detail yang otomatis tandai "sudah dibaca" pas dibuka, hapus pesan. Pola sama kayak dashboard modul lain (nanti ikut disapu bareng di Fase 2/SWR).
  * `components/DashboardSidebar.tsx` — tambah menu "Aspirasi Warga" (sebelumnya gak ada link ke halaman ini sama sekali).
* **Bug 2 — Halaman publik `/lembaga` 100% hardcoded, gak connect ke DB:**
  Ada tabel `lembaga` + API CRUD penuh + dashboard admin — tapi `lib/fetchers.ts` gak punya `getAllLembaga`, dan halamannya isinya array 3 item manual.
  **Dilakukan:**
  * `getAllLembaga()` baru di `lib/fetchers.ts` + tipe `LembagaItem` baru di `lib/types.ts`.
  * `app/lembaga/page.tsx` diubah jadi Server Component murni yang fetch data asli — sekalian nyicil Fase 1 buat halaman ini (sekarang prerendered statis, bukan `"use client"` lagi).
  * Tab interaktifnya ditarik ke `components/lembaga/LembagaTabs.tsx` (client component kecil, cuma urus `useState` tab aktif).
  * **Catatan:** section "Program Kerja Unggulan" di versi hardcoded lama dibuang — kolom itu gak ada di tabel `lembaga` DB (cuma ada di data dummy lama). Kalau nanti mau balikin fitur ini, perlu migration nambah kolom + field form baru di dashboard, di luar scope "sambungin ke data yang udah ada".
* **Regulasi (`app/regulasi/page.tsx`) — beda kasus, BUKAN bug, TIDAK disentuh:**
  Hardcoded juga, tapi emang gak pernah ada tabel/API/dashboard buat regulasi sama sekali. Ini "fitur yang belum pernah dibangun", bukan "koneksi yang putus". Kalau mau dinamis, itu kerjaan baru (tabel + migration + API + dashboard) — di luar scope refactor, didiskusikan terpisah kalau emang dibutuhin.
* **Kriteria Selesai:** ✅ `npx next build` sukses (26 route, `/lembaga` sekarang `○ Static`, `/dashboard/pesan` route baru muncul). `tsc --noEmit` nol error.

---

## Fase 1: Server Component untuk Halaman Publik
**Fokus:** Konversi `"use client"` di halaman statis jadi Server Component, ekstrak interaktivitasnya ke komponen kecil.

* **Modul & Pemisahan:**
  1. **Contact (`app/contact/page.tsx`)**: Layout utama jadi SSR. Form dikeruk jadi komponen terpisah `<AspirasiForm client>`.
  2. **Lembaga (`app/lembaga/page.tsx`)**: Layout utama jadi SSR. Filter Tabs diekstrak jadi `<LembagaTabs client>`.
  3. **Regulasi (`app/regulasi/page.tsx`)**: Layout utama jadi SSR. Input pencarian dan modal detail dipisah ke `<RegulasiFilter client>`.
* **Estimasi Effort:** Kecil.
* **Risiko Regresi:** *Hydration error* jika HTML antara server dan client tidak sinkron pasca refactor.
* **Kriteria Selesai:** Seluruh root `page.tsx` di `app/contact`, `app/lembaga`, dan `app/regulasi` murni Server Component.

---

## Fase 2: SWR + Extract Komponen Bersama Dashboard
**Fokus:** Ganti `useEffect` fetch manual dengan SWR, sekalian tarik komponen yang copy-paste identik di 5 halaman.

* **Modul:** `dashboard/berita`, `dashboard/umkm`, `dashboard/users`, `dashboard/lembaga`, `dashboard/perangkat` (masing-masing 500-600 baris).
* **Ketemu saat audit:** komponen `Toast` di 5 file itu **identik 1:1** (copy-paste literal, cuma beda formatting). Pola table + modal CRUD juga sangat mirip strukturnya di kelimanya.
* **Implementasi:**
  1. Tarik `Toast` ke `components/dashboard/Toast.tsx` — 1 komponen, hapus 4 duplikat. Ini sendiri motong ~150+ baris tanpa risiko apa-apa.
  2. Install `swr`. Ganti state `data`, `loading`, `page`, `useEffect` fetch dengan `useSWR(url)`.
  3. Saat submit (POST/PUT/DELETE), panggil `mutate()` buat refresh tabel tanpa reload.
  4. **Kalau ada waktu:** evaluasi apakah struktur table+modal juga bisa ditarik jadi 1 komponen generik (`<CrudTable>`/`<CrudModal>`) — ini berpotensi motong LOC dashboard jauh lebih banyak daripada SWR sendiri, tapi lebih berisiko karena tiap modul punya field beda-beda. Jangan dipaksakan kalau bikin komponennya malah lebih kompleks dari 5 versi terpisah.
* **Estimasi Effort:** Menengah.
* **Risiko Regresi:** Filter search dan pagination berhenti bekerja karena state URL tidak terhubung dengan dependency array SWR.
* **Mitigasi (Bertahap):** Kerjakan per menu dashboard. Pastikan debounce search berfungsi normal sebelum pindah ke menu berikutnya.
* **Kriteria Selesai:** Tidak ada `useEffect` manual untuk memuat list data, tidak ada duplikat `Toast`.

---

## Fase 3: Rapikan Backend API (versi ringan)
**Fokus:** SQL mentah di `route.ts` memang berantakan (14 file, rata-rata ~115 baris), tapi solusi "service layer + validation layer" penuh nambah banyak file baru untuk solo dev. Ambil yang perlu aja.

* **Modul:** `api/berita`, `api/umkm`, `api/users`, `api/lembaga`, `api/perangkat-desa`, `api/pesan`.
* **Implementasi (skala kecil dulu):**
  * Kalau ada query yang literally sama persis di beberapa `route.ts` (misal pola pagination/filter) → tarik jadi 1 helper di `lib/db-helpers.ts`. Jangan bikin 1 file service per modul kalau isinya cuma 1-2 fungsi.
  * Validasi input: cukup di endpoint yang nerima data dari publik tanpa auth (`pesan` — form kontak warga). Endpoint dashboard yang udah di-guard auth + dipakai form terkontrol sendiri, risikonya jauh lebih rendah — validasi Zod di situ opsional, bukan wajib.
* **Kalau nanti beneran butuh Zod:** install cuma untuk skema yang dipakai, gak usah generate skema buat semua 6 modul sekaligus di awal.
* **Estimasi Effort:** Menengah, tapi bisa dicicil per endpoint yang paling bermasalah dulu (mulai dari `pesan`, karena itu yang nerima input publik).
* **Risiko Regresi:** Merusak response format (`success`, `data`, `pagination`) yang bisa membuat tabel dashboard pecah.
* **Mitigasi (Bertahap):** Refactor 1 endpoint utuh (`pesan` dulu), tes menyeluruh di UI. Kalau aman, baru lanjut endpoint lain — dan cuma kalau memang masih kerasa berantakan setelah Fase 2 selesai.
* **Kriteria Selesai:** Gak ada lagi query yang copy-paste identik di >1 `route.ts`. Endpoint publik (`pesan`) tervalidasi.
