<template>
  <!-- Template 1: Modern Blue — Split layout dengan ilustrasi SVG -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-4">
    <div class="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[540px]">

      <!-- Panel kiri: Branding -->
      <div class="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-10"
        style="background: linear-gradient(145deg, #1e40af 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%);">
        <div class="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-20"
          style="background: radial-gradient(circle, #93c5fd, transparent 70%);" />
        <div class="absolute top-10 -right-16 w-56 h-56 rounded-full opacity-10"
          style="background: radial-gradient(circle, #bfdbfe, transparent 70%);" />
        <div class="absolute bottom-32 right-10 w-32 h-32 rounded-full opacity-15"
          style="background: radial-gradient(circle, #60a5fa, transparent 70%);" />

        <!-- Logo -->
        <div class="relative flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20 overflow-hidden flex-shrink-0">
            <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-sm font-bold text-white tracking-wide">{{ appName }}</p>
            <p class="text-[10px] text-blue-200/70 tracking-widest uppercase">{{ appSubtitle }}</p>
          </div>
        </div>

        <!-- Ilustrasi -->
        <div class="relative flex-1 flex flex-col justify-center items-start py-8 space-y-6">
          <div class="w-full flex justify-center">
            <svg viewBox="0 0 320 200" class="w-64 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="120" width="240" height="60" rx="8" fill="rgba(255,255,255,0.15)" />
              <rect x="50" y="110" width="220" height="18" rx="6" fill="rgba(255,255,255,0.25)" />
              <rect x="110" y="75" width="80" height="50" rx="6" fill="rgba(255,255,255,0.2)" />
              <rect x="116" y="81" width="68" height="36" rx="3" fill="rgba(147,197,253,0.4)" />
              <rect x="142" y="125" width="16" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
              <circle cx="75" cy="75" r="14" fill="rgba(255,255,255,0.85)" />
              <rect x="62" y="92" width="26" height="32" rx="8" fill="#f59e0b" />
              <rect x="55" y="92" width="10" height="24" rx="5" fill="#f59e0b" />
              <rect x="83" y="92" width="10" height="24" rx="5" fill="#f59e0b" />
              <rect x="65" y="124" width="10" height="20" rx="5" fill="#1e3a8a" />
              <rect x="78" y="124" width="10" height="20" rx="5" fill="#1e3a8a" />
              <rect x="44" y="105" width="14" height="18" rx="4" fill="#fbbf24" />
              <circle cx="215" cy="72" r="13" fill="rgba(255,255,255,0.85)" />
              <rect x="203" y="88" width="24" height="28" rx="8" fill="#818cf8" />
              <rect x="260" y="90" width="10" height="40" rx="5" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="260" cy="80" rx="16" ry="18" fill="rgba(134,239,172,0.6)" />
              <ellipse cx="248" cy="90" rx="10" ry="12" fill="rgba(74,222,128,0.5)" />
              <ellipse cx="272" cy="88" rx="10" ry="12" fill="rgba(74,222,128,0.5)" />
              <rect x="253" y="128" width="14" height="10" rx="3" fill="rgba(253,186,116,0.7)" />
              <circle cx="150" cy="55" r="3" fill="rgba(255,255,255,0.3)" />
              <circle cx="170" cy="45" r="2" fill="rgba(255,255,255,0.2)" />
              <circle cx="135" cy="48" r="2" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
          <div class="space-y-2">
            <h1 class="text-3xl font-bold text-white leading-tight">{{ headline }}</h1>
            <p class="text-sm text-blue-100/70 leading-relaxed max-w-xs">{{ description }}</p>
          </div>
          <div class="flex gap-6 pt-2">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <p class="text-xl font-bold text-white">{{ stat.value }}</p>
              <p class="text-[10px] text-blue-200/60 uppercase tracking-wider mt-0.5">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <p class="relative text-[11px] text-blue-200/40">&copy; {{ year }} {{ schoolName }}</p>
      </div>

      <!-- Panel kanan: Form -->
      <div class="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center overflow-hidden">
            <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-base font-bold text-slate-900">{{ appName }}</p>
            <p class="text-[11px] text-slate-400">{{ appSubtitle }}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Masuk ke Akun</h2>
          <p class="text-sm text-slate-400 mt-1.5">Masukkan username dan password untuk melanjutkan</p>
        </div>

        <form @submit.prevent="$emit('submit', form)" class="space-y-4" novalidate>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon class="w-4 h-4 text-slate-300" />
              </div>
              <input v-model="form.username" type="text"
                :class="['w-full pl-11 pr-10 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                  errors.username ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100']"
                placeholder="Masukkan username" autocomplete="username"
                @input="$emit('clearError', 'username')" />
              <Transition name="check">
                <div v-if="form.username && !errors.username" class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
              </Transition>
            </div>
            <p v-if="errors.username" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.username }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockClosedIcon class="w-4 h-4 text-slate-300" />
              </div>
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'"
                :class="['w-full pl-11 pr-11 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                  errors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100']"
                placeholder="Masukkan password" autocomplete="current-password"
                @input="$emit('clearError', 'password')" />
              <button type="button" @click="showPwd = !showPwd" tabindex="-1"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                <EyeSlashIcon v-if="showPwd" class="w-4 h-4" /><EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.password }}
            </p>
          </div>

          <Transition name="alert">
            <div v-if="authError" class="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-100">
              <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-600">{{ authError }}</p>
            </div>
          </Transition>

          <button type="submit" :disabled="loading"
            class="w-full py-3.5 text-sm font-bold rounded-2xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2 relative overflow-hidden group"
            style="background: linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6);">
            <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span v-if="loading" class="relative flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Memproses...
            </span>
            <span v-else class="relative">Masuk Sekarang</span>
          </button>
        </form>
        <p class="text-center text-xs text-slate-300 mt-8">Hubungi administrator jika mengalami kendala akses.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AcademicCapIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
const props = defineProps({
  appName: String, appSubtitle: String, schoolName: String, logoUrl: String,
  headline: String, description: String,
  errors: Object, authError: String, loading: Boolean,
  stats: Array, year: Number,
});
defineEmits(['submit', 'clearError']);
const form = ref({ username: '', password: '' });
const showPwd = ref(false);
</script>
<style scoped>
.check-enter-active, .check-leave-active { transition: all 0.2s ease; }
.check-enter-from, .check-leave-to { opacity: 0; transform: scale(0.5); }
.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
