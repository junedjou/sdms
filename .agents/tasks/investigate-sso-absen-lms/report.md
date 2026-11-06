# Laporan Investigasi: Perbedaan SSO LMS vs Absen (Presensiku)

**Tanggal:** Januari 2026  
**Status Lokal vs GitHub:** ✅ **SAMA** — `git diff HEAD origin/main` mengembalikan output kosong, tidak ada perbedaan.  
**Commit terakhir:** `11674d9` — `fix: include user di getGuru/getPegawai agar status akun tampil + password default = NIP`

---

## Ringkasan Temuan (Jawaban Langsung)

**Masalah inti:** Saat user klik Absen di App Hub SDMS, backend Absen (Presensiku) **me-redirect browser ke `/sso?access=TOKEN&refresh=TOKEN&role=ROLE`** — artinya halaman SsoCallback di React frontend membaca token dari URL dan menyimpannya ke `localStorage`. Ini berbeda total dengan LMS yang **langsung menggunakan server-side session (cookie)**.

**Mengapa login manual tidak bisa setelah SSO gagal:** Setelah SSO callback, **`SsoCallback.tsx` menghapus SEMUA key `presensiku_*` dari `localStorage` sebelum menyimpan token baru** (baris `Object.keys(localStorage).filter(...).forEach(remove)`). Jika redirect SSO gagal di tengah jalan (halaman tutup, network error, dll), `localStorage` sudah bersih tapi token baru tidak tersimpan — user dianggap belum login. Login manual seharusnya tetap bisa, TETAPI ada bug potensial: jika `localStorage` di browser tidak bisa diakses (misalnya di WebView Android dengan storage restriction, atau cookie/storage diblokir), token tidak tersimpan dan app selalu tampil "belum login."

**Perbedaan fundamental LMS vs Absen:**

| Aspek | LMS | Absen (Presensiku) |
|---|---|---|
| Auth mechanism | Server-side session (cookie Redis) | JWT di `localStorage` (client-side) |
| SSO callback | `GET /sso/callback` → simpan session → `res.redirect(dashboard)` | `GET /api/auth/sso-callback` → redirect ke `APP_URL/sso?access=TOKEN&refresh=TOKEN` |
| Frontend routing | Server-rendered / MPA | SPA React — `SsoCallback.tsx` baca token dari URL |
| Manual login | Cookie set oleh server → selalu bisa | Token di `localStorage` → bisa gagal jika storage bermasalah |
| Token persistence | Session cookie (httpOnly, secure) | `presensiku_access` + `presensiku_refresh` di localStorage |
| Role mapping | `mapRole()` sederhana (5 role) | `roleMap` lengkap (10 role) + logika SUPER_ADMIN protection |

---

## 1. Alur SSO Saat User Klik Absen dari Application Hub SDMS

```
User login SDMS
   ↓
Buka Application Hub → klik "Absen"
   ↓
AppHubView.vue: launchApp(app) → gatewayService.ssoToken('absen')
   → GET /api/v1/gateway/sso/token?app=absen
   ↓
SDMS backend: ssoService.js → createSSOToken(user, 'absen')
   → JWT payload: sub, username, role, extra_roles, dll.
   → secret: SSO_SECRET_ABSEN = 'sso_secret_absen_smkn1kras_2026'
   → expiresIn: '5m'
   → callbackPath: '/api/auth/sso-callback'  ← KHUSUS untuk 'absen'
   → redirect_url: https://absen.smkn1kras.sch.id/api/auth/sso-callback?token=JWT
   ↓
AppHubView.vue: window.open(redirect_url, '_blank')  [desktop]
                atau <a href=redirect_url target=_blank>.click() [mobile]
   ↓
Browser buka: https://absen.smkn1kras.sch.id/api/auth/sso-callback?token=JWT
   ↓
presensiku/apps/api/src/routes/auth.ts: GET /api/auth/sso-callback
   → verifikasi JWT manual (HMAC-SHA256 via node:crypto)
   → secret: SSO_SECRET = process.env.SSO_SECRET = 'sso_secret_absen_smkn1kras_2026'
   → decode payload, cek exp, aud='absen', iss='sdms-core'
   → petakan role SDMS → role Absen
   → cari/buat user di DB Presensiku (PostgreSQL via Prisma)
   → issueTokens(user.id) → { accessToken, refreshToken }
   ↓
Backend redirect ke:
   https://absen.smkn1kras.sch.id/sso?access=TOKEN&refresh=TOKEN&role=ROLE
   ↓
React SPA: Route /sso → SsoCallback.tsx
   → baca ?access= dan ?refresh= dari URL (atau #fragment sebagai fallback)
   → hapus semua localStorage presensiku_*
   → localStorage.setItem('presensiku_access', access)
   → localStorage.setItem('presensiku_refresh', refresh)
   → setTimeout 300ms → window.location.replace('/app/dashboard' atau sesuai role)
   ↓
AuthProvider (auth.tsx): restoreSession() → baca localStorage → setUser → render app
```

**Catatan penting di ssoService.js (SDMS backend):**
```javascript
// ssoService.js baris 73-79
const SSO_CALLBACK_PATHS = {
  absen: '/api/auth/sso-callback',  // ← berbeda dari LMS/piket
  pkl:   '/api/auth/sso-callback',
};
const callbackPath = SSO_CALLBACK_PATHS[appName] || '/sso/callback';
// Untuk absen: https://absen.smkn1kras.sch.id/api/auth/sso-callback?token=JWT
// Untuk lms:   https://lms.smkn1kras.sch.id/sso/callback?token=JWT&from=sdms
```

Ada juga shortcut di `presensiku/apps/api/src/app.ts`:
```javascript
// app.ts baris ~118
app.get('/sso/callback', async (request, reply) => {
  // Jika request masuk ke /sso/callback (bukan /api/...), forward ke /api/auth/sso-callback
  return reply.redirect(307, `/api/auth/sso-callback${qs}`);
});
```

---

## 2. Alur SSO LMS yang Membuat Login Manual Tetap Bisa

**File:** `D:\WEBSITE\sdms\deploy\lms-webhook\sso.js`

```javascript
// sso.js (LMS) — alur sangat sederhana
router.get('/sso/callback', async (req, res) => {
  const decoded = jwt.verify(token, SSO_SECRET_LMS, { audience: 'lms', issuer: 'sdms-core' });
  
  // Cari/buat user di DB LMS
  let lmsUser = existingRows[0];
  if (!lmsUser) { /* INSERT INTO users ... */ }

  // SET SESSION — cookie httpOnly di browser
  req.session.user = { id, username, full_name, role, sso: true, sdms_id: decoded.sub };
  await new Promise(resolve => req.session.save(resolve));  // ← simpan ke Redis dulu
  
  return res.redirect(getDashboard(lmsUser.role));  // ← langsung redirect ke dashboard
});
```

**LMS menggunakan server-side session (Express-Session + Redis):**
- Token TIDAK disimpan di `localStorage` browser
- Session disimpan sebagai cookie httpOnly di browser
- Browser mengirim cookie ke LMS di setiap request berikutnya
- Login manual juga membuat session yang sama → **tidak ada perbedaan mekanisme antara SSO dan manual**
- Bahkan jika browser direbuka, **cookie session masih ada** sampai expire

**Itulah mengapa login manual LMS selalu bisa:** Login manual juga menggunakan `req.session.user = ...` yang identik dengan SSO. Tidak ada dependency ke `localStorage`.

---

## 3. Perbedaan Implementasi SSO LMS vs Absen

### 3.1 Cara Menyimpan Sesi Setelah SSO

| | LMS | Absen (Presensiku) |
|---|---|---|
| **Mekanisme** | `req.session.user = {...}` → cookie `connect.sid` | `localStorage.setItem('presensiku_access', ...)` |
| **Di mana token disimpan** | Server (Redis) + Cookie di browser | Browser `localStorage` |
| **Akses dari tab lain** | ✅ Cookie dibagi antar tab | ✅ localStorage dibagi antar tab |
| **Akses dari WebView** | ⚠️ Cookie bisa diblokir WebView Android | ⚠️ localStorage bisa diblokir WebView Android |
| **Saat network error** | ❌ Session tidak tersimpan | ❌ Token tidak tersimpan |
| **Login manual berhasil?** | ✅ Ya — karena pakai mekanisme yang sama (session) | ✅ Seharusnya ya — tapi lihat poin 4 |

### 3.2 Pemetaan Role

**LMS (5 role):**
```javascript
function mapRole(sdmsRole) {
  const map = { super_admin: 'ADMIN', admin: 'ADMIN', guru: 'TEACHER', pegawai: 'ADMIN', siswa: 'STUDENT' };
  return map[sdmsRole] || 'STUDENT';
}
```

**Absen — `auth.controller.absen.js` (untuk Piket-style flow, 10 role):**
```javascript
function mapRoleSDMS(sdmsRole) {
  const map = {
    super_admin: 'SUPER_ADMIN', admin: 'ADMIN', guru: 'GURU',
    wali_kelas: 'WALI_KELAS', bk: 'BK', kepala_sekolah: 'KEPALA_SEKOLAH',
    petugas_piket: 'PETUGAS_PIKET', pegawai: 'GURU', siswa: 'SISWA', operator: 'OPERATOR',
  };
  return map[sdmsRole.toLowerCase()] || 'GURU';
}
```

**Absen — `presensiku/apps/api/src/routes/auth.ts` (untuk flow SSO aktual, 10 role):**
```javascript
const roleMap: Record<string, string> = {
  super_admin: 'ADMIN', admin: 'ADMIN', kepala_sekolah: 'ADMIN',
  guru: 'TEACHER', wali_kelas: 'TEACHER', pegawai: 'STAFF',
  operator: 'STAFF', petugas_piket: 'TEACHER', siswa: 'STUDENT',
};
const targetRoleKey = roleMap[sdmsPayload.role] || 'TEACHER';
```

### 3.3 Verifikasi Token JWT

**LMS:** Menggunakan library `jsonwebtoken` langsung → `jwt.verify(token, secret, options)`  
**Absen:** Verifikasi **manual** via `node:crypto` HMAC-SHA256 karena Fastify tidak bundle jsonwebtoken:
```typescript
const signingInput = `${parts[0]}.${parts[1]}`;
const expectedSig = crypto.createHmac('sha256', SSO_SECRET)
  .update(signingInput).digest('base64url');
if (expectedSig !== parts[2]) throw new Error('INVALID_SIGNATURE');
```

---

## 4. Mengapa Login Manual Absen Tidak Bisa Setelah Redirect dari SDMS

Ini adalah pertanyaan kunci. Berdasarkan kode, **secara teknis login manual seharusnya bisa** — `presensiku/apps/api/src/routes/auth.ts → POST /auth/login` tidak bergantung pada SSO sama sekali. Namun ada beberapa skenario yang menyebabkan login manual gagal:

### Skenario A: Token SSO Expired Sebelum Sampai ke Presensiku (PALING MUNGKIN)

SSO token hanya berlaku **5 menit** (`ssoService.js` baris 69). Alurnya:
1. SDMS buat SSO token (5 menit)
2. User menekan tombol "Buka Absen" — `window.open()` dibuka
3. Browser/WebView butuh waktu untuk load URL
4. Jika delay > 5 menit (jarang) atau **jika ada delay clock skew** → token expired
5. Backend Absen redirect ke `https://absen.smkn1kras.sch.id/login?error=sso_expired`
6. User mencoba login manual → gagal karena **kata sandinya tidak diketahui atau akun belum ada di DB Absen**

### Skenario B: Akun Belum Ada di DB Absen, Password Acak

Saat SSO berhasil dan user baru, backend Absen membuat akun dengan **password hash acak**:
```typescript
// auth.ts baris ~217
const defaultPwd = targetRoleKey === 'STUDENT'
  ? (process.env.STUDENT_DEFAULT_PASSWORD || 'smkn1kras')
  : _rb(16).toString('hex');  // ← password acak untuk guru/admin/staff
```

Jika SSO **gagal di tengah jalan** (network error, tab ditutup, token expired) dan user belum pernah login via SSO sebelumnya, **akun di DB Absen belum ada sama sekali** → login manual tidak bisa karena akun tidak ditemukan.

Untuk guru/staff, setelah SSO berhasil pertama kali, akun dibuat dengan **password acak** yang tidak diketahui user → login manual memang **tidak bisa untuk guru/staff**.

### Skenario C: localStorage Tidak Bisa Diakses di WebView

Jika user membuka SDMS dari WebView Android (mis. browser in-app seperti Instagram, WhatsApp, dll.):
- `window.open()` mungkin membuka di **WebView in-app** bukan browser eksternal
- WebView in-app sering **membatasi localStorage** antar origin
- Token SSO berhasil diterima tapi `presensiku_access` tidak tersimpan
- App terus-menerus menganggap user belum login

SDMS sudah mencoba mengatasi ini (commit `8b1790c`):
```javascript
// AppHubView.vue
const a = document.createElement('a');
a.href = redirect_url;
a.target = '_blank';
a.rel = 'noopener noreferrer';
document.body.appendChild(a);
a.click();  // ← trik untuk buka di browser eksternal
document.body.removeChild(a);
```
Namun **tidak semua WebView mengikuti `target="_blank"`**.

### Skenario D: Cookie/CORS Mismatch (Minor)

`presensiku` API berjalan di port 4000 (via Caddy reverse proxy ke `absen.smkn1kras.sch.id`). CORS sudah dikonfigurasi untuk `https://absen.smkn1kras.sch.id`. Jika ada mismatch domain (misalnya akses via IP atau subdomain lain), request dari SsoCallback ke backend bisa ditolak.

### Skenario E: SsoCallback.tsx Menghapus Token Lama Dulu

```typescript
// SsoCallback.tsx baris 41-44
Object.keys(localStorage)
  .filter((k) => k.startsWith('presensiku_'))
  .forEach((k) => localStorage.removeItem(k));
```

Ini **menghapus token valid yang ada** sebelum menyimpan token baru. Jika proses simpan token baru gagal (halaman ditutup, error JS), **sesi lama sudah hilang** dan user ter-logout.

---

## 5. Perubahan Spesifik yang Diperlukan agar SSO Absen Bekerja Seperti LMS

### Fix #1 (KRITIS): Set Password Default yang Diketahui untuk Semua Role

**File:** `D:\WEBSITE\presensiku\apps\api\src\routes\auth.ts`

```typescript
// SEKARANG (baris ~217):
const defaultPwd = targetRoleKey === 'STUDENT'
  ? (process.env.STUDENT_DEFAULT_PASSWORD || 'smkn1kras')
  : _rb(16).toString('hex');  // ← password acak — guru tidak bisa login manual!

// SEHARUSNYA:
const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'smkn1kras';
const defaultPwd = DEFAULT_PASSWORD;
// Atau lebih aman: set password = username (NIP guru) agar mudah diingat
```

Tambahkan env var `DEFAULT_USER_PASSWORD=smkn1kras` di `D:\WEBSITE\presensiku\.env`.

### Fix #2 (PENTING): Jangan Hapus Token Lama Sebelum Token Baru Berhasil Disimpan

**File:** `D:\WEBSITE\presensiku\apps\web\src\pages\SsoCallback.tsx`

```typescript
// SEKARANG (berbahaya):
Object.keys(localStorage)
  .filter((k) => k.startsWith('presensiku_'))
  .forEach((k) => localStorage.removeItem(k));
localStorage.setItem(TOKEN_KEY, access);
// Jika baris di atas gagal → sesi lama sudah hilang

// SEHARUSNYA (simpan dulu, hapus lama setelah berhasil):
try {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  // Baru hapus sisa token lama (selain yang baru disimpan)
  Object.keys(localStorage)
    .filter((k) => k.startsWith('presensiku_') && k !== TOKEN_KEY && k !== REFRESH_KEY)
    .forEach((k) => localStorage.removeItem(k));
} catch (e) {
  setError('Tidak dapat menyimpan sesi. Aktifkan localStorage di browser Anda.');
  return;
}
```

### Fix #3 (PENTING): Tambah Pesan Error yang Jelas di Login Page untuk SSO Error

**File:** `D:\WEBSITE\presensiku\apps\web\src\pages\Login.tsx`

Login page sudah menangani `?error=sso_expired` dll dari `SsoCallback.tsx`. Pastikan pesannya cukup jelas: "Token SSO kadaluarsa. Buka kembali Absen dari SDMS Application Hub."

### Fix #4 (REKOMENDASI): Pertimbangkan Migrasi ke Server-Side Session seperti LMS

Jika masalah terus berulang terutama di WebView Android, pertimbangkan mengubah mekanisme autentikasi Absen agar mirip LMS:
- Setelah SSO callback berhasil, set **httpOnly cookie** dengan session token
- Frontend tidak perlu akses `localStorage` sama sekali
- Jauh lebih robust di berbagai browser dan WebView

Ini adalah perubahan arsitektur yang lebih besar, tapi menyelesaikan masalah secara permanen.

### Fix #5 (MINOR): Verifikasi SSO_SECRET Sama di Kedua Sisi

**SDMS backend `.env`:**
```
SSO_SECRET_ABSEN=sso_secret_absen_smkn1kras_2026
```

**Presensiku `.env` (di root `D:\WEBSITE\presensiku\.env`):**
```
SSO_SECRET=sso_secret_absen_smkn1kras_2026
```

✅ **Secret sudah sama** — bukan sumber masalah.

---

## 6. Perbandingan Detail Konfigurasi Lingkungan

| Parameter | SDMS | Presensiku (Absen) |
|---|---|---|
| URL | `https://sdms.smkn1kras.sch.id` | `https://absen.smkn1kras.sch.id` |
| SSO Secret Absen | `sso_secret_absen_smkn1kras_2026` | `sso_secret_absen_smkn1kras_2026` |
| SSO Callback Path (dari SDMS) | — | `/api/auth/sso-callback?token=JWT` |
| SSO Redirect ke Frontend | — | `/sso?access=TOKEN&refresh=TOKEN&role=ROLE` |
| Token Storage | Redis + cookie (SDMS internal) | `localStorage` (presensiku_access, presensiku_refresh) |
| JWT Access Expiry | 8h | 8h |
| JWT Refresh Expiry | 7d | 30d |
| DB | MariaDB (sdms_master) | PostgreSQL (presensiku) |

---

## 7. Status: Lokal vs GitHub

```
$ git -C d:\WEBSITE\sdms diff HEAD origin/main
(output kosong)
```

**File lokal identik dengan GitHub.** Hanya ada 12 file untracked di folder `docs/` (dokumen Word proposal, Python scripts) yang memang tidak perlu di-commit. Tidak ada perubahan yang belum di-push.

---

## Kesimpulan dan Prioritas Perbaikan

1. **🔴 KRITIS:** Guru/staff yang login manual ke Absen tidak bisa karena password akun mereka acak (dibuat saat SSO pertama kali). Solusi cepat: set `DEFAULT_USER_PASSWORD` di `.env` presensiku, tambah mekanisme "reset password by admin".

2. **🟠 PENTING:** `SsoCallback.tsx` menghapus sesi lama sebelum menyimpan yang baru — rename ke atomic write (simpan dulu, baru hapus lama).

3. **🟡 KONTEKS:** LMS bisa login manual karena menggunakan server-side session (cookie). Tidak ada dependency ke localStorage. Ini adalah perbedaan arsitektur, bukan bug.

4. **🟢 KONFIRMASI:** Secret SSO sudah sinkron antara SDMS dan Presensiku. Token 5 menit cukup untuk normal flow. Tidak perlu mengubah SDMS backend.

5. **📋 INVESTIGASI LEBIH LANJUT:** Perlu cek apakah masalah login manual muncul karena: (a) akun baru belum ada di DB Absen karena SSO belum pernah berhasil, atau (b) akun sudah ada tapi password tidak diketahui karena dibuat dengan hash acak. Log `D:\WEBSITE\presensiku\logs\` bisa membantu mengkonfirmasi.
