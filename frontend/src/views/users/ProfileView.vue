<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Saya</h1>
        <p class="page-subtitle">Informasi akun dan ubah password</p>
      </div>
    </div>

    <!-- Info Card -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700">Informasi Akun</h2>
      </div>
      <div class="card-body">
        <div class="flex items-center gap-5 mb-6">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-lg ring-2 ring-white/20"
            :class="avatarColor"
          >
            {{ initials }}
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">{{ user?.full_name }}</h3>
            <p class="text-sm text-gray-500">{{ user?.email }}</p>
            <span class="badge-blue mt-1 inline-block">{{ user?.role_label }}</span>
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-gray-400 font-medium">Username</dt>
            <dd class="text-gray-800 mt-0.5">{{ user?.username }}</dd>
          </div>
          <div>
            <dt class="text-gray-400 font-medium">Role</dt>
            <dd class="text-gray-800 mt-0.5">{{ user?.role_label }}</dd>
          </div>
          <div>
            <dt class="text-gray-400 font-medium">Login Terakhir</dt>
            <dd class="text-gray-800 mt-0.5">{{ formatDateTime(user?.last_login_at) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Permissions -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700">Permissions Anda</h2>
        <span class="badge-blue">{{ user?.permissions?.length || 0 }} akses</span>
      </div>
      <div class="card-body">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="perm in user?.permissions"
            :key="perm"
            class="badge-gray text-xs font-mono"
          >
            {{ perm }}
          </span>
          <p v-if="!user?.permissions?.length" class="text-sm text-gray-400">Tidak ada permission terdaftar</p>
        </div>
      </div>
    </div>

    <!-- Ganti Password -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700">Ganti Password</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleChangePassword" class="space-y-4 sm:space-y-5 max-w-md">
          <div class="form-group">
            <label class="form-label">Password Lama</label>
            <input v-model="pwForm.old_password" type="password" class="form-input" placeholder="Password saat ini" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password Baru</label>
            <input v-model="pwForm.new_password" type="password" class="form-input" placeholder="Minimal 8 karakter" required minlength="8" />
          </div>
          <div class="form-group">
            <label class="form-label">Konfirmasi Password Baru</label>
            <input v-model="pwForm.confirm_password" type="password" class="form-input" placeholder="Ulangi password baru" required />
            <p v-if="pwForm.new_password && pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password" class="form-error">
              Password tidak cocok
            </p>
          </div>
          <button type="submit" class="btn-primary" :disabled="pwLoading">
            <span v-if="pwLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { authService } from '@/services/api';
import { getInitials, getAvatarColor, formatDateTime } from '@/utils/helpers';
import { notify } from '@/utils/toast';

const authStore = useAuthStore();
const uiStore   = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Profil Saya' }]);

const user       = computed(() => authStore.user);
const initials   = computed(() => getInitials(user.value?.full_name));
const avatarColor = computed(() => getAvatarColor(user.value?.full_name));

const pwForm     = ref({ old_password: '', new_password: '', confirm_password: '' });
const pwLoading  = ref(false);

const handleChangePassword = async () => {
  if (pwForm.value.new_password !== pwForm.value.confirm_password) {
    notify.error('Konfirmasi password tidak cocok');
    return;
  }
  pwLoading.value = true;
  try {
    await authService.changePassword({
      old_password: pwForm.value.old_password,
      new_password: pwForm.value.new_password,
      confirm_password: pwForm.value.confirm_password,
    });
    notify.success('Password berhasil diubah');
    pwForm.value = { old_password: '', new_password: '', confirm_password: '' };
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal mengubah password');
  } finally {
    pwLoading.value = false;
  }
};
</script>
