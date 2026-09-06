<template>
  <!-- Template 4: Minimal Clean — Putih bersih, tipografi dominan -->
  <div class="min-h-screen flex bg-white">

    <!-- Panel kiri: accent bar dengan pola geometri -->
    <div class="hidden lg:flex w-2/5 xl:w-1/2 relative overflow-hidden flex-col"
      style="background: linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%);">

      <!-- Geometric shapes -->
      <div class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-50"
        style="background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%); transform: translate(30%, -30%);" />
      <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-40"
        style="background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%); transform: translate(-30%, 30%);" />

      <!-- Pola titik-titik -->
      <div class="absolute inset-0 opacity-30"
        style="background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px); background-size: 28px 28px;" />

      <!-- Accent bar kiri -->
      <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
        style="background: linear-gradient(180deg, #6366f1, #8b5cf6, #ec4899);" />

      <div class="relative flex flex-col justify-between h-full p-12 xl:p-16 pl-14 xl:pl-18">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-md"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-bold text-slate-800 text-sm">{{ appName }}</p>
            <p class="text-[10px] text-slate-400">{{ appSubtitle }}</p>
          </div>
        </div>

        <!-- Konten tengah -->
        <div class="space-y-8">
          <!-- Kutipan besar -->
          <div class="space-y-4">
            <div class="text-6xl xl:text-7xl font-black text-slate-100 select-none leading-none">
              <span style="background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">"</span>
            </div>
            <h1 class="text-3xl xl:text-4xl font-black text-slate-800 leading-tight">
              {{ headline || 'Satu Data.' }}<br />
              <span class="text-slate-300">{{ headlineTwo || 'Satu Sistem.' }}</span>
            </h1>
            <p class="text-sm text-slate-400 leading-relaxed max-w-xs">{{ description }}</p>
          </div>

          <!-- Feature cards -->
          <div class="space-y-2.5">
            <div v-for="feat in features" :key="feat.label"
              class="flex items-center gap-3 p-3.5 rounded-2xl bg-white shadow-sm border border-slate-100 group hover:border-indigo-100 hover:shadow-md transition-all">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));">
                {{ feat.icon }}
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-700">{{ feat.label }}</p>
                <p class="text-[10px] text-slate-400">{{ feat.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-xs text-slate-300">&copy; {{ year }} {{ schoolName }}</p>
      </div>
    </div>

    <!-- Panel kanan: Form -->
    <div class="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-10 relative">

      <!-- Decorative corner accent -->
      <div class="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style="background: linear-gradient(225deg, rgba(99,102,241,0.04) 0%, transparent 70%);" />

      <!-- Mobile logo -->
      <div class="lg:hidden flex items-center gap-3 mb-10">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-md"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
          <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
          <AcademicCapIcon v-else class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="font-bold text-slate-800">{{ appName }}</p>
          <p class="text-[11px] text-slate-400">{{ appSubtitle }}</p>
        </div>
      </div>

      <div class="w-full max-w-sm">
        <!-- Heading -->
        <div class="mb-9">
          <p class="text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-2">Selamat Datang</p>
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">Masuk</h2>
          <p class="text-sm text-slate-400 mt-2">Gunakan akun yang diberikan oleh administrator</p>
        </div>

        <form @submit.prevent="$emit('submit', form)" class="space-y-5" novalidate>

          <!-- Username -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Username</label>
            <div class="relative">
              <input v-model="form.username" type="text"
                :class="['w-full px-4 py-3 text-sm rounded-2xl border-2 outline-none transition-all duration-200',
                  errors.username
                    ? 'border-red-200 bg-red-50/50 focus:border-red-300'
                    : 'border-slate-100 bg-slate-50/80 focus:border-indigo-300 focus:bg-white focus:shadow-lg focus:shadow-indigo-50']"
                placeholder="Masukkan username" autocomplete="username"
                @input="$emit('clearError', 'username')" />
              <!-- Underline active -->
              <div v-if="!errors.username"
                class="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-300 origin-left"
                :class="form.username ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6);" />
            </div>
            <p v-if="errors.username" class="text-xs text-red-500 flex items-center gap-1">
              <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.username }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'"
                :class="['w-full px-4 pr-11 py-3 text-sm rounded-2xl border-2 outline-none transition-all duration-200',
                  errors.password
                    ? 'border-red-200 bg-red-50/50 focus:border-red-300'
                    : 'border-slate-100 bg-slate-50/80 focus:border-indigo-300 focus:bg-white focus:shadow-lg focus:shadow-indigo-50']"
                placeholder="Masukkan password" autocomplete="current-password"
                @input="$emit('clearError', 'password')" />
              <button type="button" @click="showPwd = !showPwd" tabindex="-1"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-600 transition-colors">
                <EyeSlashIcon v-if="showPwd" class="w-4 h-4" /><EyeIcon v-else class="w-4 h-4" />
              </button>
              <div v-if="!errors.password"
                class="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-300 origin-left"
                :class="form.password ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6);" />
            </div>
            <p v-if="errors.password" class="text-xs text-red-500 flex items-center gap-1">
              <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.password }}
            </p>
          </div>

          <!-- Error -->
          <Transition name="alert">
            <div v-if="authError" class="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-100">
              <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-600">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Submit -->
          <button type="submit" :disabled="loading"
            class="w-full py-3.5 text-sm font-bold rounded-2xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Memproses...
            </span>
            <span v-else>Masuk →</span>
          </button>
        </form>

        <p class="text-center text-xs text-slate-300 mt-8">Hubungi administrator jika mengalami kendala.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
const props = defineProps({
  appName: String, appSubtitle: String, schoolName: String, logoUrl: String,
  headline: String, headlineTwo: String, description: String,
  errors: Object, authError: String, loading: Boolean,
  stats: Array, year: Number,
});
defineEmits(['submit', 'clearError']);
const form = ref({ username: '', password: '' });
const showPwd = ref(false);
const features = [
  { icon: '📊', label: 'Data Terintegrasi', desc: 'Semua data akademik dalam satu platform' },
  { icon: '🔐', label: 'SSO Login', desc: 'Satu akun untuk semua aplikasi' },
  { icon: '⚡', label: 'Real-time Sync', desc: 'Sinkronisasi otomatis antar sistem' },
];
</script>
<style scoped>
.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
