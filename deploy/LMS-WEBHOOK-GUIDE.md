# Panduan Integrasi Webhook SDMS → LMS

## Cara Kerja

Setiap kali data berubah di SDMS (tambah/edit/hapus guru, siswa, kelas, mapel),
SDMS otomatis mengirim HTTP POST ke endpoint webhook LMS:

```
POST /api/webhooks/sdms
Host: <LMS_URL>
Headers:
  Content-Type: application/json
  X-SDMS-Event: guru.created
  X-SDMS-Secret: sdms_lms_secret
  X-SDMS-Timestamp: 2024-08-01T10:00:00.000Z
```

## Event yang dikirim SDMS ke LMS

| Event | Kapan dikirim |
|---|---|
| `guru.created` | Guru baru ditambahkan |
| `guru.updated` | Data guru diperbarui |
| `guru.deleted` | Guru dihapus/dinonaktifkan |
| `siswa.created` | Siswa baru ditambahkan |
| `siswa.updated` | Data siswa diperbarui |
| `siswa.deleted` | Siswa dihapus |
| `pegawai.created` | Pegawai baru |
| `pegawai.updated` | Data pegawai diperbarui |
| `pegawai.deleted` | Pegawai dihapus |
| `kelas.created` | Kelas baru dibuat |
| `kelas.updated` | Data kelas diperbarui |
| `mapel.created` | Mata pelajaran baru |
| `mapel.updated` | Mata pelajaran diperbarui |
| `bulk.sync` | Sync massal seluruh data |

## Format Payload

```json
{
  "event": "guru.created",
  "payload": {
    "id": "uuid-...",
    "nama": "Budi Santoso",
    "nip": "196001011990011001",
    "jenis_kelamin": "L",
    "status_kepegawaian": "PNS",
    "jabatan": "Wali Kelas",
    "mata_pelajaran": "Matematika",
    "jurusan_id": "uuid-...",
    "no_hp": "08123456789",
    "email": "budi@sekolah.sch.id"
  },
  "meta": {
    "timestamp": "2024-08-01T10:00:00.000Z",
    "source": "sdms-core"
  }
}
```

## Konfigurasi di .env SDMS (VPS)

```env
LMS_URL=https://lms.smkn1kras.sch.id
LMS_WEBHOOK_SECRET=ganti_dengan_secret_yang_aman
```

## Kode Webhook Receiver untuk LMS

### Express.js (Node.js)

```javascript
// routes/webhooks.js di aplikasi LMS

const express = require('express');
const router  = express.Router();

const SDMS_SECRET = process.env.SDMS_WEBHOOK_SECRET || 'sdms_lms_secret';

// Middleware verifikasi secret
const verifySDMS = (req, res, next) => {
  const secret = req.headers['x-sdms-secret'];
  if (secret !== SDMS_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.post('/sdms', verifySDMS, async (req, res) => {
  const { event, payload, meta } = req.body;

  console.log(`[SDMS Webhook] ${event}`, payload?.nama || payload?.id);

  try {
    switch (event) {
      // ── GURU ─────────────────────────────────────────────
      case 'guru.created':
        await upsertGuru(payload);
        break;
      case 'guru.updated':
        await upsertGuru(payload);
        break;
      case 'guru.deleted':
        await deleteGuru(payload.id);
        break;

      // ── SISWA ─────────────────────────────────────────────
      case 'siswa.created':
        await upsertSiswa(payload);
        break;
      case 'siswa.updated':
        await upsertSiswa(payload);
        break;
      case 'siswa.deleted':
        await deleteSiswa(payload.id);
        break;

      // ── KELAS ─────────────────────────────────────────────
      case 'kelas.created':
      case 'kelas.updated':
        await upsertKelas(payload);
        break;

      // ── MAPEL ─────────────────────────────────────────────
      case 'mapel.created':
      case 'mapel.updated':
        await upsertMapel(payload);
        break;

      // ── BULK SYNC ─────────────────────────────────────────
      case 'bulk.sync':
        await handleBulkSync(payload);
        break;

      default:
        console.log(`[SDMS Webhook] Event tidak dikenal: ${event}`);
    }

    // Selalu balas 200 agar SDMS tahu webhook diterima
    res.json({ received: true, event });

  } catch (err) {
    console.error(`[SDMS Webhook] Error proses ${event}:`, err.message);
    // Tetap 200 agar SDMS tidak retry terus
    res.json({ received: true, event, error: err.message });
  }
});

// ── Helper functions — sesuaikan dengan ORM/DB LMS ──────────

async function upsertGuru(data) {
  // Contoh dengan Sequelize:
  // await Guru.upsert({
  //   sdms_id: data.id,       // simpan ID dari SDMS sebagai foreign key
  //   nama: data.nama,
  //   nip: data.nip,
  //   mata_pelajaran: data.mata_pelajaran,
  //   jurusan_id: data.jurusan_id,
  //   is_active: true,
  // }, { conflictFields: ['sdms_id'] });
  console.log('[LMS] Upsert guru:', data.nama);
}

async function deleteGuru(sdmsId) {
  // await Guru.update({ is_active: false }, { where: { sdms_id: sdmsId } });
  console.log('[LMS] Delete guru:', sdmsId);
}

async function upsertSiswa(data) {
  // await Siswa.upsert({ sdms_id: data.id, nama: data.nama, nisn: data.nisn, ... });
  console.log('[LMS] Upsert siswa:', data.nama);
}

async function deleteSiswa(sdmsId) {
  // await Siswa.update({ is_active: false }, { where: { sdms_id: sdmsId } });
  console.log('[LMS] Delete siswa:', sdmsId);
}

async function upsertKelas(data) {
  console.log('[LMS] Upsert kelas:', data.nama);
}

async function upsertMapel(data) {
  console.log('[LMS] Upsert mapel:', data.nama);
}

async function handleBulkSync(payload) {
  // payload = { guru: [...], siswa: [...], kelas: [...] }
  const { guru = [], siswa = [], kelas = [] } = payload;
  console.log(`[LMS] Bulk sync: ${guru.length} guru, ${siswa.length} siswa, ${kelas.length} kelas`);
  for (const g of guru)  await upsertGuru(g);
  for (const s of siswa) await upsertSiswa(s);
  for (const k of kelas) await upsertKelas(k);
}

module.exports = router;
```

### Daftarkan route di app.js LMS

```javascript
// app.js atau server.js di LMS
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);
// Endpoint aktif: POST /api/webhooks/sdms
```

### Laravel (PHP) — jika LMS pakai Laravel

```php
// routes/api.php
Route::post('/webhooks/sdms', [SDMSWebhookController::class, 'handle']);
```

```php
// app/Http/Controllers/SDMSWebhookController.php
<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SDMSWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $secret = $request->header('X-SDMS-Secret');
        if ($secret !== config('services.sdms.webhook_secret')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $event   = $request->input('event');
        $payload = $request->input('payload');

        match ($event) {
            'guru.created', 'guru.updated' => $this->upsertGuru($payload),
            'guru.deleted'                 => $this->deleteGuru($payload['id']),
            'siswa.created', 'siswa.updated' => $this->upsertSiswa($payload),
            'siswa.deleted'                => $this->deleteSiswa($payload['id']),
            'kelas.created', 'kelas.updated' => $this->upsertKelas($payload),
            'bulk.sync'                    => $this->bulkSync($payload),
            default                        => logger()->info("SDMS webhook tidak dikenal: $event"),
        };

        return response()->json(['received' => true]);
    }

    private function upsertGuru(array $data): void
    {
        \App\Models\Guru::updateOrCreate(
            ['sdms_id' => $data['id']],
            [
                'nama'            => $data['nama'],
                'nip'             => $data['nip'] ?? null,
                'mata_pelajaran'  => $data['mata_pelajaran'] ?? null,
                'jurusan_id'      => $data['jurusan_id'] ?? null,
                'is_active'       => true,
            ]
        );
    }

    private function deleteGuru(string $sdmsId): void
    {
        \App\Models\Guru::where('sdms_id', $sdmsId)->update(['is_active' => false]);
    }

    // ... implement upsertSiswa, upsertKelas, bulkSync sesuai model LMS
}
```
