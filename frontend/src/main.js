import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import App from './App.vue';
import router from './router';
import '@/assets/main.css';

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
