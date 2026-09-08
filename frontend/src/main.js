import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import App from './App.vue';
import router from './router';
import '@/assets/main.css';

// ── PWA Service Worker ────────────────────────────────────────
// vite-plugin-pwa akan generate file ini saat build
import { registerSW } from 'virtual:pwa-register';
registerSW({
  onNeedRefresh() {
    // Ada versi baru — bisa tampilkan notif update jika mau
    console.info('[PWA] Update tersedia, akan diterapkan otomatis.');
  },
  onOfflineReady() {
    console.info('[PWA] Aplikasi siap digunakan offline.');
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 3500,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  draggable: true,
  hideProgressBar: false,
  closeButton: 'button',
  maxToasts: 5,
});

app.mount('#app');

// Load settings setelah app mount agar CSS vars diterapkan
import { useSettingsStore } from '@/stores/settings.store';
const settingsStore = useSettingsStore();
settingsStore.load();
