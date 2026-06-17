# SafePlace — Historis Planning & Eksekusi
> Dokumen ringkasan perjalanan membangun SafePlace dari awal hingga sekarang.
> Dibuat untuk: konteks chat baru agar diskusi selanjutnya selaras dengan rancangan sebelumnya.

---

## 🧭 Tentang SafePlace

SafePlace adalah platform digital pelaporan dan pendampingan kekerasan seksual yang dimulai dari lingkungan kampus dan dirancang tumbuh menjadi platform nasional terbuka. Platform mengutamakan keamanan psikologis pelapor, kerahasiaan data, dan alur penanganan terstruktur antar semua pihak yang terlibat.

**Website live:** `https://safeplace-five.vercel.app/id`
**GitHub repo:** `https://github.com/mudzakkirawandi-cloud/Safeplace-`
**Supabase project:** `https://btafefcorrfqcofsxshz.supabase.co`

---

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|---|---|
| Next.js 14 (App Router) | Frontend + routing |
| Tailwind CSS | Styling |
| Framer Motion | Animasi smooth |
| Supabase | Database, Auth, Realtime, Storage, Edge Functions |
| next-intl | Internasionalisasi (ID + EN) |
| React Hook Form + Zod | Form & validasi |
| Recharts | Grafik dashboard admin |
| Resend | Email notifikasi (belum dikonfigurasi) |
| Vercel | Hosting & deployment |
| Cloudflare | DNS + CDN + SSL (belum dikonfigurasi) |
| GitHub | Version control |

---

## 👥 Roles & Wewenang

| Role | Deskripsi | Status |
|---|---|---|
| **Pelapor** | Korban/saksi, bisa anonim atau akun | ✅ Aktif |
| **Konsultan** | Pendamping profesional/volunteer, diundang admin | ✅ Aktif |
| **Admin Web** | Pengelola seluruh sistem | ✅ Aktif |
| **Operator Komunitas** | Moderator per kampus | ✅ Aktif |
| **Satgas PPKS** | Pihak kampus, Fase 1: portal lihat + update status | ✅ Aktif |
| **Peer Consultant** | Volunteer teman sebaya | 🔮 Fase 2 |

---

## 🎨 Filosofi Warna Per Role

| Role | Warna Primary | Background |
|---|---|---|
| Pelapor | `#4A90B8` (biru tenang) | `#F0F7FC` |
| Konsultan | `#5B8A6F` (hijau teal) | `#F4F9F6` |
| Admin | `#2C3E6B` (navy) | `#F5F6FA` |
| Operator | `#7B5EA7` (ungu) | `#F8F5FC` |
| Satgas | `#1A5276` (biru tua) | `#EBF5FB` |
| Homepage | `#1B4F72` (navy) | `#FAFBFF` |

---

## 🔀 Sistem Pelaporan

### Dua Jalur
- **Anonim** — tidak perlu akun, dapat kode tracking 8 karakter, bisa chat via kode tracking
- **Teridentifikasi** — akun email, riwayat laporan tersimpan, notifikasi email

### Tiga Intent (dipilih di awal)
1. 📋 **Lapor & Dokumentasikan** — hanya catat kejadian
2. 💬 **Konsultasi & Pendampingan** — chat dengan konsultan
3. 🏛️ **Teruskan ke Satgas** — laporan ke pihak resmi kampus

### Mode Pelapor
- **Korban** — melaporkan kejadian yang dialami sendiri
- **Saksi** — melaporkan untuk orang lain

### Form Pelaporan (6 Step)
1. Jenis kejadian + tanggal
2. Lokasi + institusi/kampus
3. Hubungan dengan pelaku + kondisi keamanan
4. Deskripsi kejadian (opsional)
5. Lampiran/bukti (opsional, terenkripsi)
6. Ringkasan + konfirmasi

---

## 🔄 Sistem Auto-Assign Konsultan

```
Laporan masuk dengan intent konsultasi
        ↓
Cari konsultan online dengan kasus paling sedikit
        ↓
Auto-assign → admin bisa override kapan saja
```

---

## 👩‍💼 Onboarding Konsultan

**Model:** Volunteer + Profesional berbayar (campuran)

**Alur:**
1. Admin temukan kandidat di luar platform
2. Verifikasi manual (WhatsApp/wawancara)
3. Admin input data konsultan di dashboard → sistem kirim link invite (berlaku 48 jam)
4. Konsultan klik link → set password → setujui syarat → akun aktif
5. Jika link expired → admin kirim ulang dari dashboard
6. Jika konsultan dinonaktifkan → akun diarsipkan (tidak bisa login, riwayat tetap ada)

---

## 🏗️ Arsitektur Database (Supabase)

**Tabel utama:**
- `users` — semua role (reporter, consultant, admin, operator, satgas)
- `campuses` — data kampus partner
- `reports` — semua laporan masuk
- `report_attachments` — lampiran terenkripsi
- `messages` — chat pelapor ↔ konsultan
- `case_notes` — catatan pribadi konsultan (private)
- `satgas_case_updates` — update status penanganan satgas
- `consultant_invites` — token undangan konsultan
- `audit_logs` — log semua aksi kritis
- `user_preferences` — preferensi bahasa user

**Keamanan:**
- RLS (Row Level Security) per role di semua tabel
- Pelapor anonim: tidak ada logging IP
- Lampiran terenkripsi di Supabase Storage
- Panic button: redirect ke Google tanpa history
- Auto-logout: idle 10 menit → modal countdown 60 detik

---

## 🖥️ Halaman yang Sudah Dibangun

### Homepage Publik
- `/id` — homepage dengan navbar, hero, how it works, security, impact, campus CTA, footer

### Alur Pelaporan
- `/id/report/start` — pilih jalur (anonim/akun)
- `/id/report/mode` — pilih mode (korban/saksi)
- `/id/report/intent` — pilih intent (lapor/konsultasi/satgas)
- `/id/report/form` — form 6 step
- `/id/report/confirmation` — konfirmasi + kode tracking
- `/id/report/track` — tracking status laporan
- `/id/report/chat` — chat dengan konsultan

### Auth
- `/id/login` — login semua role, auto-redirect sesuai role
- `/id/register` — daftar akun user biasa (role: reporter otomatis)
- `/id/join/[token]` — aktivasi akun konsultan via invite link

### Dashboard Konsultan
- `/id/consultant/dashboard` — statistik + kasus aktif
- `/id/consultant/cases` — daftar kasus
- `/id/consultant/cases/[id]` — detail kasus + chat + case notes
- `/id/consultant/messages` — inbox pesan
- `/id/consultant/profile` — profil konsultan

### Dashboard Admin
- `/id/admin/dashboard` — KPI + grafik
- `/id/admin/reports` — semua laporan + filter + bulk action
- `/id/admin/consultants` — manajemen konsultan + undang konsultan
- `/id/admin/operators` — manajemen operator
- `/id/admin/satgas` — manajemen satgas
- `/id/admin/campuses` — manajemen kampus partner
- `/id/admin/users` — manajemen semua user
- `/id/admin/settings` — pengaturan platform
- `/id/admin/export` — export data
- `/id/admin/audit` — log aktivitas

### Dashboard Operator
- `/id/operator/dashboard` — antrian laporan kampus
- `/id/operator/reports` — laporan yang di-flag

### Dashboard Satgas
- `/id/satgas/dashboard` — laporan yang diteruskan
- `/id/satgas/cases` — kasus ditangani
- `/id/satgas/stats` — statistik kampus
- `/id/satgas/profile` — profil satgas

---

## ✅ Fase yang Sudah Selesai

| Fase | Deskripsi | Status |
|---|---|---|
| Fase 0 | Setup project + struktur folder + design tokens | ✅ |
| Fase 1 | Database schema + RLS + Auth + Edge Functions | ✅ |
| Fase 2 | Homepage publik + SEO + animasi | ✅ |
| Fase 3A | Pilih jalur + mode + PanicButton + ReportContext | ✅ |
| Fase 3B | Pilih intent pelaporan | ✅ |
| Fase 3C | Form pelaporan 6 step | ✅ |
| Fase 3D | Konfirmasi + tracking laporan | ✅ |
| Fase 4 | Dashboard konsultan lengkap | ✅ |
| Fase 5 | Chat real-time (Supabase Realtime) | ✅ |
| Fase 6 | Dashboard admin + KPI + grafik | ✅ |
| Fase 6B | Onboarding konsultan via invite link | ✅ |
| Fase 7A | Dashboard operator komunitas per kampus | ✅ |
| Fase 7B | Dashboard satgas PPKS (portal) | ✅ |
| Fase 8 | Notifikasi + NotificationBell + email setup | ✅ |
| Fase 9 | Keamanan + login page + panic button + auto-logout | ✅ |
| Fase 10 | i18n lengkap (ID + EN) + UI polish | ✅ |
| Fase 11 | SEO + performance + launch preparation | ✅ |

---

## 📋 Pre-Launch Checklist (Belum Selesai)

- [ ] Setup Resend (email notifikasi)
- [ ] Beli domain (`safeplace.id` atau alternatif)
- [ ] Hubungkan Cloudflare (DNS + SSL)
- [ ] Aktifkan email confirmation di Supabase
- [ ] Test end-to-end semua alur
- [ ] Setup logo SafePlace asli
- [ ] Deploy Edge Functions ke Supabase

---

## 🔮 Fase 2 Roadmap (Belum Dikerjakan)

### Fase 12 — Navbar Baru + Halaman Publik
Navbar: `Beranda | Laporkan | Pendampingan | Edukasi | Komunitas | Tentang`

Halaman baru:
- `/laporkan` — landing page ruang pelaporan
- `/pendampingan` — daftar konsultan publik (request butuh login)
- `/edukasi` — modul pembelajaran + embed YouTube + regulasi
- `/tentang` — tentang SafePlace, tim, kolaborasi

### Fase 13 — Dashboard Pelapor + Logout Konfirmasi
- Dashboard pelapor: riwayat laporan, status real-time, akses chat
- Logout konfirmasi modal (Y/N) untuk SEMUA role
- Setelah logout semua role → redirect ke homepage `/id`
- Notifikasi status real-time untuk pelapor

### Fase 14 — AI Agent
- **Widget** di semua halaman (chat bubble pojok kiri bawah)
- **Halaman khusus** `/ai-assistant`
- **Model:** Google Gemini (primary) + Groq/Llama (fallback)
- **Bahasa:** otomatis detect Indonesia/Inggris
- **Kemampuan:** navigasi platform, alur pelaporan, info hukum, rekomendasi konsultan, dukungan emosional awal

### Fase 15 — Fitur Komunitas
- Feed umum + ruang diskusi per kategori
- Akses butuh akun, identitas bebas (nama/anonim)
- 5 kategori: Berbagi Cerita, Trauma & Pemulihan, Info Hukum, Tanya Jawab, Dukungan Sesama
- Trigger warning, hide/blur konten sensitif
- Moderasi: operator komunitas bisa takedown

### Fase 16 — Animasi, Logo & Polish
- Animasi tambahan (berdasarkan PDF design reference dari owner)
- Logo SafePlace asli
- Dark/Light mode
- Satgas platform penuh (chat + investigasi)
- Peer Consultant
- Mobile App (React Native + Expo)

---

## 🔑 Akun Test yang Sudah Ada

| Role | Email | Password |
|---|---|---|
| Admin | `admin@safeplace.id` | `Admin123!` |
| Konsultan | `konsultan@safeplace.id` | `Konsultan123!` |
| Operator | `operator@safeplace.id` | `Operator123!` |
| Satgas | `satgas@safeplace.id` | `Satgas123!` |

*Catatan: Email confirmation sementara dimatikan untuk testing. Aktifkan kembali sebelum launch.*

---

## 📁 Struktur File Penting

```
SafeSafe/
├── app/[locale]/
│   ├── (public)/          — homepage, login, register, join
│   └── (dashboard)/
│       ├── report/        — alur pelaporan
│       ├── consultant/    — dashboard konsultan
│       ├── admin/         — dashboard admin
│       ├── operator/      — dashboard operator
│       └── satgas/        — dashboard satgas
├── lib/
│   ├── supabase/          — client & server config
│   └── colors.ts          — design tokens warna per role
├── messages/
│   ├── id.json            — teks Bahasa Indonesia
│   └── en.json            — teks Bahasa Inggris
├── supabase/
│   ├── migrations/        — SQL schema database
│   └── functions/         — Edge Functions (Deno)
├── .env.local             — environment variables (tidak di-push)
└── middleware.ts          — auth + locale routing
```

---

## 💡 Keputusan Desain Penting

1. **Operator per kampus** — setiap kampus punya operator sendiri, RLS memastikan isolasi data
2. **Satgas = Portal di Fase 1** — lihat + update status, chat dan investigasi di Fase 2
3. **Konsultan diundang admin** — tidak ada registrasi publik untuk konsultan
4. **User biasa daftar sendiri** — otomatis dapat role `reporter`
5. **Logout semua role** → redirect ke homepage
6. **Panic button** — di semua halaman pelapor, `Escape x2` juga trigger
7. **AI Agent** — Gemini primary, Groq fallback, widget + halaman khusus
8. **Komunitas** — dibangun di Fase 2 setelah platform utama stabil

---

*Dokumen ini merangkum seluruh historis planning dan eksekusi SafePlace.*
*Gunakan sebagai konteks di chat baru untuk melanjutkan pengembangan.*
