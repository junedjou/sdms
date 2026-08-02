<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div><h1 class="page-title">Kalender Akademik</h1><p class="page-subtitle">Jadwal kegiatan dan agenda sekolah</p></div>
      <button v-if="authStore.hasPermission('master:view')" @click="openForm()" class="btn-primary">
        <PlusIcon class="w-4 h-4" /> Tambah Kegiatan
      </button>
    </div>

    <!-- Filter -->
    <div class="card p-4 flex gap-3">
      <select v-model="filterTP" @change="fetchData" class="form-input w-56">
        <option value="">Semua Tahun Pelajaran</option>
        <option v-for="tp in masterStore.tahunPelajaran" :key="tp.id" :value="tp.id">{{ tp.nama }}</option>
      </select>
    </div>

    <!-- Grid Kalender -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
      <template v-else-if="items.length">
        <div class="table-container border-0">
          <table class="table">
            <thead>
              <tr><th>Judul Kegiatan</th><th>Tanggal Mulai</th><th>Tanggal Selesai</th><th>Jenis</th><th class="text-right">Aksi</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: item.warna || jenisColor[item.jenis] || '#94a3b8' }" />
                    <span class="font-medium text-gray-900">{{ item.judul }}</span>
                  </div>
                </td>
                <td class="text-gray-600">{{ formatDate(item.tanggal_mulai) }}</td>
                <td class="text-gray-600">{{ formatDate(item.tanggal_selesai) }}</td>
                <td>
                  <span class="badge" :class="jenisBadge[item.jenis] || 'badge-gray'">{{ item.jenis }}</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="openForm(item)" class="btn-ghost btn-sm p-1.5"><PencilSquareIcon class="w-4 h-4" /></button>
                    <button @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50"><TrashIcon class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <BaseEmpty v-else title="Belum ada jadwal kegiatan" />
    </div>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Kegiatan' : 'Tambah Kegiatan'" size="md">
      <form class="space-y-4">
        <div class="form-group">
          <label class="form-label">Judul Kegiatan <span class="text-red-500">*</span></label>
          <input v-model="form.judul" type="text" class="form-input" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Tanggal Mulai <span class="text-red-500">*</span></label>
            <input v-model="form.tanggal_mulai" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Selesai <span class="text-red-500">*</span></label>
            <input v-model="form.tanggal_selesai" type="date" class="form-input" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Jenis</label>
            <select v-model="form.jenis" class="form-input">
              <option v-for="j in ['libur','ujian','kegiatan','penerimaan','lainnya']" :key="j" :value="j">{{ j }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Warna</label>
            <input v-model="form.warna" type="color" class="form-input h-10 cursor-pointer" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Tahun Pelajaran</label>
          <select v-model="form.tahun_pelajaran_id" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="tp in masterStore.tahunPelajaran" :key="tp.id" :value="tp.id">{{ tp.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea v-model="form.deskripsi" class="form-input" rows="2" />
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Simpan
        </button>
      </template>
    </BaseModal>

    <BaseConfirm v-model="showConfirm" title="Hapus Kegiatan" :message="`Hapus kegiatan '${deleteTarget?.judul}'?`" confirm-label="Hapus" :danger-mode="true" :loading="formLoading" @confirm="executeDelete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useMasterStore } from '@/stores/master.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { formatDate } from '@/utils/helpers';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

const authStore   = useAuthStore();
const masterStore = useMasterStore();
const uiStore     = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Kalender Akademik' }]);

const items = ref([]); const loading = ref(true);
const filterTP = ref(masterStore.tahunAktif?.id || '');
const showForm = ref(false); const editItem = ref(null); const formLoading = ref(false);
const showConfirm = ref(false); const deleteTarget = ref(null);

const jenisColor = { libur: '#ef4444', ujian: '#f59e0b', kegiatan: '#3b82f6', penerimaan: '#10b981', lainnya: '#8b5cf6' };
const jenisBadge = { libur: 'badge-red', ujian: 'badge-yellow', kegiatan: 'badge-blue', penerimaan: 'badge-green', lainnya: 'badge-gray' };

const emptyForm = () => ({ judul: '', tanggal_mulai: '', tanggal_selesai: '', jenis: 'kegiatan', warna: '#3b82f6', tahun_pelajaran_id: masterStore.tahunAktif?.id || '', deskripsi: '' });
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await masterService.kalenderList({ tahun_pelajaran_id: filterTP.value || undefined });
    items.value = res.data.data || [];
  } finally { loading.value = false; }
};

const openForm = (item = null) => {
  editItem.value = item;
  form.value = item ? { ...item } : emptyForm();
  showForm.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) { await masterService.kalenderUpdate(editItem.value.id, form.value); notify.success('Kegiatan diperbarui'); }
    else { await masterService.kalenderCreate(form.value); notify.success('Kegiatan ditambahkan'); }
    showForm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; }
};

const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try { await masterService.kalenderDelete(deleteTarget.value.id); notify.success('Kegiatan dihapus'); showConfirm.value = false; fetchData(); }
  catch { notify.error('Gagal menghapus'); } finally { formLoading.value = false; }
};

onMounted(fetchData);
</script>
