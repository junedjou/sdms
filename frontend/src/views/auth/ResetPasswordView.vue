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

          <!-- State: token tidak ada di URL -->
          <template v-if="!token">
            <div class="text-center py-4">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ExclamationCircleIcon class="w-8 h-8 text-red-400" />
              </div>
              <h2 class="text-lg font-bold text-slate-800 mb-2">Link Tidak Valid</h2>
              <p class="text-sm text-slate-500 leading-relaxed">
                Link reset password tidak ditemukan atau sudah tidak berlaku.
                Silakan minta link baru.
              </p>
              <router-link
                to="/forgot-password"
                class="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                style="background: linear-gradient(135deg, #1d4ed8, #2563eb);">
                Minta Link Baru
              </router-link>
            </div>
          </template>

          <!-- State: berhasil reset password -->
          <template v-else-if="success">
            <div class="text-center py-4">
              <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon class="w-8 h-8 text-emerald-500" />
              </div>
              <h2 class="text-xl font-bold text-slate-800 mb-2">Password Berhasil Direset!</h2>
              <p class="text-sm text-slate-500 leading-relaxed mb-6">
                Password Anda sudah diperbarui. Silakan login menggunakan password baru.
              </p>
              <router-link
                to="/login"
                class="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6);">
                <ArrowRightIcon class="w-4 h-4" />
                Login Sekarang
              </router-link>
            </div>
          </template>

          <!-- State: form reset password -->
          <template v-else>
            <div class="mb-6">
              <h2 class="text-xl font-bold text-slate-800">Buat Password Baru</h2>
              <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">
                Masukkan password baru untuk akun Anda. Minimal 8 karakter.
              </p>
            </div>

            <form @submit.prevent="handleSubmit" novalidate class="space-y-4">

              <!-- Password Baru -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password Baru
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon class="w-4 h-4 text-slate-300" />
                  </div>
                  <input
                    v-model="form.new_password"
                    :type="showNew ? 'text' : 'password'"
                    :class="['w-full pl-11 pr-11 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                      errors.new_password ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100']"
                    placeholder="Minimal 8 karakter"
                    autocomplete="new-password"
                    @input="errors.new_password = ''; errors.confirm_password = ''"
                  />
                  <button type="button" @click="showNew = !showNew" tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                    <EyeSlashIcon v-if="showNew" class="w-4 h-4" /><EyeIcon v-else class="w-4 h-4" />
                  </button>
                </div>
                <!-- Indikator kekuatan password -->
                <div v-if="form.new_password" class="mt-2 flex gap-1">
                  <div v-for="i in 4" :key="i"
                    :class="['h-1 flex-1 rounded-full transition-all duration-300',
                      i <= strength.score ? strength.color : 'bg-slate-100']" />
                </div>
                <p v-if="form.new_password" class="mt-1 text-xs" :class="strength.textColor">
                  {{ strength.label }}
                </p>
                <p v-if="errors.new_password" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.new_password }}
                </p>
              </div>

              <!-- Konfirmasi Password -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Konfirmasi Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon class="w-4 h-4 text-slate-300" />
                  </div>
                  <input
                    v-model="form.confirm_password"
                    :type="showConfirm ? 'text' : 'password'"
                    :class="['w-full pl-11 pr-11 py-3 text-sm rounded-2xl border-2 transition-all duration-200 outline-none bg-slate-50',
                      errors.confirm_password ? 'border-red-300 focus:border-red-400'
                      : (form.confirm_password && form.confirm_password === form.new_password) ? 'border-emerald-300 focus:border-emerald-400'
                      : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-sm focus:shadow-blue-100']"
                    placeholder="Ulangi password baru"
                    autocomplete="new-password"
                    @input="errors.confirm_password = ''"
                  />
                  <button type="button" @click="showConfirm = !showConfirm" tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                    <EyeSlashIcon v-if="showConfirm" class="w-4 h-4" /><EyeIcon v-else class="w-4 h-4" />
                  </button>
                  <!-- Centang cocok -->
                  <Transition name="check">
                    <div v-if="form.confirm_password && form.confirm_password === form.new_password"
                      class="absolute inset-y-0 right-8 pr-2 flex items-center pointer-events-none">
                      <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </Transition>
                </div>
                <p v-if="errors.confirm_password" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon class="w-3.5 h-3.5 flex-shrink-0" />{{ errors.confirm_password }}
                </p>
              </div>

              <!-- Error API -->
              <Transition name="alert">
                <div v-if="apiError" class="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-100">
                  <ExclamationCircleIcon class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p class="text-sm text-red-600">{{ apiError }}</p>
                </div>
              </Transition>

              <!-- Tombol simpan -->
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
                  Menyimpan...
                </span>
                <span v-else class="relative">Simpan Password Baru</span>
              </button>
            </form>
          </template>

          <!-- Link kembali ke login -->
          <div v-if="!success" class="mt-6 pt-5 border-t border-slate-100 text-center">
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  AcademicCapIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  ExclamationCircleIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon,
} from '@heroicons/vue/24/outline';
import { useSettingsStore } from '@/stores/settings.store';
import { authService } from '@/services/api';

const settingsStore = useSettingsStore();
const route = useRoute();
const year  = new Date().getFullYear();

// ── Ambil token dari query string ─────────────────────────────
const token = ref('');
onMounted(() => {
  token.value = route.query.token || '';
});

// ── State ─────────────────────────────────────────────────────
const form    = ref({ new_password: '', confirm_password: '' });
const errors  = ref({ new_password: '', confirm_password: '' });
const apiError = ref('');
const loading  = ref(false);
const success  = ref(false);
const showNew     = ref(false);
const showConfirm = ref(false);

// ── Kekuatan password ─────────────────────────────────────────
const strength = computed(() => {
  const pwd = form.value.new_password;
  if (!pwd) return { score: 0, label: '', color: 'bg-slate-100', textColor: 'text-slate-400' };

  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd))   score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score = Math.min(score + 1, 4);

  const map = {
    1: { label: 'Lemah',   color: 'bg-red-400',    textColor: 'text-red-500'    },
    2: { label: 'Cukup',   color: 'bg-orange-400', textColor: 'text-orange-500' },
    3: { label: 'Baik',    color: 'bg-yellow-400', textColor: 'text-yellow-600' },
    4: { label: 'Kuat',    color: 'bg-emerald-500',textColor: 'text-emerald-600'},
  };
  return { score: Math.max(score, 1), ...(map[Math.max(score, 1)] || map[1]) };
});

// ── Validasi lokal ────────────────────────────────────────────
function validate() {
  errors.value = { new_password: '', confirm_password: '' };
  let valid = true;

  if (!form.value.new_password) {
    errors.value.new_password = 'Password baru wajib diisi'; valid = false;
  } else if (form.value.new_password.length < 8) {
    errors.value.new_password = 'Password minimal 8 karakter'; valid = false;
  }

  if (!form.value.confirm_password) {
    errors.value.confirm_password = 'Konfirmasi password wajib diisi'; valid = false;
  } else if (form.value.confirm_password !== form.value.new_password) {
    errors.value.confirm_password = 'Konfirmasi password tidak cocok'; valid = false;
  }
  return valid;
}

// ── Submit ────────────────────────────────────────────────────
async function handleSubmit() {
  apiError.value = '';
  if (!validate()) return;

  loading.value = true;
  try {
    await authService.resetPassword({
      token:            token.value,
      new_password:     form.value.new_password,
      confirm_password: form.value.confirm_password,
    });
    success.value = true;
  } catch (err) {
    apiError.value = err.response?.data?.message
      || 'Token tidak valid atau sudah kadaluarsa. Silakan minta link reset baru.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.check-enter-active, .check-leave-active { transition: all 0.2s ease; }
.check-enter-from, .check-leave-to { opacity: 0; transform: scale(0.5); }
.alert-enter-active, .alert-leave-active { transition: all 0.22s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
