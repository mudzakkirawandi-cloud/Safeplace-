# SafePlace — Master Development Plan (v2 Final)
> Platform Pelaporan & Pendampingan Kekerasan Seksual  
> Tech Stack: Next.js 14 · Tailwind CSS · Supabase · Vercel + Cloudflare  
> Bahasa: Indonesia (default) + i18n multi-bahasa  
> Dibuat untuk: Antigravity AI Narasi Prompt Guide

---

## 🧭 Visi Platform

SafePlace adalah platform digital pelaporan dan pendampingan kekerasan seksual yang dimulai dari lingkungan kampus dan dirancang tumbuh menjadi platform nasional terbuka. Platform mengutamakan keamanan psikologis pelapor, kerahasiaan data, dan alur penanganan terstruktur antar semua pihak yang terlibat.

---

## 👥 Roles & Wewenang

| Role | Deskripsi | Fase |
|---|---|---|
| **Pelapor** | Korban atau saksi yang melaporkan kejadian | Fase 1 |
| **Konsultan** | Profesional pendamping pelapor | Fase 1 |
| **Admin Web** | Pengelola sistem, data, dan seluruh akses | Fase 1 |
| **Operator Komunitas** | Moderator per kampus, membantu admin memantau laporan | Fase 1 |
| **Satgas PPKS** | Pihak kampus — Fase 1: Portal (lihat + status). Fase 2: Platform Penuh | Fase 1 → 2 |
| **Peer Consultant** | Volunteer/teman sebaya konsultasi awal | Fase 2 |

---

## 🔀 Dua Jalur Pelaporan

### Jalur A — Anonim
- Tidak perlu akun
- Identitas tidak tersimpan, tidak ada logging IP
- Mendapat **kode tracking 8 karakter** unik untuk pantau status
- Bisa akses chat konsultan menggunakan kode tracking sebagai identitas sesi
- Kode hilang = tidak bisa akses laporan lagi (by design, untuk keamanan)

### Jalur B — Teridentifikasi
- Daftar/masuk dengan email + password
- Identitas tersimpan terenkripsi
- Akses riwayat laporan, status, dan riwayat konsultasi
- Notifikasi update via email

---

## 🎯 Tiga Intent Pelapor

Dipilih pelapor di awal, sebelum mengisi form:

```
┌──────────────────┬───────────────────────┬──────────────────────┐
│  📋 LAPOR SAJA   │  💬 KONSULTASI        │  🏛️ TERUSKAN KE     │
│                  │  + PENDAMPINGAN       │  SATGAS PPKS         │
│  Dokumentasikan  │                       │                      │
│  kejadian tanpa  │  Chat dengan          │  Laporan masuk ke    │
│  tindak lanjut   │  konsultan sebelum    │  dashboard Satgas    │
│  lebih lanjut    │  atau sambil lapor    │  kampus terkait      │
└──────────────────┴───────────────────────┴──────────────────────┘
```

**Catatan penting:**
- Pelapor bisa **berubah intent** setelah lapor pertama (misal: awalnya lapor saja, lalu minta konsultasi)
- Intent bisa diubah dari dashboard pelapor, tidak perlu lapor ulang

---

## 👤 Mode Pelapor

Di awal alur, ada pilihan tambahan:

```
Kamu melapor sebagai:
┌─────────────────────────┬──────────────────────────────┐
│  🙋 SAYA KORBAN         │  👁️ SAYA SAKSI / PELAPOR    │
│                         │  UNTUK ORANG LAIN            │
│  Kejadian dialami       │  Melaporkan atas nama         │
│  langsung oleh saya     │  orang lain                  │
└─────────────────────────┴──────────────────────────────┘
```

Jika mode saksi: form menyesuaikan — ada field tambahan "Hubungan dengan korban" dan peringatan bahwa korban perlu diberitahu tentang laporan ini.

---

## 🌐 Sistem Internasionalisasi (i18n)

- **Bahasa default:** Bahasa Indonesia
- **Implementasi:** `next-intl` library
- **Struktur file:** `/messages/id.json`, `/messages/en.json`, dst.
- **Language switcher:** Tersedia di navbar semua halaman (dropdown bendera)
- **Cakupan:** Seluruh halaman dan konten UI platform (bukan konten laporan)
- **URL strategy:** `/id/...` dan `/en/...` (atau subdomain `en.safeplace.id`)
- **Fase 1:** Indonesia + Inggris
- **Fase 2+:** Tambah bahasa daerah atau bahasa lain sesuai kebutuhan

---

## 🎨 Filosofi Warna Per Role

### Pelapor — "Tenang & Dipercaya"
```
Primary:    #4A90B8  (Biru tenang)
Background: #F0F7FC  (Biru pucat)
Accent:     #7EC8A4  (Hijau sage — harapan)
Text:       #1A2E3B
```

### Konsultan — "Hangat & Empatik"
```
Primary:    #5B8A6F  (Hijau teal)
Background: #F4F9F6
Accent:     #E8A87C  (Oranye warm)
Text:       #2C3E35
```

### Admin Web — "Tegas & Terstruktur"
```
Primary:    #2C3E6B  (Navy profesional)
Background: #F5F6FA
Accent:     #4ECDC4  (Teal cerah)
Text:       #1A1F36
```

### Operator Komunitas — "Kolaboratif & Siaga"
```
Primary:    #7B5EA7  (Ungu medium)
Background: #F8F5FC
Accent:     #F4A261  (Amber)
Text:       #2D1F4E
```

### Satgas PPKS — "Otoritatif & Institusional"
```
Primary:    #1A5276  (Biru tua institusional)
Background: #EBF5FB
Accent:     #D4AC0D  (Emas — wibawa kampus)
Text:       #1B2631
```

### Homepage Publik — "Berani & Aman"
```
Primary:    #1B4F72
Background: #FAFBFF
Accent:     #E74C3C  (Merah — urgensi)
Hero Grad:  #1B4F72 → #154360
```

---

## 🖥️ Halaman Per Role

### Homepage Publik (`/`)
- Navbar: Logo + Language Switcher + tombol Masuk + tombol Mulai Lapor
- Hero: Tagline + subheadline empatik + 2 CTA + ilustrasi SVG/Lottie
- Cara kerja: 3 langkah visual
- Keamanan & privasi: 4 kartu fitur (anonim, enkripsi, rahasia, panic button)
- Statistik dampak (agregat anonim)
- Bagian untuk kampus partner (ajakan bergabung)
- Footer: kebijakan privasi, syarat penggunaan, kontak

### Dashboard Pelapor (`/report`)
- `/report/start` — Pilih jalur (Anonim / Akun)
- `/report/mode` — Pilih mode (Korban / Saksi)
- `/report/intent` — Pilih intent (Lapor Saja / Konsultasi / Teruskan ke Satgas)
- `/report/form` — Form multi-step 6 langkah:
  - Step 1: Jenis kejadian + tanggal + apakah masih berlangsung
  - Step 2: Lokasi + konteks + institusi/kampus
  - Step 3: Hubungan dengan pelaku + kondisi keamanan pelapor saat ini
  - Step 4: Deskripsi kejadian (textarea empatik, opsional detail)
  - Step 5: Lampiran/bukti (drag & drop, terenkripsi, opsional)
  - Step 6: Ringkasan + konfirmasi intent
- `/report/confirmation` — Kode tracking + langkah selanjutnya
- `/report/track` — Tracking status via kode atau login
- `/report/chat` — Chat dengan konsultan (sesi via kode tracking atau akun)
- `/report/resources` — Artikel edukasi & sumber daya

### Dashboard Konsultan (`/consultant`)
- `/consultant/dashboard` — Statistik kasus + notifikasi
- `/consultant/cases` — Daftar kasus di-assign (filter: status, prioritas, intent)
- `/consultant/cases/[id]` — Detail kasus:
  - Tab: Info Laporan | Chat Pelapor | Catatan Pribadi | Riwayat Status
  - Rich text editor untuk case notes (TipTap)
  - Update status kasus
- `/consultant/chat` — Inbox pesan semua pelapor
- `/consultant/profile` — Profil & ketersediaan (online/busy/offline)

### Dashboard Admin Web (`/admin`)
- `/admin/dashboard` — KPI + grafik tren + distribusi intent
- `/admin/reports` — Semua laporan: filter multi-kolom, assign konsultan, flag urgent, eskalasi ke satgas
- `/admin/reports/[id]` — Detail laporan lengkap + timeline aktivitas
- `/admin/users` — Manajemen semua akun (toggle aktif, ubah role)
- `/admin/consultants` — Manajemen konsultan + beban kasus
- `/admin/operators` — Manajemen operator per kampus
- `/admin/satgas` — Manajemen akun Satgas per kampus
- `/admin/campuses` — Manajemen data kampus partner
- `/admin/settings` — Konfigurasi platform + template pesan + aturan auto-assign
- `/admin/export` — Export laporan CSV/PDF (anonymized)
- `/admin/logs` — Audit log seluruh aktivitas sistem

### Dashboard Operator Komunitas (`/operator`) — Per Kampus
- `/operator/dashboard` — Overview laporan kampus mereka sendiri
- `/operator/queue` — Antrian laporan baru belum di-review
- `/operator/flagged` — Laporan yang sudah di-flag untuk eskalasi
- `/operator/activity` — Log aktivitas harian operator
- **Batasan:** Hanya lihat laporan dari kampus sendiri. Tidak bisa lihat identitas pelapor teridentifikasi (hanya kode + jenis kejadian). Tidak bisa edit/hapus data. Aksi: Approve / Flag ke Admin / Tandai Urgent.

### Dashboard Satgas PPKS (`/satgas`) — Fase 1: Portal
- `/satgas/dashboard` — Laporan yang diteruskan ke satgas kampus mereka
- `/satgas/reports` — Daftar laporan: filter status penanganan
- `/satgas/reports/[id]` — Detail laporan + update status penanganan (Diterima / Sedang Diinvestigasi / Selesai)
- **Fase 1 batasan:** Read + update status saja. Tidak ada chat langsung dengan pelapor.
- **Fase 2 tambahan:** Chat dengan pelapor, dokumentasi investigasi, berita acara digital

---

## 🔄 Alur Auto-Assign Konsultan

```
Laporan masuk
     │
     ▼
Sistem cek konsultan tersedia
(status: online, beban kasus < batas maksimal)
     │
     ├── Ada konsultan tersedia ──► Auto-assign ke konsultan
     │                              dengan beban kasus paling sedikit
     │
     └── Tidak ada ──► Laporan masuk antrian
                        Admin mendapat notifikasi
                        Admin bisa assign manual
                             │
                             ▼
                   Admin bisa ubah assign
                   kapan saja (override)
```

---

## 👩‍💼 Sistem Onboarding Konsultan

### Model Konsultan
SafePlace mendukung dua tipe konsultan yang bisa berjalan bersamaan:

| Tipe | Deskripsi | Label di Profil |
|---|---|---|
| **Volunteer** | Sukarela, tidak dibayar | Badge "Relawan" |
| **Profesional** | Berbayar (honor per kasus/jam, dikelola di luar platform) | Badge "Profesional" |

### Alur Onboarding (Admin-Initiated)

Seluruh proses dimulai dari inisiatif admin — tidak ada form pendaftaran publik untuk konsultan.

```
LUAR PLATFORM
─────────────────────────────────────────────
Admin temukan kandidat
(referral, komunitas, kampus, media sosial)
        ↓
Verifikasi manual: WhatsApp / wawancara / video call
Kumpulkan: nama, email, WA, pendidikan,
           pengalaman relevan, motivasi, tipe
        ↓
Keputusan layak → lanjut ke platform

DALAM PLATFORM
─────────────────────────────────────────────
Admin buka /admin/consultants
        ↓
Klik "Undang Konsultan Baru"
        ↓
Admin isi form:
  • Nama lengkap
  • Email
  • Nomor WhatsApp
  • Latar belakang pendidikan
  • Pengalaman relevan
  • Tipe: Volunteer / Profesional
  • Kampus afiliasi (opsional)
  • Maks. kasus aktif (default: 10)
        ↓
Sistem generate link invite unik
(one-time use, berlaku 48 jam)
        ↓
Email otomatis terkirim ke konsultan:
  • Pesan selamat datang dari SafePlace
  • Penjelasan singkat peran konsultan
  • Tombol "Aktifkan Akun Saya" → /join/[token]

SISI KONSULTAN
─────────────────────────────────────────────
Konsultan klik link → halaman /join/[token]
        ↓
Lihat data profil yang sudah diisi admin
(nama, email, tipe — read only, tidak bisa diubah di sini)
        ↓
Set password sendiri (min. 8 karakter)
        ↓
Baca & setujui Syarat dan Ketentuan Konsultan
(dokumen khusus: kerahasiaan data, etika pendampingan,
 batasan peran, prosedur eskalasi)
        ↓
Checkbox "Saya menyetujui seluruh ketentuan"
        ↓
Akun aktif → otomatis masuk dashboard konsultan
```

### Penanganan Link Expired

Jika konsultan tidak mengklik link dalam 48 jam:
- Halaman `/join/[token]` menampilkan pesan "Link undangan ini sudah kedaluwarsa"
- Instruksi: "Hubungi admin SafePlace untuk mendapatkan undangan baru"
- Admin di dashboard `/admin/consultants` melihat status konsultan: **"Undangan Expired"**
- Admin klik tombol **"Kirim Ulang Undangan"** → sistem generate token baru + kirim email baru
- Token lama otomatis tidak valid

### Penonaktifan & Pengarsipan Konsultan

Jika konsultan berhenti atau dinonaktifkan admin:

```
Admin klik "Arsipkan Konsultan" di /admin/consultants/[id]
        ↓
Modal konfirmasi muncul:
"Konsultan ini memiliki [N] kasus aktif.
 Pilih konsultan pengganti untuk kasus tersebut:"
[Dropdown pilih konsultan pengganti]
        ↓
Admin konfirmasi → sistem:
  1. Re-assign semua kasus aktif ke konsultan pengganti
  2. Notifikasi pelapor: "Konsultanmu telah berganti"
  3. Status akun → ARCHIVED (tidak bisa login)
  4. Semua riwayat kasus tetap terhubung ke nama konsultan
  5. Di riwayat kasus: nama tampil sebagai "[Nama] (Tidak Aktif)"
```

### Halaman Tambahan yang Dibutuhkan

- `/join/[token]` — Halaman aktivasi akun konsultan (publik, tidak butuh login)
- `/admin/consultants` — Tambah kolom status: Aktif / Undangan Terkirim / Undangan Expired / Diarsipkan
- `/admin/consultants/[id]` — Detail konsultan + tombol Kirim Ulang Undangan / Arsipkan
- `/consultant/profile` — Konsultan bisa edit: foto profil, nomor WA, bio singkat, status ketersediaan

### Tabel Database Tambahan

```sql
-- Invite token konsultan
consultant_invites
  id, token (uuid unik),
  consultant_id FK,
  created_at,
  expires_at (created_at + 48 jam),
  used_at (nullable — kapan dipakai),
  is_used (bool default false)
```

---

## 🏗️ Arsitektur Sistem

```
┌────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14 App Router)       │
│  Deployed di Vercel · i18n dengan next-intl         │
├──────────┬────────────┬──────────┬─────────────────┤
│ /public  │ /report    │ /admin   │ /consultant      │
│ homepage │ pelapor    │ admin    │ /operator        │
│          │            │          │ /satgas          │
└──────────┴────────────┴──────────┴─────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│              SUPABASE                              │
│  Auth · PostgreSQL · RLS · Realtime · Storage      │
│  Edge Functions (auto-assign, notifikasi trigger)  │
└────────────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
┌──────────────────┐   ┌──────────────────────┐
│  Cloudflare      │   │  Resend              │
│  DNS+CDN+SSL     │   │  Email notifikasi    │
│  Custom domain   │   │  Template per role   │
└──────────────────┘   └──────────────────────┘
```

---

## 🗃️ Skema Database

```sql
-- Kampus partner
campuses
  id, name, slug, city, province,
  is_active, created_at

-- Users semua role
users
  id, email, role (reporter|consultant|admin|operator|satgas),
  display_name, campus_id (nullable),
  is_anonymous, consultant_status (online|busy|offline),
  max_cases (untuk konsultan), created_at, last_active

-- Laporan
reports
  id, tracking_code (8 char unik),
  reporter_id (nullable — anonim),
  reporter_mode (victim|witness),
  intent_type (report_only|consultation|escalate),
  route_type (anonymous|identified),
  incident_type, incident_date, is_ongoing,
  location, campus_id,
  perpetrator_relation,
  reporter_safety_status,
  description,
  status (submitted|under_review|in_consultation|
          escalated_to_satgas|closed),
  priority (low|normal|urgent),
  assigned_consultant_id,
  assigned_operator_id,
  assigned_satgas_campus_id,
  created_at, updated_at

-- Lampiran (terenkripsi)
report_attachments
  id, report_id, file_path,
  file_type, is_encrypted, uploaded_at

-- Pesan Chat
messages
  id, report_id, sender_id,
  sender_tracking_code (untuk anonim),
  content, is_read, sent_at

-- Catatan Konsultan (private)
case_notes
  id, report_id, consultant_id,
  note_content, created_at

-- Status Penanganan Satgas
satgas_case_updates
  id, report_id, satgas_id,
  status (received|investigating|completed),
  notes, updated_at

-- Audit Log
audit_logs
  id, actor_id, action,
  target_type, target_id,
  metadata, timestamp

-- i18n preference
user_preferences
  id, user_id, language (id|en|...),
  updated_at
```

---

## 🔐 Keamanan & Privasi

- **RLS Supabase:** Setiap role hanya akses data yang relevan, dibatasi per kampus untuk operator dan satgas
- **Enkripsi lampiran:** File di Supabase Storage dienkripsi at-rest
- **Anonim total:** Pelapor anonim tidak menyimpan IP, email, atau device fingerprint
- **Tracking code:** Dihasilkan secara kriptografis, tidak bisa ditebak
- **Panic button:** Pojok kanan bawah semua halaman pelapor, redirect ke Google tanpa history (`window.location.replace`)
- **Keyboard shortcut:** `Escape` ditekan 2x cepat = trigger panic button
- **Auto-logout:** Idle 10 menit di dashboard pelapor → modal countdown 60 detik → auto-logout + clear storage
- **Quick Exit navbar:** Tombol "Keluar Cepat" selalu terlihat di navbar pelapor
- **Audit log:** Semua aksi dicatat — siapa, apa, kapan, terhadap data apa
- **HTTPS only:** Enforced via Cloudflare SSL Full Strict

---

## ✨ Sistem Animasi & UX

**Library:**
- `framer-motion` → page transitions, form step slides, card reveals
- `tailwind animate` → micro-interactions (hover, focus, badge pulse)
- `lottie-react` → ilustrasi animasi hero homepage
- CSS scroll-driven animations → scroll reveal di homepage

**Prinsip:**
- Smooth tapi tidak berlebihan — animasi melayani konten
- Hormati `prefers-reduced-motion` (semua animasi punya fallback statis)
- Skeleton screens, bukan spinner

**Spesifik per halaman:**
- Homepage hero: teks muncul bertahap, gradient shift ambient
- Form step: slide kiri-kanan antar step, progress bar animated
- Dashboard cards: fade-in staggered saat load
- Status badge urgent: pulse animation
- Chat bubble: slide-up saat pesan baru masuk
- Notifikasi: slide-in kanan, auto-dismiss 5 detik
- Language switcher: smooth dropdown dengan flag icon

---

## 🚀 Deployment

```
Domain:      safeplace.id
Cloudflare:  DNS + CDN + SSL Full Strict
             Page Rule: www → non-www redirect
Vercel:      Hosting Next.js (auto-deploy dari GitHub main branch)

Subdomain rencana:
  safeplace.id         → homepage publik
  app.safeplace.id     → platform (opsional, bisa di-merge)

SEO:
  Homepage (/)         → diindex Google
  Semua /report, /admin, /consultant, /operator, /satgas
                       → noindex (robots.txt)
  sitemap.xml          → otomatis via next-sitemap
  Open Graph + Twitter Card → untuk share sosial
```

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_DEFAULT_LOCALE=id
```

---

## 📦 Dependensi Utama

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "tailwindcss": "3.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "next-intl": "^3.x",
    "framer-motion": "^11.x",
    "lottie-react": "^2.x",
    "recharts": "^2.x",
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "resend": "^3.x",
    "lucide-react": "^0.x",
    "date-fns": "^3.x",
    "next-sitemap": "^4.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  }
}
```

---

## 📋 FASE DEVELOPMENT

---

### FASE 0 — Fondasi & Setup (Hari 1-3)

**Prompt Antigravity:**
> "Buatkan setup project Next.js 14 dengan App Router dan Tailwind CSS untuk platform bernama SafePlace. Inisialisasi Supabase client dengan environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Setup `next-intl` untuk internasionalisasi dengan bahasa default Indonesia, tambahkan file `/messages/id.json` dan `/messages/en.json` dengan key dasar (nav, common, auth). Buat struktur folder: `/app/[locale]/(public)/` untuk halaman publik, `/app/[locale]/(dashboard)/report/` untuk pelapor, `/app/[locale]/(dashboard)/consultant/` untuk konsultan, `/app/[locale]/(dashboard)/admin/` untuk admin, `/app/[locale]/(dashboard)/operator/` untuk operator, `/app/[locale]/(dashboard)/satgas/` untuk satgas. Buat file `lib/colors.ts` berisi design token warna per role: pelapor (biru `#4A90B8`), konsultan (hijau teal `#5B8A6F`), admin (navy `#2C3E6B`), operator (ungu `#7B5EA7`), satgas (biru tua `#1A5276`), homepage (navy `#1B4F72`). Buat `middleware.ts` untuk: (1) proteksi route berdasarkan role dari Supabase session, (2) redirect locale default. Setup font: Plus Jakarta Sans sebagai display, Inter sebagai body, keduanya via `next/font/google`."

**Checklist:**
- [ ] Next.js 14 + Tailwind terkonfigurasi
- [ ] Supabase client (browser + server)
- [ ] next-intl dengan id.json & en.json dasar
- [ ] Struktur folder semua role
- [ ] `lib/colors.ts` design token lengkap
- [ ] `middleware.ts` auth + locale routing
- [ ] Font Plus Jakarta Sans + Inter

---

### FASE 1 — Database & Auth (Hari 3-7)

**Prompt Antigravity:**
> "Buat skema database lengkap di Supabase untuk SafePlace. Jalankan SQL migration untuk membuat tabel: `campuses` (id, name, slug, city, province, is_active, created_at), `users` (id, email, role enum ['reporter','consultant','admin','operator','satgas'], display_name, campus_id FK nullable, is_anonymous bool, consultant_status enum ['online','busy','offline'] nullable, max_cases int nullable default 10, created_at, last_active), `reports` (id, tracking_code varchar(8) unique, reporter_id uuid FK nullable, reporter_mode enum ['victim','witness'], intent_type enum ['report_only','consultation','escalate'], route_type enum ['anonymous','identified'], incident_type varchar, incident_date date, is_ongoing bool, location text, campus_id FK nullable, perpetrator_relation varchar, reporter_safety_status varchar, description text, status enum ['submitted','under_review','in_consultation','escalated_to_satgas','closed'] default 'submitted', priority enum ['low','normal','urgent'] default 'normal', assigned_consultant_id uuid FK nullable, assigned_operator_id uuid FK nullable, assigned_satgas_campus_id uuid FK nullable, created_at, updated_at), `report_attachments`, `messages`, `case_notes`, `satgas_case_updates`, `audit_logs`, `user_preferences`. Aktifkan Row Level Security (RLS): reporter hanya lihat laporan sendiri (via reporter_id atau tracking_code di session), konsultan hanya lihat laporan yang assigned_consultant_id = auth.uid(), operator hanya lihat laporan dari campus_id mereka, satgas hanya lihat laporan yang assigned_satgas_campus_id = campus_id mereka, admin lihat semua. Buat Supabase Edge Function `generate_tracking_code` yang menghasilkan kode 8 karakter alfanumerik unik (uppercase). Buat Edge Function `auto_assign_consultant` yang dipanggil saat laporan baru masuk dengan intent consultation: cari konsultan dengan status online dan jumlah kasus aktif paling sedikit (di bawah max_cases), assign otomatis, insert ke audit_logs."

**Checklist:**
- [ ] Semua tabel + enum types
- [ ] RLS policy per role per tabel
- [ ] Auth email/password + anonymous Supabase
- [ ] Edge Function generate_tracking_code
- [ ] Edge Function auto_assign_consultant
- [ ] Migration files tersimpan di `/supabase/migrations/`

---

### FASE 2 — Homepage Publik (Hari 7-10)

**Prompt Antigravity:**
> "Buat homepage publik SafePlace di `/app/[locale]/(public)/page.tsx` menggunakan Next.js 14, Tailwind CSS, Framer Motion, dan next-intl untuk teks. Warna: navy `#1B4F72`, aksen merah `#E74C3C`, background `#FAFBFF`. Komponen dan section yang dibutuhkan: (1) `Navbar.tsx` — logo SafePlace di kiri, di kanan: LanguageSwitcher dropdown (ID/EN dengan ikon bendera), tombol 'Masuk' (ghost), tombol 'Mulai Lapor' (solid merah), navbar sticky dengan blur background saat scroll. (2) `HeroSection.tsx` — full-height section, headline besar 'Ruang Aman untuk Bersuara' dengan animasi teks muncul kata per kata menggunakan Framer Motion, subheadline empatik 2 kalimat, dua tombol CTA (Lapor Sekarang & Pelajari Lebih Lanjut), sisi kanan ada ilustrasi SVG abstrak berbentuk tangan yang saling mendukung atau perisai dengan nuansa tenang (bukan gambar orang). (3) `HowItWorksSection.tsx` — 3 langkah dengan ikon Lucide: Pilih Jalur → Ceritakan Kejadianmu → Dapatkan Pendampingan, scroll-triggered fade-in staggered. (4) `SecuritySection.tsx` — 4 kartu fitur keamanan: Anonim Sepenuhnya, Data Terenkripsi, Identitas Terlindungi, Keluar Cepat Kapan Saja. (5) `ImpactSection.tsx` — 3 statistik besar (dummy: 500+ laporan ditangani, 50+ konsultan aktif, 20+ kampus partner). (6) `CampusSection.tsx` — CTA untuk kampus yang ingin bergabung sebagai partner. (7) `Footer.tsx` — link kebijakan privasi, syarat penggunaan, kontak, sosial media. Semua teks menggunakan `useTranslations` dari next-intl. Homepage dioptimasi SEO: generateMetadata dengan title, description, OG image."

**Checklist:**
- [ ] Navbar + LanguageSwitcher berfungsi
- [ ] Hero dengan animasi Framer Motion
- [ ] Semua section lengkap
- [ ] Scroll-triggered reveal animations
- [ ] SEO metadata
- [ ] Mobile responsive
- [ ] Teks dari next-intl (id.json + en.json terisi)

---

### FASE 3 — Alur Pelaporan (Hari 10-16)

**Prompt Antigravity — 3A (Pilih Jalur & Mode):**
> "Buat dua halaman awal alur pelaporan SafePlace. Tema warna pelapor: biru `#4A90B8`, background `#F0F7FC`. Halaman `/report/start`: dua kartu besar pilihan jalur — (1) 'Lapor Anonim' dengan ikon perisai, deskripsi keuntungan, tombol 'Lanjut Tanpa Akun'; (2) 'Lapor dengan Akun' dengan ikon orang, deskripsi keuntungan, tombol 'Masuk / Daftar'. Di bawah kartu: catatan kecil 'Keduanya sama-sama aman. Pilihanmu tidak mempengaruhi seberapa serius laporan ditangani.' Komponen `PanicButton.tsx` — tombol merah kecil pojok kanan bawah bertulis 'Keluar Cepat', saat diklik `window.location.replace('https://www.google.com')`. Juga pasang event listener: dua kali tekan Escape dalam 500ms = trigger panic button. Halaman `/report/mode`: setelah pilih jalur, pilih mode pelapor — (1) 'Saya Korban' ikon orang; (2) 'Saya Melapor untuk Orang Lain' ikon dua orang, tambahkan catatan 'Jika kamu melapor untuk orang lain, pastikan mereka mengetahui dan menyetujui laporan ini dibuat.' State jalur + mode disimpan ke React Context `ReportContext`. PanicButton juga ada di halaman ini."

**Prompt Antigravity — 3B (Pilih Intent):**
> "Buat halaman `/report/intent` untuk SafePlace. Tampilkan tiga kartu besar pilihan intent dengan animasi fade-in staggered menggunakan Framer Motion: (1) Kartu '📋 Lapor & Dokumentasikan' — 'Hanya ingin kejadian tercatat secara resmi. Kamu tidak diwajibkan melakukan apa pun setelahnya.'; (2) Kartu '💬 Konsultasi & Pendampingan' — 'Ingin berbicara dengan konsultan profesional sebelum atau sambil melapor.'; (3) Kartu '🏛️ Teruskan ke Satgas Kampus' — 'Ingin laporan ditangani secara resmi oleh Satgas PPKS kampusmu.' Saat satu kartu dipilih, kartu tersebut di-highlight dengan border warna biru tebal dan checkmark muncul di pojok kanan atas kartu. Tombol 'Lanjut' aktif setelah pilih. Di bawah: teks kecil 'Kamu bisa mengubah pilihan ini nanti dari dashboard.' Simpan intent ke ReportContext."

**Prompt Antigravity — 3C (Form 6 Step):**
> "Buat form pelaporan multi-step SafePlace di `/report/form` dengan 6 langkah menggunakan React Hook Form + Zod untuk validasi, Framer Motion untuk transisi slide antar step. Di atas form: progress bar horizontal dengan label step, persentase, dan nomor step saat ini dari total. Di pojok kanan atas: tombol 'Simpan Draft' yang menyimpan ke Supabase (atau localStorage jika anonim). Setiap step punya tombol 'Sebelumnya' dan 'Lanjut'. PanicButton tetap ada. Step 1 — Jenis & Waktu: radio button jenis kejadian (Pelecehan Verbal / Pelecehan Fisik / Kekerasan Seksual / Kekerasan Digital / Lainnya), date picker tanggal kejadian, toggle 'Apakah masih berlangsung?'. Step 2 — Lokasi & Institusi: input lokasi spesifik (opsional), dropdown kampus partner (atau 'Di luar kampus / Umum'), input kota jika umum. Step 3 — Konteks & Keamanan: dropdown hubungan dengan pelaku (Tidak dikenal / Kenalan / Teman / Rekan / Senior / Dosen/Atasan / Pasangan / Lainnya), radio 'Apakah kamu merasa aman saat ini?' (Ya / Tidak / Tidak tahu), jika 'Tidak': tampilkan kotak info kontak darurat (119 ext 8 untuk krisis). Step 4 — Cerita (opsional): textarea besar dengan placeholder empatik 'Ceritakan dengan kata-katamu sendiri. Kamu tidak harus menceritakan semuanya. Hanya bagikan apa yang kamu nyaman bagikan.', character counter, catatan 'Kolom ini sepenuhnya opsional.' Step 5 — Lampiran (opsional): drag & drop zone upload file (jpg/png/pdf/mp4 max 10MB per file, max 5 file), thumbnail preview, catatan 'Semua file dienkripsi dan hanya bisa diakses oleh konsultan dan admin yang ditugaskan.' Step 6 — Ringkasan & Konfirmasi: tampilkan ringkasan semua jawaban (bukan file), konfirmasi intent yang dipilih, checkbox persetujuan syarat, tombol 'Kirim Laporan'."

**Prompt Antigravity — 3D (Konfirmasi & Tracking):**
> "Buat halaman konfirmasi dan tracking SafePlace. Halaman `/report/confirmation`: tampilkan pesan sukses dengan animasi checkmark Framer Motion, kode tracking 8 karakter dalam kotak besar dengan tombol copy, instruksi cara menggunakan kode tracking, tombol ke halaman tracking, tombol ke halaman resources. Jika pelapor teridentifikasi: tambahkan 'Kami juga mengirim email konfirmasi ke [email]'. Halaman `/report/track`: input field kode tracking (untuk anonim) atau otomatis load dari akun (teridentifikasi), tampilkan card status laporan dengan timeline vertikal: Laporan Diterima → Sedang Ditinjau → (Konsultasi Aktif jika berlaku) → (Diteruskan ke Satgas jika berlaku) → Selesai. Setiap milestone di timeline punya timestamp dan catatan singkat dari admin/konsultan (jika ada). Tombol 'Chat dengan Konsultan' muncul jika status in_consultation."

**Checklist Fase 3:**
- [ ] ReportContext (state management alur)
- [ ] Halaman start + mode + intent
- [ ] PanicButton di semua halaman pelapor
- [ ] Form 6 step + validasi Zod
- [ ] Simpan draft (localStorage anonim, Supabase teridentifikasi)
- [ ] Upload lampiran ke Supabase Storage
- [ ] Halaman konfirmasi + copy kode
- [ ] Halaman tracking dengan timeline

---

### FASE 4 — Dashboard Konsultan (Hari 16-20)

**Prompt Antigravity:**
> "Buat layout dan halaman dashboard konsultan SafePlace. Tema warna: hijau teal `#5B8A6F`, background `#F4F9F6`, aksen oranye `#E8A87C`. Layout: `ConsultantLayout.tsx` dengan sidebar kiri (200px) berisi logo SafePlace, nama + avatar konsultan, status toggle (Online/Busy/Offline dengan dot indikator warna), menu navigasi (Dashboard, Kasus Saya, Pesan, Profil), tombol Keluar, dan konten utama di kanan. Halaman `/consultant/dashboard`: (1) Row 4 kartu statistik — Kasus Aktif, Kasus Baru Hari Ini, Menunggu Responsmu, Kasus Selesai Minggu Ini; (2) Tabel kasus aktif dengan kolom: Kode Laporan, Jenis, Intent (badge warna), Prioritas (badge: Urgent=merah pulse, Normal=kuning, Low=hijau), Status, Terakhir Update, Aksi tombol 'Buka'. Halaman `/consultant/cases/[id]`: Header dengan kode laporan + status + tombol update status (dropdown). Tiga tab: (1) Tab 'Informasi Laporan' — semua data form pelaporan dalam card yang rapi, timeline kejadian; (2) Tab 'Chat Pelapor' — komponen ChatWindow (akan dibuat fase 5); (3) Tab 'Catatan Pribadi' — TipTap rich text editor untuk case notes, tombol simpan, riwayat catatan sebelumnya ditampilkan di bawah editor dengan timestamp."

**Checklist:**
- [ ] ConsultantLayout dengan sidebar
- [ ] Toggle status konsultan (realtime update ke Supabase)
- [ ] Dashboard statistik
- [ ] Tabel kasus + filter
- [ ] Halaman detail kasus + 3 tab
- [ ] TipTap editor untuk case notes

---

### FASE 5 — Chat Real-time (Hari 20-24)

**Prompt Antigravity:**
> "Implementasikan sistem chat real-time SafePlace menggunakan Supabase Realtime. Buat komponen `ChatWindow.tsx` yang reusable, digunakan di `/report/chat` (sisi pelapor) dan `/consultant/cases/[id]` tab Chat (sisi konsultan). Komponen menerima props: `reportId`, `currentUserId` (atau `trackingCode` untuk anonim), `userRole`. Implementasi: subscribe ke Supabase Realtime channel `chat:${reportId}`, load riwayat pesan dari tabel `messages` saat mount, tampilkan pesan dalam bubble (pesan sendiri di kanan biru, pesan lawan di kiri abu), timestamp setiap pesan (format 'HH:mm'), indikator pesan sudah dibaca (centang abu=terkirim, centang biru=dibaca), indikator 'sedang mengetik...' menggunakan Supabase Presence, auto-scroll ke pesan terbaru saat pesan baru masuk, input teks di bawah dengan tombol kirim (Lucide Send icon), disabled jika tidak ada koneksi. Untuk pelapor anonim: sender_id diisi null, sender_tracking_code diisi dari session. Di atas chat: nama atau 'Konsultan SafePlace' (jika anonim tidak tahu nama konsultan), status online konsultan (dot hijau/abu), tombol 'Akhiri Sesi' yang update status laporan. Pesan baru muncul dengan animasi slide-up Framer Motion."

**Checklist:**
- [ ] ChatWindow component reusable
- [ ] Supabase Realtime subscribe/publish
- [ ] Support anonim via tracking code
- [ ] Indikator typing (Presence)
- [ ] Indikator read receipt
- [ ] Auto-scroll
- [ ] Animasi bubble pesan

---

### FASE 6 — Dashboard Admin (Hari 24-29)

**Prompt Antigravity:**
> "Buat dashboard admin SafePlace di `/app/[locale]/(dashboard)/admin`. Tema warna: navy `#2C3E6B`, background `#F5F6FA`, aksen teal `#4ECDC4`. Layout: `AdminLayout.tsx` dengan sidebar kiri lebar (240px) berisi logo, info admin, menu navigasi lengkap (Dashboard, Laporan, Pengguna, Konsultan, Operator, Satgas, Kampus, Pengaturan, Export, Log Aktivitas). Halaman `/admin/dashboard`: (1) 4 kartu KPI besar dengan ikon Lucide dan tren arrow — Total Laporan Masuk, Kasus Aktif, Konsultan Online, Rata-rata Waktu Respon; (2) Line chart Recharts tren laporan 30 hari dengan tooltip; (3) Pie chart Recharts distribusi intent pelapor; (4) Tabel laporan terbaru 10 baris dengan tombol quick-action. Halaman `/admin/reports`: data table lengkap semua laporan dengan: filter bar (status, intent, route_type, priority, campus, tanggal dari-sampai, search kode), sort semua kolom, checkbox multi-select untuk bulk action, bulk action bar muncul saat ada yang diselect (Assign Konsultan, Tandai Urgent, Eskalasi ke Satgas, Tutup Laporan), pagination 20 per halaman. Modal assign konsultan: dropdown pilih konsultan (tampilkan nama + jumlah kasus aktif + status), textarea catatan untuk konsultan, tombol konfirmasi. Setiap aksi kritis (close laporan, hapus user) tampilkan modal konfirmasi dengan teks aksi yang harus diketik ulang."

**Checklist:**
- [ ] AdminLayout sidebar
- [ ] Dashboard KPI + Recharts
- [ ] Tabel laporan + filter + sort + pagination
- [ ] Multi-select + bulk actions
- [ ] Modal assign konsultan
- [ ] Modal konfirmasi aksi kritis
- [ ] Halaman manajemen user/konsultan/operator/satgas/kampus

---

### FASE 6B — Onboarding Konsultan (Hari 29-32)

**Prompt Antigravity:**
> "Implementasikan sistem onboarding konsultan SafePlace. Seluruh proses dimulai dari admin — tidak ada form pendaftaran publik untuk konsultan. (1) Di halaman `/admin/consultants`: tambahkan tombol 'Undang Konsultan Baru' yang membuka modal form dengan field: nama lengkap, email, nomor WhatsApp, latar belakang pendidikan (textarea), pengalaman relevan (textarea), tipe konsultan (radio: Volunteer / Profesional), kampus afiliasi (dropdown kampus partner, opsional), maks. kasus aktif (number input, default 10). Saat admin submit: insert ke tabel `users` dengan role 'consultant' dan status 'pending', insert ke tabel `consultant_invites` dengan token UUID unik dan expires_at = now() + 48 jam, kirim email undangan via Resend (template hangat: pesan selamat datang, penjelasan peran, tombol CTA 'Aktifkan Akun Saya' → `/join/[token]`). Kolom status di tabel konsultan: Aktif (hijau) / Undangan Terkirim (kuning) / Undangan Expired (merah) / Diarsipkan (abu). Tombol 'Kirim Ulang Undangan' muncul jika status Expired — generate token baru, invalidate token lama, kirim email baru. (2) Halaman publik `/join/[token]`: cek validitas token (is_used=false, expires_at > now()), jika invalid tampilkan halaman error 'Link ini sudah kedaluwarsa. Hubungi admin SafePlace untuk undangan baru.' Jika valid: tampilkan data profil yang diisi admin (read only), form set password (min 8 karakter + konfirmasi), checkbox persetujuan Syarat dan Ketentuan Konsultan SafePlace (dengan link ke dokumen syarat), tombol 'Aktifkan Akun'. Saat submit: update password di Supabase Auth, set is_used=true dan used_at=now() di tabel invite, update status user menjadi aktif, redirect ke `/consultant/dashboard` dengan toast pesan selamat datang. (3) Fitur arsipkan di `/admin/consultants/[id]`: tombol 'Arsipkan Konsultan' → modal konfirmasi menampilkan jumlah kasus aktif + dropdown pilih konsultan pengganti. Saat konfirmasi: re-assign semua kasus aktif ke pengganti, kirim notifikasi in-app ke pelapor terdampak ('Konsultanmu telah diperbarui'), set status akun menjadi ARCHIVED (tidak bisa login), nama di riwayat kasus tampil sebagai '[Nama] (Tidak Aktif)'."

**Checklist:**
- [ ] Modal undang konsultan di /admin/consultants
- [ ] Tabel `consultant_invites` + token UUID logic
- [ ] Email undangan via Resend
- [ ] Status badge: Aktif / Terkirim / Expired / Diarsipkan
- [ ] Tombol kirim ulang undangan (invalidate token lama)
- [ ] Halaman publik `/join/[token]` dengan validasi expiry
- [ ] Form set password + persetujuan syarat konsultan
- [ ] Redirect ke dashboard setelah aktivasi berhasil
- [ ] Fitur arsipkan + re-assign kasus aktif + notifikasi pelapor

---

### FASE 7 — Dashboard Operator & Satgas (Hari 32-37)

**Prompt Antigravity — Operator:**
> "Buat dashboard operator komunitas SafePlace di `/operator`. Tema warna: ungu `#7B5EA7`, background `#F8F5FC`, aksen amber `#F4A261`. Layout sidebar sederhana. Operator hanya melihat laporan dari campus_id mereka (enforced oleh RLS Supabase). Halaman utama: badge notifikasi laporan baru (realtime). Antrian laporan baru belum ditinjau — kartu per laporan berisi: kode laporan, jenis kejadian, waktu masuk, tiga tombol aksi: 'Sudah Ditinjau' (hijau), 'Flag ke Admin' (kuning, minta input alasan via modal kecil), 'Urgent!' (merah, langsung update priority ke urgent + notifikasi admin). Operator tidak dapat melihat: nama, email, deskripsi detail laporan — hanya metadata. Log aktivitas harian: timeline vertikal aksi yang sudah dilakukan operator hari ini. Pasang browser Notification API: minta permission saat pertama login, kirim notif saat laporan baru masuk dari kampus mereka."

**Prompt Antigravity — Satgas:**
> "Buat dashboard Satgas PPKS SafePlace di `/satgas`. Tema warna: biru tua `#1A5276`, background `#EBF5FB`, aksen emas `#D4AC0D`. Ini adalah Fase 1 (Portal): satgas hanya bisa lihat laporan yang diteruskan ke mereka dan update status penanganan. Layout sidebar. Halaman utama: daftar laporan yang diteruskan ke satgas kampus mereka, filter status penanganan (Baru Diterima / Sedang Diinvestigasi / Selesai). Halaman detail laporan: tampilkan data laporan yang relevan untuk penanganan formal (jenis kejadian, deskripsi, lampiran jika ada, riwayat konsultasi singkat). Panel 'Update Status Penanganan' di sisi kanan: dropdown status (Diterima / Sedang Diinvestigasi / Selesai) + textarea catatan resmi + tombol simpan. Riwayat update status ditampilkan sebagai timeline di bawah panel. Catatan di footer halaman: 'Fitur komunikasi langsung dengan pelapor akan tersedia di pembaruan mendatang.'"

**Checklist:**
- [ ] Dashboard operator + antrian + flag system
- [ ] Browser notification API
- [ ] Dashboard satgas + update status
- [ ] RLS memastikan isolasi data per kampus

---

### FASE 8 — Notifikasi & Email (Hari 33-37)

**Prompt Antigravity:**
> "Implementasikan sistem notifikasi SafePlace. Setup Resend sebagai email provider. Buat Supabase Edge Functions sebagai trigger: (1) Trigger `on_report_created`: kirim email konfirmasi ke pelapor teridentifikasi (template HTML empatik dengan kode tracking, langkah selanjutnya, kontak bantuan), kirim notifikasi in-app ke admin dan operator kampus terkait; (2) Trigger `on_consultant_assigned`: kirim email ke konsultan (template berisi kode laporan, jenis kejadian, instruksi untuk membuka dashboard), kirim notif in-app ke konsultan; (3) Trigger `on_report_status_changed`: kirim email update ke pelapor teridentifikasi, update in-app notification; (4) Trigger `on_escalated_to_satgas`: kirim email ke akun satgas kampus tersebut. Semua template email menggunakan HTML bersih, warna sesuai SafePlace, bahasa empatik dan tidak kaku. Buat komponen `NotificationBell.tsx` untuk navbar semua dashboard: ikon lonceng Lucide dengan badge jumlah notifikasi belum dibaca, klik tampilkan dropdown daftar notifikasi terbaru (max 10), setiap item: ikon sesuai tipe, teks singkat, timestamp relatif ('5 menit lalu'), klik buka halaman terkait, tombol 'Tandai semua dibaca' di header dropdown. Notifikasi baru masuk realtime via Supabase."

**Checklist:**
- [ ] Resend terkonfigurasi + domain verified
- [ ] 4 template email HTML
- [ ] 4 Supabase Edge Function trigger
- [ ] NotificationBell component
- [ ] Realtime in-app notification

---

### FASE 9 — Keamanan & Fitur Perlindungan (Hari 37-40)

**Prompt Antigravity:**
> "Implementasikan semua fitur keamanan SafePlace. (1) PanicButton final: pastikan komponen `PanicButton.tsx` terpasang di layout semua halaman pelapor (`/report/*`). Tombol merah kecil fixed position pojok kanan bawah (z-index tinggi), teks 'Keluar Cepat ✕', hover menjadi lebih besar dengan shadow. Saat diklik: `window.location.replace('https://www.google.com')` — tidak ada confirm dialog, langsung redirect. Event listener global: dua Escape dalam 500ms memicu hal yang sama. (2) Auto-logout: buat hook `useIdleDetection(timeoutMs: number)` yang listen event mousemove/keydown/click/touchstart, reset timer setiap ada interaksi. Jika idle 10 menit di halaman pelapor: tampilkan `IdleWarningModal.tsx` dengan countdown 60 detik animasi, tombol 'Saya Masih Di Sini' untuk cancel, jika countdown habis: logout Supabase + `sessionStorage.clear()` + `localStorage.clear()` + redirect ke homepage. (3) Security headers di `next.config.js`: Content-Security-Policy, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin. (4) Audit log: buat helper `logAudit(action, targetType, targetId, metadata)` yang insert ke tabel `audit_logs`, panggil di setiap aksi kritis admin/operator/satgas."

**Checklist:**
- [ ] PanicButton di semua halaman /report
- [ ] Keyboard shortcut Escape x2
- [ ] useIdleDetection hook
- [ ] IdleWarningModal dengan countdown
- [ ] Auto-logout + clear storage
- [ ] Security headers di next.config.js
- [ ] logAudit helper terpasang

---

### FASE 10 — i18n Lengkap & Polish (Hari 40-44)

**Prompt Antigravity:**
> "Lengkapi internasionalisasi SafePlace. Pastikan semua teks di seluruh platform (homepage, semua dashboard, form, pesan error, email template) menggunakan `useTranslations` dari next-intl — tidak ada hardcoded string bahasa Indonesia di komponen. Lengkapi file `/messages/id.json` dan `/messages/en.json` dengan semua key yang dibutuhkan, terorganisir per namespace: `nav`, `auth`, `report`, `consultant`, `admin`, `operator`, `satgas`, `common`, `errors`. Buat komponen `LanguageSwitcher.tsx` yang: tampil di navbar semua halaman, gunakan cookie `NEXT_LOCALE` untuk persist pilihan, tampilkan bendera dan kode bahasa (🇮🇩 ID / 🇬🇧 EN), smooth dropdown animation. Lakukan juga UI polish menyeluruh: pastikan semua halaman mobile responsive (breakpoint sm/md/lg/xl), periksa konsistensi spacing Tailwind antar halaman, pastikan semua form punya proper focus states dan ARIA labels, pastikan semua animasi Framer Motion punya `initial/animate/exit` yang tepat dan respectful terhadap `prefers-reduced-motion`."

**Checklist:**
- [ ] Zero hardcoded strings — semua via next-intl
- [ ] id.json + en.json 100% terisi
- [ ] LanguageSwitcher dengan cookie persist
- [ ] Mobile responsive semua halaman
- [ ] Accessibility: focus states + ARIA
- [ ] prefers-reduced-motion dipatuhi

---

### FASE 11 — SEO, Performance & Launch (Hari 44-48)

**Prompt Antigravity:**
> "Persiapkan SafePlace untuk production launch. (1) SEO: `generateMetadata` di semua halaman publik dengan title template 'SafePlace — [nama halaman]', description, Open Graph image (buat `/public/og-image.png` 1200x630), Twitter Card, canonical URL. Buat `public/robots.txt`: Allow `/` dan `/[locale]/`, Disallow semua `/[locale]/(dashboard)/`. Setup `next-sitemap` untuk generate `sitemap.xml` otomatis. (2) Performance: gunakan `next/image` untuk semua gambar, `dynamic()` dengan ssr:false untuk komponen berat (TipTap, chart), `next/font` sudah terpasang dari Fase 0. Buat `vercel.json` dengan security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy), redirect www ke non-www. (3) Environment: pastikan semua env vars terdokumentasi di `.env.example`. (4) Error handling: buat halaman `error.tsx` dan `not-found.tsx` per locale dengan pesan empatik dan tombol kembali. (5) Loading states: buat `loading.tsx` dengan skeleton screen per section utama. Target Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100."

**Checklist:**
- [ ] generateMetadata semua halaman publik
- [ ] robots.txt + sitemap.xml
- [ ] OG image dibuat
- [ ] vercel.json dengan headers + redirect
- [ ] .env.example terdokumentasi
- [ ] error.tsx + not-found.tsx per locale
- [ ] loading.tsx skeleton screens
- [ ] Lighthouse ≥ 90 semua kategori
- [ ] Deploy ke Vercel + custom domain via Cloudflare

---

## 🗓️ Timeline Ringkas

| Hari | Fase | Deliverable |
|---|---|---|
| 1–3 | 0 | Setup project + i18n + middleware |
| 3–7 | 1 | Database + RLS + Auth + Edge Functions |
| 7–10 | 2 | Homepage publik lengkap |
| 10–16 | 3 | Alur pelaporan end-to-end |
| 16–20 | 4 | Dashboard konsultan |
| 20–24 | 5 | Chat real-time |
| 24–29 | 6 | Dashboard admin |
| 29–33 | 7 | Dashboard operator + satgas |
| 33–37 | 8 | Notifikasi + email |
| 37–40 | 9 | Keamanan + panic button |
| 40–44 | 10 | i18n lengkap + UI polish |
| 44–48 | 11 | SEO + performance + launch 🚀 |

---

## 🔮 Roadmap Fase 2 (Post-Launch)

| Fitur | Deskripsi |
|---|---|
| **Satgas Platform Penuh** | Chat satgas ↔ pelapor, dokumentasi investigasi, berita acara digital |
| **Peer Consultant** | Sistem volunteer, onboarding, jadwal shift, supervisi oleh konsultan senior |
| **Multi-bahasa tambahan** | Tambah bahasa daerah atau bahasa asing sesuai kebutuhan |
| **Mobile App** | React Native + Expo dengan fitur core platform |
| **AI Triage** | Klasifikasi urgensi laporan otomatis (tanpa menyimpan konten sensitif) |
| **Statistik Publik** | Dashboard agregat publik (zero PII) untuk advokasi kebijakan |
| **SSO Kampus** | Login menggunakan akun institusi kampus |

---

*SafePlace plan.md v2 — Final. Siap digunakan sebagai prompt narasi di Antigravity.*
*Setiap blok "Prompt Antigravity" dapat langsung di-copy sebagai instruksi pembangunan per fase.*
