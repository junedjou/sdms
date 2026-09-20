<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-4">
    <div class="w-full max-w-md">

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="px-8 pt-8 pb-6 text-center"
          style="background: linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6);">
          <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 ring-1 ring-white/30 overflow-hidden">
            <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-xl font-bold text-white">{{ settingsStore.get('app_name') || 'SDMS' }}</h1>
          <p class="text-sm text-blue-100/70 mt-0.5">{{ settingsStore.get('school_name') || 'SMKN 1 Kras' }}</p>
        </div>

        <!-- Body -->
        <div class="px-8 py-8">

          <!-- State: belum submit (tampilkan form) -->
          <template v-if="!submitted">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-slate-800">Lupa Password?</h2>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">
                Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password Anda.
              </p>
            </div>

            <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon class="w-4 h-4 text-slate-300" />
                  </div>
                  <input
                    v-model="form.email"
                    type="email"
                    :class="['w-full pl-11 pr-4 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                      fieldError ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100']"
                    placeholder="email@sekolah.sch.id"
                    autocomplete="email"
                    @input="fieldError = ''"
                  />
                </div>
                <p v-if="fieldError" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ fieldError }}
                </p>
              </div>

              <!-- Error dari API -->
              <Transition name="alert">
                <div v-if="apiError" class="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-100">
                  <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p class="text-sm text-red-600">{{ apiError }}</p>
                </div>
              </Transition>

              <!-- Tombol kirim -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3.5 text-sm font-bold rounded-2xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2 relative overflow-hidden group"
                style="background: linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6);">
                <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span v-if="loading" class="relative flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Mengirim...
                </span>
                <span v-else class="relative">Kirim Link Reset Password</span>
              </button>
            </form>
          </template>

          <!-- State: sudah submit → tampilkan konfirmasi -->
          <template v-else>
            <div class="text-center py-4">
              <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon class="w-8 h-8 text-emerald-500" />
              </div>
              <h2 class="text-xl font-bold text-slate-800 mb-2">Email Terkirim!</h2>
              <p class="text-sm text-slate-500 leading-relaxed mb-2">
                Jika email <strong class="text-slate-700">{{ form.email }}</strong> terdaftar,
                link reset password sudah dikirim ke inbox Anda.
              </p>
              <p class="text-xs text-slate-400 leading-relaxed">
                Cek folder <em>Spam</em> jika tidak ada di inbox. Link berlaku selama <strong>1 jam</strong>.
              </p>

              <!-- Kirim ulang -->
              <button
                @click="handleResend"
                :disabled="resendCooldown > 0 || loading"
                class="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                <span v-if="resendCooldown > 0">Kirim ulang dalam {{ resendCooldown }}d</span>
                <span v-else>Kirim ulang email</span>
              </button>
            </div>
          </template>

          <!-- Link kembali ke login (selalu tampil) -->
          <div class="mt-6 pt-5 border-t border-slate-100 text-center">
            <router-link
              to="/login"
              class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeftIcon class="w-4 h-4" />
              Kembali ke halaman login
            </router-link>
          </div>

        </div>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        &copy; {{ year }} {{ settingsStore.get('school_name') || 'SDMS' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  AcademicCapIcon, EnvelopeIcon, ExclamationCircleIcon,
  CheckCircleIcon, ArrowLeftIcon,
} from '@heroicons/vue/24/outline';
import { useSettingsStore } from '@/stores/settings.store';
import { authService } from '@/services/api';

const settingsStore = useSettingsStore();
const year = new Date().getFullYear();

// ── State ─────────────────────────────────────────────────────
const form        = ref({ email: '' });
const fieldError  = ref('');
const apiError    = ref('');
const loading     = ref(false);
const submitted   = ref(false);     // sudah berhasil submit → tampilkan konfirmasi
const resendCooldown = ref(0);      // detik cooldown kirim ulang

// ── Validasi lokal ────────────────────────────────────────────
function validate() {
  const email = form.value.email.trim();
  if (!email) { fieldError.value = 'Email wajib diisi'; return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldError.value = 'Format email tidak valid';
    return false;
  }
  return true;
}

// ── Submit form ───────────────────────────────────────────────
async function handleSubmit() {
  apiError.value  = '';
  fieldError.value = '';
  if (!validate()) return;

  loading.value = true;
  try {
    await authService.forgotPassword({ email: form.value.email.trim().toLowerCase() });
    submitted.value = true;
    startCooldown();
  } catch (err) {
    apiError.value = err.response?.data?.message || 'Gagal mengirim email. Silakan coba lagi.';
  } finally {
    loading.value = false;
  }
}

// ── Kirim ulang ───────────────────────────────────────────────
async function handleResend() {
  submitted.value  = false;
  apiError.value   = '';
  // Langsung submit ulang tanpa user harus klik submit lagi
  await handleSubmit();
}

// ── Countdown cooldown 60 detik ───────────────────────────────
function startCooldown() {
  resendCooldown.value = 60;
  const timer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) clearInterval(timer);
  }, 1000);
}
</script>

<style scoped>
.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
