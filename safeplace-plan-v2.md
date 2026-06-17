# SafePlace — Planning & Eksekusi Fase 2
> Dokumen ini adalah kelanjutan dari `safeplace-history.md` (Fase 0–11).
> Dibuat untuk: konteks chat baru di VSCode/Antigravity agar eksekusi Fase 12–16 berjalan presisi.
> Semua keputusan desain dan teknis sudah final dan terdokumentasi di sini.

---

## 🔗 Referensi Cepat

| Item | Detail |
|---|---|
| **Website live** | `https://safeplace-five.vercel.app/id` |
| **GitHub** | `https://github.com/mudzakkirawandi-cloud/Safeplace-` |
| **Supabase** | `https://btafefcorrfqcofsxshz.supabase.co` |
| **History doc** | `safeplace-history.md` (Fase 0–11, semua konteks sebelumnya) |

---

## ✅ Keputusan Desain Final (Jangan Diubah Tanpa Diskusi)

| Topik | Keputusan |
|---|---|
| Navbar style | Simple link langsung, tanpa dropdown/mega menu |
| Navbar mobile | Hamburger → slide-in panel dari kanan |
| Navbar hover effect | Underline animasi smooth + active state |
| Tombol CTA navbar | "Mulai Lapor" dengan subtle glow effect |
| AI Widget posisi | Kanan bawah, stack di atas PanicButton |
| URL Dashboard Pelapor | `/report/dashboard` |
| Halaman Komunitas Fase 12 | Placeholder cantik, belum full feature |
| Animasi demo pelaporan | Framer Motion CSS (bukan video/GIF) |
| YouTube di edukasi | Embed in-page (modal player) + tombol buka YouTube baru |
| Konten edukasi | Model B — dikelola admin dari dashboard |
| Foto konsultan | Opsional, fallback avatar inisial warna `#5B8A6F`, toggle admin |
| Logo SafePlace | SVG akan diberikan owner, placeholder text dulu |
| Nomor darurat | Section homepage + kolom footer + `/report/resources` |
| Halaman `/tentang` | Dikerjakan belakangan, bukan prioritas Fase 12 |
| Pure black/white | ❌ Dilarang — gunakan `#242424` dan `#E7E9EB` |
| Form input style | Box border (bukan underline), label di atas field |
| Placeholder di form | Hanya sebagai hint, bukan pengganti label |
| Password field | Wajib ada strength indicator + checklist persyaratan |
| Loading state | Skeleton loading (bukan spinner klasik) |
| Dropdown banyak opsi | Support search/filter (bukan scroll panjang) |

---

## 🎨 Logo & Kolaborasi

### Logo SafePlace
- Ikon: tangan memeluk sosok dengan bintang di atas + teks "SAFEPLACE" bold
- File SVG akan diberikan owner → **placeholder teks dulu saat coding**
- Logo beradaptasi warna sesuai role (sesuai filosofi warna di `safeplace-history.md`)

### Carousel Kolaborasi (Auto-scroll loop ke kanan)
Urutan logo di carousel:
1. **Sahabat Tangguh** (logo biru, figur manusia berpelukan)
2. **ULBI** (Universitas Logistik & Bisnis Internasional)
3. **Smart Insight** (human resource services & organisation development)
4. **Call Center Polri 110** (badge/logo resmi)
5. **SAPA 129 KemenPPPA** (badge/logo resmi)
- Loop terus-menerus tanpa henti, infinite scroll
- Pause on hover

---

## 📞 Nomor Darurat — Tiga Titik Akses

### 1. Section di Homepage (antara section kolaborasi dan footer)
```
🆘 Butuh Bantuan Segera?
Sentra Pelayanan Kepolisian Terpadu (SPKT) — kantor polisi terdekat
📞 Call Center Polri: 110 (gratis)
📞 Layanan SAPA 129 KemenPPPA: 129
💬 WhatsApp SAPA: 0821-2600-129
💬 WhatsApp Pengaduan Humas Polri: 0896-8233-3678
```

### 2. Kolom di Footer
Tambahkan kolom "Bantuan Darurat" di footer multi-kolom:
```
Bantuan Darurat
───────────────
📞 Polri: 110
📞 SAPA: 129
💬 WA SAPA: 0821-2600-129
```

### 3. Halaman `/report/resources`
Halaman resources pelapor — list lengkap kontak darurat + panduan singkat kapan menghubungi yang mana.

---

## 🗄️ Database Baru yang Dibutuhkan

### Tabel `education_content` (Fase 12)
```sql
CREATE TABLE education_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'pencegahan' | 'penanganan' | 'hukum' | 'pemulihan' | 'regulasi'
  content_type TEXT NOT NULL, -- 'video' | 'pdf' | 'article' | 'link'
  url TEXT, -- YouTube URL atau link eksternal
  file_path TEXT, -- path di Supabase Storage untuk PDF
  thumbnail_url TEXT, -- auto-generate dari YouTube atau upload manual
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'published' | 'draft'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: hanya admin yang bisa insert/update/delete
-- Public bisa SELECT hanya yang status = 'published'
```

---

## 🗓️ Urutan Eksekusi

```
Fase 12 → Fase 13 → Fase 14 → Fase 15 → Fase 16
```

---

# FASE 12 — Navbar Baru + Halaman Publik

## Scope
- [ ] Update navbar homepage (simple, animated)
- [ ] Footer baru multi-kolom (termasuk kolom nomor darurat)
- [ ] Carousel logo kolaborasi (infinite scroll, Framer Motion)
- [ ] Animasi demo pelaporan (Framer Motion mockup browser)
- [ ] Section nomor darurat di homepage
- [ ] Halaman `/pendampingan` — daftar konsultan publik
- [ ] Halaman `/edukasi` — konten dikelola admin
- [ ] Halaman `/komunitas` — placeholder "Segera Hadir"
- [ ] Tabel `education_content` di Supabase + RLS
- [ ] Update dashboard admin: tambah menu "Kelola Edukasi"

## Catatan Teknis Fase 12
- Navbar: sticky, background blur saat scroll, height mengecil smooth
- Animasi demo: mockup browser bergaya ilustrasi, bukan screenshot asli
- Embed YouTube: gunakan `youtube-nocookie.com` untuk privasi
- Skeleton loading di halaman `/pendampingan` saat fetch konsultan
- Foto konsultan: jika tidak ada → avatar inisial background `#5B8A6F`

---

## 🤖 PROMPT EKSEKUSI FASE 12

Salin prompt ini ke chat baru Antigravity/VSCode:

```
Kamu adalah senior Next.js developer yang sedang mengembangkan platform SafePlace — platform pelaporan kekerasan seksual berbasis kampus di Indonesia.

KONTEKS PROYEK:
- Baca file safeplace-history.md dan safeplace-plan-v2.md di root project untuk memahami seluruh konteks
- Tech stack: Next.js 14 App Router, Tailwind CSS, Framer Motion, Supabase, next-intl
- Website live: https://safeplace-five.vercel.app/id
- Semua halaman ada di app/[locale]/(public)/ dan app/[locale]/(dashboard)/

TUGAS FASE 12 — Kerjakan dalam urutan ini:

1. NAVBAR BARU
   - Update komponen navbar di semua halaman publik
   - Menu: Logo | Beranda | Laporkan | Pendampingan | Edukasi | Komunitas | Tentang | [Masuk] [Mulai Lapor]
   - Desktop: link langsung, tanpa dropdown
   - Mobile: hamburger → slide-in panel dari kanan
   - Efek: sticky, background blur saat scroll, height mengecil smooth, underline animasi hover
   - Tombol "Mulai Lapor": warna primary `#1B4F72`, ada subtle glow

2. FOOTER BARU MULTI-KOLOM
   - Kolom 1: Logo SafePlace (placeholder SVG) + tagline + sosial media
   - Kolom 2: Platform (Beranda, Laporkan, Pendampingan, Edukasi)
   - Kolom 3: Komunitas (Forum, Kategori, Moderasi)
   - Kolom 4: Bantuan Darurat (📞 Polri: 110, 📞 SAPA: 129, 💬 WA SAPA: 0821-2600-129)
   - Kolom 5: Legal (Kebijakan Privasi, Syarat Penggunaan, Keamanan Data)
   - Bawah footer: copyright + "Dibuat dengan ❤️ untuk Indonesia yang lebih aman"

3. CAROUSEL LOGO KOLABORASI
   - Infinite scroll ke kanan, loop terus, pause on hover
   - Logo: Sahabat Tangguh, ULBI, Smart Insight, Call Center Polri, SAPA 129
   - Gunakan Framer Motion atau CSS animation
   - Background section: subtle gradient sesuai warna homepage `#1B4F72`
   - Judul section: "Dipercaya & Berkolaborasi Bersama"

4. SECTION NOMOR DARURAT DI HOMEPAGE
   - Tempatkan antara section kolaborasi dan footer
   - Background merah lembut atau amber — menandakan urgensi tapi tidak menakutkan
   - Judul: "Butuh Bantuan Segera?"
   - Tampilkan 4 nomor darurat dengan ikon yang sesuai
   - Tombol: "Lihat Semua Layanan Darurat" → menuju /report/resources

5. ANIMASI DEMO PELAPORAN
   - Mockup browser bergaya ilustrasi (bukan screenshot asli)
   - Step 1: Browser search "SafePlace"
   - Step 2: Masuk beranda SafePlace
   - Step 3: Klik "Mulai Lapor"
   - Step 4: Pilih jalur pelaporan
   - Step 5: Isi form → selesai
   - Gunakan Framer Motion untuk animasi antar step
   - Auto-play, loop, bisa juga dikontrol manual

6. DATABASE — TABEL education_content
   - Buat migration SQL baru di supabase/migrations/
   - Schema sesuai yang ada di safeplace-plan-v2.md
   - Tambahkan RLS: public SELECT hanya status='published', admin full access

7. HALAMAN /edukasi
   - Fetch konten dari tabel education_content (status='published')
   - Filter per kategori: Pencegahan | Penanganan | Hukum & Regulasi | Pemulihan
   - Card video YouTube: embed in-page (modal player pakai youtube-nocookie.com) + tombol "Buka di YouTube"
   - Card PDF: tombol download + preview singkat
   - Skeleton loading saat fetch
   - Jika belum ada konten: tampilkan empty state yang informatif

8. HALAMAN /pendampingan
   - Fetch data konsultan dari tabel users WHERE role='consultant' AND is_active=true
   - Hanya tampilkan konsultan yang admin set show_public=true
   - Card konsultan: foto (fallback avatar inisial `#5B8A6F`) + nama + keahlian + bio singkat
   - Tombol "Request Pendampingan" → redirect ke /login jika belum login, lalu ke /report/intent
   - Skeleton loading saat fetch
   - Filter: Semua | Online | Spesialisasi

9. HALAMAN /komunitas (PLACEHOLDER)
   - Desain cantik, jangan kosong
   - Judul: "Ruang Komunitas SafePlace"
   - Subtitle: "Kami sedang membangun ruang diskusi yang aman dan terstruktur untukmu"
   - Preview 5 kategori komunitas yang akan hadir (Berbagi Cerita, Trauma & Pemulihan, Info Hukum, Tanya Jawab, Dukungan Sesama)
   - Form email notifikasi: "Beritahu saya saat Komunitas siap"
   - Warna sesuai tema homepage

10. UPDATE DASHBOARD ADMIN
    - Tambah menu "Konten Edukasi" di sidebar admin
    - Halaman /admin/education: list semua konten + filter status
    - Form tambah konten: judul, kategori, tipe (video/pdf/artikel), URL atau upload file, thumbnail, urutan, status
    - Tombol publish/unpublish, edit, hapus
    - Embed preview YouTube saat paste URL

STANDAR WAJIB DI SEMUA KODE:
- Semua teks dalam dua bahasa: id.json dan en.json (next-intl)
- Tidak ada pure black (#000000) atau pure white (#FFFFFF) — gunakan #242424 dan #E7E9EB
- Semua form: label di atas field, placeholder hanya hint
- Input field: border box, bukan underline
- Loading state: skeleton bukan spinner
- Semua halaman baru: tambahkan SEO metadata
- Responsive: mobile-first

Mulai dari nomor 1 (Navbar) dan kerjakan secara berurutan. Tanya jika ada yang ambigu sebelum mulai coding.
```

---

# FASE 13 — Dashboard Pelapor + Logout Konfirmasi

## Scope
- [ ] Halaman `/report/dashboard` — dashboard pelapor yang sudah login
- [ ] Halaman `/report/resources` — kontak darurat + panduan lengkap
- [ ] Logout konfirmasi modal untuk SEMUA role (pelapor, konsultan, admin, operator, satgas)
- [ ] Notifikasi status real-time untuk pelapor
- [ ] Redirect setelah logout semua role → homepage `/id`

## Isi Dashboard Pelapor `/report/dashboard`
- Riwayat laporan + status real-time tiap laporan
- Akses cepat ke chat konsultan (jika ada sesi aktif)
- Notifikasi terbaru (update status laporan, pesan baru)
- Tombol "Buat Laporan Baru"
- Tombol "Lacak Laporan Anonim" (masuk kode tracking)
- Statistik singkat: total laporan, laporan aktif, laporan selesai

## Catatan Teknis Fase 13
- Real-time: subscribe ke tabel `reports` dan `messages` via Supabase Realtime
- Logout modal: konfirmasi Y/N, bukan langsung logout
- Setelah logout → redirect ke `/id` (bukan `/id/login`)
- Status laporan gunakan badge warna sesuai tahap penanganan

---

## 🤖 PROMPT EKSEKUSI FASE 13

```
Kamu adalah senior Next.js developer yang sedang mengembangkan platform SafePlace.

KONTEKS PROYEK:
- Baca file safeplace-history.md dan safeplace-plan-v2.md untuk konteks lengkap
- Fase 12 sudah selesai (navbar, footer, carousel, halaman edukasi, komunitas placeholder)
- Tech stack: Next.js 14 App Router, Tailwind CSS, Framer Motion, Supabase Realtime, next-intl

TUGAS FASE 13 — Kerjakan dalam urutan ini:

1. DASHBOARD PELAPOR — /report/dashboard
   - Hanya bisa diakses jika sudah login dengan role 'reporter'
   - Jika belum login → redirect ke /login
   - Komponen yang dibutuhkan:
     a. Header: "Halo, [nama]" + tombol notifikasi + logout
     b. Section riwayat laporan: list semua laporan user + status badge real-time
     c. Section laporan aktif: laporan yang sedang dalam proses (highlight)
     d. Akses chat: jika ada konsultan assigned → tombol "Lanjut Chat"
     e. Notifikasi terbaru: 5 notifikasi terakhir dari tabel notifications
     f. Quick action: "Buat Laporan Baru" | "Lacak Laporan Anonim"
   - Status badge warna: Diterima (kuning), Diproses (biru), Selesai (hijau), Ditutup (abu)
   - Real-time: subscribe Supabase Realtime ke reports WHERE user_id = current_user

2. HALAMAN /report/resources — Kontak Darurat & Panduan
   - Daftar lengkap semua nomor darurat:
     * Polri 110
     * SAPA 129 KemenPPPA
     * WA SAPA: 0821-2600-129
     * WA Pengaduan Humas Polri: 0896-8233-3678
     * SPKT (panduan menemukan kantor polisi terdekat)
   - Panduan kapan menghubungi yang mana
   - Tombol "Hubungi Sekarang" yang klik langsung buka phone dialer (tel: protocol)
   - Tombol "WhatsApp" yang buka wa.me link
   - Bisa diakses tanpa login (halaman publik)

3. LOGOUT KONFIRMASI — SEMUA ROLE
   - Buat komponen reusable <LogoutConfirmModal />
   - Trigger: klik tombol logout di navbar/sidebar role manapun
   - Modal berisi:
     * Judul: "Keluar dari SafePlace?"
     * Pesan: "Sesi kamu akan berakhir. Pastikan kamu sudah menyimpan semua informasi penting."
     * Tombol: [Batal] [Ya, Keluar]
   - Setelah konfirmasi → supabase.auth.signOut() → redirect ke /id
   - Pasang di: navbar pelapor, sidebar konsultan, sidebar admin, sidebar operator, sidebar satgas
   - Animasi modal: Framer Motion fade + scale

4. NOTIFIKASI REAL-TIME PELAPOR
   - Subscribe ke tabel notifications WHERE user_id = current_user
   - Tampilkan badge merah di ikon lonceng jika ada notifikasi belum dibaca
   - Klik lonceng → dropdown notifikasi terbaru (5 item)
   - Tandai sebagai dibaca saat diklik
   - Tipe notifikasi yang ada: status_update, new_message, case_assigned

STANDAR WAJIB:
- Semua teks bilingual (next-intl)
- Skeleton loading di semua fetch data
- Error state yang informatif jika fetch gagal
- Mobile responsive
- Tidak ada pure black/white

Mulai dari nomor 1 dan kerjakan berurutan.
```

---

# FASE 14 — AI Agent (Widget + Halaman Khusus)

## Scope
- [ ] Widget AI Agent (floating bubble, kanan bawah, di atas PanicButton)
- [ ] Halaman `/ai-assistant` — tampilan full-page AI Agent
- [ ] Integrasi Google Gemini (primary) + Groq/Llama (fallback)
- [ ] Auto-detect bahasa Indonesia/Inggris
- [ ] System prompt yang disesuaikan konteks SafePlace

## Kemampuan AI Agent
- Navigasi platform (arahkan ke halaman yang tepat)
- Panduan alur pelaporan step by step
- Informasi hukum dasar kekerasan seksual di Indonesia
- Rekomendasi konsultan berdasarkan kebutuhan
- Dukungan emosional awal (bukan pengganti profesional)
- Jawaban FAQ SafePlace

## Catatan Teknis Fase 14
- Widget: minimized = ikon bubble, expanded = chat panel 350px x 500px
- Context window: kirim 10 pesan terakhir per sesi
- Tidak ada memori antar sesi (privasi)
- Jika Gemini error → otomatis fallback ke Groq
- Rate limit: 20 pesan per sesi per user
- Tombol "Hubungi Konsultan Manusia" selalu tampil di widget

---

## 🤖 PROMPT EKSEKUSI FASE 14

```
Kamu adalah senior Next.js developer yang sedang mengembangkan platform SafePlace.

KONTEKS PROYEK:
- Baca safeplace-history.md dan safeplace-plan-v2.md untuk konteks lengkap
- Fase 12 dan 13 sudah selesai
- Tech stack: Next.js 14 App Router, Tailwind CSS, Framer Motion, Supabase, next-intl

TUGAS FASE 14 — AI Agent:

1. SETUP API
   - Buat /app/api/ai-agent/route.ts
   - Primary: Google Gemini API (gunakan @google/generative-ai)
   - Fallback: Groq API (gunakan groq-sdk) jika Gemini error/timeout
   - Environment variables yang dibutuhkan: GEMINI_API_KEY, GROQ_API_KEY
   - Rate limit: 20 pesan per session (simpan di sessionStorage sisi client)

2. SYSTEM PROMPT AI AGENT
   Gunakan system prompt ini (terjemahkan ke EN jika user bicara Inggris):
   """
   Kamu adalah AI Assistant SafePlace — platform pelaporan dan pendampingan kekerasan seksual di Indonesia.
   
   Peranmu:
   - Membantu pengguna memahami cara menggunakan SafePlace
   - Memberikan panduan alur pelaporan yang tepat
   - Memberikan informasi dasar hukum perlindungan korban kekerasan seksual di Indonesia (UU TPKS No. 12 Tahun 2022)
   - Memberikan dukungan emosional awal yang empatik dan tidak menghakimi
   - Mengarahkan ke konsultan profesional jika diperlukan
   
   Yang TIDAK boleh kamu lakukan:
   - Memberikan diagnosis psikologis
   - Menjanjikan hasil hukum tertentu
   - Meminta detail kejadian yang tidak perlu
   - Mengungkap identitas pelapor
   
   Selalu akhiri respons dengan reminder: "Jika kamu membutuhkan pendampingan langsung, konsultan kami siap membantu."
   
   Halaman-halaman di SafePlace yang perlu kamu ketahui:
   - /report/start → mulai pelaporan
   - /report/track → lacak laporan anonim
   - /pendampingan → daftar konsultan
   - /edukasi → konten edukasi
   - /komunitas → forum komunitas (segera hadir)
   - /login → masuk akun
   """

3. WIDGET AI AGENT
   - Buat komponen <AIAgentWidget /> di components/ai/
   - Posisi: fixed, kanan bawah, z-index di atas segalanya kecuali PanicButton
   - PanicButton tetap paling bawah, AI Widget di atasnya (gap 16px)
   - State minimized: ikon bubble animasi dengan pulse ring subtle
   - State expanded: panel chat 350px x 500px
     * Header: "AI Assistant SafePlace" + tombol minimize (X)
     * Area chat: scroll, bubble pesan user (kanan) vs AI (kiri)
     * Input: textarea auto-resize + tombol kirim
     * Footer: "Hubungi Konsultan Manusia →" (selalu tampil)
   - Animasi buka/tutup: Framer Motion spring
   - Pasang widget di: layout publik, layout dashboard pelapor

4. HALAMAN /ai-assistant
   - Versi full-page dari AI Agent
   - Layout dua kolom (desktop): kiri = chat, kanan = quick actions
   - Quick actions kanan:
     * "Mulai Laporan" → /report/start
     * "Lacak Laporan" → /report/track
     * "Cari Konsultan" → /pendampingan
     * "Materi Edukasi" → /edukasi
     * "Nomor Darurat" → /report/resources
   - Mobile: single column, quick actions di atas chat

5. INTEGRASI I18N
   - Auto-detect bahasa dari next-intl locale
   - Kirim locale ke API untuk menyesuaikan bahasa respons AI
   - Semua teks UI widget dalam id.json dan en.json

CATATAN PENTING:
- Jangan simpan riwayat chat di database (privasi pelapor)
- Gunakan sessionStorage untuk riwayat dalam satu sesi
- Loading state: typing indicator animasi (3 titik bergerak)
- Error state: "AI sedang tidak tersedia, coba beberapa saat lagi"
- Selalu ada fallback ke Groq jika Gemini gagal

Mulai dari nomor 1 (setup API) lalu lanjut ke widget.
```

---

# FASE 15 — Fitur Komunitas

## Scope
- [ ] Skema database komunitas (tabel baru)
- [ ] Feed utama komunitas
- [ ] Ruang diskusi per kategori (5 kategori)
- [ ] Sistem moderasi (operator bisa takedown konten)
- [ ] Trigger warning + blur konten sensitif
- [ ] Akses butuh login, identitas bebas (nama tampil atau anonim)

## 5 Kategori Komunitas
1. 💬 **Berbagi Cerita** — ruang bercerita aman tanpa judgement
2. 🧠 **Trauma & Pemulihan** — diskusi proses pemulihan
3. ⚖️ **Info Hukum** — tanya jawab seputar hukum dan regulasi
4. ❓ **Tanya Jawab** — pertanyaan umum seputar kekerasan seksual
5. 🤝 **Dukungan Sesama** — saling support antar anggota komunitas

## Database Komunitas
```sql
-- Tabel posts komunitas
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT, -- nama yang ditampilkan jika anonymous
  has_trigger_warning BOOLEAN DEFAULT false,
  trigger_warning_text TEXT,
  status TEXT DEFAULT 'published', -- 'published' | 'hidden' | 'removed'
  removed_by UUID REFERENCES users(id), -- operator yang remove
  removed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel replies/komentar
CREATE TABLE community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel reactions (bukan likes biasa — lebih empatik)
CREATE TABLE community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  reaction_type TEXT NOT NULL, -- 'support' | 'strong' | 'hug' | 'thanks'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

## Catatan Teknis Fase 15
- Reaction bukan "like" biasa — gunakan emoji empatik: 🤍 Support, 💪 Kuat, 🫂 Peluk, 🙏 Terima Kasih
- Trigger warning: konten ter-blur sampai user klik "Saya siap membaca"
- Identitas anonim di komunitas ≠ laporan anonim (berbeda konteks)
- Operator per kampus bisa moderasi post yang melanggar
- Real-time: post baru muncul tanpa reload

---

## 🤖 PROMPT EKSEKUSI FASE 15

```
Kamu adalah senior Next.js developer yang sedang mengembangkan platform SafePlace.

KONTEKS PROYEK:
- Baca safeplace-history.md dan safeplace-plan-v2.md untuk konteks lengkap
- Fase 12, 13, dan 14 sudah selesai
- Tech stack: Next.js 14 App Router, Tailwind CSS, Framer Motion, Supabase Realtime, next-intl

TUGAS FASE 15 — Fitur Komunitas:

1. DATABASE
   - Buat migration SQL untuk tabel: community_posts, community_replies, community_reactions
   - Schema lengkap ada di safeplace-plan-v2.md
   - RLS: user hanya bisa edit/delete post miliknya sendiri
   - Operator bisa update status post (hidden/removed) di kampusnya
   - Public bisa SELECT hanya yang status='published'

2. HALAMAN /komunitas (REPLACE PLACEHOLDER)
   - Update halaman placeholder Fase 12 menjadi full feature
   - Layout:
     * Sidebar kiri: navigasi kategori + statistik komunitas
     * Content utama: feed post terbaru dari semua kategori
     * Sidebar kanan (desktop): post trending + panduan komunitas
   - Tab filter: Terbaru | Terpopuler | Kategori
   - Tombol "Buat Post" → modal form post baru

3. HALAMAN /komunitas/[kategori]
   - Feed post per kategori
   - Header kategori dengan deskripsi dan aturan singkat
   - Tombol "Buat Post di sini"
   - Sort: Terbaru | Terpopuler

4. HALAMAN /komunitas/post/[id]
   - Detail post + semua reply
   - Reaction bar: 🤍 Support | 💪 Kuat | 🫂 Peluk | 🙏 Terima Kasih
   - Form reply (harus login)
   - Real-time: reply baru muncul langsung via Supabase Realtime
   - Tombol lapor konten (untuk moderasi)

5. TRIGGER WARNING SYSTEM
   - Buat komponen <TriggerWarning content={post} />
   - Jika post.has_trigger_warning = true:
     * Tampilkan overlay blur di atas konten
     * Tampilkan pesan: "Konten ini mengandung topik yang mungkin sensitif: [trigger_warning_text]"
     * Tombol: "Saya siap membaca" → blur hilang smooth (Framer Motion)
   - Simpan state "sudah baca" di sessionStorage per post ID

6. FORM BUAT POST
   - Modal atau halaman tersendiri /komunitas/new
   - Field: Judul, Kategori (dropdown), Konten (textarea rich text minimal), Identitas (nama asli / anonim)
   - Jika anonim: field "Nama Tampil" (misal: "Anonim123" atau custom)
   - Toggle: "Tambahkan Trigger Warning" → jika ON, muncul field deskripsi warning
   - Validasi: judul min 10 karakter, konten min 50 karakter

7. UPDATE DASHBOARD OPERATOR
   - Tambah menu "Moderasi Komunitas" di sidebar operator
   - Halaman /operator/community: list semua post dari kampus operator
   - Tombol per post: Sembunyikan | Hapus | Tandai Aman
   - Filter: Semua | Dilaporkan | Disembunyikan

STANDAR WAJIB:
- Semua teks bilingual (next-intl)
- Skeleton loading di semua fetch
- Empty state yang informatif
- Mobile responsive
- Tidak ada pure black/white

Mulai dari nomor 1 (database migration) dan kerjakan berurutan.
```

---

# FASE 16 — Polish, Dark Mode & Mobile App

## Scope
- [ ] Dark/Light mode toggle (semua halaman)
- [ ] Logo SafePlace final (setelah file SVG diterima)
- [ ] Animasi tambahan berdasarkan referensi PDF
- [ ] Satgas full feature (chat + investigasi, bukan hanya portal)
- [ ] Peer Consultant role
- [ ] Mobile App (React Native + Expo) — fase paling akhir

## Catatan Fase 16
- Dark mode: simpan preferensi di `user_preferences` table (sudah ada) atau localStorage untuk guest
- Logo final: replace semua placeholder setelah SVG diterima dari owner
- Mobile App: share business logic dengan web jika memungkinkan (Supabase client sama)
- Peer Consultant: sama seperti Konsultan tapi volunteer teman sebaya, wewenang lebih terbatas

---

## 🤖 PROMPT EKSEKUSI FASE 16

```
Kamu adalah senior Next.js developer yang sedang mengembangkan platform SafePlace.

KONTEKS PROYEK:
- Baca safeplace-history.md dan safeplace-plan-v2.md untuk konteks lengkap
- Fase 12–15 sudah selesai, platform sudah full featured
- Tech stack: Next.js 14 App Router, Tailwind CSS, Framer Motion, Supabase, next-intl

TUGAS FASE 16 — Polish & Completion:

1. DARK/LIGHT MODE
   - Implementasi sistem dark mode menggunakan next-themes
   - Tambahkan CSS variables untuk dark mode di globals.css
   - Toggle button di navbar (ikon matahari/bulan)
   - Simpan preferensi: jika user login → update user_preferences table; jika guest → localStorage
   - Pastikan semua komponen sudah support dark mode (cek semua halaman)
   - Dark mode colors harus konsisten dengan filosofi warna per role

2. LOGO FINAL
   - Owner sudah memberikan file SVG logo SafePlace
   - Replace semua placeholder text/logo di:
     * Navbar semua halaman
     * Footer
     * Login page
     * Favicon dan OG image
     * Dashboard semua role
   - Implementasi adaptive color: logo menyesuaikan warna role aktif

3. SATGAS FULL FEATURE
   - Update dashboard satgas dari "portal lihat + update status" menjadi full feature
   - Tambahkan: chat langsung dengan pelapor, sistem investigasi, upload dokumen resmi
   - Buat tabel baru: satgas_investigations, satgas_documents
   - Update RLS sesuai wewenang satgas yang diperluas

4. PEER CONSULTANT ROLE
   - Tambahkan role 'peer_consultant' ke sistem
   - Wewenang: bisa chat dengan pelapor, tapi tidak bisa akses case notes atau data sensitif
   - Dashboard peer consultant: versi sederhana dari dashboard konsultan
   - Onboarding: sama seperti konsultan (invite link dari admin)
   - Update RLS untuk role baru

5. ANIMASI TAMBAHAN
   - Review semua halaman, tambahkan animasi Framer Motion di tempat yang masih statis
   - Page transition: smooth fade antar halaman
   - Scroll-triggered animations: section muncul smooth saat di-scroll
   - Micro-interactions: button click feedback, form validation feedback

Mulai dari nomor 1 (dark mode) karena ini yang paling berdampak ke semua halaman.
```

---

## 📋 Pre-Launch Checklist (Sebelum Go Live)

- [ ] Setup Resend (email notifikasi transaksional)
- [ ] Beli domain (`safeplace.id` atau alternatif)
- [ ] Hubungkan Cloudflare (DNS + CDN + SSL)
- [ ] Aktifkan email confirmation di Supabase Auth
- [ ] Deploy semua Edge Functions ke Supabase
- [ ] Test end-to-end semua alur (pelaporan anonim, teridentifikasi, konsultasi, satgas)
- [ ] Test semua role login dan akses dashboard
- [ ] Upload konten edukasi awal (minimal 3 video + 2 PDF)
- [ ] Setup logo SafePlace final (SVG)
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Security audit (RLS, data pelapor, lampiran terenkripsi)
- [ ] Test panic button di semua halaman
- [ ] Test auto-logout idle 10 menit
- [ ] Aktifkan akun test sesuai tabel di safeplace-history.md
- [ ] Soft launch dengan 1-2 kampus pilot

---

## 🔑 Standar Kode Global (Berlaku di Semua Fase)

```
✅ SELALU:
- Semua teks dalam next-intl (id.json + en.json)
- Label di atas input field, placeholder hanya hint
- Border box untuk semua input (bukan underline)
- Skeleton loading untuk semua fetch async
- Error state yang informatif dan tidak menakutkan
- SEO metadata di semua halaman baru
- Mobile responsive (mobile-first)
- Warna sesuai design tokens di lib/colors.ts

❌ JANGAN PERNAH:
- Pure black (#000000) atau pure white (#FFFFFF)
- Placeholder sebagai pengganti label
- Spinner klasik (gunakan skeleton)
- Hardcode teks bahasa langsung di JSX
- Membuat halaman baru tanpa cek RLS
- Mengabaikan loading dan error state
```

---

*Dokumen ini adalah kelanjutan dari safeplace-history.md.*
*Gunakan kedua dokumen bersamaan sebagai konteks di setiap chat baru.*
*Terakhir diperbarui: Juni 2025*
