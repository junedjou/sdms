<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Application Hub</h1>
        <p class="page-subtitle">Akses semua aplikasi sekolah — klik kartu untuk membuka dengan SSO</p>
      </div>
      <button @click="loadHealth(false)" class="btn-secondary btn-sm" :disabled="healthLoading">
        <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': healthLoading }" />
        Cek Status Aplikasi
      </button>
    </div>

    <!-- Info banner -->
    <div class="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
      <InformationCircleIcon class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div class="text-sm text-blue-700">
        <p class="font-medium">Cara kerja Application Hub</p>
        <p class="text-blue-600 mt-0.5">
          Klik aplikasi yang <span class="font-semibold">sudah berjalan</span> untuk masuk tanpa login ulang (SSO).
          Aplikasi bertanda <span class="badge bg-gray-100 text-gray-500 text-xs">Segera</span> masih dalam pengembangan.
          Aplikasi bertanda <span class="badge bg-yellow-100 text-yellow-700 text-xs">Belum Aktif</span>
          perlu dikonfigurasi URL-nya di file <code class="bg-blue-100 px-1 rounded">.env</code> backend.
        </p>
      </div>
    </div>

    <!-- Kategori: Aktif -->
    <div class="mb-2">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Aplikasi Tersedia</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <template v-for="app in activeApps" :key="app.id">
          <AppCard :app="app" :health-status="healthStatus[app.id]" @open="openApp(app)" />
        </template>
      </div>
    </div>

    <!-- Kategori: Dalam Pengembangan -->
    <div class="mt-6">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Dalam Pengembangan</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <div
          v-for="app in devApps"
          :key="app.id"
          class="card p-4 text-center opacity-60"
        >
          <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
            <component :is="getAppIcon(app.id)" class="w-5 h-5 text-gray-400" />
          </div>
          <p class="text-xs font-medium text-gray-500">{{ app.name }}</p>
          <span class="badge bg-gray-100 text-gray-400 text-xs mt-1">Segera</span>
        </div>
      </div>
    </div>

    <!-- SSO Loading overlay -->
    <Transition name="fade">
      <div v-if="ssoLoading" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-4">
          <div class="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          <div>
            <p class="font-semibold text-gray-800">Menghubungkan ke {{ ssoTarget }}...</p>
            <p class="text-sm text-gray-500">Menyiapkan SSO token</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { dashboardService, gatewayService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import {
  ArrowPathIcon, InformationCircleIcon, ArrowTopRightOnSquareIcon,
  BookOpenIcon, ClipboardDocumentListIcon, ClipboardDocumentCheckIcon, MoonIcon,
  CalendarDaysIcon, AcademicCapIcon, GlobeAltIcon, ArchiveBoxIcon,
  Squares2X2Icon, BriefcaseIcon, UsersIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';

const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Application Hub' }]);

const apps          = ref([]);
const loading       = ref(false);
const healthLoading = ref(false);
const ssoLoading    = ref(false);
const ssoTarget     = ref('');
const healthStatus  = ref({});

const appIcons = {
  lms:          BookOpenIcon,
  jurnal:       ClipboardDocumentListIcon,
  piket:        ClipboardDocumentCheckIcon,
  sholat:       MoonIcon,
  kegiatan:     CalendarDaysIcon,
  kelulusan:    AcademicCapIcon,
  website:      GlobeAltIcon,
  inventaris:   ArchiveBoxIcon,
  perpustakaan: Squares2X2Icon,
  pkl:          BriefcaseIcon,
  alumni:       UsersIcon,
};
const getAppIcon = (id) => appIcons[id] || BookOpenIcon;

// Pisah apps aktif dan dalam pengembangan
const activeApps = computed(() => apps.value.filter(a => a.status !== 'development'));
const devApps    = computed(() => apps.value.filter(a => a.status === 'development'));

// Komponen AppCard
const AppCard = defineComponent({
  props: { app: Object, healthStatus: String },
  emits: ['open'],
  setup(props, { emit }) {
    const isOnline  = computed(() => props.healthStatus === 'online');
    const isOffline = computed(() => props.healthStatus === 'offline');
    const isUnknown = computed(() => !props.healthStatus);

    const canOpen = computed(() => !!props.app.url);

    const statusBadge = computed(() => {
      if (isOnline.value)  return { text: 'Online',      cls: 'badge-green' };
      if (isOffline.value) return { text: 'Offline',     cls: 'badge-red' };
      return                      { text: 'Belum Aktif', cls: 'badge-yellow' };
    });

    return () => h('div', {
      class: [
        'card p-5 transition-all duration-200 group relative',
        canOpen.value
          ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-primary-200'
          : 'opacity-70 cursor-default',
      ],
      onClick: () => canOpen.value && emit('open'),
    }, [
      // Top: icon + status
      h('div', { class: 'flex items-start justify-between mb-4' }, [
        h('div', {
          class: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm',
          style: { backgroundColor: props.app.color + '20', color: props.app.color },
        }, [
          h(getAppIcon(props.app.id), { class: 'w-6 h-6' }),
        ]),
        h('span', { class: `badge text-xs ${statusBadge.value.cls}` }, [
          h('span', { class: 'w-1.5 h-1.5 rounded-full inline-block mr-1', style: { backgroundColor: 'currentColor' } }),
          statusBadge.value.text,
        ]),
      ]),

      // Nama + deskripsi
      h('h3', { class: 'font-semibold text-gray-900 text-sm mb-1' }, props.app.label),
      h('p',  { class: 'text-xs text-gray-500 leading-relaxed' }, props.app.description),

      // Footer
      h('div', { class: 'mt-4 pt-3 border-t border-gray-50' },
        canOpen.value
          ? h('div', { class: 'flex items-center gap-1.5 text-xs text-primary-600 group-hover:text-primary-700' }, [
              h(ArrowTopRightOnSquareIcon, { class: 'w-3.5 h-3.5' }),
              h('span', { class: 'group-hover:underline' }, 'Buka dengan SSO'),
            ])
          : h('div', { class: 'flex items-center gap-1.5 text-xs text-gray-400' }, [
              h(ExclamationTriangleIcon, { class: 'w-3.5 h-3.5' }),
              h('span', 'URL belum dikonfigurasi di .env'),
            ])
      ),
    ]);
  },
});

const loadApps = async () => {
  loading.value = true;
  try {
    const res = await dashboardService.appHub();
    apps.value = res.data.data || [];
  } catch {
    notify.error('Gagal memuat daftar aplikasi');
  } finally {
    loading.value = false;
  }
};

// silent: jika true, tidak tampilkan notifikasi (untuk auto-load saat mount)
const loadHealth = async (silent = false) => {
  healthLoading.value = true;
  try {
    const res = await gatewayService.health();
    const integrations = res.data?.integrations || [];
    const newStatus = {};
    integrations.forEach(item => { newStatus[item.app] = item.status; });
    healthStatus.value = newStatus;

    // Notifikasi hanya saat klik manual
    if (!silent) {
      const online  = integrations.filter(i => i.status === 'online').length;
      const offline = integrations.filter(i => i.status === 'offline').length;
      if (online > 0 && offline === 0) notify.success(`Semua aplikasi online (${online})`);
      else if (online > 0) notify.success(`${online} online, ${offline} offline`);
      else notify.info('Belum ada aplikasi yang aktif');
    }
  } catch {
    if (!silent) notify.error('Gagal cek status aplikasi');
  } finally {
    healthLoading.value = false;
  }
};

const openApp = async (app) => {
  if (!app.url) {
    notify.warning(`URL ${app.label} belum dikonfigurasi di .env backend`);
    return;
  }

  ssoLoading.value = true;
  ssoTarget.value  = app.label;

  try {
    const res = await gatewayService.ssoToken(app.id);
    const { redirect_url } = res.data.data;
    // Buka di tab baru
    window.open(redirect_url, '_blank', 'noopener,noreferrer');
    notify.success(`Membuka ${app.label}...`);
  } catch {
    notify.error(`Gagal membuka ${app.label}. Pastikan aplikasi sudah berjalan.`);
  } finally {
    ssoLoading.value = false;
    ssoTarget.value  = '';
  }
};

onMounted(() => {
  // Load daftar app + langsung cek health secara silent (tanpa popup)
  loadApps();
  loadHealth(true);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
