<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-4">

    <!-- Card utama -->
    <div class="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[540px]">

      <!-- ── Panel kiri: Branding ──────────────────────────────── -->
      <div class="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-10"
        style="background: linear-gradient(145deg, #1e40af 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%);">

        <!-- Blob dekoratif -->
        <div class="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-20"
          style="background: radial-gradient(circle, #93c5fd, transparent 70%);" />
        <div class="absolute top-10 -right-16 w-56 h-56 rounded-full opacity-10"
          style="background: radial-gradient(circle, #bfdbfe, transparent 70%);" />
        <div class="absolute bottom-32 right-10 w-32 h-32 rounded-full opacity-15"
          style="background: radial-gradient(circle, #60a5fa, transparent 70%);" />
        <div class="absolute top-1/2 left-1/3 w-20 h-20 rounded-full opacity-10"
          style="background: radial-gradient(circle, #e0f2fe, transparent 70%);" />

        <!-- Logo & nama app -->
        <div class="relative flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20 overflow-hidden flex-shrink-0">
            <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-sm font-bold text-white tracking-wide">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
            <p class="text-[10px] text-blue-200/70 tracking-widest uppercase">{{ settingsStore.get('app_subtitle') || 'School Data Management' }}</p>
          </div>
        </div>

        <!-- Ilustrasi tengah -->
        <div class="relative flex-1 flex flex-col justify-center items-start py-8 space-y-6">
          <!-- Gambar ilustrasi SVG sekolah -->
          <div class="w-full flex justify-center">
            <svg viewBox="0 0 320 200" class="w-64 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
              <!-- Meja / counter -->
              <rect x="40" y="120" width="240" height="60" rx="8" fill="rgba(255,255,255,0.15)" />
              <rect x="50" y="110" width="220" height="18" rx="6" fill="rgba(255,255,255,0.25)" />
              <!-- Layar komputer -->
              <rect x="110" y="75" width="80" height="50" rx="6" fill="rgba(255,255,255,0.2)" />
              <rect x="116" y="81" width="68" height="36" rx="3" fill="rgba(147,197,253,0.4)" />
              <rect x="142" y="125" width="16" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
              <!-- Orang 1 (kiri, bawa tas) -->
              <circle cx="75" cy="75" r="14" fill="rgba(255,255,255,0.85)" />
              <rect x="62" y="92" width="26" height="32" rx="8" fill="#f59e0b" />
              <rect x="55" y="92" width="10" height="24" rx="5" fill="#f59e0b" />
              <rect x="83" y="92" width="10" height="24" rx="5" fill="#f59e0b" />
              <rect x="65" y="124" width="10" height="20" rx="5" fill="#1e3a8a" />
              <rect x="78" y="124" width="10" height="20" rx="5" fill="#1e3a8a" />
              <!-- Tas di tangan kiri -->
              <rect x="44" y="105" width="14" height="18" rx="4" fill="#fbbf24" />
              <!-- Orang 2 (kanan, di balik meja) -->
              <circle cx="215" cy="72" r="13" fill="rgba(255,255,255,0.85)" />
              <rect x="203" y="88" width="24" height="28" rx="8" fill="#818cf8" />
              <!-- Tanaman pojok -->
              <rect x="260" y="90" width="10" height="40" rx="5" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="260" cy="80" rx="16" ry="18" fill="rgba(134,239,172,0.6)" />
              <ellipse cx="248" cy="90" rx="10" ry="12" fill="rgba(74,222,128,0.5)" />
              <ellipse cx="272" cy="88" rx="10" ry="12" fill="rgba(74,222,128,0.5)" />
              <!-- Pot -->
              <rect x="253" y="128" width="14" height="10" rx="3" fill="rgba(253,186,116,0.7)" />
              <!-- Bintik dekorasi -->
              <circle cx="150" cy="55" r="3" fill="rgba(255,255,255,0.3)" />
              <circle cx="170" cy="45" r="2" fill="rgba(255,255,255,0.2)" />
              <circle cx="135" cy="48" r="2" fill="rgba(255,255,255,0.25)" />
              <circle cx="95" cy="55" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="240" cy="55" r="3" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>

          <!-- Teks -->
          <div class="space-y-2">
            <h1 class="text-3xl font-bold text-white leading-tight">
              {{ settingsStore.get('login_headline') || 'Selamat Datang' }}
            </h1>
            <p class="text-sm text-blue-100/70 leading-relaxed max-w-xs">
              {{ settingsStore.get('login_description') || 'Kelola seluruh data akademik sekolah dalam satu platform terintegrasi.' }}
            </p>
          </div>

          <!-- Stats kecil -->
          <div class="flex gap-6 pt-2">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <p class="text-xl font-bold text-white">{{ stat.value }}</p>
              <p class="text-[10px] text-blue-200/60 uppercase tracking-wider mt-0.5">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <!-- Footer kiri -->
        <p class="relative text-[11px] text-blue-200/40">&copy; {{ year }} {{ settingsStore.get('school_name') || 'SMKN 1 Kras' }}</p>
      </div>

      <!-- ── Panel kanan: Form ─────────────────────────────────── -->
      <div class="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">

        <!-- Mobile logo -->
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center overflow-hidden">
            <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-base font-bold text-slate-900">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
            <p class="text-[11px] text-slate-400">{{ settingsStore.get('app_subtitle') }}</p>
          </div>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Masuk ke Akun</h2>
          <p class="text-sm text-slate-400 mt-1.5">Masukkan username dan password untuk melanjutkan</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>

          <!-- Username -->
          <div>
            <label for="username" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon class="w-4 h-4 text-slate-300" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                :class="[
                  'w-full pl-11 pr-10 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                  errors.username
                    ? 'border-red-300 focus:border-red-400 focus:bg-red-50/30'
                    : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100',
                ]"
                placeholder="Masukkan username"
                autocomplete="username"
                @input="errors.username = ''; authError = ''"
              />
              <Transition name="check">
                <div v-if="form.username && !errors.username" class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </Transition>
            </div>
            <Transition name="err">
              <p v-if="errors.username" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.username }}
              </p>
            </Transition>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockClosedIcon class="w-4 h-4 text-slate-300" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :class="[
                  'w-full pl-11 pr-11 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                  errors.password
                    ? 'border-red-300 focus:border-red-400 focus:bg-red-50/30'
                    : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100',
                ]"
                placeholder="Masukkan password"
                autocomplete="current-password"
                @input="errors.password = ''; authError = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                tabindex="-1"
              >
                <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <Transition name="err">
              <p v-if="errors.password" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.password }}
              </p>
            </Transition>
          </div>

          <!-- Error alert -->
          <Transition name="alert">
            <div v-if="authError" class="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-100">
              <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-600">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 text-sm font-bold rounded-2xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 relative overflow-hidden group"
            style="background: linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6);"
          >
            <!-- Shine effect -->
            <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span v-if="loading" class="relative flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </span>
            <span v-else class="relative">Masuk Sekarang</span>
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
.err-enter-active, .err-leave-active     { transition: all 0.18s ease; }
.err-enter-from, .err-leave-to           { opacity: 0; transform: translateY(-4px); }

.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to       { opacity: 0; transform: translateY(-6px) scale(0.98); }

.check-enter-active, .check-leave-active { transition: all 0.2s ease; }
.check-enter-from, .check-leave-to       { opacity: 0; transform: scale(0.5); }
</style>
