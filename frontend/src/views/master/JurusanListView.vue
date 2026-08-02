<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Jurusan</h1>
        <p class="page-subtitle">Kelola program keahlian / kompetensi sekolah</p>
      </div>
      <button v-if="authStore.hasPermission('jurusan:create')" @click="openForm()" class="btn-primary">
        <PlusIcon class="w-4 h-4" /> Tambah Jurusan
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="card p-5 animate-pulse h-36" />
    </div>

    <!-- Grid jurusan -->
    <div v-else-if="items.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="card p-5 hover:shadow-md transition-all duration-200 group"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center">
            <span class="text-base font-bold text-primary-700">{{ item.kode }}</span>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              v-if="authStore.hasPermission('jurusan:update')"
              @click="openForm(item)"
              class="btn-ghost btn-sm p-1.5"
              title="Edit jurusan"
            >
              <PencilSquareIcon class="w-4 h-4 text-gray-500" />
            </button>
            <button
              v-if="authStore.hasPermission('jurusan:delete')"
              @click="confirmDelete(item)"
              class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50"
              title="Nonaktifkan jurusan"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <h3 class="font-semibold text-gray-900">{{ item.nama }}</h3>
        <p v-if="item.kepalaJurusan" class="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <UserGroupIcon class="w-3.5 h-3.5" />
          Kajur: {{ item.kepalaJurusan.nama }}
        </p>
        <p v-if="item.deskripsi" class="text-xs text-gray-500 mt-2 line-clamp-2">{{ item.deskripsi }}</p>

        <!-- Footer stats -->
        <div class="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3 text-xs text-gray-400">
          <span>Kode: <strong class="text-gray-600">{{ item.kode }}</strong></span>
          <span v-if="item.is_active" class="badge-green text-xs">Aktif</span>
          <span v-else class="badge-red text-xs">Nonaktif</span>
        </div>
      </div>
    </div>

    <BaseEmpty v-else title="Belum ada jurusan" subtitle="Klik Tambah Jurusan untuk mulai menambahkan data" />

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Jurusan' : 'Tambah Jurusan'" size="md">
      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="form-group">
          <label class="form-label">Kode Jurusan <span class="text-red-500">*</span></label>
          <input
            v-model="form.kode"
            type="text"
            class="form-input"
            placeholder="Contoh: TKJ, RPL, AKL"
            required
            maxlength="20"
          />
          <p class="text-xs text-gray-400 mt-1">Kode unik singkatan jurusan, maks 20 karakter</p>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Jurusan <span class="text-red-500">*</span></label>
          <input
            v-model="form.nama"
            type="text"
            class="form-input"
            placeholder="Contoh: Teknik Komputer dan Jaringan"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea v-model="form.deskripsi" class="form-input" rows="3" placeholder="Deskripsi singkat jurusan (opsional)" />
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {{ editItem ? 'Simpan Perubahan' : 'Tambah Jurusan' }}
        </button>
      </template>
    </BaseModal>

    <!-- Konfirmasi nonaktifkan -->
    <BaseConfirm
      v-model="showConfirm"
      title="Nonaktifkan Jurusan"
      :message="`Nonaktifkan jurusan '${deleteTarget?.nama}' (${deleteTarget?.kode})?`"
      confirm-label="Ya, Nonaktifkan"
      :danger-mode="true"
      :loading="formLoading"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useMasterStore } from '@/stores/master.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon, UserGroupIcon } from '@heroicons/vue/24/outline';

const authStore   = useAuthStore();
const masterStore = useMasterStore();
const uiStore     = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Jurusan' }]);

const items       = ref([]);
const loading     = ref(true);
const showForm    = ref(false);
const editItem    = ref(null);
const formLoading = ref(false);
const showConfirm = ref(false);
const deleteTarget = ref(null);

const emptyForm = () => ({ kode: '', nama: '', deskripsi: '' });
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    items.value = (await masterService.jurusanList()).data.data || [];
  } catch {
    notify.error('Gagal memuat data jurusan');
  } finally {
    loading.value = false;
  }
};

const openForm = (item = null) => {
  editItem.value = item;
  form.value = item ? { kode: item.kode, nama: item.nama, deskripsi: item.deskripsi || '' } : emptyForm();
  showForm.value = true;
};

const submitForm = async () => {
  if (!form.value.kode.trim()) { notify.error('Kode jurusan wajib diisi'); return; }
  if (!form.value.nama.trim()) { notify.error('Nama jurusan wajib diisi'); return; }

  formLoading.value = true;
  try {
    if (editItem.value) {
      await masterService.jurusanUpdate(editItem.value.id, form.value);
      notify.success('Jurusan berhasil diperbarui');
    } else {
      await masterService.jurusanCreate(form.value);
      notify.success('Jurusan berhasil ditambahkan');
    }
    showForm.value = false;
    fetchData();
    masterStore.fetchJurusan(); // update lookup global
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyimpan jurusan');
  } finally {
    formLoading.value = false;
  }
};

const confirmDelete = (item) => {
  deleteTarget.value = item;
  showConfirm.value = true;
};

const executeDelete = async () => {
  formLoading.value = true;
  try {
    await masterService.jurusanUpdate(deleteTarget.value.id, { is_active: false });
    notify.success(`Jurusan ${deleteTarget.value.kode} dinonaktifkan`);
    showConfirm.value = false;
    fetchData();
    masterStore.fetchJurusan();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menonaktifkan jurusan');
  } finally {
    formLoading.value = false;
  }
};

onMounted(fetchData);
</script>
