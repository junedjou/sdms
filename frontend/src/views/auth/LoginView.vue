<template>
  <component
    :is="activeTemplate"
    v-bind="templateProps"
    @submit="handleSubmit"
    @clearError="clearError"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';

import LoginTemplate1 from './templates/LoginTemplate1.vue';
import LoginTemplate2 from './templates/LoginTemplate2.vue';
import LoginTemplate3 from './templates/LoginTemplate3.vue';
import LoginTemplate4 from './templates/LoginTemplate4.vue';

const authStore     = useAuthStore();
const settingsStore = useSettingsStore();
const router        = useRouter();
const route         = useRoute();

// ── State ─────────────────────────────────────────────────────
const errors    = ref({ username: '', password: '' });
const authError = ref('');
const loading   = ref(false);
const year      = new Date().getFullYear();

const stats = [
  { label: 'Modul',    value: '12+' },
  { label: 'Aplikasi', value: '7+'  },
  { label: 'Status',   value: 'Online' },
];

// ── Pilih template berdasarkan setting ───────────────────────
const templateMap = {
  '1': LoginTemplate1,
  '2': LoginTemplate2,
  '3': LoginTemplate3,
  '4': LoginTemplate4,
};

const activeTemplate = computed(() => {
  const key = settingsStore.get('login_template') || '1';
  return templateMap[key] || LoginTemplate1;
});

// ── Props yang diteruskan ke semua template ──────────────────
const templateProps = computed(() => ({
  appName:     settingsStore.get('app_name')     || 'SDMS',
  appSubtitle: settingsStore.get('app_subtitle') || 'School Data Management System',
  schoolName:  settingsStore.get('school_name')  || 'SMKN 1 Kras',
  logoUrl:     settingsStore.get('logo_url')     || '',
  headline:    settingsStore.get('login_headline')    || 'Selamat Datang',
  headlineTwo: settingsStore.get('login_headline2')   || 'Satu Sistem.',
  description: settingsStore.get('login_description') || 'Kelola seluruh data akademik sekolah dalam satu platform terintegrasi.',
  errors:    errors.value,
  authError: authError.value,
  loading:   loading.value,
  stats,
  year,
}));

// ── Actions ──────────────────────────────────────────────────
const clearError = (field) => {
  errors.value[field] = '';
  authError.value = '';
};

const validate = (form) => {
  errors.value = { username: '', password: '' };
  let valid = true;
  if (!form.username?.trim()) { errors.value.username = 'Username wajib diisi'; valid = false; }
  if (!form.password)         { errors.value.password = 'Password wajib diisi'; valid = false; }
  return valid;
};

const handleSubmit = async (form) => {
  authError.value = '';
  if (!validate(form)) return;

  loading.value = true;
  const result = await authStore.login(form);
  loading.value = false;

  if (result.success) {
    const redirect = route.query.redirect || '/dashboard';
    await router.replace(redirect);
  } else {
    authError.value = result.message || 'Login gagal. Periksa username dan password Anda.';
  }
};
</script>
