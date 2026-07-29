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

## Fase 1: Server Component untuk Halaman Publik — ✅ SELESAI
**Fokus:** Konversi `"use client"` di halaman statis jadi Server Component, ekstrak interaktivitasnya ke komponen kecil.

* **Modul & Pemisahan:**
  1. **Contact (`app/contact/page.tsx`)**: Layout utama jadi SSR. Form ditarik ke `components/contact/AspirasiForm.tsx` (client). Bonus: tombol "Buka Peta" yang tadinya `<button onClick={window.open}>` diganti `<a href target="_blank">` — gak butuh JS sama sekali.
  2. **Lembaga (`app/lembaga/page.tsx`)**: Udah kelar duluan di Fase 0.9 (sekalian pas nyambungin ke DB).
  3. **Regulasi (`app/regulasi/page.tsx`)**: Layout utama jadi SSR. Search/filter/modal ditarik ke `components/regulasi/RegulasiFilter.tsx` (client), data hardcoded-nya dipindah ke `page.tsx` server + tipe `Regulation` baru di `lib/types.ts`.
* **Kriteria Selesai:** ✅ `grep "use client"` di ketiga `page.tsx` nol hasil. `tsc --noEmit` dan `eslint` bersih, `next build` sukses.

---

## Fase 2: SWR + Extract Komponen Bersama Dashboard — ✅ SELESAI
**Fokus:** Ganti `useEffect` fetch manual dengan SWR, sekalian tarik komponen yang copy-paste identik.

* **Modul:** `dashboard/berita`, `dashboard/umkm`, `dashboard/users`, `dashboard/lembaga`, `dashboard/perangkat`, `dashboard/pesan` (6 file, bukan 5 — `pesan` ketambahan pas Fase 0.9 dan sengaja dibangun pake pola lama biar konsisten, jadi ikut disapu di sini juga).
* **Dilakukan:**
  1. `Toast` ditarik ke `components/dashboard/Toast.tsx` — 6 duplikat jadi 1. CSS keyframe `animate-slide-in` yang tadinya di-inject `<style jsx global>` di tiap file (6x) dipindah ke `app/globals.css` sekali.
  2. `swr` diinstall (user install manual di mesinnya sendiri — `pnpm`/`npm` dua-duanya gak jalan di sandbox eksekusi ini, Node terlalu lama buat pnpm & npm crash di struktur `node_modules` pnpm). Semua `useState` (`items`/`loading`/`total`/`totalPages`) + `useCallback` fetch + `useEffect` pemicu fetch diganti `useSWR(url, fetcher)` dari `lib/swr-fetcher.ts` baru.
  3. Submit/delete manggil `mutate()` buat refresh tabel, ganti `fetchItems()`/`fetchUsers()` manual.
  4. Bonus: pola `useEffect(() => setPage(1), [statusFilter])` (anti-pattern React — "adjusting state on prop change") dipindah jadi reset langsung di `onChange`/`onClick` handler filter-nya. Ini juga yang bikin lint rule `react-hooks/set-state-in-effect` (10 error sebelumnya) sekarang nol di seluruh project.
  5. Sekalian beresin `catch (err: any)` yang ketemu di lint audit → `err instanceof Error ? err.message : "..."`.
  6. **Gak dikerjain (sesuai catatan opsional di plan):** ekstraksi `<CrudTable>`/`<CrudModal>` generik. Field tiap modul beda-beda cukup jauh, dipaksakan malah nambah kompleksitas.
* **Hasil:** total baris 6 halaman dashboard 2725 baris (dulu berita/umkm/users/lembaga/perangkat aja udah 2898 sebelum `pesan` ditambah — jadi walau nambah 1 halaman baru, total tetap turun berkat dedup `Toast` + state simplification). `next build` sukses, `tsc --noEmit` bersih, `eslint` nol error `set-state-in-effect` di seluruh project.
* **Kriteria Selesai:** ✅ Tidak ada `useEffect` manual untuk memuat list data, tidak ada duplikat `Toast`.

---

## Fase 3: Rapikan Backend API (versi ringan) — ✅ SELESAI
**Fokus:** SQL mentah di `route.ts` memang berantakan, tapi solusi "service layer + validation layer" penuh nambah banyak file baru untuk solo dev. Ambil yang perlu aja — dan ternyata gak perlu keduanya.

* **Modul:** `api/berita`, `api/umkm`, `api/users`, `api/lembaga`, `api/perangkat-desa`, `api/pesan`.
* **Dilakukan:**
  1. Parsing pagination (`page`/`limit`/`offset`) yang copy-paste identik di 6 `route.ts` → 1 helper `parsePagination()` di `lib/pagination.ts`. **Gak jadi bikin service layer per modul** — cukup 1 helper kecil, bukti lagi kalau layer arsitektur penuh emang gak dibutuhin buat scale sekecil ini.
  2. `POST /api/pesan` (satu-satunya endpoint publik tanpa auth) divalidasi manual: trim, cek panjang sesuai limit kolom DB (`nama_pengirim` maks 150, `email` maks 255, `no_hp` maks 20, `isi_pesan` maks 1000) — **gak install Zod**, cukup 4 `if` biasa buat 1 endpoint.
  3. Bonus, ketemu pas lint audit ulang: `no-explicit-any` (5 `catch (error: any)` di `berita`, `perangkat-desa`, `users`, `upload`) → `error instanceof Error`/narrowing manual. `prefer-const` di `pesan/route.ts` (`let data`/`let countResult` gak pernah di-reassign). 4 `@ts-ignore` di config NextAuth ternyata juga udah gak perlu (session/token role udah ke-type) — dihapus, persis temuan yang sama kayak Fase 0.5.
* **Hasil:** `tsc --noEmit` nol error, `eslint` nol error di seluruh `app/api/*` (sisa cuma warning `<img>` di 4 halaman dashboard yang emang udah sengaja di-skip). `next build` sukses.
* **Kriteria Selesai:** ✅ Gak ada lagi query yang copy-paste identik di >1 `route.ts`. Endpoint publik (`pesan`) tervalidasi.

---

## Fase 4: Data Basi, Font, & Endpoint Mati — ✅ SELESAI
**Fokus:** Ketemu pas ngecek "apa masih ada yang bisa dikencengin". Yang pertama sebenernya **bug**, bukan cuma soal kecepatan.

* **Bug — Data publik beku sejak `next build` → DIPERBAIKI:**
  5 halaman publik yang query DB (`/`, `/berita`, `/umkm`, `/tentang`, `/lembaga`) semuanya `○ Static` di build output, dan **gak ada satupun `export const revalidate` di seluruh project**. Artinya data di-query sekali pas build lalu dibekukan — admin publish berita baru, halaman publik gak akan pernah nampilin sampai situs di-build & deploy ulang. Kelas bug yang sama kayak Fase 0.9: fiturnya keliatan jalan, aslinya nggak.
  **Dilakukan:** `export const revalidate = 60` di 5 halaman itu (ISR). Halaman tetap dilayani dari cache statis (kenceng), cuma di-regenerate di background tiap 60 detik — jauh lebih ringan daripada `dynamic = 'force-dynamic'` yang query DB tiap request. Terbukti di build output: kolom `Revalidate` sekarang `1m` di kelima halaman.
* **Perf — Font `@import` Google → `next/font/local` (lewat 3 percobaan):**
  1. **Percobaan 1 — `next/font/google`: GAGAL.** Dia download file font pas build ke `fonts.gstatic.com`. Di jaringan hotspot (IPv6/NAT64) sering gagal → build error `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`. Gagal 2 dari 3 build. Sempat dibalikin ke `@import` CSS.
  2. **Percobaan 2 — cek jaringan.** Ketahuan `fonts.googleapis.com` (metadata CSS) bisa diakses, tapi `fonts.gstatic.com` (file font aslinya) gak tembus di jaringan itu.
  3. **Percobaan 3 — `next/font/local`: BERHASIL ✅.** Numpang jaringan lain sebentar, download 2 file variable font ke `app/fonts/` (Inter 48KB + Space Grotesk 22KB, subset latin), lalu pakai `next/font/local`.
  **Kenapa `local` lebih baik daripada `google` di sini:** file font ikut masuk repo, jadi **build gak pernah butuh internet lagi** — mau di hotspot, kampus, atau CI manapun tetap jalan. Pengunjung juga nol request ke Google (sama seperti versi `google`).
  Hasil: 3 dari 3 build sukses dari cache kosong.
* **Bonus — `DATABASE_URL` pindah ke connection pooler (ketemu tak sengaja pas build):**
  Build sempat gagal `connect ENETUNREACH 2406:da14:...:5432`. Ternyata `db.<ref>.supabase.co` **cuma punya alamat IPv6**, jadi mati total di jaringan IPv4-only. Diganti ke pooler Supabase (`aws-0-ap-northeast-1.pooler.supabase.com:5432`) yang punya IPv4 — URL-nya udah ada di `supabase/.temp/pooler-url` (dibikin CLI pas `supabase link`), tinggal ditambahin password.
  ⚠️ Perhatikan username-nya ikut berubah: `postgres` → `postgres.<project-ref>`, wajib buat pooler.
  Pakai port **5432 (session mode)** — perilakunya sama kayak koneksi biasa, gak perlu ubah kode. Ada juga 6543 (transaction mode) yang lebih hemat buat serverless, tapi butuh `prepare: false` di `postgres.js` — belum perlu sekarang.
  Ini perubahan di `.env.local` (gak ke-commit, di-gitignore). **Kalau deploy, jangan lupa set `DATABASE_URL` versi pooler ini di environment variable hosting-nya.**
* **Cleanup — 7 handler API mati dihapus:**
  Dicek satu-satu: dashboard cuma manggil `PUT` + `DELETE` di route `[id]`. Yang gak pernah dipanggil dari manapun → dihapus: `GET` di 6 route `[id]` (`berita`, `umkm`, `lembaga`, `perangkat-desa`, `users`, `pesan`) + `PATCH` di `berita/[id]` (increment views — halaman detail publik ternyata pakai `incrementBeritaViews()` dari `fetchers.ts` langsung, bukan lewat API).
* **Cleanup — sisa lint:** `any` + 5 import gak kepake di `app/dashboard/page.tsx` (satu-satunya halaman dashboard yang belum kesentuh Fase 2), `ChevronDown` di `Header.tsx`, `eslint-disable` mubazir di `lib/db.ts`, `NextAuth` import gak kepake di `types/next-auth.d.ts`.
* **Hasil:** `tsc --noEmit` nol error. `eslint` **nol error** di seluruh project (dari 12 error sebelum fase ini) — sisa 6 warning, semuanya `<img>` dashboard yang emang sengaja ditunda.
* **Kriteria Selesai:** ✅ Kolom `Revalidate: 1m` muncul di 5 halaman publik. `grep "fonts.googleapis"` di `globals.css` nol hasil. Semua route `[id]` cuma nyisain `PUT DELETE`.

---

## Sengaja TIDAK Dikerjakan (biar gak lupa alasannya)

* **Index database.** Cuma ada 1 index (`berita(views DESC)` — ironisnya kolom yang gak pernah dipakai buat sorting), dan `ORDER BY created_at` / `ILIKE` search emang gak ter-index. **Sengaja gak ditambah:** di skala web desa (puluhan–ratusan baris), Postgres nge-scan 100 baris lebih cepat daripada muter lewat index. Tambahin nanti kalau data udah ribuan DAN beneran kerasa lambat — jangan sekarang.
* **4 `<img>` sisa di dashboard admin + unused imports.** Admin-only, gak ngaruh ke kecepatan yang dirasain pengunjung. Cosmetic.
* **`<CrudTable>`/`<CrudModal>` generik.** Field tiap modul beda-beda cukup jauh; dipaksain malah nambah kompleksitas (lihat catatan Fase 2).
* **Zod.** Cuma 1 endpoint publik tanpa auth (`POST /api/pesan`), udah cukup divalidasi 4 baris `if`. Nambah dependency buat itu doang = mubazir.

---

## Catatan Arsitektur: Kenapa ada 2 cara ambil data?

Ini sering bikin bingung, jadi dicatat di sini biar jelas. **Aturan intinya cuma satu: browser TIDAK BOLEH connect langsung ke database** (password DB bakal keliatan publik). Jadi caranya beda tergantung kodenya jalan di mana.

| | Halaman publik | Dashboard admin |
|---|---|---|
| Contoh | `/`, `/berita`, `/umkm`, `/tentang`, `/lembaga` | `/dashboard/*` |
| Ada `"use client"`? | ❌ Tidak → **Server Component** | ✅ Ya → **Client Component** |
| Kodenya jalan di | Server | Browser pengunjung |
| Ambil data lewat | `lib/fetchers.ts` → SQL langsung | `useSWR` → `fetch('/api/...')` → `route.ts` → SQL |
| Jumlah lompatan | 1 (server → DB) | 2 (browser → server → DB) |

**Jadi `lib/fetchers.ts` itu BUKAN "raw SQL dari frontend".** File itu cuma diimport Server Component — kodenya gak pernah ikut terkirim ke browser, jadi SQL & kredensial DB aman. Makanya di atas file itu ada komentar *"JANGAN import file ini di Client Components"*.

Kenapa dashboard gak ikut pola Server Component? Karena dia butuh interaktif (modal, form, search real-time, tombol hapus) — itu semua wajib jalan di browser. Dan begitu kode jalan di browser, satu-satunya jalan ke DB ya lewat API route.

**Yang justru salah** (dan alhamdulillah gak ada di project ini): Server Component yang manggil `fetch('/api/...')` ke API-nya sendiri. Itu buang-buang 1 lompatan network — mending query langsung.
