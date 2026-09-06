<template>
  <!-- Template 2: Dark Elegant — Full dark dengan glow effect -->
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden"
    style="background: linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1a1040 100%);">

    <!-- Glow blobs -->
    <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); filter: blur(60px);" />
    <div class="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%); filter: blur(50px);" />
    <div class="absolute top-1/2 left-0 w-64 h-64 rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%); filter: blur(40px);" />

    <!-- Grid pattern -->
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
      style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 40px 40px;" />

    <!-- Card -->
    <div class="relative w-full max-w-md mx-4">
      <!-- Border glow -->
      <div class="absolute -inset-0.5 rounded-3xl opacity-30"
        style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4); filter: blur(6px);" />

      <div class="relative rounded-3xl p-8 sm:p-10"
        style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(20px);">

        <!-- Logo + nama -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-white/10"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-base font-bold text-white">{{ appName }}</p>
            <p class="text-[11px] text-white/30 tracking-wider">{{ appSubtitle }}</p>
          </div>
          <!-- Status dot -->
          <div class="ml-auto flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-[10px] text-white/30">Online</span>
          </div>
        </div>

        <!-- Heading -->
        <div class="mb-7">
          <h2 class="text-2xl font-black text-white tracking-tight">Selamat Datang 👋</h2>
          <p class="text-sm text-white/40 mt-1.5 leading-relaxed">{{ headline }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="$emit('submit', form)" class="space-y-4" novalidate>

          <!-- Username -->
          <div>
            <label class="block text-xs font-medium text-white/40 mb-1.5 tracking-wide">Username</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon class="w-4 h-4 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input v-model="form.username" type="text"
                class="w-full pl-11 pr-10 py-3 text-sm text-white placeholder-white/20 rounded-xl outline-none transition-all duration-200"
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);"
                :style="{ 'box-shadow': form.username ? '0 0 0 2px rgba(99,102,241,0.4)' : '' }"
                placeholder="Masukkan username" autocomplete="username"
                @input="$emit('clearError', 'username')"
                @focus="e => e.target.style.border = '1px solid rgba(99,102,241,0.5)'"
                @blur="e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'" />
              <Transition name="check">
                <div v-if="form.username && !errors.username" class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div class="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
              </Transition>
            </div>
            <p v-if="errors.username" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.username }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-medium text-white/40 mb-1.5 tracking-wide">Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockClosedIcon class="w-4 h-4 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'"
                class="w-full pl-11 pr-11 py-3 text-sm text-white placeholder-white/20 rounded-xl outline-none transition-all duration-200"
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);"
                placeholder="Masukkan password" autocomplete="current-password"
                @input="$emit('clearError', 'password')"
                @focus="e => e.target.style.border = '1px solid rgba(99,102,241,0.5)'"
                @blur="e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'" />
              <button type="button" @click="showPwd = !showPwd" tabindex="-1"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/60 transition-colors">
                <EyeSlashIcon v-if="showPwd" class="w-4 h-4" /><EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.password }}
            </p>
          </div>

          <!-- Error alert -->
          <Transition name="alert">
            <div v-if="authError" class="flex items-start gap-3 p-3.5 rounded-xl"
              style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);">
              <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-400">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Submit -->
          <button type="submit" :disabled="loading"
            class="w-full py-3.5 text-sm font-bold rounded-xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2 relative overflow-hidden group"
            style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
            <span class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);" />
            <span v-if="loading" class="relative flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Memproses...
            </span>
            <span v-else class="relative">Masuk</span>
          </button>
        </form>

        <!-- Divider + info -->
        <div class="mt-6 pt-6 border-t" style="border-color: rgba(255,255,255,0.06);">
          <div class="flex justify-between items-center">
            <div class="flex gap-4">
              <div v-for="stat in stats" :key="stat.label">
                <p class="text-sm font-bold text-white/70">{{ stat.value }}</p>
                <p class="text-[10px] text-white/25 mt-0.5">{{ stat.label }}</p>
              </div>
            </div>
            <p class="text-[10px] text-white/20">&copy; {{ year }} {{ schoolName }}</p>
          </div>
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
.check-enter-active, .check-leave-active { transition: all 0.2s ease; }
.check-enter-from, .check-leave-to { opacity: 0; transform: scale(0.5); }
.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
