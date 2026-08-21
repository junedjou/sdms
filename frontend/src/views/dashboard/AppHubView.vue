<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🔌 Integration Hub</h1>
        <p class="page-subtitle">Pusat data — kelola aplikasi yang terhubung dan pantau sinkronisasi</p>
      </div>
      <div class="flex gap-2">
        <button @click="loadClients" class="btn-secondary btn-sm" :disabled="loading">
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
        <button @click="showRegisterModal = true" class="btn-primary btn-sm">
          <PlusIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Daftarkan Aplikasi</span>
        </button>
      </div>
    </div>

    <!-- Stats Banner -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ clients.length }}</div>
        <div class="text-xs text-gray-500 mt-1">Aplikasi Terdaftar</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ activeClients }}</div>
        <div class="text-xs text-gray-500 mt-1">Aktif</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ totalDelivered }}</div>
        <div class="text-xs text-gray-500 mt-1">Webhook Terkirim</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold" :class="totalFailed > 0 ? 'text-red-600' : 'text-gray-400'">{{ totalFailed }}</div>
        <div class="text-xs text-gray-500 mt-1">Gagal</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
        :class="activeTab === tab.id
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Aplikasi -->
    <div v-if="activeTab === 'apps'">
      <!-- Info -->
      <div class="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <InformationCircleIcon class="w-5 h-5 text-blue-600" />
          </div>
          <div class="text-sm">
            <p class="font-semibold text-blue-900">Cara Kerja: SDMS sebagai Data Pusat</p>
            <p class="text-blue-700 mt-1">
              SDMS menjadi <strong>satu-satunya sumber data</strong> untuk semua aplikasi.
              Ketika Anda menambah/mengubah data siswa atau guru di SDMS,
              otomatis semua aplikasi terhubung akan menerima update-nya via <strong>Webhook</strong>.
            </p>
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div class="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">1</span>
                <span class="text-blue-800">Daftarkan aplikasi di sini</span>
              </div>
              <div class="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">2</span>
                <span class="text-blue-800">Aplikasi terima webhook otomatis</span>
              </div>
              <div class="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">3</span>
                <span class="text-blue-800">Data selalu sinkron</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- App Cards -->
      <div v-if="clients.length === 0 && !loading" class="card p-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <LinkIcon class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 font-medium">Belum ada aplikasi terdaftar</p>
        <p class="text-sm text-gray-400 mt-1 mb-4">Daftarkan aplikasi pertama untuk mulai sinkronisasi data</p>
        <button @click="showRegisterModal = true" class="btn-primary btn-sm">
          <PlusIcon class="w-4 h-4" /> Daftarkan Sekarang
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <div v-for="client in clients" :key="client.id"
          class="card p-5 transition-all duration-200 hover:shadow-lg group"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                :class="getStatusBg(client.status)">
                <component :is="getAppIcon(client.slug)" class="w-5 h-5" :class="getStatusText(client.status)" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-sm">{{ client.name }}</h3>
                <p class="text-xs text-gray-400">{{ client.slug }}</p>
              </div>
            </div>
            <span class="badge text-xs" :class="getStatusBadge(client.status)">
              <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" :class="getStatusDot(client.status)" />
              {{ client.status === 'active' ? 'Aktif' : client.status === 'error' ? 'Error' : 'Nonaktif' }}
            </span>
          </div>

          <!-- Webhook URL -->
          <div class="mb-3 p-2.5 bg-gray-50 rounded-lg">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Webhook URL</div>
            <code class="text-xs text-gray-600 break-all font-mono">{{ client.webhook_url }}</code>
          </div>

          <!-- Events -->
          <div class="mb-3">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Events</div>
            <div class="flex flex-wrap gap-1">
              <span v-if="client.events?.includes('*')" class="badge bg-purple-100 text-purple-700 text-[10px]">
                Semua Event
              </span>
              <template v-else>
                <span v-for="evt in (client.events || []).slice(0, 4)" :key="evt"
                  class="badge bg-gray-100 text-gray-600 text-[10px]">
                  {{ evt.replace('.', ' ') }}
                </span>
                <span v-if="(client.events || []).length > 4" class="badge bg-gray-100 text-gray-500 text-[10px]">
                  +{{ client.events.length - 4 }}
                </span>
              </template>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span class="flex items-center gap-1">
              <CheckCircleIcon class="w-3.5 h-3.5 text-emerald-500" />
              {{ client.total_delivered || 0 }} ok
            </span>
            <span class="flex items-center gap-1">
              <XCircleIcon class="w-3.5 h-3.5 text-red-400" />
              {{ client.total_failed || 0 }} gagal
            </span>
            <span v-if="client.last_sync_at" class="text-gray-400">
              {{ formatRelative(client.last_sync_at) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-3 border-t border-gray-100">
            <button @click="testClient(client)" class="flex-1 btn-secondary btn-sm text-xs" :disabled="testingId === client.id">
              <PlayIcon v-if="testingId !== client.id" class="w-3.5 h-3.5" />
              <div v-else class="w-3.5 h-3.5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
              {{ testingId === client.id ? 'Testing...' : 'Test' }}
            </button>
            <button @click="viewClient(client)" class="flex-1 btn-secondary btn-sm text-xs">
              <EyeIcon class="w-3.5 h-3.5" /> Detail
            </button>
            <button @click="editClient(client)" class="btn-secondary btn-sm text-xs px-2.5">
              <PencilIcon class="w-3.5 h-3.5" />
            </button>
            <button @click="confirmDelete(client)" class="btn-secondary btn-sm text-xs px-2.5 text-red-500 hover:bg-red-50">
              <TrashIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Webhook Logs -->
    <div v-if="activeTab === 'logs'">
      <!-- Filter -->
      <div class="flex flex-wrap gap-3 mb-4">
        <select v-model="logFilter.client_id" @change="loadLogs" class="input-field text-sm py-2">
          <option value="">Semua Aplikasi</option>
          <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="logFilter.status" @change="loadLogs" class="input-field text-sm py-2">
          <option value="">Semua Status</option>
          <option value="success">Berhasil</option>
          <option value="failed">Gagal</option>
          <option value="retrying">Retrying</option>
        </select>
        <select v-model="logFilter.event" @change="loadLogs" class="input-field text-sm py-2">
          <option value="">Semua Event</option>
          <option v-for="e in eventTypes" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>

      <!-- Logs Table -->
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aplikasi</th>
              <th>Event</th>
              <th>Status</th>
              <th>HTTP</th>
              <th>Waktu</th>
              <th>Percobaan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="text-xs">{{ formatDateTime(log.created_at) }}</td>
              <td>
                <span class="badge bg-gray-100 text-gray-700 text-xs">{{ log.client?.name || '-' }}</span>
              </td>
              <td>
                <span class="badge text-xs" :class="getEventBadge(log.event)">{{ log.event }}</span>
              </td>
              <td>
                <span class="badge text-xs" :class="getLogStatusBadge(log.status)">
                  {{ log.status }}
                </span>
              </td>
              <td class="text-xs font-mono">{{ log.http_status || '-' }}</td>
              <td class="text-xs">{{ log.duration_ms ? log.duration_ms + 'ms' : '-' }}</td>
              <td class="text-xs">{{ log.attempt }}/3</td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400 text-sm">Belum ada log webhook</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Developer Guide -->
    <div v-if="activeTab === 'guide'">
      <div class="card p-6 sm:p-8 max-w-4xl">
        <h2 class="text-lg font-bold text-gray-900 mb-4">📘 Panduan Integrasi untuk Developer</h2>

        <div class="space-y-6 text-sm text-gray-700 leading-relaxed">
          <!-- Section 1 -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">1. Menerima Webhook dari SDMS</h3>
            <p>Setiap kali data berubah di SDMS (siswa, guru, kelas, dll), SDMS akan mengirim HTTP POST ke webhook URL yang sudah didaftarkan.</p>
            <div class="mt-3 bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto">
              <pre>// Contoh payload webhook
{
  "event": "siswa.created",
  "payload": {
    "id": "uuid-siswa",
    "nama": "Ahmad Fauzi",
    "nisn": "0085590240",
    "nis": "2024001",
    "jurusan_id": "uuid-jurusan",
    "kelas_id": "uuid-kelas",
    "status": "Aktif"
  },
  "meta": {
    "timestamp": "2026-08-22T10:30:00.000Z",
    "source": "sdms-core"
  }
}</pre>
            </div>
          </div>

          <!-- Section 2 -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">2. Verifikasi Signature</h3>
            <p>Setiap webhook dilengkapi HMAC-SHA256 signature untuk keamanan. Gunakan <code class="bg-gray-100 px-1.5 py-0.5 rounded">api_secret</code> dari aplikasi Anda.</p>
            <div class="mt-3 bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto">
              <pre>// Node.js
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expected;
}

// Express middleware
app.post('/api/webhooks/sdms', (req, res) => {
  const signature = req.headers['x-api-signature'];
  const secret = process.env.SDMS_API_SECRET;

  if (!verifySignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, payload } = req.body;

  switch (event) {
    case 'siswa.created':
    case 'siswa.updated':
      // Update database lokal siswa
      upsertSiswa(payload);
      break;
    case 'siswa.deleted':
      // Tandai siswa sebagai tidak aktif
      deactivateSiswa(payload.id);
      break;
    case 'guru.created':
    case 'guru.updated':
      upsertGuru(payload);
      break;
    case 'guru.deleted':
      deactivateGuru(payload.id);
      break;
    case 'bulk.sync':
      // Sinkronisasi massal — replace semua data
      bulkSync(payload);
      break;
  }

  res.json({ status: 'ok' });
});</pre>
            </div>
          </div>

          <!-- Section 3 -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">3. Pull Data Langsung (REST API)</h3>
            <p>Selain webhook push, aplikasi Anda juga bisa pull data langsung dari SDMS kapan saja.</p>
            <div class="mt-3 bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto">
              <pre>// Contoh: ambil semua siswa aktif
const response = await fetch('https://sdms.sekolah.id/api/v1/master/siswa?limit=100', {
  headers: {
    'Authorization': 'Bearer &lt;access_token&gt;',
    'X-API-Key': '&lt;api_key_dari_sdms&gt;'
  }
});
const { data } = await response.json();

// Endpoint tersedia:
// GET  /api/v1/master/siswa        — Daftar siswa
// GET  /api/v1/master/siswa/:id    — Detail siswa
// GET  /api/v1/master/guru         — Daftar guru
// GET  /api/v1/master/kelas        — Daftar kelas
// GET  /api/v1/master/jurusan      — Daftar jurusan
// GET  /api/v1/master/mapel        — Daftar mata pelajaran
// GET  /api/v1/master/tahun-pelajaran — Tahun pelajaran</pre>
            </div>
          </div>

          <!-- Section 4 -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">4. Event yang Tersedia</h3>
            <div class="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="group in eventGroups" :key="group.name" class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs font-semibold text-gray-600 mb-1.5">{{ group.name }}</div>
                <div v-for="evt in group.events" :key="evt" class="text-xs text-gray-500">
                  {{ evt }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5 -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">5. Flow Diagram</h3>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 text-center">
              <div class="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-medium">
                <div class="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-sm">
                  📝 Admin Update Data<br/><span class="text-blue-200">di SDMS</span>
                </div>
                <div class="text-blue-400">→</div>
                <div class="bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-sm">
                  🔔 EventBus<br/><span class="text-indigo-200">siswa.created</span>
                </div>
                <div class="text-indigo-400">→</div>
                <div class="bg-purple-600 text-white px-4 py-2.5 rounded-xl shadow-sm">
                  📡 SyncService<br/><span class="text-purple-200">Push Webhooks</span>
                </div>
                <div class="text-purple-400">→</div>
                <div class="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-sm">
                  🎯 Aplikasi Lain<br/><span class="text-emerald-200">Auto Update</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Register / Edit Modal -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <BaseModal
      v-model="showRegisterModal"
      :title="showEditModal ? 'Edit Aplikasi' : 'Daftarkan Aplikasi Baru'"
      size="lg"
      @close="closeModals"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi *</label>
          <input v-model="form.name" class="input-field" placeholder="Contoh: LMS Sekolah" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL *</label>
          <input v-model="form.webhook_url" class="input-field font-mono text-sm"
            placeholder="https://lms.sekolah.id/api/webhooks/sdms" />
          <p class="text-xs text-gray-400 mt-1">URL yang akan menerima POST dari SDMS saat data berubah</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="form.description" class="input-field" placeholder="Deskripsi singkat (opsional)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Events yang Didengar</label>
          <div class="flex items-center gap-2 mb-2">
            <button @click="toggleAllEvents"
              class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              :class="form.events.includes('*') ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              {{ form.events.includes('*') ? '✓ ' : '' }}Semua Event
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            <label v-for="evt in availableEvents.filter(e => e.value !== '*')" :key="evt.value"
              class="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-white">
              <input type="checkbox" :value="evt.value" v-model="form.events"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span class="text-gray-700">{{ evt.label }}</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="closeModals" class="btn-secondary btn-sm">Batal</button>
        <button @click="saveClient" class="btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Menyimpan...' : (showEditModal ? 'Simpan Perubahan' : 'Daftarkan') }}
        </button>
      </template>
    </BaseModal>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Detail Modal (shows API keys after creation) -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <BaseModal
      v-model="showDetailModal"
      :title="`Detail: ${detailClient?.name || ''}`"
      size="lg"
    >
      <div v-if="detailClient" class="space-y-4">
        <!-- API Keys (only show when freshly created) -->
        <div v-if="detailClient.api_key" class="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <KeyIcon class="w-5 h-5 text-amber-600" />
            <span class="font-semibold text-amber-800 text-sm">⚠️ Simpan Kredensial Ini Sekarang!</span>
          </div>
          <p class="text-xs text-amber-700 mb-3">Kunci ini hanya ditampilkan sekali. Setelah ditutup, tidak akan bisa dilihat lagi.</p>

          <div class="space-y-2">
            <div>
              <label class="text-[10px] text-amber-600 uppercase tracking-wider">API Key</label>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-xs bg-white p-2 rounded-lg border border-amber-200 font-mono break-all">{{ detailClient.api_key }}</code>
                <button @click="copyToClipboard(detailClient.api_key)" class="btn-secondary btn-sm px-2">
                  <ClipboardIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label class="text-[10px] text-amber-600 uppercase tracking-wider">API Secret</label>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-xs bg-white p-2 rounded-lg border border-amber-200 font-mono break-all">{{ detailClient.api_secret }}</code>
                <button @click="copyToClipboard(detailClient.api_secret)" class="btn-secondary btn-sm px-2">
                  <ClipboardIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-3">
          <div>
            <label class="text-[10px] text-gray-400 uppercase tracking-wider">Webhook URL</label>
            <code class="block text-sm font-mono text-gray-700 mt-0.5">{{ detailClient.webhook_url }}</code>
          </div>
          <div>
            <label class="text-[10px] text-gray-400 uppercase tracking-wider">Status</label>
            <div class="mt-0.5">
              <span class="badge text-xs" :class="getStatusBadge(detailClient.status)">
                {{ detailClient.status }}
              </span>
            </div>
          </div>
          <div>
            <label class="text-[10px] text-gray-400 uppercase tracking-wider">Events</label>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-if="detailClient.events?.includes('*')" class="badge bg-purple-100 text-purple-700 text-xs">Semua Event</span>
              <span v-for="evt in (detailClient.events || [])" :key="evt"
                class="badge bg-gray-100 text-gray-600 text-xs">{{ evt }}</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <div class="text-center">
              <div class="text-lg font-bold text-emerald-600">{{ detailClient.total_delivered || 0 }}</div>
              <div class="text-[10px] text-gray-400">Terkirim</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-red-500">{{ detailClient.total_failed || 0 }}</div>
              <div class="text-[10px] text-gray-400">Gagal</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-gray-400">{{ detailClient.error_count || 0 }}</div>
              <div class="text-[10px] text-gray-400">Error Berturut</div>
            </div>
          </div>
        </div>

        <!-- Test & Regenerate -->
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <button @click="testClient(detailClient)" class="btn-secondary btn-sm flex-1" :disabled="testingId === detailClient.id">
            <PlayIcon class="w-4 h-4" /> Test Webhook
          </button>
          <button @click="confirmRegenerateKeys(detailClient)" class="btn-secondary btn-sm flex-1 text-amber-600">
            <ArrowPathIcon class="w-4 h-4" /> Regenerate Keys
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal v-model="showDeleteConfirm" title="Hapus Aplikasi" size="sm">
      <p class="text-sm text-gray-600">
        Yakin ingin menghapus <strong>{{ deleteTarget?.name }}</strong>? Aplikasi ini tidak akan menerima webhook lagi.
      </p>
      <template #footer>
        <button @click="showDeleteConfirm = false" class="btn-secondary btn-sm">Batal</button>
        <button @click="doDelete" class="btn-danger btn-sm" :disabled="deleting">
          {{ deleting ? 'Menghapus...' : 'Hapus' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { apiHubService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import BaseModal from '@/components/common/BaseModal.vue';
import {
  ArrowPathIcon, PlusIcon, InformationCircleIcon, LinkIcon,
  CheckCircleIcon, XCircleIcon, EyeIcon, PencilIcon, TrashIcon,
  KeyIcon, ClipboardIcon, PlayIcon,
  BookOpenIcon, ClipboardDocumentListIcon, MoonIcon,
  CalendarDaysIcon, AcademicCapIcon, GlobeAltIcon,
} from '@heroicons/vue/24/outline';

const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Integration Hub' }]);

// State
const clients = ref([]);
const logs = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const testingId = ref(null);
const activeTab = ref('apps');
const availableEvents = ref([]);

// Modals
const showRegisterModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const showDeleteConfirm = ref(false);
const detailClient = ref(null);
const deleteTarget = ref(null);
const editTarget = ref(null);

// Form
const form = ref({ name: '', webhook_url: '', description: '', events: ['*'] });

// Log filter
const logFilter = ref({ client_id: '', status: '', event: '' });

// Tabs
const tabs = [
  { id: 'apps', label: 'Aplikasi', icon: '🔌' },
  { id: 'logs', label: 'Webhook Logs', icon: '📋' },
  { id: 'guide', label: 'Developer Guide', icon: '📘' },
];

// Event groups for guide
const eventGroups = [
  { name: '👤 Siswa', events: ['siswa.created', 'siswa.updated', 'siswa.deleted'] },
  { name: '👩‍🏫 Guru', events: ['guru.created', 'guru.updated', 'guru.deleted'] },
  { name: '🏢 Pegawai', events: ['pegawai.created', 'pegawai.updated', 'pegawai.deleted'] },
  { name: '🏫 Kelas', events: ['kelas.created', 'kelas.updated'] },
  { name: '📚 Mapel', events: ['mapel.created', 'mapel.updated'] },
  { name: '🔄 System', events: ['bulk.sync'] },
];

// Computed
const activeClients = computed(() => clients.value.filter(c => c.status === 'active').length);
const totalDelivered = computed(() => clients.value.reduce((sum, c) => sum + (c.total_delivered || 0), 0));
const totalFailed = computed(() => clients.value.reduce((sum, c) => sum + (c.total_failed || 0), 0));
const eventTypes = computed(() => {
  const events = new Set();
  logs.value.forEach(l => events.add(l.event));
  return [...events].sort();
});

// Icons
const appIcons = {
  lms: BookOpenIcon, jurnal: ClipboardDocumentListIcon, piket: ClipboardDocumentListIcon,
  sholat: MoonIcon, kegiatan: CalendarDaysIcon, kelulusan: AcademicCapIcon,
  website: GlobeAltIcon,
};
const getAppIcon = (slug) => appIcons[slug] || LinkIcon;

// Status helpers
const getStatusBg = (s) => s === 'active' ? 'bg-emerald-100' : s === 'error' ? 'bg-red-100' : 'bg-gray-100';
const getStatusText = (s) => s === 'active' ? 'text-emerald-600' : s === 'error' ? 'text-red-600' : 'text-gray-400';
const getStatusBadge = (s) => s === 'active' ? 'bg-emerald-100 text-emerald-700' : s === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500';
const getStatusDot = (s) => s === 'active' ? 'bg-emerald-500' : s === 'error' ? 'bg-red-500' : 'bg-gray-400';
const getLogStatusBadge = (s) => ({
  success: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  retrying: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-500',
}[s] || 'bg-gray-100 text-gray-500');
const getEventBadge = (e) => {
  if (e.includes('siswa')) return 'bg-blue-100 text-blue-700';
  if (e.includes('guru')) return 'bg-purple-100 text-purple-700';
  if (e.includes('kelas')) return 'bg-indigo-100 text-indigo-700';
  if (e.includes('bulk')) return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

// Format helpers
const formatRelative = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return 'Baru saja';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m lalu`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}j lalu`;
  return `${Math.floor(diff/86400000)}h lalu`;
};
const formatDateTime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// Load data
const loadClients = async () => {
  loading.value = true;
  try {
    const res = await apiHubService.listClients();
    clients.value = res.data.data || [];
  } catch {
    notify.error('Gagal memuat daftar aplikasi');
  } finally {
    loading.value = false;
  }
};

const loadLogs = async () => {
  try {
    const params = {};
    if (logFilter.value.client_id) params.api_client_id = logFilter.value.client_id;
    if (logFilter.value.status) params.status = logFilter.value.status;
    if (logFilter.value.event) params.event = logFilter.value.event;
    const res = await apiHubService.getLogs(params);
    logs.value = res.data.data?.rows || res.data.data || [];
  } catch {
    // silent
  }
};

const loadEvents = async () => {
  try {
    const res = await apiHubService.availableEvents();
    availableEvents.value = res.data.data || [];
  } catch {
    availableEvents.value = [];
  }
};

// Actions
const toggleAllEvents = () => {
  if (form.value.events.includes('*')) {
    form.value.events = [];
  } else {
    form.value.events = ['*'];
  }
};

const closeModals = () => {
  showRegisterModal.value = false;
  showEditModal.value = false;
  form.value = { name: '', webhook_url: '', description: '', events: ['*'] };
  editTarget.value = null;
};

const saveClient = async () => {
  if (!form.value.name || !form.value.webhook_url) {
    notify.warning('Nama dan Webhook URL wajib diisi');
    return;
  }
  saving.value = true;
  try {
    if (showEditModal.value && editTarget.value) {
      await apiHubService.updateClient(editTarget.value.id, form.value);
      notify.success('Aplikasi berhasil diperbarui');
    } else {
      const res = await apiHubService.createClient(form.value);
      detailClient.value = res.data.data?.client || res.data.data;
      showDetailModal.value = true;
      notify.success('Aplikasi berhasil didaftarkan!');
    }
    closeModals();
    loadClients();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyimpan');
  } finally {
    saving.value = false;
  }
};

const editClient = (client) => {
  editTarget.value = client;
  form.value = {
    name: client.name,
    webhook_url: client.webhook_url,
    description: client.description || '',
    events: client.events || ['*'],
  };
  showEditModal.value = true;
  showRegisterModal.value = true;
};

const viewClient = (client) => {
  detailClient.value = { ...client };
  showDetailModal.value = true;
};

const testClient = async (client) => {
  testingId.value = client.id;
  try {
    const res = await apiHubService.testWebhook(client.id);
    const result = res.data.data;
    if (result.status === 'success') {
      notify.success(`✓ Webhook berhasil ke ${client.name} (${result.latency_ms}ms)`);
    } else {
      notify.error(`✗ Gagal: ${result.error}`);
    }
  } catch (err) {
    notify.error('Gagal test webhook');
  } finally {
    testingId.value = null;
  }
};

const confirmDelete = (client) => {
  deleteTarget.value = client;
  showDeleteConfirm.value = true;
};

const doDelete = async () => {
  deleting.value = true;
  try {
    await apiHubService.deleteClient(deleteTarget.value.id);
    notify.success(`${deleteTarget.value.name} berhasil dihapus`);
    showDeleteConfirm.value = false;
    loadClients();
  } catch (err) {
    notify.error('Gagal menghapus');
  } finally {
    deleting.value = false;
  }
};

const confirmRegenerateKeys = async (client) => {
  if (!confirm(`Regenerate API key untuk ${client.name}? Key lama akan berhenti berfungsi.`)) return;
  try {
    const res = await apiHubService.regenerateKeys(client.id);
    detailClient.value = { ...detailClient.value, ...res.data.data };
    notify.success('API key baru berhasil dibuat');
  } catch {
    notify.error('Gagal regenerate key');
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    notify.success('Berhasil disalin!');
  } catch {
    notify.error('Gagal menyalin');
  }
};

// Watch tab changes
import { watch } from 'vue';
watch(activeTab, (tab) => {
  if (tab === 'logs') loadLogs();
});

onMounted(() => {
  loadClients();
  loadEvents();
});
</script>
