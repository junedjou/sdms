<template>
  <div class="min-h-screen flex">

    <!-- ── Panel kiri: Branding (desktop only) ───────────────── -->
    <div
      class="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col relative overflow-hidden"
      :style="{ background: settingsStore.loginBg }"
    >
      <!-- ── Latar dekoratif ──────────────────────────────────── -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- Blob ungu besar kanan atas -->
        <div class="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-20"
          style="background: radial-gradient(circle, #6366f1 0%, transparent 70%); filter: blur(40px);" />
        <!-- Blob biru kiri bawah -->
        <div class="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full opacity-15"
          style="background: radial-gradient(circle, #3b82f6 0%, transparent 70%); filter: blur(50px);" />
        <!-- Blob violet tengah -->
        <div class="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"
          style="background: radial-gradient(circle, #a855f7 0%, transparent 70%); filter: blur(60px);" />

        <!-- Grid dot pattern -->
        <div class="absolute inset-0 opacity-[0.04]"
          style="background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 28px 28px;" />

        <!-- Garis diagonal dekoratif -->
        <div class="absolute top-0 right-0 w-px h-full opacity-10"
          style="background: linear-gradient(180deg, transparent, #6366f1, transparent);" />
      </div>

      <!-- ── Konten utama ──────────────────────────────────────── -->
      <div class="relative flex flex-col h-full p-10">

        <!-- Logo -->
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/60 flex-shrink-0 overflow-hidden"
            :style="{ background: settingsStore.get('sidebar_accent') }">
            <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-base font-bold text-white tracking-wide">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
            <p class="text-[11px] text-white/40 tracking-wider uppercase">{{ settingsStore.get('app_subtitle') }}</p>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1 flex flex-col justify-center py-8 space-y-8">

          <!-- Badge -->
          <div class="inline-flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style="background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.3);">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span class="text-xs font-semibold text-indigo-300 tracking-widest uppercase">{{ settingsStore.get('login_badge') }}</span>
          </div>

          <!-- Headline -->
          <div class="space-y-3">
            <h1 class="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {{ settingsStore.get('login_headline') }}<br />
              <span style="background: linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #60a5fa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                {{ settingsStore.get('login_headline2') }}
              </span>
            </h1>
            <p class="text-sm text-white/50 leading-relaxed max-w-xs">
              {{ settingsStore.get('login_description') }}
            </p>
          </div>

          <!-- Stats cards -->
          <div class="grid grid-cols-3 gap-3">
            <div v-for="stat in stats" :key="stat.label"
              class="rounded-2xl p-3.5 border flex flex-col gap-1.5"
              style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);">
              <component :is="stat.icon" class="w-4 h-4 text-indigo-400" />
              <p class="text-xl font-black text-white leading-none">{{ stat.value }}</p>
              <p class="text-[10px] text-white/40 font-medium uppercase tracking-wider leading-none">{{ stat.label }}</p>
            </div>
          </div>

          <!-- Feature pills -->
          <div class="flex flex-wrap gap-2">
            <div v-for="feat in features" :key="feat.label"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-white/60 hover:text-white/90 transition-colors"
              style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);">
              <component :is="feat.icon" class="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span class="text-xs font-medium">{{ feat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <p class="text-[11px] text-white/20">&copy; {{ year }} {{ settingsStore.get('school_name') || 'SDMS' }}</p>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-[11px] text-white/30">Sistem Aktif</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Panel kanan: Form login ────────────────────────────── -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-surface-50 relative">
      <!-- Mobile logo -->
      <div class="lg:hidden flex items-center gap-3 mb-10">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
          <AcademicCapIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-lg font-bold text-slate-900">SDMS</p>
          <p class="text-xs text-slate-400">School Data Management</p>
        </div>
      </div>

      <div class="w-full max-w-sm animate-slide-up">

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Selamat datang</h2>
          <p class="text-sm text-slate-500 mt-1.5">Masuk ke akun SDMS Anda untuk melanjutkan</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5" novalidate>

          <!-- Username -->
          <div>
            <label for="username" class="form-label">Username atau Email</label>
            <div class="relative mt-1.5">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon class="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                :class="[
                  'form-input pl-10',
                  errors.username ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-red-50/30' : '',
                ]"
                placeholder="Masukkan username atau email"
                autocomplete="username"
                @input="errors.username = ''"
              />
            </div>
            <Transition name="err">
              <p v-if="errors.username" class="form-error">
                <ExclamationCircleIcon class="w-3.5 h-3.5" />
                {{ errors.username }}
              </p>
            </Transition>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="form-label">Password</label>
            <div class="relative mt-1.5">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon class="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :class="[
                  'form-input pl-10 pr-11',
                  errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-red-50/30' : '',
                ]"
                placeholder="Masukkan password"
                autocomplete="current-password"
                @input="errors.password = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              >
                <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <Transition name="err">
              <p v-if="errors.password" class="form-error">
                <ExclamationCircleIcon class="w-3.5 h-3.5" />
                {{ errors.password }}
              </p>
            </Transition>
          </div>

          <!-- Alert error -->
          <Transition name="alert">
            <div
              v-if="authError"
              class="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200/70"
              role="alert"
            >
              <ExclamationCircleIcon class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-700 leading-snug">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full py-3 text-sm font-semibold rounded-xl shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </span>
            <span v-else class="flex items-center gap-2">
              <ArrowRightOnRectangleIcon class="w-4 h-4" />
              Masuk ke Sistem
            </span>
          </button>
        </form>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 mt-8">
          Hubungi administrator jika mengalami kendala akses.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import {
  AcademicCapIcon, UserIcon, LockClosedIcon,
  EyeIcon, EyeSlashIcon, ExclamationCircleIcon,
  ArrowRightOnRectangleIcon, ArrowPathIcon,
  CheckCircleIcon, ShieldCheckIcon, CircleStackIcon,
  Squares2X2Icon, RectangleStackIcon,
} from '@heroicons/vue/24/outline';

const authStore     = useAuthStore();
const settingsStore = useSettingsStore();
const router        = useRouter();
const route         = useRoute();

const form         = ref({ username: '', password: '' });
const errors       = ref({ username: '', password: '' });
const showPassword = ref(false);
const loading      = ref(false);
const authError    = ref('');
const year         = new Date().getFullYear();

const features = [
  { label: 'One Login',      icon: ShieldCheckIcon },
  { label: 'One Data',       icon: CircleStackIcon },
  { label: 'One Dashboard',  icon: CheckCircleIcon },
];

const stats = [
  { label: 'Aplikasi',  value: '7+',   icon: Squares2X2Icon },
  { label: 'Modul',     value: '12+',  icon: RectangleStackIcon },
  { label: 'Real-time', value: 'Sync', icon: ArrowPathIcon },
];

const validate = () => {
  errors.value = { username: '', password: '' };
  let valid = true;
  if (!form.value.username.trim()) {
    errors.value.username = 'Username wajib diisi';
    valid = false;
  }
  if (!form.value.password) {
    errors.value.password = 'Password wajib diisi';
    valid = false;
  }
  return valid;
};

const handleLogin = async () => {
  authError.value = '';
  if (!validate()) return;

  loading.value = true;
  const result = await authStore.login(form.value);
  loading.value = false;

  if (result.success) {
    const redirect = route.query.redirect || '/dashboard';
    await router.replace(redirect);
  } else {
    authError.value = result.message || 'Login gagal. Periksa username dan password Anda.';
    form.value.password = '';
  }
};
</script>

<style scoped>
.err-enter-active, .err-leave-active    { transition: all 0.18s ease; }
.err-enter-from, .err-leave-to          { opacity: 0; transform: translateY(-4px); }

.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to       { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
