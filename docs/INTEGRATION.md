# 🔌 Panduan Integrasi SDMS — Data Pusat

## Cara Kerja

```
SDMS (Data Pusat) ──webhook POST──► Aplikasi Anda
     │                                     │
     │  saat data berubah,                 │  terima data,
     │  SDMS push ke semua                 │  update database
     │  aplikasi terdaftarkan              │  aplikasi Anda
```

**Prinsip:** SDMS adalah satu-satunya sumber data. Aplikasi Anda hanya **menerima** update.

---

## Langkah 1: Daftarkan Aplikasi di SDMS

1. Buka SDMS → **Application Hub** → klik **"Daftarkan Aplikasi"**
2. Isi:
   - **Nama:** `LMS` (nama aplikasi Anda)
   - **Webhook URL:** `https://lms.sekolah.id/api/webhooks/sdms`
   - **Events:** Pilih event yang ingin didengar (atau "Semua Event")
3. Klik **Daftarkan**
4. **SIMPAN** API Key & API Secret yang muncul — tidak akan ditampilkan lagi!

---

## Langkah 2: Buat Endpoint Webhook di Aplikasi Anda

Aplikasi Anda harus punya **satu endpoint** yang menerima POST dari SDMS.

### Node.js / Express

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// ⚠️ Simpan di environment variable, jangan hardcode!
const SDMS_API_SECRET = process.env.SDMS_API_SECRET;

app.post('/api/webhooks/sdms', (req, res) => {
  // 1. Verifikasi signature
  const signature = req.headers['x-api-signature'];
  const expected = crypto
    .createHmac('sha256', SDMS_API_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Proses event
  const { event, payload } = req.body;

  switch (event) {
    case 'siswa.created':
    case 'siswa.updated':
      upsertSiswa(payload); // Update database lokal
      break;
    case 'siswa.deleted':
      deactivateSiswa(payload.id);
      break;
    case 'guru.created':
    case 'guru.updated':
      upsertGuru(payload);
      break;
    case 'guru.deleted':
      deactivateGuru(payload.id);
      break;
    case 'kelas.created':
    case 'kelas.updated':
      upsertKelas(payload);
      break;
    case 'bulk.sync':
      bulkSync(payload); // Sinkronisasi massal
      break;
  }

  // 3. Selalu return 200 OK
  res.json({ status: 'ok' });
});

app.listen(4000, () => console.log('LMS running on port 4000'));
```

### PHP / Laravel

```php
<?php
// routes/web.php atau routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypto;

Route::post('/api/webhooks/sdms', function (Request $request) {
    // 1. Verifikasi signature
    $signature = $request->header('X-API-Signature');
    $expected = hash_hmac('sha256', $request->getContent(), env('SDMS_API_SECRET'));

    if ($signature !== $expected) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    // 2. Proses event
    $event = $request->input('event');
    $payload = $request->input('payload');

    switch ($event) {
        case 'siswa.created':
        case 'siswa.updated':
            Siswa::updateOrCreate(['id' => $payload['id']], $payload);
            break;
        case 'siswa.deleted':
            Siswa::where('id', $payload['id'])->update(['status' => 'inactive']);
            break;
        case 'guru.created':
        case 'guru.updated':
            Guru::updateOrCreate(['id' => $payload['id']], $payload);
            break;
        // ... event lainnya
    }

    return response()->json(['status' => 'ok']);
});
```

### Python / Flask

```python
import hmac
import hashlib
import os
from flask import Flask, request, jsonify

app = Flask(__name__)
SDMS_API_SECRET = os.environ.get('SDMS_API_SECRET')

@app.route('/api/webhooks/sdms', methods=['POST'])
def sdms_webhook():
    # 1. Verifikasi signature
    signature = request.headers.get('X-API-Signature')
    body = request.get_data(as_text=True)
    expected = hmac.new(
        SDMS_API_SECRET.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()

    if signature != expected:
        return jsonify({'error': 'Invalid signature'}), 401

    # 2. Proses event
    data = request.get_json()
    event = data['event']
    payload = data['payload']

    if event in ('siswa.created', 'siswa.updated'):
        upsert_siswa(payload)
    elif event == 'siswa.deleted':
        deactivate_siswa(payload['id'])
    elif event in ('guru.created', 'guru.updated'):
        upsert_guru(payload)
    # ... event lainnya

    return jsonify({'status': 'ok'})
```

---

## Langkah 3: Deploy & Test

1. Deploy aplikasi Anda
2. Buka SDMS → Application Hub → klik **"Test"** pada aplikasi Anda
3. Jika berhasil, status akan berubah jadi "Online" ✅

---

## Format Webhook Payload

Setiap webhook yang dikirim SDMS memiliki format:

```json
{
  "event": "siswa.created",
  "payload": {
    "id": "uuid-siswa",
    "nama": "Ahmad Fauzi",
    "nisn": "0085590240",
    "nis": "2024001",
    "jenis_kelamin": "L",
    "jurusan_id": "uuid-jurusan",
    "kelas_id": "uuid-kelas",
    "status": "Aktif",
    "tahun_masuk": "2024",
    "created_at": "2026-08-22T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2026-08-22T10:30:00.000Z",
    "source": "sdms-core"
  }
}
```

### Headers yang Dikirim SDMS

| Header | Nilai | Keterangan |
|--------|-------|------------|
| `Content-Type` | `application/json` | JSON body |
| `X-SDMS-Event` | `siswa.created` | Nama event |
| `X-API-Signature` | `hmac-sha256-hex` | Signature untuk verifikasi |
| `X-SDMS-Timestamp` | `2026-08-22T10:30:00.000Z` | Waktu pengiriman |

---

## Daftar Event

### 👤 Siswa
| Event | Keterangan |
|-------|-----------|
| `siswa.created` | Siswa baru ditambahkan |
| `siswa.updated` | Data siswa diperbarui |
| `siswa.deleted` | Siswa dinonaktifkan |

### 👩‍🏫 Guru
| Event | Keterangan |
|-------|-----------|
| `guru.created` | Guru baru ditambahkan |
| `guru.updated` | Data guru diperbarui |
| `guru.deleted` | Guru dinonaktifkan |

### 🏢 Pegawai
| Event | Keterangan |
|-------|-----------|
| `pegawai.created` | Pegawai baru ditambahkan |
| `pegawai.updated` | Data pegawai diperbarui |
| `pegawai.deleted` | Pegawai dinonaktifkan |

### 🏫 Kelas & Mapel
| Event | Keterangan |
|-------|-----------|
| `kelas.created` | Kelas baru dibuat |
| `kelas.updated` | Data kelas diperbarui |
| `mapel.created` | Mata pelajaran baru |
| `mapel.updated` | Data mapel diperbarui |

### 🔄 System
| Event | Keterangan |
|-------|-----------|
| `bulk.sync` | Sinkronisasi massal (seluruh data) |

---

## FAQ

### Q: Bagaimana kalau aplikasi saya sedang offline?
SDMS akan retry otomatis **3 kali** dengan interval 1 detik, 5 detik, dan 15 detik. Jika tetap gagal, event akan tercatat di Webhook Logs.

### Q: Bagaimana cara pull data langsung dari SDMS?
Selain webhook push, Anda juga bisa pull data langsung:
```
GET /api/v1/master/siswa?limit=100
GET /api/v1/master/guru
GET /api/v1/master/kelas
GET /api/v1/master/jurusan
GET /api/v1/master/mapel
```
Header: `Authorization: Bearer <token>` dan `X-API-Key: <api_key>`

### Q: Berapa banyak aplikasi yang bisa dihubungkan?
Tidak terbatas. Daftarkan sebanyak yang dibutuhkan.

### Q: Apakah data bisa diubah dari aplikasi lain?
Tidak. SDMS adalah **satu-satunya sumber data**. Aplikasi lain hanya menerima update (one-way sync). Jika perlu update, lakukan di SDMS.
