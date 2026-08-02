import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import App from './App.vue';
import router from './router';
import '@/assets/main.css';

const app = createApp(App);

// Pinia store
app.use(createPinia());

// Router
app.use(router);

// Toast notifications
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
