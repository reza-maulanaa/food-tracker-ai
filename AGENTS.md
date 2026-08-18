# AGENTS.md

Aturan wajib untuk AI agent (OpenCode) yang bekerja di repo ini. Baca file ini sebelum melakukan perubahan apapun, dan patuhi tanpa pengecualian.

## 0. Aturan Paling Penting
- **DILARANG melakukan `git commit` dalam bentuk apapun.** Agent boleh mengubah/membuat file, tapi commit HANYA dilakukan manual oleh developer (user). Jangan pernah menjalankan `git commit`, `git push`, atau perintah git lain yang mengubah histori repo.
- Kalau sudah menyelesaikan satu unit kerja, berhenti dan laporkan ke user apa yang berubah — jangan lanjut commit sendiri atas inisiatif sendiri.

## 1. Alur Kerja (Wajib Berurutan)
Kerjakan project dalam urutan berikut, jangan loncat tahap:

1. **Frontend** — bangun UI dulu (halaman upload, tampilan hasil, layout dasar) sebelum backend logic disambungkan. Gunakan data dummy/mock dulu kalau perlu.
2. **Backend** — bangun API routes (Next.js Route Handlers), koneksi ke Supabase (DB + Storage), integrasi Gemini API.
3. **Testing** — setelah frontend dan backend tersambung, lakukan testing end-to-end: upload foto asli, cek hasil analisa, cek data tersimpan di Supabase, cek error handling.
4. **Deployment** — setelah semua teruji, baru masuk tahap build & deploy ke VPS (PM2 + Nginx).

Jangan mengerjakan tahap deployment sebelum testing selesai, dan jangan mengerjakan backend sebelum kerangka frontend ada.

## 2. Tech Stack (Wajib Diikuti, Jangan Ganti Tanpa Diminta)
- **Framework:** Next.js — monolith (frontend + API routes dalam satu app, JANGAN pisah jadi backend server terpisah)
- **Database:** PostgreSQL via Supabase
- **Storage foto:** Supabase Storage
- **AI Vision:** Gemini API
- **Auth:** TIDAK diimplementasikan di versi ini — tidak ada dashboard admin, jadi auth belum diperlukan. Jangan menambahkan auth kecuali diminta eksplisit.
- **ORM:** Tidak pakai ORM tambahan (Prisma dll) — gunakan `@supabase/supabase-js` client langsung sebagai query builder.

## 3. Aturan Desain UI (Wajib)
- **Border-radius: 0 di semua elemen.** Tidak ada sudut membulat sama sekali — button, card, input, image, semua harus full kotak/siku.
- **Palet warna — hanya 3 warna, dominan ungu:**
  - Primary (dominan): `#5B2A8C` (ungu tua)
  - Neutral terang: `#F5F1EA` (off-white hangat)
  - Neutral gelap: `#1A1A1A` (charcoal, untuk teks/kontras)
- Jangan menambah warna lain di luar 3 ini tanpa persetujuan user.

## 4. Batasan Scope
- Jangan menambahkan fitur di luar PRD (`PRD.md`) tanpa diminta — termasuk auth, multi-user, export laporan, dashboard admin.
- Kalau ragu apakah sesuatu masuk scope, tanya ke user dulu sebelum implementasi.

## 5. Struktur Project
```
/app
  /page.tsx                 → halaman utama (upload + hasil)
  /api/analyze/route.ts     → endpoint analisa foto (panggil Gemini)
  /api/scans/route.ts       → endpoint simpan/ambil riwayat scan (Supabase)
/lib
  /supabase.ts              → client Supabase
  /gemini.ts                → helper panggil Gemini API
```

## 6. Referensi
Untuk gambaran lengkap fitur dan tujuan project, baca `PRD.md` di root repo.
