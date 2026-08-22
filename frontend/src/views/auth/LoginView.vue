<template>
  <div class="min-h-screen flex">

    <!-- ── Panel kiri: Branding (desktop only) ───────────────── -->
    <div class="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col relative overflow-hidden"
      style="background: linear-gradient(160deg, #6366f1 0%, #8b5cf6 30%, #a78bfa 55%, #c084fc 75%, #e879a0 100%);">

      <!-- ── Latar dekoratif ──────────────────────────────────── -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- Warm blob — peach/rose kanan atas -->
        <div class="absolute -top-24 -right-24 w-[440px] h-[440px] rounded-full opacity-20 animate-float"
          style="background: radial-gradient(circle, #f97316 0%, transparent 70%); filter: blur(50px);" />
        <!-- Blob ungu lembut kiri bawah -->
        <div class="absolute -bottom-20 -left-20 w-[380px] h-[380px] rounded-full opacity-18 animate-float-delay"
          style="background: radial-gradient(circle, #818cf8 0%, transparent 70%); filter: blur(50px);" />
        <!-- Blob rose tengah -->
        <div class="absolute top-[40%] left-[35%] w-[280px] h-[280px] rounded-full opacity-12 -translate-x-1/2 -translate-y-1/2"
          style="background: radial-gradient(circle, #f472b6 0%, transparent 70%); filter: blur(60px);" />
        <!-- Blob amber kecil -->
        <div class="absolute top-[15%] left-[60%] w-[200px] h-[200px] rounded-full opacity-10"
          style="background: radial-gradient(circle, #fbbf24 0%, transparent 70%); filter: blur(45px);" />

        <!-- Floating particles — warm palette -->
        <div class="absolute top-[18%] left-[12%] w-2.5 h-2.5 rounded-full bg-amber-300/35 animate-float" />
        <div class="absolute top-[55%] left-[20%] w-2 h-2 rounded-full bg-rose-300/30 animate-float-delay" />
        <div class="absolute top-[30%] right-[18%] w-3 h-3 rounded-full bg-white/20 animate-float" />
        <div class="absolute bottom-[22%] right-[12%] w-2 h-2 rounded-full bg-indigo-200/25 animate-float-delay" />
        <div class="absolute top-[12%] right-[35%] w-1.5 h-1.5 rounded-full bg-amber-200/30 animate-float" />
        <div class="absolute bottom-[35%] left-[40%] w-1.5 h-1.5 rounded-full bg-pink-200/25 animate-float-delay" />

        <!-- Grid dot pattern — warmer -->
        <div class="absolute inset-0 opacity-[0.035]"
          style="background-image: radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px); background-size: 30px 30px;" />

        <!-- Subtle diagonal accent line -->
        <div class="absolute top-0 right-0 w-px h-full opacity-10"
          style="background: linear-gradient(180deg, transparent, #f9a8d4, #c084fc, transparent);" />
      </div>

      <!-- ── Konten utama ──────────────────────────────────────── -->
      <div class="relative flex flex-col h-full p-10">

        <!-- Logo -->
        <div class="flex items-center gap-3.5 animate-fade-in">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/40 flex-shrink-0 overflow-hidden bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
            <AcademicCapIcon v-else class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-base font-bold text-white tracking-wide">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
            <p class="text-[11px] text-white/45 tracking-wider uppercase">{{ settingsStore.get('app_subtitle') }}</p>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1 flex flex-col justify-center py-8 space-y-8">

          <!-- Badge — warm glassmorphism -->
          <div class="inline-flex w-fit items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm animate-fade-in">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
            <span class="text-xs font-semibold text-white/80 tracking-widest uppercase">{{ settingsStore.get('login_badge') }}</span>
          </div>

          <!-- Headline — warmer, brighter -->
          <div class="space-y-3 animate-fade-in-up">
            <h1 class="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-sm">
              {{ settingsStore.get('login_headline') }}<br />
              <span class="text-gradient-rainbow">
                {{ settingsStore.get('login_headline2') }}
              </span>
            </h1>
            <p class="text-sm text-white/50 leading-relaxed max-w-xs">
              {{ settingsStore.get('login_description') }}
            </p>
          </div>

          <!-- Stats cards — glassmorphism with warm tint -->
          <div class="grid grid-cols-3 gap-3 animate-fade-in-up animation-delay-200">
            <div v-for="(stat, idx) in stats" :key="stat.label"
              class="rounded-3xl p-4 bg-white/8 border border-white/10 backdrop-blur-sm group hover:bg-white/12 hover:border-white/18 transition-all duration-200 cursor-default"
              :class="`animation-delay-${(idx + 1) * 100}`">
              <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <component :is="stat.icon" class="w-4 h-4 text-white/70 group-hover:text-white/90 transition-colors" />
              </div>
              <p class="text-xl font-black text-white leading-none mt-2.5">{{ stat.value }}</p>
              <p class="text-[10px] text-white/40 font-medium uppercase tracking-wider leading-none mt-1.5">{{ stat.label }}</p>
            </div>
          </div>

          <!-- Feature pills — warm glass -->
          <div class="flex flex-wrap gap-2 animate-fade-in-up animation-delay-300">
            <div v-for="feat in features" :key="feat.label"
              class="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/8 border border-white/10 backdrop-blur-sm text-white/60 hover:text-white/95 hover:bg-white/12 hover:border-white/18 transition-all duration-200 cursor-default">
              <component :is="feat.icon" class="w-3.5 h-3.5 text-amber-300/70 flex-shrink-0" />
              <span class="text-xs font-medium">{{ feat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <p class="text-[11px] text-white/25">&copy; {{ year }} {{ settingsStore.get('school_name') || 'SDMS' }}</p>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-[11px] text-white/35">Sistem Aktif</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Panel kanan: Form login ────────────────────────────── -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden"
      style="background: linear-gradient(160deg, #faf9ff 0%, #fff5f0 40%, #fdf2f8 70%, #f0f4ff 100%);">

      <!-- Background decoration for mobile & desktop -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Warm blob top right -->
        <div class="absolute -top-24 -right-24 w-[350px] h-[350px] rounded-full opacity-[0.06]"
          style="background: radial-gradient(circle, #f97316 0%, transparent 70%); filter: blur(50px);" />
        <!-- Purple blob bottom left -->
        <div class="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full opacity-[0.05]"
          style="background: radial-gradient(circle, #8b5cf6 0%, transparent 70%); filter: blur(50px);" />
        <!-- Rose blob center -->
        <div class="absolute top-[50%] right-[30%] w-[250px] h-[250px] rounded-full opacity-[0.03]"
          style="background: radial-gradient(circle, #f472b6 0%, transparent 70%); filter: blur(60px);" />
      </div>

      <!-- Mobile logo -->
      <div class="lg:hidden flex items-center gap-3 mb-10 animate-fade-in relative">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/25 ring-2 ring-purple-100 overflow-hidden bg-gradient-to-br from-primary-400 to-violet-500">
          <img v-if="settingsStore.get('logo_url')" :src="settingsStore.get('logo_url')" class="w-full h-full object-contain" alt="Logo" />
          <AcademicCapIcon v-else class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-lg font-bold text-slate-800 tracking-tight">{{ settingsStore.get('app_name') || 'SDMS' }}</p>
          <p class="text-xs text-slate-400">{{ settingsStore.get('app_subtitle') }}</p>
        </div>
      </div>

      <div class="w-full max-w-sm animate-slide-up relative">

        <!-- Heading — warmer welcome -->
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-sm shadow-amber-400/20">
              <span class="text-base">👋</span>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Selamat datang kembali</h2>
          <p class="text-sm text-slate-400 mt-2">Masuk ke akun SDMS Anda untuk melanjutkan</p>
        </div>

        <!-- Form card — glassmorphism warm -->
        <div class="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-card-lg p-6">

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
                    'form-input pl-10 py-3',
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
                    'form-input pl-10 pr-11 py-3',
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

            <!-- Alert error — warm red -->
            <Transition name="alert">
              <div
                v-if="authError"
                class="flex items-start gap-3 p-4 rounded-2xl bg-red-50/80 border border-red-200/50"
                role="alert"
              >
                <ExclamationCircleIcon class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-red-600 leading-snug">{{ authError }}</p>
              </div>
            </Transition>

            <!-- Submit — bright warm gradient button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 text-sm font-semibold rounded-2xl text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]"
              style="background: linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c084fc 70%, #e879a0 100%); box-shadow: 0 4px 14px -3px rgba(139,92,246,0.35);"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <ArrowRightOnRectangleIcon class="w-4 h-4" />
                Masuk ke Sistem
              </span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 mt-6">
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
