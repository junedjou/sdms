<template>
  <div class="min-h-screen flex">

    <!-- ── Panel kiri: Branding (desktop only) ───────────────── -->
    <div
      class="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col relative overflow-hidden"
      style="background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);"
    >
      <!-- Decorative blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/3 translate-x-1/3 rounded-full"
          style="background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);" />
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] translate-y-1/3 -translate-x-1/4 rounded-full"
          style="background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);" />
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-[0.03]"
          style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 40px 40px;" />
      </div>

      <!-- Content -->
      <div class="relative flex flex-col justify-between h-full p-10">
        <!-- Logo area -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-900/50">
            <AcademicCapIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-lg font-bold text-white tracking-tight">SDMS</p>
            <p class="text-xs text-white/40">School Data Management</p>
          </div>
        </div>

        <!-- Main headline -->
        <div class="space-y-6">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/20 border border-primary-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              <span class="text-xs font-semibold text-primary-300 tracking-wide">Platform Terpadu</span>
            </div>
            <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Satu Data,<br />
              <span class="text-transparent bg-clip-text" style="background: linear-gradient(90deg, #818cf8, #a78bfa);">
                Satu Sistem
              </span>
            </h1>
            <p class="text-base text-white/50 leading-relaxed max-w-sm">
              Kelola data guru, siswa, pegawai, dan seluruh administrasi sekolah dalam satu platform terintegrasi.
            </p>
          </div>

          <!-- Feature pills -->
          <div class="flex flex-wrap gap-2">
            <div
              v-for="feat in features"
              :key="feat.label"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70"
            >
              <component :is="feat.icon" class="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
              <span class="text-xs font-medium">{{ feat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Footer note -->
        <p class="text-xs text-white/20">
          &copy; {{ year }} SDMS — Hak cipta dilindungi
        </p>
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
import {
  AcademicCapIcon, UserIcon, LockClosedIcon,
  EyeIcon, EyeSlashIcon, ExclamationCircleIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon, ShieldCheckIcon, CircleStackIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const router    = useRouter();
const route     = useRoute();

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
