<template>
  <!-- Template 3: Nature Green — Segar dengan ilustrasi alam -->
  <div class="min-h-screen flex relative overflow-hidden"
    style="background: linear-gradient(160deg, #052e16 0%, #14532d 30%, #166534 60%, #15803d 100%);">

    <!-- Decorative shapes -->
    <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
      style="background: radial-gradient(circle, #4ade80, transparent 70%);" />
    <div class="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15"
      style="background: radial-gradient(circle, #86efac, transparent 70%);" />
    <div class="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10"
      style="background: radial-gradient(circle, #a7f3d0, transparent 70%);" />

    <!-- Wave bottom -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
      <svg viewBox="0 0 1440 120" class="w-full" preserveAspectRatio="none" style="height:80px;">
        <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,50 1440,60 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.04)" />
      </svg>
    </div>

    <!-- Panel kiri: info -->
    <div class="hidden lg:flex flex-col justify-between w-1/2 p-12 xl:p-16 relative">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden ring-1 ring-white/20"
          style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);">
          <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
          <AcademicCapIcon v-else class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-sm font-bold text-white">{{ appName }}</p>
          <p class="text-[10px] text-green-200/60 tracking-widest uppercase">{{ appSubtitle }}</p>
        </div>
      </div>

      <!-- Ilustrasi pohon & bangunan sekolah -->
      <div class="flex-1 flex flex-col justify-center py-10">
        <svg viewBox="0 0 360 260" class="w-72 mx-auto drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <!-- Gedung sekolah -->
          <rect x="100" y="100" width="160" height="120" rx="4" fill="rgba(255,255,255,0.12)" />
          <rect x="80" y="90" width="200" height="20" rx="4" fill="rgba(255,255,255,0.2)" />
          <!-- Jendela -->
          <rect x="120" y="120" width="30" height="25" rx="4" fill="rgba(134,239,172,0.4)" />
          <rect x="165" y="120" width="30" height="25" rx="4" fill="rgba(134,239,172,0.4)" />
          <rect x="210" y="120" width="30" height="25" rx="4" fill="rgba(134,239,172,0.4)" />
          <rect x="120" y="158" width="30" height="25" rx="4" fill="rgba(134,239,172,0.3)" />
          <rect x="210" y="158" width="30" height="25" rx="4" fill="rgba(134,239,172,0.3)" />
          <!-- Pintu -->
          <rect x="162" y="170" width="36" height="50" rx="4" fill="rgba(255,255,255,0.25)" />
          <circle cx="193" cy="195" r="3" fill="rgba(255,255,255,0.6)" />
          <!-- Tiang bendera -->
          <line x1="180" y1="60" x2="180" y2="90" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
          <polygon points="180,60 200,68 180,76" fill="rgba(255,100,100,0.8)" />
          <!-- Pohon kiri -->
          <ellipse cx="55" cy="140" rx="30" ry="35" fill="rgba(74,222,128,0.5)" />
          <ellipse cx="40" cy="155" rx="22" ry="25" fill="rgba(34,197,94,0.5)" />
          <rect x="50" y="170" width="10" height="50" rx="5" fill="rgba(255,255,255,0.2)" />
          <!-- Pohon kanan -->
          <ellipse cx="305" cy="135" rx="28" ry="32" fill="rgba(74,222,128,0.5)" />
          <ellipse cx="318" cy="152" rx="20" ry="22" fill="rgba(34,197,94,0.5)" />
          <rect x="300" y="162" width="10" height="58" rx="5" fill="rgba(255,255,255,0.2)" />
          <!-- Jalan -->
          <rect x="0" y="218" width="360" height="42" rx="0" fill="rgba(0,0,0,0.1)" />
          <rect x="150" y="222" width="60" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
          <!-- Dekorasi titik -->
          <circle cx="280" cy="70" r="4" fill="rgba(255,255,255,0.2)" />
          <circle cx="300" cy="55" r="3" fill="rgba(255,255,255,0.15)" />
          <circle cx="60" cy="70" r="3" fill="rgba(255,255,255,0.15)" />
        </svg>

        <div class="mt-8 space-y-2 text-center">
          <h1 class="text-3xl font-bold text-white leading-tight">{{ headline }}</h1>
          <p class="text-sm text-green-200/60 leading-relaxed max-w-sm mx-auto">{{ description }}</p>
        </div>
      </div>

      <p class="text-[11px] text-green-200/30">&copy; {{ year }} {{ schoolName }}</p>
    </div>

    <!-- Panel kanan: Form -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative">
      <div class="w-full max-w-sm">

        <!-- Card -->
        <div class="rounded-3xl p-8 shadow-2xl"
          style="background: rgba(255,255,255,0.97); backdrop-filter: blur(20px);">

          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center gap-3 mb-7">
            <div class="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center overflow-hidden">
              <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
              <AcademicCapIcon v-else class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-bold text-slate-800">{{ appName }}</p>
              <p class="text-[11px] text-slate-400">{{ appSubtitle }}</p>
            </div>
          </div>

          <div class="mb-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
              Sistem Aktif
            </div>
            <h2 class="text-2xl font-bold text-slate-800">Masuk Sekarang</h2>
            <p class="text-sm text-slate-400 mt-1">Akses dashboard sekolah Anda</p>
          </div>

          <form @submit.prevent="$emit('submit', form)" class="space-y-4" novalidate>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">USERNAME</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon class="w-4 h-4 text-slate-300" />
                </div>
                <input v-model="form.username" type="text"
                  :class="['w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none',
                    errors.username ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-slate-50 focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100']"
                  placeholder="username" autocomplete="username"
                  @input="$emit('clearError', 'username')" />
              </div>
              <p v-if="errors.username" class="mt-1 text-xs text-red-500">{{ errors.username }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">PASSWORD</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockClosedIcon class="w-4 h-4 text-slate-300" />
                </div>
                <input v-model="form.password" :type="showPwd ? 'text' : 'password'"
                  :class="['w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-all outline-none',
                    errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-slate-50 focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100']"
                  placeholder="password" autocomplete="current-password"
                  @input="$emit('clearError', 'password')" />
                <button type="button" @click="showPwd = !showPwd" tabindex="-1"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                  <EyeSlashIcon v-if="showPwd" class="w-4 h-4" /><EyeIcon v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
            </div>

            <Transition name="alert">
              <div v-if="authError" class="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-red-600">{{ authError }}</p>
              </div>
            </Transition>

            <button type="submit" :disabled="loading"
              class="w-full py-3 text-sm font-bold rounded-xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style="background: linear-gradient(135deg, #16a34a, #15803d, #166534);">
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Memproses...
              </span>
              <span v-else>Masuk</span>
            </button>
          </form>

          <p class="text-center text-xs text-slate-300 mt-6">Hubungi administrator jika ada kendala.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AcademicCapIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
defineProps({
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
.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
