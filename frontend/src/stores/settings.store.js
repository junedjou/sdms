import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

// ── Defaults (sama dengan backend) ───────────────────────────
const DEFAULTS = {
  app_name:          'SDMS',
  app_subtitle:      'School Data Management System',
  school_name:       'SMK Negeri 1 Kras',
  logo_url:          '',
  sidebar_bg:        '#0f172a',
  sidebar_accent:    '#6366f1',
  sidebar_text:      'rgba(255,255,255,0.7)',
  login_bg_from:     '#0f172a',
  login_bg_mid:      '#1e1b4b',
  login_bg_to:       '#0c0a1e',
  login_headline:    'Satu Data.',
  login_headline2:   'Satu Sistem.',
  login_description: 'Kelola seluruh data akademik sekolah dalam satu platform terintegrasi.',
  login_badge:       'Platform Terpadu',
};

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({ ...DEFAULTS });
  const items    = ref([]);
  const loading  = ref(false);
  const saving   = ref(false);

  // ── Getters ───────────────────────────────────────────────
  const get = (key) => settings.value[key] ?? DEFAULTS[key] ?? '';

  const sidebarStyle = computed(() => ({
    '--sdms-sidebar-bg':     get('sidebar_bg'),
    '--sdms-sidebar-accent': get('sidebar_accent'),
    '--sdms-sidebar-text':   get('sidebar_text'),
  }));

  const loginBg = computed(() =>
    `linear-gradient(160deg, ${get('login_bg_from')} 0%, ${get('login_bg_mid')} 40%, ${get('login_bg_to')} 100%)`
  );

  // ── Load dari API ─────────────────────────────────────────
  const load = async () => {
    loading.value = true;
    try {
      const res = await api.get('/settings');
      settings.value = { ...DEFAULTS, ...res.data.data.settings };
      items.value    = res.data.data.items || [];
      applyCSSVars();
    } catch {
      // Fallback ke defaults, tidak throw error
    } finally {
      loading.value = false;
    }
  };

  // ── Save ke API ───────────────────────────────────────────
  const save = async (patch) => {
    saving.value = true;
    try {
      const res = await api.put('/settings', { settings: patch });
      settings.value = { ...DEFAULTS, ...res.data.data.settings };
      applyCSSVars();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal menyimpan' };
    } finally {
      saving.value = false;
    }
  };

  // ── Upload logo ───────────────────────────────────────────
  const uploadLogo = async (file) => {
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const res = await api.post('/settings/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      settings.value.logo_url = res.data.data.logo_url;
      applyCSSVars();
      return { success: true, logo_url: res.data.data.logo_url };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal upload logo' };
    }
  };

  const deleteLogo = async () => {
    try {
      await api.delete('/settings/logo');
      settings.value.logo_url = '';
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal hapus logo' };
    }
  };

  // ── Apply CSS variables ke :root ──────────────────────────
  const applyCSSVars = () => {
    const root = document.documentElement;
    root.style.setProperty('--sdms-sidebar-bg',     get('sidebar_bg'));
    root.style.setProperty('--sdms-sidebar-accent', get('sidebar_accent'));
    root.style.setProperty('--sdms-sidebar-text',   get('sidebar_text'));
  };

  return {
    settings, items, loading, saving,
    get, sidebarStyle, loginBg,
    load, save, uploadLogo, deleteLogo,
    applyCSSVars,
  };
});
