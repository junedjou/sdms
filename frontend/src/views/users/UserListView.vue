<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div><h1 class="page-title">Manajemen User</h1><p class="page-subtitle">Kelola akun dan hak akses pengguna sistem</p></div>
      <button v-if="authStore.hasPermission('user:create')" @click="openForm()" class="btn-primary">
        <PlusIcon class="w-4 h-4" /> Tambah User
      </button>
    </div>

    <!-- Filter -->
    <div class="card p-4 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" @input="debouncedFetch" type="search" placeholder="Cari nama, username, email..." class="form-input pl-9" />
      </div>
      <select v-model="filterRole" @change="fetchData" class="form-input w-full sm:w-44">
        <option value="">Semua Role</option>
        <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.label }}</option>
      </select>
    </div>

    <!-- Tabel -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
      <template v-else-if="items.length">
        <div class="table-container border-0">
          <table class="table">
            <thead>
              <tr><th>User</th><th>Username</th><th>Role</th><th>Login Terakhir</th><th>Status</th><th class="text-right">Aksi</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         :class="getAvatarColor(item.full_name)">
                      {{ getInitials(item.full_name) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ item.full_name }}</p>
                      <p class="text-xs text-gray-400">{{ item.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="font-mono text-sm text-gray-700">{{ item.username }}</td>
                <td>
                  <span class="badge" :class="roleBadge(item.role?.name)">{{ item.role?.label }}</span>
                </td>
                <td class="text-sm text-gray-500">{{ formatDateTime(item.last_login_at) }}</td>
                <td>
                  <span class="badge" :class="item.is_active ? 'badge-green' : 'badge-red'">
                    {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="authStore.hasPermission('user:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button v-if="authStore.isAdmin" @click="openResetPw(item)" class="btn-ghost btn-sm p-1.5 text-yellow-600 hover:bg-yellow-50" title="Reset Password">
                      <KeyIcon class="w-4 h-4" />
                    </button>
                    <button v-if="authStore.hasPermission('user:delete') && item.id !== authStore.user?.id"
                            @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-50">
          <BasePagination :current-page="page" :total-pages="totalPages" :total="total" :limit="limit" @change="(p) => { page = p; fetchData(); }" />
        </div>
      </template>
      <BaseEmpty v-else :title="search ? 'User tidak ditemukan' : 'Belum ada user'" :icon="search ? 'search' : 'inbox'" />
    </div>

    <!-- Form Modal: Tambah / Edit User -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit User' : 'Tambah User'" size="md">
      <form class="space-y-4">
        <div class="form-group">
          <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.full_name" type="text" class="form-input" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Username <span class="text-red-500">*</span></label>
            <input v-model="form.username" type="text" class="form-input" required autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" class="form-input" required />
          </div>
        </div>
        <div v-if="!editItem" class="form-group">
          <label class="form-label">Password <span class="text-red-500">*</span></label>
          <input v-model="form.password" type="password" class="form-input" required minlength="8" autocomplete="new-password" />
          <p class="text-xs text-gray-400 mt-1">Minimal 8 karakter</p>
        </div>
        <div class="form-group">
          <label class="form-label">Role <span class="text-red-500">*</span></label>
          <select v-model="form.role_id" class="form-input" required>
            <option value="">-- Pilih Role --</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.label }}</option>
          </select>
        </div>
        <div v-if="editItem" class="flex items-center gap-2">
          <input v-model="form.is_active" type="checkbox" id="user-aktif" class="rounded" />
          <label for="user-aktif" class="text-sm text-gray-700">User aktif</label>
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {{ editItem ? 'Simpan Perubahan' : 'Buat User' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal Reset Password -->
    <BaseModal v-model="showResetPw" title="Reset Password" size="sm">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Reset password untuk user <strong>{{ resetTarget?.username }}</strong>.</p>
        <div class="form-group">
          <label class="form-label">Password Baru <span class="text-red-500">*</span></label>
          <input v-model="newPassword" type="password" class="form-input" minlength="8" placeholder="Minimal 8 karakter" />
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showResetPw = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="executeResetPw">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Reset Password
        </button>
      </template>
    </BaseModal>

    <!-- Konfirmasi hapus -->
    <BaseConfirm v-model="showConfirm" title="Hapus User" :message="`Hapus user '${deleteTarget?.username}'? Tindakan ini tidak bisa dibatalkan.`"
      confirm-label="Hapus User" :danger-mode="true" :loading="formLoading" @confirm="executeDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { debounce, getInitials, getAvatarColor, formatDateTime } from '@/utils/helpers';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, KeyIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const uiStore   = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Administrasi' }, { label: 'Manajemen User' }]);

const items = ref([]); const loading = ref(true); const roles = ref([]);
const page = ref(1); const limit = 10; const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit));
const search = ref(''); const filterRole = ref('');
const showForm    = ref(false); const editItem  = ref(null); const formLoading = ref(false);
const showConfirm = ref(false); const deleteTarget = ref(null);
const showResetPw = ref(false); const resetTarget  = ref(null); const newPassword = ref('');

const roleBadge = (name) => ({ super_admin: 'badge-red', admin: 'badge-blue', guru: 'badge-green', pegawai: 'badge-yellow', siswa: 'badge-gray', operator: 'badge-gray' }[name] || 'badge-gray');

const emptyForm = () => ({ full_name: '', username: '', email: '', password: '', role_id: '', is_active: true });
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await userService.list({ page: page.value, limit, search: search.value, role: filterRole.value || undefined });
    items.value = res.data.data || [];
    total.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data user'); } finally { loading.value = false; }
};

const fetchRoles = async () => {
  try { roles.value = (await userService.roles()).data.data || []; } catch { /* skip */ }
};

const debouncedFetch = debounce(() => { page.value = 1; fetchData(); });

const openForm = (item = null) => {
  editItem.value = item;
  form.value = item ? { full_name: item.full_name, username: item.username, email: item.email, role_id: item.role?.id || '', is_active: item.is_active, password: '' }
                    : emptyForm();
  showForm.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) {
      const payload = { full_name: form.value.full_name, username: form.value.username, email: form.value.email, role_id: form.value.role_id, is_active: form.value.is_active };
      await userService.update(editItem.value.id, payload);
      notify.success('User berhasil diperbarui');
    } else {
      await userService.create(form.value);
      notify.success('User berhasil dibuat');
    }
    showForm.value = false;
    fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan user'); } finally { formLoading.value = false; }
};

const openResetPw = (item) => { resetTarget.value = item; newPassword.value = ''; showResetPw.value = true; };
const executeResetPw = async () => {
  if (!newPassword.value || newPassword.value.length < 8) { notify.error('Password minimal 8 karakter'); return; }
  formLoading.value = true;
  try {
    await userService.resetPassword(resetTarget.value.id, { new_password: newPassword.value });
    notify.success(`Password ${resetTarget.value.username} berhasil direset`);
    showResetPw.value = false;
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal reset password'); } finally { formLoading.value = false; }
};

const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try {
    await userService.delete(deleteTarget.value.id);
    notify.success('User berhasil dihapus');
    showConfirm.value = false;
    fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menghapus user'); } finally { formLoading.value = false; }
};

onMounted(() => { fetchData(); fetchRoles(); });
</script>
