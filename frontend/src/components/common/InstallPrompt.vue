<template>
  <!-- Banner install PWA — muncul di bawah layar saat browser trigger beforeinstallprompt -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="showBanner"
        class="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-5 sm:bottom-4 sm:left-4 sm:right-4 sm:max-w-sm sm:mx-auto"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <!-- Header bar gradient -->
          <div class="h-1 w-full" style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);" />

          <div class="p-4 flex items-start gap-3">
            <!-- Icon app -->
            <div class="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden"
              style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
              <img src="/icon-192.svg" alt="SDMS" class="w-full h-full object-contain" />
            </div>

            <!-- Teks -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-900 text-sm leading-tight">Install Aplikasi SDMS</p>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tambahkan ke layar utama untuk akses lebih cepat — tanpa buka browser.
              </p>
            </div>

            <!-- Tombol tutup -->
            <button
              @click="dismiss"
              class="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              aria-label="Tutup"
            >
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tombol aksi -->
          <div class="px-4 pb-4 flex gap-2">
            <button
              @click="dismiss"
              class="flex-1 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Nanti Saja
            </button>
            <button
              @click="install"
              class="flex-1 py-2.5 text-sm font-bold rounded-xl text-white transition-all active:scale-95 shadow-md shadow-indigo-200 hover:shadow-lg"
              style="background: linear-gradient(135deg, #6366f1, #8b5cf6);"
            >
              Install Sekarang
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast sukses setelah install -->
    <Transition name="fade">
      <div
        v-if="showSuccess"
        class="fixed top-4 left-4 right-4 z-[9999] max-w-sm mx-auto"
      >
        <div class="bg-emerald-500 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-semibold">SDMS berhasil diinstall! 🎉</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showBanner  = ref(false);
const showSuccess = ref(false);
let deferredPrompt = null;

// Cek apakah sudah pernah dismiss (simpan di localStorage)
const DISMISS_KEY = 'sdms_pwa_dismissed';
const isDismissed = () => {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  // Tanya lagi setelah 7 hari
  return (Date.now() - parseInt(ts)) < 7 * 24 * 60 * 60 * 1000;
};

const handleBeforeInstallPrompt = (e) => {
  // Cegah Chrome menampilkan prompt bawaan langsung
  e.preventDefault();
  deferredPrompt = e;

  // Tampilkan banner kustom kita (kecuali sudah di-dismiss)
  if (!isDismissed()) {
    // Delay sedikit agar tidak muncul bersamaan dengan halaman loading
    setTimeout(() => { showBanner.value = true; }, 3000);
  }
};

const handleAppInstalled = () => {
  showBanner.value = false;
  deferredPrompt   = null;
  showSuccess.value = true;
  setTimeout(() => { showSuccess.value = false; }, 4000);
};

const install = async () => {
  if (!deferredPrompt) return;
  showBanner.value = false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    showSuccess.value = true;
    setTimeout(() => { showSuccess.value = false; }, 4000);
  }
  deferredPrompt = null;
};

const dismiss = () => {
  showBanner.value = false;
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
};

onMounted(() => {
  // Jangan tampilkan jika sudah running sebagai PWA (standalone mode)
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return; // iOS

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style scoped>
/* Slide up dari bawah */
.slide-up-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-up-leave-active { transition: all 0.25s ease-in; }
.slide-up-enter-from  { opacity: 0; transform: translateY(100%); }
.slide-up-leave-to    { opacity: 0; transform: translateY(100%); }

/* Fade untuk toast sukses */
.fade-enter-active { transition: all 0.3s ease; }
.fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
