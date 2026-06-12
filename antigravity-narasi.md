# SafePlace — Template Narasi Antigravity
> Copy narasi sesuai fase yang sedang dikerjakan. Ganti bagian [dalam kurung] sesuai konteks.

---

## 🟣 NARASI PEMBUKA UNIVERSAL
> Paste ini di awal SETIAP sesi baru Antigravity, sebelum prompt fasenya.

---

Kamu adalah senior fullstack developer yang sedang membangun platform bernama **SafePlace** — sebuah platform pelaporan dan pendampingan kekerasan seksual berbasis web.

**Tech stack:**
- Frontend: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- Backend & Database: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- Email: Resend
- i18n: next-intl (bahasa default: Indonesia)
- Deployment: Vercel + Cloudflare
- Font: Plus Jakarta Sans (display) + Inter (body)

**Lima role pengguna:**
1. **Pelapor** — korban atau saksi, bisa anonim (pakai kode tracking) atau teridentifikasi (akun)
2. **Konsultan** — pendamping profesional/volunteer, diundang admin via email
3. **Admin Web** — pengelola seluruh sistem
4. **Operator Komunitas** — moderator per kampus, bantu admin pantau laporan
5. **Satgas PPKS** — pihak kampus yang terima laporan yang diteruskan (Fase 1: portal read + update status)

**Filosofi warna per role:**
- Pelapor: biru `#4A90B8`, background `#F0F7FC`
- Konsultan: hijau teal `#5B8A6F`, background `#F4F9F6`
- Admin: navy `#2C3E6B`, background `#F5F6FA`
- Operator: ungu `#7B5EA7`, background `#F8F5FC`
- Satgas: biru tua `#1A5276`, background `#EBF5FB`
- Homepage: navy `#1B4F72`, background `#FAFBFF`

**Prinsip penting:**
- Semua teks UI menggunakan `useTranslations` dari next-intl, tidak ada hardcoded string
- Pelapor anonim menggunakan kode tracking 8 karakter sebagai identitas sesi
- Semua halaman pelapor (`/report/*`) wajib ada `PanicButton` — klik langsung redirect ke Google tanpa history
- Animasi smooth dengan Framer Motion, hormati `prefers-reduced-motion`
- Keamanan: RLS Supabase per role, enkripsi lampiran, audit log setiap aksi kritis

Sesi ini kita akan mengerjakan: **[TULIS NAMA FASE DI SINI]**

---

---

## 📋 NARASI PER FASE
> Setelah narasi pembuka universal di atas, lanjutkan dengan narasi fase yang sesuai.

---

### FASE 0 — Fondasi & Setup

Sekarang kita mulai dari awal. Buatkan setup project Next.js 14 dengan App Router dan Tailwind CSS untuk platform SafePlace.

Yang perlu dibuat:
- Inisialisasi Supabase client dengan environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Setup `next-intl` dengan bahasa default Indonesia, buat file `/messages/id.json` dan `/messages/en.json` dengan key dasar untuk namespace: `nav`, `common`, `auth`
- Struktur folder lengkap:
  - `/app/[locale]/(public)/` — halaman publik
  - `/app/[locale]/(dashboard)/report/` — pelapor
  - `/app/[locale]/(dashboard)/consultant/` — konsultan
  - `/app/[locale]/(dashboard)/admin/` — admin
  - `/app/[locale]/(dashboard)/operator/` — operator
  - `/app/[locale]/(dashboard)/satgas/` — satgas
- File `lib/colors.ts` berisi design token warna per role (sesuai filosofi warna di atas)
- `middleware.ts` untuk: proteksi route berdasarkan role dari Supabase session + redirect locale default
- Font setup via `next/font/google`: Plus Jakarta Sans (display) + Inter (body)

Hasilkan struktur folder, file konfigurasi, dan semua file setup yang dibutuhkan.

---

### FASE 1 — Database & Auth

Sekarang kita buat skema database lengkap di Supabase.

Buatkan SQL migration untuk semua tabel berikut beserta enum types, foreign keys, dan Row Level Security (RLS) policy per role:

Tabel yang dibutuhkan: `campuses`, `users`, `reports`, `report_attachments`, `messages`, `case_notes`, `satgas_case_updates`, `audit_logs`, `user_preferences`, `consultant_invites`.

Detail RLS:
- Pelapor: hanya lihat laporan miliknya (via reporter_id atau tracking_code di session)
- Konsultan: hanya lihat laporan yang assigned_consultant_id = auth.uid()
- Operator: hanya lihat laporan dari campus_id mereka
- Satgas: hanya lihat laporan yang assigned_satgas_campus_id = campus_id mereka
- Admin: lihat semua

Juga buatkan dua Supabase Edge Functions:
1. `generate_tracking_code` — hasilkan kode 8 karakter alfanumerik uppercase yang unik
2. `auto_assign_consultant` — dipanggil saat laporan baru masuk dengan intent consultation, cari konsultan online dengan kasus aktif paling sedikit (di bawah max_cases), assign otomatis, catat di audit_logs

Hasilkan file SQL migration lengkap dan kode Edge Functions.

---

### FASE 2 — Homepage Publik

Sekarang kita buat homepage publik SafePlace.

Buat halaman di `/app/[locale]/(public)/page.tsx` beserta semua komponen yang dibutuhkan. Warna: navy `#1B4F72`, aksen merah `#E74C3C`, background `#FAFBFF`. Gunakan Framer Motion untuk animasi scroll-triggered reveal.

Komponen yang perlu dibuat:
- `Navbar.tsx` — logo kiri, kanan: LanguageSwitcher (ID/EN dropdown dengan ikon bendera) + tombol Masuk (ghost) + tombol Mulai Lapor (solid merah), sticky dengan blur saat scroll
- `HeroSection.tsx` — headline 'Ruang Aman untuk Bersuara' dengan animasi teks muncul kata per kata, subheadline empatik 2 kalimat, dua CTA button, ilustrasi SVG abstrak tenang di sisi kanan
- `HowItWorksSection.tsx` — 3 langkah dengan ikon Lucide: Pilih Jalur → Ceritakan Kejadianmu → Dapatkan Pendampingan, fade-in staggered
- `SecuritySection.tsx` — 4 kartu fitur: Anonim Sepenuhnya, Data Terenkripsi, Identitas Terlindungi, Keluar Cepat Kapan Saja
- `ImpactSection.tsx` — 3 statistik besar (dummy data)
- `CampusSection.tsx` — CTA untuk kampus yang ingin bergabung
- `Footer.tsx` — link kebijakan privasi, syarat penggunaan, kontak

Semua teks menggunakan `useTranslations` dari next-intl. Tambahkan `generateMetadata` untuk SEO. Mobile responsive.

---

### FASE 3A — Pilih Jalur & Mode Pelaporan

Sekarang kita buat halaman awal alur pelaporan.

Buat `ReportContext.tsx` untuk menyimpan state alur pelaporan (jalur, mode, intent, data form) yang persist antar halaman.

Buat komponen `PanicButton.tsx`:
- Fixed position pojok kanan bawah, z-index tinggi
- Teks 'Keluar Cepat ✕', warna merah
- Klik: `window.location.replace('https://www.google.com')` — tanpa confirm dialog
- Event listener global: dua kali Escape dalam 500ms = trigger yang sama

Buat halaman `/report/start` — pilih jalur:
- Dua kartu besar: Lapor Anonim (ikon perisai) vs Lapor dengan Akun (ikon orang)
- Catatan bawah: 'Keduanya sama-sama aman'
- PanicButton terpasang

Buat halaman `/report/mode` — pilih mode pelapor:
- Dua kartu: Saya Korban vs Saya Melapor untuk Orang Lain
- Jika pilih 'Orang Lain': tampilkan catatan persetujuan korban
- Simpan ke ReportContext

Tema warna pelapor: biru `#4A90B8`, background `#F0F7FC`.

---

### FASE 3B — Pilih Intent

Sekarang kita buat halaman pemilihan intent pelapor.

Buat halaman `/report/intent` dengan tiga kartu besar pilihan:
1. 📋 Lapor & Dokumentasikan — 'Hanya ingin kejadian tercatat. Tidak diwajibkan melakukan apa pun setelahnya.'
2. 💬 Konsultasi & Pendampingan — 'Ingin berbicara dengan konsultan sebelum atau sambil melapor.'
3. 🏛️ Teruskan ke Satgas Kampus — 'Ingin laporan ditangani secara resmi oleh Satgas PPKS kampusmu.'

Kartu yang dipilih: border biru tebal + checkmark pojok kanan atas (animasi scale-in Framer Motion). Tombol 'Lanjut' aktif setelah ada pilihan. Teks kecil di bawah: 'Kamu bisa mengubah pilihan ini nanti dari dashboard.' Simpan ke ReportContext. PanicButton terpasang.

---

### FASE 3C — Form Pelaporan 6 Step

Sekarang kita buat form pelaporan multi-step.

Buat halaman `/report/form` menggunakan React Hook Form + Zod untuk validasi, Framer Motion untuk transisi slide antar step. Progress bar horizontal di atas dengan label step dan persentase. Di setiap step: tombol Sebelumnya, Simpan Draft, Lanjut. PanicButton terpasang selalu.

6 langkah form:
- Step 1: Jenis kejadian (radio: Pelecehan Verbal / Pelecehan Fisik / Kekerasan Seksual / Kekerasan Digital / Lainnya) + date picker tanggal + toggle 'Masih berlangsung?'
- Step 2: Input lokasi spesifik (opsional) + dropdown kampus partner (atau 'Di luar kampus')
- Step 3: Dropdown hubungan dengan pelaku + radio kondisi keamanan saat ini (Ya/Tidak/Tidak tahu), jika 'Tidak': tampilkan kotak info kontak darurat 119 ext 8
- Step 4: Textarea deskripsi dengan placeholder empatik, character counter, label 'Sepenuhnya opsional'
- Step 5: Drag & drop upload file (jpg/png/pdf/mp4, max 10MB per file, max 5 file), thumbnail preview, catatan enkripsi
- Step 6: Ringkasan semua jawaban (read only) + checkbox persetujuan + tombol Kirim Laporan

Simpan draft ke localStorage (anonim) atau Supabase (teridentifikasi). Upload lampiran ke Supabase Storage.

---

### FASE 3D — Konfirmasi & Tracking

Sekarang kita buat halaman konfirmasi dan tracking laporan.

Buat halaman `/report/confirmation`:
- Animasi checkmark sukses (Framer Motion)
- Kode tracking 8 karakter dalam kotak besar dengan tombol copy (Lucide Copy icon + toast 'Tersalin!')
- Instruksi cara pakai kode tracking
- Tombol ke halaman tracking + tombol ke halaman resources
- Jika teridentifikasi: tambahkan info 'Email konfirmasi dikirim ke [email]'

Buat halaman `/report/track`:
- Input kode tracking (untuk anonim) atau auto-load dari akun
- Card status laporan dengan timeline vertikal: Laporan Diterima → Sedang Ditinjau → Konsultasi Aktif (kondisional) → Diteruskan ke Satgas (kondisional) → Selesai
- Setiap milestone: timestamp + catatan singkat dari admin/konsultan
- Tombol 'Chat dengan Konsultan' muncul jika status in_consultation

---

### FASE 4 — Dashboard Konsultan

Sekarang kita buat dashboard konsultan.

Tema warna: hijau teal `#5B8A6F`, background `#F4F9F6`, aksen oranye `#E8A87C`.

Buat `ConsultantLayout.tsx` dengan sidebar kiri berisi: logo SafePlace, nama + avatar konsultan, toggle status (Online/Busy/Offline dengan dot indikator warna — update realtime ke Supabase), menu navigasi (Dashboard, Kasus Saya, Pesan, Profil, Keluar).

Buat halaman `/consultant/dashboard`:
- 4 kartu statistik: Kasus Aktif, Kasus Baru Hari Ini, Menunggu Responsmu, Selesai Minggu Ini
- Tabel kasus aktif: kolom Kode Laporan, Jenis, Intent (badge warna), Prioritas (badge: Urgent=merah pulse, Normal=kuning, Low=hijau), Status, Terakhir Update, tombol Buka

Buat halaman `/consultant/cases/[id]`:
- Header: kode laporan + status + dropdown update status
- Tiga tab: (1) Info Laporan — semua data form dalam card rapi, (2) Chat Pelapor — komponen ChatWindow (placeholder dulu, akan diisi Fase 5), (3) Catatan Pribadi — TipTap rich text editor untuk case notes + riwayat catatan sebelumnya dengan timestamp

---

### FASE 5 — Chat Real-time

Sekarang kita implementasikan sistem chat real-time.

Buat komponen `ChatWindow.tsx` yang reusable. Props: `reportId`, `currentUserId` (atau `trackingCode` untuk anonim), `userRole`.

Implementasi Supabase Realtime:
- Subscribe ke channel `chat:${reportId}`
- Load riwayat pesan dari tabel `messages` saat mount
- Pesan sendiri di kanan (biru), pesan lawan di kiri (abu)
- Timestamp setiap pesan format 'HH:mm'
- Indikator 'sedang mengetik...' via Supabase Presence
- Indikator read receipt (centang abu = terkirim, centang biru = dibaca)
- Auto-scroll ke pesan terbaru
- Input teks + tombol kirim (Lucide Send)
- Pesan anonim: sender_id = null, sender_tracking_code dari session

Di atas chat: nama konsultan (atau 'Konsultan SafePlace' jika anonim tidak tahu nama), status online, tombol 'Akhiri Sesi'. Animasi bubble pesan: slide-up Framer Motion.

Pasang ChatWindow di: `/report/chat` (sisi pelapor) dan `/consultant/cases/[id]` tab Chat (sisi konsultan).

---

### FASE 6 — Dashboard Admin

Sekarang kita buat dashboard admin.

Tema warna: navy `#2C3E6B`, background `#F5F6FA`, aksen teal `#4ECDC4`.

Buat `AdminLayout.tsx` dengan sidebar kiri lebar (240px): logo, info admin, menu navigasi lengkap (Dashboard, Laporan, Pengguna, Konsultan, Operator, Satgas, Kampus, Pengaturan, Export, Log Aktivitas).

Buat halaman `/admin/dashboard`:
- 4 kartu KPI dengan tren arrow: Total Laporan Masuk, Kasus Aktif, Konsultan Online, Rata-rata Waktu Respon
- Line chart Recharts tren laporan 30 hari
- Pie chart Recharts distribusi intent pelapor
- Tabel 10 laporan terbaru dengan quick-action

Buat halaman `/admin/reports`:
- Filter bar: status, intent, route_type, priority, campus, tanggal, search kode
- Sort semua kolom, pagination 20 per halaman
- Checkbox multi-select + bulk action bar: Assign Konsultan, Tandai Urgent, Eskalasi ke Satgas, Tutup Laporan
- Modal assign konsultan: dropdown nama + jumlah kasus aktif + status konsultan, textarea catatan
- Setiap aksi kritis: modal konfirmasi

Buat halaman manajemen: `/admin/users`, `/admin/consultants`, `/admin/operators`, `/admin/satgas`, `/admin/campuses`.

---

### FASE 6B — Onboarding Konsultan

Sekarang kita implementasikan sistem onboarding konsultan.

Seluruh proses diinisiasi admin — tidak ada form pendaftaran publik untuk konsultan.

Di `/admin/consultants`: tambahkan tombol 'Undang Konsultan Baru' yang buka modal form dengan field: nama lengkap, email, nomor WhatsApp, latar belakang pendidikan (textarea), pengalaman relevan (textarea), tipe konsultan (radio: Volunteer / Profesional), kampus afiliasi (dropdown, opsional), maks. kasus aktif (default 10).

Saat admin submit:
- Insert ke tabel `users` dengan role 'consultant' dan status 'pending'
- Insert ke tabel `consultant_invites` dengan token UUID unik + expires_at = now() + 48 jam
- Kirim email undangan via Resend: pesan selamat datang hangat + tombol 'Aktifkan Akun Saya' → `/join/[token]`

Kolom status konsultan: Aktif (hijau) / Undangan Terkirim (kuning) / Undangan Expired (merah) / Diarsipkan (abu). Tombol 'Kirim Ulang Undangan' jika expired — invalidate token lama, generate token baru, kirim email baru.

Buat halaman publik `/join/[token]`:
- Validasi token (is_used=false, expires_at > now())
- Jika invalid: halaman error 'Link kedaluwarsa, hubungi admin'
- Jika valid: tampilkan data profil read only + form set password + checkbox setuju Syarat Ketentuan Konsultan
- Saat submit: update password Supabase Auth, set is_used=true, redirect ke `/consultant/dashboard` dengan toast selamat datang

Fitur arsipkan di `/admin/consultants/[id]`: modal konfirmasi tampilkan jumlah kasus aktif + dropdown konsultan pengganti. Saat konfirmasi: re-assign kasus aktif, notif pelapor terdampak, set akun ARCHIVED, nama di riwayat jadi '[Nama] (Tidak Aktif)'.

---

### FASE 7A — Dashboard Operator Komunitas

Sekarang kita buat dashboard operator komunitas.

Tema warna: ungu `#7B5EA7`, background `#F8F5FC`, aksen amber `#F4A261`. Layout sidebar sederhana.

Operator hanya melihat laporan dari campus_id mereka (enforced RLS Supabase). Operator tidak bisa lihat identitas pelapor teridentifikasi — hanya kode laporan dan jenis kejadian.

Halaman utama `/operator/dashboard`:
- Badge notifikasi laporan baru (Supabase Realtime)
- Antrian laporan belum ditinjau — kartu per laporan dengan: kode, jenis kejadian, waktu masuk, tiga tombol aksi: 'Sudah Ditinjau' (hijau) / 'Flag ke Admin' (kuning, minta alasan via modal kecil) / 'Urgent!' (merah, update priority + notif admin)
- Log aktivitas harian: timeline vertikal aksi hari ini

Pasang browser Notification API: minta permission saat pertama login, kirim notif saat laporan baru masuk dari kampus mereka.

---

### FASE 7B — Dashboard Satgas PPKS

Sekarang kita buat dashboard Satgas PPKS (Fase 1: Portal).

Tema warna: biru tua `#1A5276`, background `#EBF5FB`, aksen emas `#D4AC0D`. Layout sidebar.

Satgas hanya lihat laporan dari kampus mereka yang diteruskan oleh admin (RLS enforced).

Halaman `/satgas/dashboard`:
- Daftar laporan yang diteruskan ke satgas kampus mereka
- Filter status: Baru Diterima / Sedang Diinvestigasi / Selesai

Halaman `/satgas/reports/[id]`:
- Data laporan yang relevan untuk penanganan formal (jenis, deskripsi, lampiran, riwayat konsultasi singkat)
- Panel kanan 'Update Status Penanganan': dropdown status (Diterima / Sedang Diinvestigasi / Selesai) + textarea catatan resmi + tombol simpan
- Timeline riwayat update status di bawah panel
- Footer: 'Fitur komunikasi langsung dengan pelapor akan tersedia di pembaruan mendatang.'

---

### FASE 8 — Notifikasi & Email

Sekarang kita implementasikan sistem notifikasi.

Setup Resend sebagai email provider. Buat Supabase Edge Functions sebagai trigger:

1. `on_report_created` — kirim email konfirmasi ke pelapor teridentifikasi (kode tracking, langkah selanjutnya, kontak bantuan) + notif in-app ke admin dan operator kampus terkait
2. `on_consultant_assigned` — kirim email ke konsultan (kode laporan, jenis kejadian, instruksi buka dashboard) + notif in-app ke konsultan
3. `on_report_status_changed` — kirim email update ke pelapor teridentifikasi + notif in-app
4. `on_escalated_to_satgas` — kirim email ke akun satgas kampus tersebut
5. `on_consultant_invited` — kirim email undangan aktivasi akun ke konsultan baru (sudah dibuat di Fase 6B, pastikan terintegrasi)

Semua template email: HTML bersih, bahasa empatik, warna sesuai SafePlace.

Buat komponen `NotificationBell.tsx` untuk navbar semua dashboard: ikon lonceng Lucide + badge jumlah belum dibaca, klik tampilkan dropdown 10 notifikasi terbaru (ikon tipe + teks singkat + timestamp relatif '5 menit lalu'), tombol 'Tandai semua dibaca'. Notif baru masuk realtime via Supabase.

---

### FASE 9 — Keamanan & Perlindungan

Sekarang kita implementasikan semua fitur keamanan SafePlace.

1. PanicButton final: pastikan komponen `PanicButton.tsx` terpasang di layout semua halaman `/report/*`. Fixed position pojok kanan bawah, tombol merah teks 'Keluar Cepat ✕', hover lebih besar dengan shadow. Klik: `window.location.replace('https://www.google.com')`. Event listener global: dua Escape dalam 500ms = trigger yang sama.

2. Auto-logout: buat hook `useIdleDetection(timeoutMs)` yang listen event mousemove/keydown/click/touchstart. Jika idle 10 menit di halaman pelapor: tampilkan `IdleWarningModal.tsx` dengan countdown 60 detik (animasi angka), tombol 'Saya Masih Di Sini'. Jika habis: `supabase.auth.signOut()` + `sessionStorage.clear()` + `localStorage.clear()` + redirect ke homepage.

3. Security headers di `next.config.js`: Content-Security-Policy, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin.

4. Audit log: buat helper `logAudit(action, targetType, targetId, metadata)` yang insert ke tabel `audit_logs`. Pasang di semua aksi kritis admin, operator, dan satgas.

---

### FASE 10 — i18n Lengkap & UI Polish

Sekarang kita selesaikan internasionalisasi dan polish UI SafePlace.

Pastikan semua teks di seluruh platform menggunakan `useTranslations` dari next-intl — tidak ada hardcoded string bahasa Indonesia di komponen manapun. Lengkapi `/messages/id.json` dan `/messages/en.json` dengan semua key terorganisir per namespace: `nav`, `auth`, `report`, `consultant`, `admin`, `operator`, `satgas`, `common`, `errors`.

Buat `LanguageSwitcher.tsx`:
- Tampil di navbar semua halaman
- Gunakan cookie `NEXT_LOCALE` untuk persist pilihan
- Tampilkan bendera + kode bahasa (🇮🇩 ID / 🇬🇧 EN)
- Smooth dropdown animation Framer Motion

UI Polish menyeluruh:
- Pastikan semua halaman mobile responsive (breakpoint sm/md/lg/xl Tailwind)
- Konsistensi spacing antar halaman
- Semua form punya proper focus states + ARIA labels untuk aksesibilitas
- Semua animasi Framer Motion punya `initial/animate/exit` + fallback untuk `prefers-reduced-motion`
- Skeleton screens sudah terpasang di semua halaman yang fetch data

---

### FASE 11 — SEO, Performance & Launch

Sekarang kita siapkan SafePlace untuk production launch.

1. SEO: `generateMetadata` di semua halaman publik — title template 'SafePlace — [nama halaman]', description, OG image (`/public/og-image.png` 1200x630), Twitter Card, canonical URL. Buat `public/robots.txt`: Allow `/` dan `/[locale]/`, Disallow semua dashboard. Setup `next-sitemap` untuk generate `sitemap.xml` otomatis.

2. Performance: gunakan `next/image` untuk semua gambar, `dynamic()` dengan ssr:false untuk komponen berat (TipTap, chart Recharts), pastikan `next/font` sudah optimal.

3. Buat `vercel.json` dengan: security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy), redirect www ke non-www.

4. Error handling: buat halaman `error.tsx` dan `not-found.tsx` per locale — pesan empatik + tombol kembali ke beranda.

5. Loading states: buat `loading.tsx` dengan skeleton screen per section di semua halaman dashboard.

6. Buat `.env.example` mendokumentasikan semua environment variables yang dibutuhkan.

Target Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100.

---

## 💡 Tips Penggunaan

1. **Selalu mulai dengan Narasi Pembuka Universal** — paste dulu, baru tambahkan narasi fase yang sesuai di bawahnya.

2. **Satu fase per sesi** — jangan gabungkan dua fase sekaligus. Selesaikan dan review dulu sebelum lanjut.

3. **Jika Antigravity berhenti di tengah** — lanjutkan dengan prompt: *"Lanjutkan dari bagian [nama komponen/halaman] yang belum selesai. Konteks proyek sama seperti sebelumnya."*

4. **Jika ada yang perlu diperbaiki** — sebutkan spesifik: *"Di halaman [nama halaman], [komponen X] perlu diubah menjadi [deskripsi]. Jangan ubah bagian lainnya."*

5. **Fase 1 (Database)** — output SQL dari Antigravity dijalankan manual di Supabase SQL Editor, bukan dijalankan otomatis. Minta Antigravity generate file `.sql`-nya saja.

6. **Setelah tiap fase selesai** — test dulu di browser sebelum lanjut ke fase berikutnya. Lebih mudah debug per fase daripada nanti sekaligus.
