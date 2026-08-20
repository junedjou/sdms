<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengaturan Tampilan</h1>
        <p class="page-subtitle">Kustomisasi tampilan aplikasi SDMS sesuai identitas sekolah</p>
      </div>
      <button @click="saveAll" :disabled="saving" class="btn-primary gap-2">
        <span v-if="saving" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <CheckIcon v-else class="w-4 h-4" />
        {{ saving ? 'Menyimpan...' : 'Simpan Semua' }}
      </button>
    </div>

    <!-- Tab navigation -->
    <div class="flex gap-1 p-1 bg-slate-100/80 rounded-xl w-fit overflow-x-auto no-scrollbar">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
          activeTab === tab.id
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700',
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Tab: Branding ──────────────────────────────────── -->
    <div v-show="activeTab === 'branding'" class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

      <!-- Logo -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-sm font-bold text-slate-800">Logo Aplikasi</h2>
        </div>
        <div class="card-body space-y-4">
          <!-- Preview logo -->
          <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
              :style="{ background: form.sidebar_accent }">
              <img v-if="form.logo_url" :src="form.logo_url" class="w-full h-full object-contain" alt="Logo" />
              <AcademicCapIcon v-else class="w-9 h-9 text-white" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-800">{{ form.app_name || 'SDMS' }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ form.app_subtitle }}</p>
            </div>
          </div>

          <!-- Upload -->
          <div class="space-y-2">
            <label class="form-label">Upload Logo</label>
            <div class="flex items-center gap-3">
              <label class="btn-secondary btn-sm cursor-pointer gap-2">
                <PhotoIcon class="w-3.5 h-3.5" />
                Pilih File
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  class="hidden" @change="onLogoChange" />
              </label>
              <button v-if="form.logo_url" @click="removeLogo" class="btn-ghost btn-sm text-red-500 gap-1.5">
                <TrashIcon class="w-3.5 h-3.5" />
                Hapus Logo
              </button>
            </div>
            <p class="form-hint">Format: PNG, JPG, SVG, WebP. Maks 500KB. Rekomendasi ukuran: 128×128px.</p>
          </div>
        </div>
      </div>

      <!-- Nama & teks -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-sm font-bold text-slate-800">Identitas Aplikasi</h2>
        </div>
        <div class="card-body space-y-4">
          <div>
            <label class="form-label">Nama Aplikasi</label>
            <input v-model="form.app_name" type="text" class="form-input mt-1.5" placeholder="SDMS" />
          </div>
          <div>
            <label class="form-label">Sub-judul</label>
            <input v-model="form.app_subtitle" type="text" class="form-input mt-1.5"
              placeholder="School Data Management System" />
          </div>
          <div>
            <label class="form-label">Nama Sekolah</label>
            <input v-model="form.school_name" type="text" class="form-input mt-1.5"
              placeholder="SMK Negeri 1 Kras" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab: Sidebar ───────────────────────────────────── -->
    <div v-show="activeTab === 'sidebar'" class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

      <!-- Warna sidebar -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-sm font-bold text-slate-800">Warna Sidebar</h2>
        </div>
        <div class="card-body space-y-5">
          <ColorField v-model="form.sidebar_bg"     label="Background Sidebar" />
          <ColorField v-model="form.sidebar_accent" label="Warna Aksen / Menu Aktif" />
          <ColorField v-model="form.sidebar_text"   label="Warna Teks Menu" is-rgba />

          <!-- Preset tema -->
          <div>
            <p class="form-label mb-2">Preset Tema</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in sidebarPresets" :key="preset.name"
                @click="applyPreset(preset)"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:scale-105"
                :style="{ background: preset.bg, borderColor: preset.accent, color: '#fff' }"
              >
                <span class="w-3 h-3 rounded-full border-2 border-white/50" :style="{ background: preset.accent }" />
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview sidebar -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-sm font-bold text-slate-800">Preview Sidebar</h2>
        </div>
        <div class="card-body p-0 overflow-hidden rounded-b-2xl">
          <div class="w-full h-72 flex" :style="{ background: form.sidebar_bg }">
            <!-- Mini sidebar preview -->
            <div class="w-48 h-full flex flex-col p-3 gap-1">
              <!-- Logo -->
              <div class="flex items-center gap-2 px-2 py-3 mb-2 border-b" :style="{ borderColor: 'rgba(255,255,255,0.08)' }">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  :style="{ background: form.sidebar_accent }">
                  <AcademicCapIcon class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-xs font-bold text-white leading-none">{{ form.app_name || 'SDMS' }}</p>
                  <p class="text-[9px] leading-none mt-0.5" :style="{ color: form.sidebar_text }">School Data</p>
                </div>
              </div>
              <!-- Menu items preview -->
              <div v-for="item in previewMenuItems" :key="item.label"
                class="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all"
                :class="item.active ? 'text-white' : ''"
                :style="item.active
                  ? { background: form.sidebar_accent, color: 'white' }
                  : { color: form.sidebar_text }"
              >
                <component :is="item.icon" class="w-3.5 h-3.5 flex-shrink-0" />
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab: Login Panel ───────────────────────────────── -->
    <div v-show="activeTab === 'login'" class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

      <!-- Form teks login -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-sm font-bold text-slate-800">Teks Panel Login</h2>
        </div>
        <div class="card-body space-y-4">
          <div>
            <label class="form-label">Teks Badge</label>
            <input v-model="form.login_badge" type="text" class="form-input mt-1.5"
              placeholder="Platform Terpadu" />
          </div>
          <div>
            <label class="form-label">Headline Baris 1</label>
            <input v-model="form.login_headline" type="text" class="form-input mt-1.5"
              placeholder="Satu Data." />
          </div>
          <div>
            <label class="form-label">Headline Baris 2 (gradient)</label>
            <input v-model="form.login_headline2" type="text" class="form-input mt-1.5"
              placeholder="Satu Sistem." />
          </div>
          <div>
            <label class="form-label">Deskripsi</label>
            <textarea v-model="form.login_description" class="form-input mt-1.5" rows="3"
              placeholder="Kelola seluruh data akademik sekolah..." />
          </div>

          <div class="divider" />

          <div class="space-y-3">
            <p class="form-label">Warna Background Gradient</p>
            <ColorField v-model="form.login_bg_from" label="Warna Awal (kiri atas)" />
            <ColorField v-model="form.login_bg_mid"  label="Warna Tengah" />
            <ColorField v-model="form.login_bg_to"   label="Warna Akhir (kanan bawah)" />
          </div>
        </div>
      </div>

      <!-- Preview login panel -->
      <div class="card overflow-hidden">
        <div class="card-header">
          <h2 class="text-sm font-bold text-slate-800">Preview Panel Login</h2>
        </div>
        <div class="overflow-hidden rounded-b-2xl">
          <div class="relative h-80 flex flex-col justify-between p-6"
            :style="{ background: `linear-gradient(160deg, ${form.login_bg_from} 0%, ${form.login_bg_mid} 40%, ${form.login_bg_to} 100%)` }">

            <!-- Decorative blob -->
            <div class="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-20"
              style="background: radial-gradient(circle, #6366f1 0%, transparent 70%); filter: blur(30px); transform: translate(30%, -30%);" />

            <!-- Logo -->
            <div class="flex items-center gap-2.5 relative">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                :style="{ background: form.sidebar_accent }">
                <img v-if="form.logo_url" :src="form.logo_url" class="w-full h-full object-contain rounded-xl" />
                <AcademicCapIcon v-else class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ form.app_name || 'SDMS' }}</p>
                <p class="text-[10px] text-white/40">{{ form.app_subtitle }}</p>
              </div>
            </div>

            <!-- Headline -->
            <div class="relative space-y-2">
              <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                :style="{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }">
                <span class="w-1 h-1 rounded-full bg-indigo-400" />
                {{ form.login_badge }}
              </div>
              <h1 class="text-2xl font-black text-white leading-tight">
                {{ form.login_headline }}<br />
                <span style="background: linear-gradient(90deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
                  {{ form.login_headline2 }}
                </span>
              </h1>
              <p class="text-xs text-white/50 leading-relaxed max-w-xs">{{ form.login_description }}</p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between relative">
              <p class="text-[10px] text-white/20">&copy; {{ year }} {{ form.school_name }}</p>
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span class="text-[10px] text-white/30">Sistem Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import ColorField from '@/components/common/ColorField.vue';
import {
  CheckIcon, PhotoIcon, TrashIcon, AcademicCapIcon,
  HomeIcon, UserGroupIcon, Squares2X2Icon, Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

const settingsStore = useSettingsStore();
const uiStore       = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Sistem' }, { label: 'Pengaturan Tampilan' }]);

const activeTab = ref('branding');
const saving    = ref(false);
const year      = new Date().getFullYear();

// ── Tabs ─────────────────────────────────────────────────────
const tabs = [
  { id: 'branding', label: 'Branding',     icon: PhotoIcon },
  { id: 'sidebar',  label: 'Sidebar',      icon: Squares2X2Icon },
  { id: 'login',    label: 'Login Panel',  icon: HomeIcon },
];

// ── Form state — copy dari store ─────────────────────────────
const form = reactive({
  app_name:          '',
  app_subtitle:      '',
  school_name:       '',
  logo_url:          '',
  sidebar_bg:        '',
  sidebar_accent:    '',
  sidebar_text:      '',
  login_bg_from:     '',
  login_bg_mid:      '',
  login_bg_to:       '',
  login_headline:    '',
  login_headline2:   '',
  login_description: '',
  login_badge:       '',
});

const syncForm = () => {
  Object.keys(form).forEach(k => {
    form[k] = settingsStore.get(k);
  });
};

onMounted(async () => {
  if (!settingsStore.items.length) await settingsStore.load();
  syncForm();
});

// ── Preset tema sidebar ───────────────────────────────────────
const sidebarPresets = [
  { name: 'Dark Navy',  bg: '#0f172a', accent: '#6366f1', text: 'rgba(255,255,255,0.7)' },
  { name: 'Dark Green', bg: '#0d1f1a', accent: '#10b981', text: 'rgba(255,255,255,0.7)' },
  { name: 'Dark Blue',  bg: '#0c1a2e', accent: '#3b82f6', text: 'rgba(255,255,255,0.7)' },
  { name: 'Dark Rose',  bg: '#1a0d12', accent: '#f43f5e', text: 'rgba(255,255,255,0.7)' },
  { name: 'Charcoal',   bg: '#1c1c1e', accent: '#f59e0b', text: 'rgba(255,255,255,0.65)' },
  { name: 'Forest',     bg: '#0f2017', accent: '#22c55e', text: 'rgba(255,255,255,0.65)' },
];

const applyPreset = (preset) => {
  form.sidebar_bg     = preset.bg;
  form.sidebar_accent = preset.accent;
  form.sidebar_text   = preset.text;
};

// ── Preview sidebar menu items ────────────────────────────────
const previewMenuItems = [
  { label: 'Dashboard',  icon: HomeIcon,       active: true },
  { label: 'Data Guru',  icon: UserGroupIcon,  active: false },
  { label: 'App Hub',    icon: Squares2X2Icon, active: false },
  { label: 'Pengaturan', icon: Cog6ToothIcon,  active: false },
];

// ── Upload logo ───────────────────────────────────────────────
const onLogoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const result = await settingsStore.uploadLogo(file);
  if (result.success) {
    form.logo_url = result.logo_url;
    notify.success('Logo berhasil diupload');
  } else {
    notify.error(result.message || 'Gagal upload logo');
  }
};

const removeLogo = async () => {
  const result = await settingsStore.deleteLogo();
  if (result.success) {
    form.logo_url = '';
    notify.success('Logo dihapus');
  } else {
    notify.error(result.message);
  }
};

// ── Save semua ────────────────────────────────────────────────
const saveAll = async () => {
  saving.value = true;
  // logo_url tidak perlu disave via PUT (sudah via POST /logo)
  const { logo_url, ...patch } = { ...form };
  const result = await settingsStore.save(patch);
  saving.value = false;
  if (result.success) {
    notify.success('Pengaturan berhasil disimpan dan diterapkan');
  } else {
    notify.error(result.message);
  }
};
</script>

<!-- ── Komponen lokal: ColorField ─────────────────────────────
     Input warna dengan preview dan input hex/rgba
-->
<script>
// ColorField sebagai komponen inline terpisah
</script>
