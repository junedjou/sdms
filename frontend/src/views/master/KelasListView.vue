<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div><h1 class="page-title">Data Kelas</h1><p class="page-subtitle">Pengelolaan rombongan belajar</p></div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('kelas:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('kelas:create')" @click="openForm()" class="btn-primary"><PlusIcon class="w-4 h-4" /> Tambah Kelas</button>
      </div>
    </div>

    <div class="card p-4 flex gap-3">
      <select v-model="filterTP" @change="fetchData" class="form-input w-56">
        <option value="">Semua Tahun Pelajaran</option>
        <option v-for="tp in masterStore.tahunPelajaran" :key="tp.id" :value="tp.id">{{ tp.nama }}</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center"><div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" /></div>
      <template v-else-if="items.length">
        <div class="table-container border-0">
          <table class="table">
            <thead><tr><th>Nama Kelas</th><th>Tingkat</th><th>Jurusan</th><th>Wali Kelas</th><th>Kapasitas</th><th>Ruangan</th><th class="text-right">Aksi</th></tr></thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="font-medium text-gray-900">{{ item.nama }}</td>
                <td><span class="badge-blue">Kelas {{ item.tingkat }}</span></td>
                <td>{{ item.jurusan?.kode || '—' }}</td>
                <td class="text-sm text-gray-600">{{ item.waliKelas?.nama || '—' }}</td>
                <td class="text-gray-600">{{ item.kapasitas }} siswa</td>
                <td class="text-gray-600">{{ item.ruangan || '—' }}</td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="authStore.hasPermission('kelas:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit"><PencilSquareIcon class="w-4 h-4" /></button>
                    <button v-if="authStore.hasPermission('kelas:delete')" @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Nonaktifkan"><TrashIcon class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <BaseEmpty v-else title="Belum ada kelas" subtitle="Tambahkan data kelas terlebih dahulu" />
    </div>

    <ImportExcelModal v-model="showImport" title="Kelas" :import-fn="importFn" @download-template="doTemplate" @imported="handleImported" />
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Kelas' : 'Tambah Kelas'" size="md">
      <form class="grid grid-cols-2 gap-4">
        <div class="form-group col-span-2">
          <label class="form-label">Nama Kelas <span class="text-red-500">*</span></label>
          <input v-model="form.nama" type="text" class="form-input" placeholder="X TKJ 1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Tingkat <span class="text-red-500">*</span></label>
          <select v-model="form.tingkat" class="form-input" required>
            <option value="">-- Pilih --</option>
            <option v-for="t in ['X','XI','XII']" :key="t" :value="t">Kelas {{ t }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jurusan</label>
          <select v-model="form.jurusan_id" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Tahun Pelajaran <span class="text-red-500">*</span></label>
          <select v-model="form.tahun_pelajaran_id" class="form-input" required>
            <option value="">-- Pilih --</option>
            <option v-for="tp in masterStore.tahunPelajaran" :key="tp.id" :value="tp.id">{{ tp.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Kapasitas</label>
          <input v-model="form.kapasitas" type="number" class="form-input" placeholder="36" />
        </div>
        <div class="form-group">
          <label class="form-label">Ruangan</label>
          <input v-model="form.ruangan" type="text" class="form-input" />
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

    <BaseConfirm v-model="showConfirm" title="Nonaktifkan Kelas" :message="`Nonaktifkan kelas '${deleteTarget?.nama}'?`" confirm-label="Ya, Nonaktifkan" :danger-mode="true" :loading="formLoading" @confirm="executeDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store'; import { useMasterStore } from '@/stores/master.store'; import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { useExcelIO } from '@/composables/useExcelIO';
import BaseModal from '@/components/common/BaseModal.vue'; import BaseEmpty from '@/components/common/BaseEmpty.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
const authStore = useAuthStore(); const masterStore = useMasterStore(); const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Kelas' }]);

const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.kelasExport,
  templateFn: masterService.kelasTemplate,
  importFn:   masterService.kelasImport,
  label:      'kelas',
  onImported: () => fetchData(),
});

const items = ref([]); const loading = ref(true); const filterTP = ref(masterStore.tahunAktif?.id || '');
const showForm = ref(false); const editItem = ref(null); const formLoading = ref(false);
const showConfirm = ref(false); const deleteTarget = ref(null);
const emptyForm = () => ({ nama: '', tingkat: '', jurusan_id: '', tahun_pelajaran_id: masterStore.tahunAktif?.id || '', kapasitas: 36, ruangan: '' });
const form = ref(emptyForm());

const fetchData = async () => { loading.value = true; try { items.value = (await masterService.kelasList({ tahun_pelajaran_id: filterTP.value || undefined })).data.data || []; } finally { loading.value = false; } };
const openForm = (item = null) => { editItem.value = item; form.value = item ? { ...item, jurusan_id: item.jurusan_id || '', tahun_pelajaran_id: item.tahun_pelajaran_id || '' } : emptyForm(); showForm.value = true; };
const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) { await masterService.kelasUpdate(editItem.value.id, form.value); notify.success('Kelas diperbarui'); }
    else { await masterService.kelasCreate(form.value); notify.success('Kelas ditambahkan'); }
    showForm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; }
};
const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try {
    await masterService.kelasUpdate(deleteTarget.value.id, { is_active: false });
    notify.success(`Kelas ${deleteTarget.value.nama} dinonaktifkan`);
    showConfirm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal'); } finally { formLoading.value = false; }
};

onMounted(fetchData);
</script>
