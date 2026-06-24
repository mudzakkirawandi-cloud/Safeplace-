# SafePlace Frontend Design Skill

## Tentang Project Ini
SafePlace adalah platform pelaporan kekerasan seksual berbasis web (Next.js 14 App Router).
Ada beberapa role: pelapor, peer_consultant, operator, admin, satgas, konsultan.
Stack: Next.js 14 + Tailwind CSS + Supabase + Framer Motion + Lucide React.

---

## ⛔ LARANGAN KERAS — JANGAN PERNAH DISENTUH

Ini adalah file dan logika yang PERNAH RUSAK dan butuh berhari-hari untuk diperbaiki.
Sebelum mengubah apapun, baca daftar ini dulu.

### File Chat — JANGAN UBAH LOGIKA INI
- `app/[locale]/(dashboard)/report/chat/[reportId]/page.tsx`
- `app/[locale]/(dashboard)/peer-consultant/chat/[reportId]/page.tsx`

Yang TIDAK BOLEH diubah di file chat:
- useEffect realtime subscription (channel messages)
- dependency array `[router, supabase]` atau `[reportId, supabase]`
- fungsi `handleSendMessage`
- presence channel setup — `.on()` HARUS sebelum `.subscribe()`
- `setMessages(prev => [...prev, newMsg])` — jangan ubah pola ini
- cleanup `supabase.removeChannel(channel)` di return useEffect

### Database Query Rules
- SELALU pakai `.maybeSingle()` bukan `.single()` — `.single()` throw error jika kosong
- JANGAN pakai `as any` — selalu buat interface spesifik
- Filter realtime HARUS unik: `nama-${userId}-${Date.now()}`

### File yang Tidak Boleh Diubah Tanpa Konfirmasi
- `app/api/ai-agent/route.ts` — AI Pendamping Gemini, sudah bekerja
- `middleware.ts` — routing auth, perubahan kecil bisa rusak semua redirect
- `app/[locale]/(dashboard)/report/layout.tsx` — sangat simpel, jangan diubah
- `supabase/migrations/` — jangan buat migration baru tanpa konfirmasi

### Pola yang Menyebabkan Bug
```typescript
// ❌ SALAH — menyebabkan histori chat hilang
setMessages([]) // jangan reset messages ke array kosong

// ✅ BENAR
setMessages(prev => {
  const exists = prev.some(m => m.id === newMsg.id)
  if (exists) return prev
  return [...prev, newMsg]
})

// ❌ SALAH — presence channel
pChannel.subscribe()
pChannel.on('presence', ...) // on SETELAH subscribe = error

// ✅ BENAR
pChannel.on('presence', ...) // on DULU
pChannel.subscribe()         // baru subscribe
```

---

## 🎨 Design Token SafePlace

### Warna (dari tailwind.config.ts & globals.css)
```
Primary Navy:     #1B4F72  → var(--primary)
Background:       #FAFBFF  → var(--background)
Card:             #FFFFFF  → var(--card)
Foreground:       #333333  → var(--foreground)
Muted:            #F5F6FA  → var(--muted)
Border:           #E5E7EB  → var(--border)

Per Role:
Pelapor accent:   #4A90B8
Konsultan:        #5B8A6F
Admin:            #2C3E6B
Operator:         #7B5EA7
Satgas:           #1A5276

Dashboard pelapor (Sanctuary):
Warm cream:       #FDF6EC
Soft teal:        #4A9B8E
Dusty rose:       #C9847A
Deep slate:       #2D3748
```

### Tipografi
```
Font display:  Plus Jakarta Sans  → font-display (judul, heading)
Font body:     Inter              → font-sans (teks biasa)
```

### Spacing & Radius
```
Card radius:   rounded-xl (16px) — JANGAN rounded-3xl untuk semua card
Gap section:   gap-6 (24px)
Padding card:  p-4 atau p-6
Shadow:        shadow-sm untuk card biasa, shadow-lg untuk modal
```

---

## 🧩 Komponen yang Sudah Ada

### Jangan Buat Ulang
- `components/ui/SafePlaceLogo.tsx` — logo resmi SafePlace
- `components/ai/AIAgentWidget.tsx` — widget AI agent
- Navbar → `app/[locale]/(public)/_components/Navbar.tsx`
- Footer → `app/[locale]/(public)/_components/Footer.tsx`
- EmergencySection → `app/[locale]/(public)/_components/EmergencySection.tsx`

### Tabel Supabase yang Ada
- `users` — id, full_name, role, is_online, avatar_url, last_login_at
- `reports` — id, tracking_code, incident_type, status, assigned_consultant_id, assignment_status, reporter_id, emergency
- `messages` — id, report_id, sender_id, content, message_type, attachment_url, is_read, created_at
- `assignment_notifications` — id, report_id, peer_consultant_id, status
- `journals` — id, user_id, title, content, mood, attachment_url, is_private

### RLS Policy Penting
- messages: peer consultant bisa SELECT jika `assigned_consultant_id = auth.uid()`
- messages: reporter bisa SELECT jika `reporter_id = auth.uid()`
- users: semua authenticated bisa SELECT (policy: `users_select_authenticated`)
- journals: hanya pemilik yang bisa akses

---

## 🎯 Design Rules SafePlace

### Yang Membuat UI Terlihat "AI banget" — HINDARI
- Semua card pakai rounded-2xl + shadow-sm yang seragam
- Gradient teal ke cream di semua section
- Tombol full-width di setiap section
- Spacing dan padding yang identik di semua komponen
- Animasi fade-in di semua elemen sekaligus
- Card dengan struktur icon + title + description yang berulang

### Yang Harus Dilakukan
- Setiap halaman punya SATU elemen signature yang memorable
- Gunakan white space secara dramatis, bukan merata
- Variasikan ukuran elemen — ada yang besar, ada yang kecil
- Tipografi adalah personality — pakai font-display untuk heading penting
- Warna per role harus konsisten (pelapor = #4A90B8, bukan teal random)

### Komponen UI Pattern SafePlace
```tsx
// Card standar pelapor
<div className="bg-white rounded-xl p-4 shadow-sm border border-[#E5E7EB] 
  hover:shadow-md transition-shadow">

// Tombol utama pelapor  
<button className="bg-[#4A90B8] text-white px-6 py-3 rounded-xl 
  font-medium hover:bg-[#3A7FA8] transition-colors">

// Tombol utama peer consultant
<button className="bg-[#1B4F72] text-white px-6 py-3 rounded-xl 
  font-medium hover:bg-[#154360] transition-colors">

// Badge status
<span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">

// Section header
<h2 className="font-display font-semibold text-[#2D3748] text-lg">
```

---

## 📋 Checklist Sebelum Submit ke AG

Sebelum mengirim prompt ke AG, pastikan:
- [ ] Sebutkan file mana yang boleh diubah secara eksplisit
- [ ] Sebutkan file mana yang TIDAK boleh disentuh
- [ ] Minta AG cek dulu kondisi kode sebelum mengubah
- [ ] Selalu minta `npm run build` setelah perubahan
- [ ] Kalau ada yang rusak di chat/realtime — STOP, jangan lanjut

---

## 🚀 Urutan Deploy yang Benar
1. AG edit file
2. `npm run build` — harus hijau
3. `git add . && git commit -m "..." && git push origin main`
4. Tunggu Vercel deploy
5. Test di browser
6. Kalau ada yang rusak → cek console browser dulu sebelum minta AG fix
