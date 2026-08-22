<template>
  <div class="min-h-screen flex bg-white">

    <!-- ── Panel kiri: Branding (desktop only) ───────────────── -->
    <div class="hidden lg:flex lg:w-5/12 xl:w-[45%] flex-col relative overflow-hidden bg-slate-900">

      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 opacity-[0.03]"
        style="background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px;" />

      <!-- Subtle accent glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style="background: radial-gradient(circle, #818cf8 0%, transparent 70%); filter: blur(80px);" />

      <!-- ── Konten ────────────────────────────────────────────── -->
      <div class="relative flex flex-col h-full p-10 xl:p-14">

        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10 overflow-hidden">
            <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p class="text-sm font-semibold text-white tracking-wide">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
            <p class="text-[10px] text-white/30 tracking-widest uppercase">{{ settingsStore.get('app_subtitle') }}</p>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1 flex flex-col justify-center py-12 space-y-10">

          <!-- Headline -->
          <div class="space-y-4">
            <h1 class="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              {{ settingsStore.get('login_headline') || 'Satu Data.' }}<br />
              <span class="text-white/40">
                {{ settingsStore.get('login_headline2') || 'Satu Sistem.' }}
              </span>
            </h1>
            <p class="text-sm text-white/30 leading-relaxed max-w-sm">
              {{ settingsStore.get('login_description') || 'Kelola seluruh data akademik sekolah dalam satu platform terintegrasi.' }}
            </p>
          </div>

          <!-- Minimal stats -->
          <div class="flex gap-8">
            <div v-for="stat in stats" :key="stat.label">
              <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
              <p class="text-[11px] text-white/25 mt-1 uppercase tracking-wider">{{ stat.label }}</p>
            </div>
          </div>

          <!-- Feature list -->
          <div class="space-y-3">
            <div v-for="feat in features" :key="feat" class="flex items-center gap-3">
              <div class="w-1 h-1 rounded-full bg-indigo-400/50" />
              <span class="text-sm text-white/30">{{ feat }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-[11px] text-white/15">&copy; {{ year }} {{ settingsStore.get('school_name') || 'SMKN 1 Kras' }}</p>
      </div>
    </div>

    <!-- ── Panel kanan: Form login ────────────────────────────── -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white relative">

      <!-- Mobile logo -->
      <div class="lg:hidden flex items-center gap-3 mb-10">
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
          <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
          <AcademicCapIcon v-else class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="text-base font-bold text-slate-900 tracking-tight">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
          <p class="text-[11px] text-slate-400">{{ settingsStore.get('app_subtitle') }}</p>
        </div>
      </div>

      <div class="w-full max-w-sm">

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Masuk</h2>
          <p class="text-sm text-slate-400 mt-2">Masukkan kredensial Anda untuk melanjutkan</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5" novalidate>

          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon class="w-4 h-4 text-slate-300" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                :class="[
                  'w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 outline-none',
                  errors.username
                    ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white',
                ]"
                placeholder="username atau email"
                autocomplete="username"
                @input="errors.username = ''; authError = ''"
              />
            </div>
            <Transition name="err">
              <p v-if="errors.username" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon class="w-3.5 h-3.5" />
                {{ errors.username }}
              </p>
            </Transition>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon class="w-4 h-4 text-slate-300" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :class="[
                  'w-full pl-10 pr-11 py-3 text-sm rounded-xl border transition-all duration-200 outline-none',
                  errors.password
                    ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 bg-slate-50/50 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white',
                ]"
                placeholder="password"
                autocomplete="current-password"
                @input="errors.password = ''; authError = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
              >
                <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <Transition name="err">
              <p v-if="errors.password" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon class="w-3.5 h-3.5" />
                {{ errors.password }}
              </p>
            </Transition>
          </div>

          <!-- Error alert -->
          <Transition name="alert">
            <div
              v-if="authError"
              class="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100"
            >
              <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-600">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 text-sm font-semibold rounded-xl bg-slate-900 text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </span>
            <span v-else>Masuk</span>
          </button>
        </form>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-300 mt-8">
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
  'One Login, One Data, One Dashboard',
  'Real-time sinkronisasi antar aplikasi',
  'Akses semua modul dalam satu akun',
];

const stats = [
  { label: 'Modul', value: '12+' },
  { label: 'Aplikasi', value: '7+' },
  { label: 'Status', value: 'Online' },
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
