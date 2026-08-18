# PRD — Deteksi Gizi Makanan via Foto

## 1. Overview
Aplikasi web yang memungkinkan user mengupload/foto makanan, lalu AI menganalisa foto tersebut dan mengembalikan estimasi kandungan gizi (kalori, protein, karbohidrat, lemak). Dibuat untuk tugas sekolah — scope kecil, fokus ke fungsionalitas inti, bukan produk production skala besar.

## 2. Tujuan
- User bisa upload foto makanan dan mendapat estimasi gizi dalam hitungan detik.
- Codebase simpel, mudah dikerjakan solo, mudah di-deploy ke VPS pribadi.

## 3. Scope

### In Scope
- Upload foto makanan (dari file atau kamera device)
- Analisa foto lewat AI vision API (Gemini) → hasil gizi dalam format terstruktur
- Tampilan hasil analisa (nama makanan, estimasi porsi, kalori, protein, karbo, lemak)
- Penyimpanan riwayat scan (foto + hasil) ke database, opsional ditampilkan sebagai daftar riwayat
- Deploy ke VPS pribadi

### Out of Scope (sengaja tidak dibuat)
- Autentikasi/login user — **menyusul**, tidak wajib karena tidak ada dashboard admin di versi ini
- Multi-user / role management
- Edit manual hasil analisa oleh user
- Export laporan (PDF/Excel)

## 4. User Flow
1. User buka web app
2. User upload atau foto makanan
3. User klik "Analisa"
4. App menampilkan loading state
5. App menampilkan hasil: nama makanan + rincian gizi
6. (Opsional) hasil tersimpan otomatis ke riwayat

## 5. Tech Stack
| Layer | Teknologi |
|---|---|
| Framework | Next.js (monolith — frontend + API routes jadi satu) |
| Database | PostgreSQL via Supabase |
| Storage foto | Supabase Storage |
| AI Vision | Gemini API (Google AI Studio) |
| Auth | Belum diimplementasi — menyusul |
| Deployment | VPS pribadi (PM2 + Nginx) |

## 6. Data Model (Sederhana)
Tabel `scans`:
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | primary key |
| foto_url | text | URL foto di Supabase Storage |
| nama_makanan | text | hasil identifikasi AI |
| estimasi_porsi | text | |
| kalori | numeric | |
| protein_g | numeric | |
| karbohidrat_g | numeric | |
| lemak_g | numeric | |
| created_at | timestamp | default now() |

## 7. Desain UI
- **Bentuk:** tidak ada border-radius sama sekali — semua elemen (button, card, input, image) full kotak/siku (`border-radius: 0`)
- **Palet warna (3 warna, selaras, dominan ungu):**
  - Primary (dominan): Ungu tua — `#5B2A8C`
  - Neutral terang: Off-white hangat — `#F5F1EA`
  - Neutral gelap (teks/kontras): Charcoal — `#1A1A1A`
- Layout minimal: form upload di tengah, hasil analisa muncul di bawahnya sebagai card kotak dengan warna neutral terang, aksen ungu untuk button/heading.

## 8. Workflow Pengerjaan
Urutan kerja tetap: **Frontend → Backend → Testing → Deployment**
(detail aturan kerja ada di `AGENTS.md`)

## 9. Kriteria Selesai (Definition of Done)
- User bisa upload foto dan mendapat hasil analisa gizi yang masuk akal
- Data tersimpan di Supabase (DB + Storage)
- App berjalan stabil di VPS lewat domain/IP
- UI mengikuti aturan desain (kotak, 3 warna selaras dominan ungu)