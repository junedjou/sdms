<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Page header ───────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title text-2xl">Executive Dashboard</h1>
        <p class="page-subtitle">
          {{ masterStore.tahunAktif?.nama
            ? `Tahun Pelajaran ${masterStore.tahunAktif.nama}`
            : 'Tahun pelajaran belum diset' }}
        </p>
      </div>
      <button @click="loadAll" class="btn-secondary btn-sm" :disabled="loading">
        <ArrowPathIcon class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" />
        Refresh
      </button>
    </div>

    <!-- ── Stat cards — warm gradient icons ────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        v-for="card in statCards"
        :key="card.label"
        v-bind="card"
        :loading="statsLoading"
      />
    </div>

    <!-- ── Row 2: Bar chart + Agenda ─────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Siswa per Jurusan -->
      <div class="lg:col-span-2 card overflow-hidden">
        <div class="card-header">
          <div>
            <h2 class="text-sm font-bold text-slate-700">Siswa per Jurusan</h2>
            <p class="text-xs text-slate-400 mt-0.5">Distribusi berdasarkan jurusan aktif</p>
          </div>
          <span class="badge-indigo">{{ stats?.siswa ?? 0 }} Total Siswa</span>
        </div>
        <div class="card-body">
          <div v-if="summaryLoading" class="h-56 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3 text-slate-400">
              <svg class="w-6 h-6 animate-spin text-primary-400" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span class="text-xs">Memuat data...</span>
            </div>
          </div>
          <Bar
            v-else-if="barChartData.labels.length"
            :data="barChartData"
            :options="barOptions"
            class="max-h-56"
          />
          <BaseEmpty v-else title="Belum ada data jurusan" />
        </div>
      </div>

      <!-- Agenda -->
      <div class="card flex flex-col overflow-hidden">
        <div class="card-header">
          <div>
            <h2 class="text-sm font-bold text-slate-700">Agenda Terdekat</h2>
            <p class="text-xs text-slate-400 mt-0.5">30 hari ke depan</p>
          </div>
          <RouterLink
            to="/master/kalender"
            class="text-xs font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-colors"
          >
            Lihat semua
          </RouterLink>
        </div>

        <!-- Loading -->
        <div v-if="agendaLoading" class="card-body space-y-2">
          <div v-for="i in 4" :key="i" class="h-12 skeleton rounded-xl" />
        </div>

        <!-- Items -->
        <div v-else-if="agenda.length" class="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50/80">
          <div
            v-for="item in agenda"
            :key="item.id"
            class="px-5 py-3.5 flex items-start gap-3 hover:bg-primary-50/20 transition-colors cursor-default"
          >
            <div
              class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-offset-1"
              :style="{
                backgroundColor: item.warna || jenisColor[item.jenis] || '#94a3b8',
                ringColor: (item.warna || jenisColor[item.jenis] || '#94a3b8') + '25',
              }"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-700 truncate">{{ item.judul }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <CalendarDaysIcon class="w-3 h-3 text-slate-400" />
                <p class="text-xs text-slate-400">{{ formatDate(item.tanggal_mulai) }}</p>
              </div>
            </div>
          </div>
        </div>

        <BaseEmpty v-else title="Tidak ada agenda" subtitle="dalam 30 hari ke depan" class="py-12" />
      </div>
    </div>

    <!-- ── Row 3: Doughnut charts + Quick links ───────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

      <!-- Siswa per JK -->
      <div class="card overflow-hidden">
        <div class="card-header">
          <div>
            <h2 class="text-sm font-bold text-slate-700">Jenis Kelamin Siswa</h2>
            <p class="text-xs text-slate-400 mt-0.5">Rasio laki-laki / perempuan</p>
          </div>
        </div>
        <div class="card-body flex items-center justify-center py-6">
          <div v-if="summaryLoading" class="w-8 h-8 rounded-full border-2 border-slate-200 border-t-primary-400 animate-spin" />
          <Doughnut
            v-else-if="jkChartData.labels.length"
            :data="jkChartData"
            :options="doughnutOptions"
            class="max-h-44"
          />
          <BaseEmpty v-else title="Belum ada data" class="py-8" />
        </div>
      </div>

      <!-- Guru per Status -->
      <div class="card overflow-hidden">
        <div class="card-header">
          <div>
            <h2 class="text-sm font-bold text-slate-700">Status Guru</h2>
            <p class="text-xs text-slate-400 mt-0.5">Per status kepegawaian</p>
          </div>
        </div>
        <div class="card-body flex items-center justify-center py-6">
          <div v-if="summaryLoading" class="w-8 h-8 rounded-full border-2 border-slate-200 border-t-primary-400 animate-spin" />
          <Doughnut
            v-else-if="guruStatusData.labels.length"
            :data="guruStatusData"
            :options="doughnutOptions"
            class="max-h-44"
          />
          <BaseEmpty v-else title="Belum ada data" class="py-8" />
        </div>
      </div>

      <!-- Quick access — warm colorful -->
      <div class="card overflow-hidden">
        <div class="card-header">
          <div>
            <h2 class="text-sm font-bold text-slate-700">Akses Cepat</h2>
            <p class="text-xs text-slate-400 mt-0.5">Menu yang sering digunakan</p>
          </div>
        </div>
        <div class="card-body grid grid-cols-2 gap-2.5 p-3.5">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex flex-col items-center gap-2.5 p-4 rounded-2xl hover:scale-[1.03] hover:shadow-md transition-all duration-200 group"
            :style="{ backgroundColor: link.color + '0a' }"
          >
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
              :style="{ backgroundColor: link.color + '15' }"
            >
              <component :is="link.icon" class="w-5 h-5 transition-colors" :style="{ color: link.color }" />
            </div>
            <span class="text-xs font-semibold text-slate-600 text-center leading-tight">{{ link.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title,
} from 'chart.js';
import { dashboardService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store';
import { useMasterStore } from '@/stores/master.store';
import { formatDate } from '@/utils/helpers';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import {
  ArrowPathIcon, UserGroupIcon, AcademicCapIcon, BriefcaseIcon,
  RectangleStackIcon, BookOpenIcon, CalendarDaysIcon,
} from '@heroicons/vue/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const uiStore     = useUIStore();
const masterStore = useMasterStore();
uiStore.setBreadcrumbs([{ label: 'Dashboard' }]);

const stats          = ref(null);
const summary        = ref(null);
const agenda         = ref([]);
const loading        = ref(false);
const statsLoading   = ref(true);
const summaryLoading = ref(true);
const agendaLoading  = ref(true);

const jenisColor = {
  libur:      '#f43f5e',
  ujian:      '#f59e0b',
  kegiatan:   '#6366f1',
  penerimaan: '#10b981',
  lainnya:    '#a78bfa',
};

// ── Stat cards — warm gradient backgrounds ────────────────────
const statCards = computed(() => [
  {
    label: 'Total Guru',    value: stats.value?.guru,
    icon: UserGroupIcon,      color: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50',    iconColor: 'text-indigo-500',
    trend: 'Tenaga pendidik aktif',
  },
  {
    label: 'Total Siswa',   value: stats.value?.siswa,
    icon: AcademicCapIcon,    color: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',     iconColor: 'text-emerald-500',
    trend: 'Peserta didik aktif',
  },
  {
    label: 'Total Pegawai', value: stats.value?.pegawai,
    icon: BriefcaseIcon,      color: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50',    iconColor: 'text-amber-500',
    trend: 'Tenaga kependidikan',
  },
  {
    label: 'Total Kelas',   value: stats.value?.kelas,
    icon: RectangleStackIcon, color: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50', iconColor: 'text-violet-500',
    trend: stats.value?.tahun_pelajaran || '—',
  },
]);

// ── Chart configs — warm bright palette ──────────────────────
const chartColors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#22d3ee', '#f472b6', '#a3e635'];
const chartColorsBg = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#06b6d4', '#ec4899', '#84cc16'];

const barChartData = computed(() => {
  const items = summary.value?.siswa_per_jurusan || [];
  return {
    labels: items.map((i) => i.kode || i.jurusan),
    datasets: [{
      label: 'Jumlah Siswa',
      data: items.map((i) => i.total),
      backgroundColor: chartColors.map(c => c + 'cc'),
      hoverBackgroundColor: chartColorsBg,
      borderRadius: 10,
      borderWidth: 0,
      borderSkipped: false,
    }],
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#475569',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 14,
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 4,
      bodyFont: { weight: '600' },
      callbacks: { label: (ctx) => ` ${ctx.raw} siswa` },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f8fafc', drawBorder: false },
      ticks: { font: { size: 11, weight: '500' }, color: '#94a3b8' },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11, weight: '500' }, color: '#94a3b8' },
    },
  },
};

const jkChartData = computed(() => {
  const items = summary.value?.siswa_per_jk || [];
  return {
    labels: items.map((i) => i.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'),
    datasets: [{ data: items.map((i) => i.total), backgroundColor: ['#818cf8', '#f472b6'], borderWidth: 0, hoverOffset: 8 }],
  };
});

const guruStatusData = computed(() => {
  const items = summary.value?.guru_per_status || [];
  return {
    labels: items.map((i) => i.status),
    datasets: [{ data: items.map((i) => i.total), backgroundColor: chartColors, borderWidth: 0, hoverOffset: 8 }],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 11, weight: '500' }, boxWidth: 10, padding: 14, color: '#64748b', usePointStyle: true },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#475569',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 14,
      cornerRadius: 12,
      bodyFont: { weight: '600' },
    },
  },
};

// ── Quick links — warm colorful ──────────────────────────────
const quickLinks = [
  { label: 'Data Guru',   to: '/master/guru',   icon: UserGroupIcon,      color: '#6366f1' },
  { label: 'Data Siswa',  to: '/master/siswa',  icon: AcademicCapIcon,    color: '#10b981' },
  { label: 'Data Kelas',  to: '/master/kelas',  icon: RectangleStackIcon, color: '#f59e0b' },
  { label: 'App Hub',     to: '/app-hub',        icon: BookOpenIcon,       color: '#a78bfa' },
];

// ── Data loading ─────────────────────────────────────────────
const loadStats = async () => {
  statsLoading.value = true;
  try   { stats.value = (await dashboardService.stats()).data.data; }
  finally { statsLoading.value = false; }
};

const loadSummary = async () => {
  summaryLoading.value = true;
  try   { summary.value = (await dashboardService.summary()).data.data; }
  finally { summaryLoading.value = false; }
};

const loadAgenda = async () => {
  agendaLoading.value = true;
  try   { agenda.value = (await dashboardService.agenda()).data.data || []; }
  finally { agendaLoading.value = false; }
};

const loadAll = async () => {
  loading.value = true;
  await Promise.all([loadStats(), loadSummary(), loadAgenda()]);
  loading.value = false;
};

onMounted(loadAll);
</script>
