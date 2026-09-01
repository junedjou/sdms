<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🏠 Application Hub</h1>
        <p class="page-subtitle">Aplikasi terhubung — klik untuk langsung membuka</p>
      </div>
      <div class="flex gap-2">
        <button @click="runHealthCheck" class="btn-secondary btn-sm" :disabled="checkingHealth">
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': checkingHealth }" />
          <span class="hidden sm:inline ml-1">Cek Koneksi</span>
        </button>
        <button v-if="authStore.isSuperAdmin" @click="showRegisterModal = true" class="btn-primary btn-sm">
          <PlusIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Kelola Aplikasi</span>
        </button>
      </div>
    </div>

    <!-- Status Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-gray-900">{{ apps.length }}</div>
        <div class="text-xs text-gray-500 mt-1">Total Aplikasi</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-emerald-600">{{ onlineCount }}</div>
        <div class="text-xs text-gray-500 mt-1">🟢 Online</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-red-500">{{ offlineCount }}</div>
        <div class="text-xs text-gray-500 mt-1">🔴 Offline</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-blue-600">{{ ssoEnabledCount }}</div>
        <div class="text-xs text-gray-500 mt-1">🔑 SSO Aktif</div>
      </div>
    </div>

    <!-- Health check notice -->
    <div v-if="!healthChecked" class="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
      <ExclamationTriangleIcon class="w-5 h-5 text-amber-500 shrink-0" />
      <span>Klik <strong>"Cek Koneksi"</strong> untuk melihat status aktual setiap aplikasi.</span>
    </div>

    <!-- App Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      <div
        v-for="app in apps"
        :key="app.id"
        class="card group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        @click="launchApp(app)"
      >
        <!-- Gradient Header -->
        <div
          class="h-24 flex items-center justify-center relative overflow-hidden"
          :style="{ background: app.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' }"
        >
          <!-- Decorative circles -->
          <div class="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
          <div class="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

          <!-- App Icon -->
          <div class="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <component :is="app.icon" class="w-7 h-7 text-white drop-shadow" />
          </div>

          <!-- Status badge -->
          <div class="absolute top-3 right-3 flex items-center gap-1.5 backdrop-blur-sm rounded-full px-2.5 py-1"
               :class="statusBgClass(app.status)">
            <span class="w-2 h-2 rounded-full" :class="statusDotClass(app.status)" />
            <span class="text-[10px] font-medium text-white">
              {{ statusLabel(app) }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <h3 class="font-bold text-gray-900 text-base mb-1">{{ app.name }}</h3>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ app.description }}</p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span v-if="app.sso_enabled" class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              🔑 SSO
            </span>
            <span v-if="app.sync_enabled" class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              🔄 Sync
            </span>
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
              {{ app.category || 'Umum' }}
            </span>
            <span v-if="app.latency" class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
              ⚡ {{ app.latency }}ms
            </span>
          </div>

          <!-- Launch Button -->
          <button
            class="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02] active:scale-[0.98]"
            :style="{ background: app.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' }"
            :disabled="launching === app.id"
          >
            <span v-if="launching === app.id" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Membuka...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <ArrowTopRightOnSquareIcon class="w-4 h-4" />
              Buka {{ app.name }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="apps.length === 0 && !loading" class="card p-12 text-center">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
        <Squares2X2Icon class="w-8 h-8 text-indigo-400" />
      </div>
      <p class="text-gray-700 font-semibold">Belum ada aplikasi</p>
      <p class="text-sm text-gray-400 mt-1 mb-4">Aplikasi yang terhubung ke SDMS akan muncul di sini</p>
      <button v-if="authStore.isSuperAdmin" @click="showRegisterModal = true" class="btn-primary btn-sm">
        <PlusIcon class="w-4 h-4" /> Daftarkan Aplikasi
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Admin: Register / Edit Modal -->
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
          <label class="block text-sm font-medium text-gray-700 mb-1">URL Aplikasi *</label>
          <input v-model="form.webhook_url" class="input-field font-mono text-sm"
            placeholder="https://lms.sekolah.id" />
          <p class="text-xs text-gray-400 mt-1">URL lengkap server aplikasi (untuk health check & SSO)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">SSO App ID</label>
          <input v-model="form.slug" class="input-field font-mono text-sm"
            placeholder="lms" />
          <p class="text-xs text-gray-400 mt-1">ID aplikasi untuk SSO (contoh: lms, piket, sholat, absen)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="form.description" class="input-field" placeholder="Deskripsi singkat" />
        </div>
      </div>
      <template #footer>
        <button @click="closeModals" class="btn-secondary btn-sm">Batal</button>
        <button @click="saveClient" class="btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Menyimpan...' : (showEditModal ? 'Simpan' : 'Daftarkan') }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal v-model="showDeleteConfirm" title="Hapus Aplikasi" size="sm">
      <p class="text-sm text-gray-600">
        Yakin ingin menghapus <strong>{{ deleteTarget?.name }}</strong>?
      </p>
      <template #footer>
        <button @click="showDeleteConfirm = false" class="btn-secondary btn-sm">Batal</button>
        <button @click="doDelete" class="btn-danger btn-sm" :disabled="deleting">
          {{ deleting ? 'Menghapus...' : 'Hapus' }}
        </button>
      </template>
    </BaseModal>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Admin: Sinkronisasi Panel -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="authStore.isSuperAdmin" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">🔄 Sinkronisasi Data</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Sync Jurnal Guru -->
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
              <ClipboardDocumentListIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Jurnal Guru</h3>
              <p class="text-xs text-gray-500">Sinkron data guru & siswa ke Jurnal Guru</p>
            </div>
          </div>

          <!-- Connection Status -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs text-gray-500">Status:</span>
            <span v-if="jurnalConnection === 'checking'" class="text-xs text-amber-600 flex items-center gap-1">
              <div class="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" /> Mengecek...
            </span>
            <span v-else-if="jurnalConnection === 'online'" class="text-xs text-emerald-600">🟢 Terhubung</span>
            <span v-else-if="jurnalConnection === 'offline'" class="text-xs text-red-500">🔴 Terputus</span>
            <span v-else-if="jurnalConnection === 'no-credentials'" class="text-xs text-amber-600">⚠️ Belum diatur</span>
            <span v-else class="text-xs text-gray-400">—</span>
            <span v-if="jurnalLatency" class="text-[10px] text-gray-400">{{ jurnalLatency }}ms</span>
          </div>

          <!-- Sync Buttons -->
          <div class="space-y-2">
            <button
              @click="syncJurnal('full')"
              class="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
              :disabled="jurnalSyncing"
            >
              <span v-if="jurnalSyncing" class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sinkronisasi...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <ArrowPathIcon class="w-4 h-4" /> Sinkron Semua Data
              </span>
            </button>

            <div class="grid grid-cols-2 gap-2">
              <button @click="syncJurnal('kelas')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">🏫 Kelas</button>
              <button @click="syncJurnal('siswa')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">👩‍🎓 Siswa</button>
              <button @click="syncJurnal('guru')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">👨‍🏫 Guru</button>
              <button @click="syncJurnal('mapel')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">📚 Mapel</button>
            </div>
          </div>

          <p class="text-[10px] text-gray-400 mt-2 text-center">
            Push data dari SDMS ke Jurnal Guru (https://jurnal.smkn1kras.sch.id)
          </p>
        </div>

        <!-- Sync Info -->
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <ExclamationTriangleIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Yang Disinkronkan</h3>
              <p class="text-xs text-gray-500">Data yang dikirim ke aplikasi lain</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">👨‍🏫 Data Guru</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">👩‍🎓 Data Siswa</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">🏫 Data Kelas</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">📚 Mata Pelajaran</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
          </div>

          <div class="mt-3 p-2 bg-blue-50 rounded-lg">
            <p class="text-[11px] text-blue-600">
              💡 <strong>Otomatis:</strong> Setiap kali admin update data guru/siswa di SDMS, data langsung dikirim ke aplikasi terhubung. Sinkron manual hanya untuk first-time setup atau pemulihan data.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin: Manage Apps Table -->
    <div v-if="authStore.isSuperAdmin && clients.length > 0" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">⚙️ Kelola Aplikasi (Admin)</h2>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>SSO ID</th>
              <th>URL</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.id">
              <td class="font-medium text-gray-900">{{ client.name }}</td>
              <td><code class="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{{ client.slug || '-' }}</code></td>
              <td class="text-xs text-gray-500 break-all max-w-[200px] truncate">{{ client.webhook_url || '-' }}</td>
              <td>
                <span class="badge text-xs" :class="client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'">
                  {{ client.status }}
                </span>
              </td>
              <td>
                <div class="flex gap-1">
                  <button @click="editClient(client)" class="btn-secondary btn-sm text-xs px-2">
                    <PencilIcon class="w-3.5 h-3.5" />
                  </button>
                  <button @click="confirmDelete(client)" class="btn-secondary btn-sm text-xs px-2 text-red-500 hover:bg-red-50">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiHubService, gatewayService } from '@/services/api';
import { notify } from '@/utils/toast';
import BaseModal from '@/components/common/BaseModal.vue';
import {
  ArrowPathIcon, PlusIcon, ArrowTopRightOnSquareIcon, Squares2X2Icon,
  ExclamationTriangleIcon,
  BookOpenIcon, ClipboardDocumentListIcon, MoonIcon,
  CalendarDaysIcon, AcademicCapIcon, GlobeAltIcon, LinkIcon,
  PencilIcon, TrashIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ── App definitions (built-in) — status awal: 'unknown' ─────
const builtinApps = [
  {
    id: 'lms', name: 'LMS Sekolah', slug: 'lms',
    description: 'Learning Management System — belajar online, tugas, ujian',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: BookOpenIcon,
    category: 'Akademik',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'piket', name: 'Jurnal Piket', slug: 'piket',
    description: 'Catatan piket harian — guru piket, siswa melanggar, laporan',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: ClipboardDocumentListIcon,
    category: 'Kesiswaan',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'jurnal', name: 'Jurnal Guru', slug: 'jurnal',
    description: 'E-Journal Guru — jurnal harian, absensi kelas, nilai, rekap',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    icon: ClipboardDocumentListIcon,
    category: 'Akademik',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'sholat', name: 'Sholat & Ibadah', slug: 'sholat',
    description: 'Monitoring sholat berjamaah, absensi keagamaan',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: MoonIcon,
    category: 'Keagamaan',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'kegiatan', name: 'Kegiatan Sekolah', slug: 'kegiatan',
    description: 'Event, ekstrakurikuler, jadwal kegiatan',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: CalendarDaysIcon,
    category: 'Kegiatan',
    sso_enabled: true, sync_enabled: false,
    status: 'unknown', latency: null,
  },
  {
    id: 'kelulusan', name: 'Kelulusan', slug: 'kelulusan',
    description: 'Manajemen kelulusan, rapor, transkrip',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: AcademicCapIcon,
    category: 'Akademik',
    sso_enabled: true, sync_enabled: false,
    status: 'unknown', latency: null,
  },
  {
    id: 'website', name: 'Website Sekolah', slug: 'website',
    description: 'Portal website resmi sekolah',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    icon: GlobeAltIcon,
    category: 'Publik',
    sso_enabled: false, sync_enabled: true,
    status: 'unknown', latency: null,
  },
];

// State
const apps = ref(JSON.parse(JSON.stringify(builtinApps)));
const clients = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const launching = ref(null);
const checkingHealth = ref(false);
const healthChecked = ref(false);
const jurnalSyncing = ref(false);
const jurnalConnection = ref('checking'); // checking | online | offline | no-credentials
const jurnalLatency = ref(null);

// Modals
const showRegisterModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const editTarget = ref(null);

// Form
const form = ref({ name: '', webhook_url: '', slug: '', description: '', events: ['*'] });

// ── Computed ────────────────────────────────────────────────
const onlineCount = computed(() => apps.value.filter(a => a.status === 'online').length);
const offlineCount = computed(() => apps.value.filter(a => a.status === 'offline').length);
const ssoEnabledCount = computed(() => apps.value.filter(a => a.sso_enabled).length);

// ── Status helpers ──────────────────────────────────────────
const statusLabel = (app) => {
  if (app.status === 'online') return 'Online';
  if (app.status === 'offline') return 'Offline';
  return 'Cek Koneksi';
};

const statusBgClass = (status) => {
  if (status === 'online') return 'bg-black/30';
  if (status === 'offline') return 'bg-black/30';
  return 'bg-black/20';
};

const statusDotClass = (status) => {
  if (status === 'online') return 'bg-emerald-400';
  if (status === 'offline') return 'bg-red-400';
  return 'bg-amber-400';
};

// ── Health Check (REAL!) ────────────────────────────────────
// Backend /gateway/health does actual HTTP requests to each app's URL
// and returns which ones respond vs which are unreachable.
const runHealthCheck = async () => {
  checkingHealth.value = true;

  // Reset all to 'checking' state
  apps.value.forEach(app => {
    app.status = 'checking';
    app.latency = null;
  });

  try {
    const res = await gatewayService.health();
    const integrations = res.data.data?.integrations || res.data.integrations || [];

    // Map health results to our app list
    integrations.forEach(item => {
      const found = apps.value.find(a =>
        a.slug === item.app || a.id === item.app || a.name === item.app
      );
      if (found) {
        found.status = item.status;   // 'online' or 'offline'
        found.latency = item.latency_ms || null;
      }
    });

    // Any app that wasn't in health results stays 'unknown'
    apps.value.forEach(app => {
      if (app.status === 'checking') {
        app.status = 'unknown';
      }
    });

    healthChecked.value = true;
    const online = integrations.filter(i => i.status === 'online').length;
    const total = integrations.length;
    notify.success(`Health check selesai: ${online}/${total} aplikasi online`);
  } catch (err) {
    console.error('Health check failed:', err);
    // Reset to unknown on error
    apps.value.forEach(app => {
      if (app.status === 'checking') app.status = 'unknown';
    });
    notify.error('Gagal menjalankan health check');
  } finally {
    checkingHealth.value = false;
  }
};

// ── SSO Launch ──────────────────────────────────────────────
const launchApp = async (app) => {
  launching.value = app.id;
  try {
    // Try SSO first
    if (app.sso_enabled) {
      try {
        const res = await gatewayService.ssoToken(app.slug);
        const { redirect_url } = res.data.data;
        if (redirect_url) {
          window.open(redirect_url, '_blank', 'noopener,noreferrer');
          notify.success(`Membuka ${app.name} via SSO...`);
          return;
        }
      } catch (ssoErr) {
        console.warn('SSO failed, trying direct URL:', ssoErr.message);
      }
    }

    // Fallback: open app URL directly
    notify.info(`Membuka ${app.name} — silakan login secara manual.`);
  } finally {
    launching.value = null;
  }
};

// ── Admin: Load DB clients ──────────────────────────────────
const loadClients = async () => {
  if (!authStore.isSuperAdmin) return;
  loading.value = true;
  try {
    const res = await apiHubService.listClients();
    clients.value = res.data.data || [];

    // Add DB-registered apps to the grid (if not already in builtin list)
    clients.value.forEach(client => {
      if (!client.slug) return;
      const existing = apps.value.find(a => a.id === client.slug || a.slug === client.slug);
      if (!existing) {
        apps.value.push({
          id: client.slug || client.id,
          name: client.name,
          slug: client.slug,
          description: client.description || '',
          gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
          icon: LinkIcon,
          category: 'Terdaftar',
          sso_enabled: true,
          sync_enabled: !!client.webhook_url,
          status: 'unknown', latency: null,
          client_id: client.id,
        });
      }
    });
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
};

// ── Admin: CRUD ─────────────────────────────────────────────
const closeModals = () => {
  showRegisterModal.value = false;
  showEditModal.value = false;
  form.value = { name: '', webhook_url: '', slug: '', description: '', events: ['*'] };
  editTarget.value = null;
};

const toggleAllEvents = () => {
  form.value.events = form.value.events.includes('*') ? [] : ['*'];
};

const saveClient = async () => {
  if (!form.value.name) {
    notify.warning('Nama aplikasi wajib diisi');
    return;
  }
  saving.value = true;
  try {
    if (showEditModal.value && editTarget.value) {
      await apiHubService.updateClient(editTarget.value.id, form.value);
      notify.success('Aplikasi berhasil diperbarui');
    } else {
      await apiHubService.createClient(form.value);
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
    webhook_url: client.webhook_url || '',
    slug: client.slug || '',
    description: client.description || '',
    events: client.events || ['*'],
  };
  showEditModal.value = true;
  showRegisterModal.value = true;
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
  } catch {
    notify.error('Gagal menghapus');
  } finally {
    deleting.value = false;
  }
};

// ── Jurnal Guru Sync ─────────────────────────────────────────
const checkJurnalConnection = async () => {
  jurnalConnection.value = 'checking';
  try {
    const res = await gatewayService.jurnalTest();
    const data = res.data.data;
    if (data.success) {
      jurnalConnection.value = 'online';
      jurnalLatency.value = data.latency_ms;
    } else if (data.error?.includes('belum di-set')) {
      jurnalConnection.value = 'no-credentials';
    } else {
      jurnalConnection.value = 'offline';
    }
  } catch {
    jurnalConnection.value = 'offline';
  }
};

const syncJurnal = async (type = 'full') => {
  jurnalSyncing.value = true;
  try {
    const res = await gatewayService.jurnalSync({ type });
    const msg = res.data?.message || 'Sinkronisasi dimulai';
    notify.success(`✅ ${msg} — data sedang dikirim ke Jurnal Guru...`);
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal sinkronisasi ke Jurnal Guru');
  } finally {
    jurnalSyncing.value = false;
  }
};

// ── On mount: load clients + health check + jurnal check ─────
onMounted(async () => {
  await loadClients();
  await Promise.all([
    runHealthCheck(),
    checkJurnalConnection(),
  ]);
});
</script>
