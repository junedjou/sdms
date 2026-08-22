<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🏠 Application Hub</h1>
        <p class="page-subtitle">Aplikasi terhubung — klik untuk langsung membuka</p>
      </div>
      <div v-if="authStore.isSuperAdmin" class="flex gap-2">
        <button @click="refreshAll" class="btn-secondary btn-sm" :disabled="loading">
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
        <button @click="showRegisterModal = true" class="btn-primary btn-sm">
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
        <div class="text-xs text-gray-500 mt-1">Online</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-red-500">{{ offlineCount }}</div>
        <div class="text-xs text-gray-500 mt-1">Offline</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-blue-600">{{ ssoEnabledCount }}</div>
        <div class="text-xs text-gray-500 mt-1">SSO Aktif</div>
      </div>
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

          <!-- Status dot -->
          <div class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1">
            <span v-if="app.status === 'online'" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span v-else-if="app.status === 'offline'" class="w-2 h-2 rounded-full bg-red-400" />
            <span v-else class="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
            <span class="text-[10px] font-medium text-white">
              {{ app.status === 'online' ? 'Online' : app.status === 'offline' ? 'Offline' : 'Checking...' }}
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input v-model="form.webhook_url" class="input-field font-mono text-sm"
            placeholder="https://lms.sekolah.id/api/webhooks/sdms" />
          <p class="text-xs text-gray-400 mt-1">URL untuk menerima update data dari SDMS (opsional)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">SSO App ID</label>
          <input v-model="form.slug" class="input-field font-mono text-sm"
            placeholder="lms" />
          <p class="text-xs text-gray-400 mt-1">ID aplikasi untuk SSO login (harus sesuai dengan config server, contoh: lms, piket, sholat)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="form.description" class="input-field" placeholder="Deskripsi singkat" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Events (untuk sinkronisasi data)</label>
          <div class="flex items-center gap-2 mb-2">
            <button @click="toggleAllEvents"
              class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              :class="form.events.includes('*') ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              {{ form.events.includes('*') ? '✓ ' : '' }}Semua Event
            </button>
          </div>
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
              <th>Webhook</th>
              <th>Sync</th>
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
                <span v-if="client.webhook_url" class="badge bg-blue-100 text-blue-700 text-xs">Aktif</span>
                <span v-else class="badge bg-gray-100 text-gray-400 text-xs">Nonaktif</span>
              </td>
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
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiHubService, gatewayService } from '@/services/api';
import { notify } from '@/utils/toast';
import BaseModal from '@/components/common/BaseModal.vue';
import {
  ArrowPathIcon, PlusIcon, ArrowTopRightOnSquareIcon, Squares2X2Icon,
  BookOpenIcon, ClipboardDocumentListIcon, MoonIcon,
  CalendarDaysIcon, AcademicCapIcon, GlobeAltIcon, LinkIcon,
  PencilIcon, TrashIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ── App definitions (built-in + DB registered) ──────────────
const builtinApps = [
  {
    id: 'lms', name: 'LMS Sekolah', slug: 'lms',
    description: 'Learning Management System — belajar online, tugas, ujian',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: BookOpenIcon,
    category: 'Akademik',
    sso_enabled: true,
    sync_enabled: true,
    status: 'unknown',
  },
  {
    id: 'piket', name: 'Jurnal Piket', slug: 'piket',
    description: 'Catatan piket harian — guru piket, siswa melanggar, laporan',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: ClipboardDocumentListIcon,
    category: 'Kesiswaan',
    sso_enabled: true,
    sync_enabled: true,
    status: 'unknown',
  },
  {
    id: 'sholat', name: 'Sholat & Ibadah', slug: 'sholat',
    description: 'Monitoring sholat berjamaah, absensi keagamaan',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: MoonIcon,
    category: 'Keagamaan',
    sso_enabled: true,
    sync_enabled: true,
    status: 'unknown',
  },
  {
    id: 'kegiatan', name: 'Kegiatan Sekolah', slug: 'kegiatan',
    description: 'Event, ekstrakurikuler, jadwal kegiatan',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: CalendarDaysIcon,
    category: 'Kegiatan',
    sso_enabled: true,
    sync_enabled: false,
    status: 'unknown',
  },
  {
    id: 'kelulusan', name: 'Kelulusan', slug: 'kelulusan',
    description: 'Manajemen kelulusan, rapor, transkrip',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: AcademicCapIcon,
    category: 'Akademik',
    sso_enabled: true,
    sync_enabled: false,
    status: 'unknown',
  },
  {
    id: 'website', name: 'Website Sekolah', slug: 'website',
    description: 'Portal website resmi sekolah',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    icon: GlobeAltIcon,
    category: 'Publik',
    sso_enabled: false,
    sync_enabled: true,
    status: 'unknown',
  },
];

// State
const apps = ref([...builtinApps]);
const clients = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const launching = ref(null);

// Modals
const showRegisterModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const editTarget = ref(null);

// Form
const form = ref({ name: '', webhook_url: '', slug: '', description: '', events: ['*'] });

// Computed
const onlineCount = computed(() => apps.value.filter(a => a.status === 'online').length);
const offlineCount = computed(() => apps.value.filter(a => a.status === 'offline').length);
const ssoEnabledCount = computed(() => apps.value.filter(a => a.sso_enabled).length);

// ── Get app URL from config ──────────────────────────────────
const getConfigUrl = (slug) => {
  const envUrls = {
    lms: import.meta.env.VITE_LMS_URL || '',
    piket: import.meta.env.VITE_PIKET_URL || '',
    sholat: import.meta.env.VITE_SHOLAT_URL || '',
    kegiatan: import.meta.env.VITE_KEGIATAN_URL || '',
    kelulusan: import.meta.env.VITE_KELULUSAN_URL || '',
    website: import.meta.env.VITE_WEBSITE_URL || '',
    absen: import.meta.env.VITE_ABSEN_URL || '',
  };
  return envUrls[slug] || '';
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
        // SSO failed — fall through to direct URL
        console.warn('SSO failed, trying direct URL:', ssoErr.message);
      }
    }

    // Fallback: open app URL directly (user will login manually)
    const appUrl = app.url || getConfigUrl(app.slug);
    if (appUrl) {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
      notify.info(`Membuka ${app.name} — silakan login secara manual.`);
    } else {
      notify.warning(`${app.name} belum terkonfigurasi. Hubungi admin untuk menambahkan URL aplikasi.`);
    }
  } finally {
    launching.value = null;
  }
};

// ── Health Check ────────────────────────────────────────────
const checkHealth = async () => {
  try {
    const res = await gatewayService.health();
    const integrations = res.data.data?.integrations || [];

    integrations.forEach(item => {
      const found = apps.value.find(a => a.id === item.app || a.slug === item.app);
      if (found) {
        found.status = item.status;
        found.latency = item.latency_ms;
      }
    });

    // Remaining 'unknown' → offline (health check couldn't reach them)
    apps.value.forEach(a => {
      if (a.status === 'unknown') a.status = 'offline';
    });
  } catch {
    apps.value.forEach(a => {
      if (a.status === 'unknown') a.status = 'offline';
    });
  }
};

// ── Admin: Load DB clients ──────────────────────────────────
const loadClients = async () => {
  if (!authStore.isSuperAdmin) return;
  loading.value = true;
  try {
    const res = await apiHubService.listClients();
    clients.value = res.data.data || [];

    // Merge DB-registered apps into the grid (if they have a slug matching a builtin)
    clients.value.forEach(client => {
      const existing = apps.value.find(a => a.id === client.slug || a.slug === client.slug);
      if (!existing && client.slug) {
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
          status: 'unknown',
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

const refreshAll = async () => {
  loading.value = true;
  await Promise.all([loadClients(), checkHealth()]);
  loading.value = false;
};

onMounted(() => {
  loadClients();
  checkHealth();
});
</script>
