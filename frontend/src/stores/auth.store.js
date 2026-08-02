import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────
  const user        = ref(null);
  const token       = ref(localStorage.getItem('sdms_token') || null);
  const refreshToken = ref(localStorage.getItem('sdms_refresh_token') || null);
  const loading     = ref(false);
  const error       = ref(null);

  // ── Getters ────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole        = computed(() => user.value?.role || null);
  const userPermissions = computed(() => user.value?.permissions || []);
  const isAdmin         = computed(() => ['super_admin', 'admin'].includes(userRole.value));
  const isSuperAdmin    = computed(() => userRole.value === 'super_admin');

  /**
   * Cek apakah user memiliki permission tertentu
   */
  const hasPermission = (permission) => {
    if (isSuperAdmin.value) return true;
    return userPermissions.value.includes(permission);
  };

  /**
   * Cek apakah user memiliki salah satu dari beberapa permissions
   */
  const hasAnyPermission = (...permissions) => {
    if (isSuperAdmin.value) return true;
    return permissions.some((p) => userPermissions.value.includes(p));
  };

  // ── Actions ────────────────────────────────────────────────
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await authService.login(credentials);
      const data = res.data.data;

      token.value = data.access_token;
      refreshToken.value = data.refresh_token;
      user.value = data.user;

      localStorage.setItem('sdms_token', data.access_token);
      localStorage.setItem('sdms_refresh_token', data.refresh_token);

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'Login gagal';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Tetap logout meskipun request gagal
    } finally {
      _clearAuth();
    }
  };

  const fetchMe = async () => {
    if (!token.value) return;
    try {
      const res = await authService.me();
      user.value = res.data.data;
    } catch {
      _clearAuth();
    }
  };

  const _clearAuth = () => {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('sdms_token');
    localStorage.removeItem('sdms_refresh_token');
  };

  return {
    user, token, loading, error,
    isAuthenticated, userRole, userPermissions,
    isAdmin, isSuperAdmin,
    hasPermission, hasAnyPermission,
    login, logout, fetchMe,
  };
});
