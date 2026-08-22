<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div><h1 class="page-title">Mata Pelajaran</h1><p class="page-subtitle">Kelola daftar mata pelajaran</p></div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('mapel:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('mapel:create')" @click="openForm()" class="btn-primary"><PlusIcon class="w-4 h-4" /> Tambah Mapel</button>
      </div>
    </div>
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center"><div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" /></div>
      <template v-else-if="items.length">
        <div class="table-wrapper border-0">
          <table class="table">
            <thead><tr>
              <th class="w-10"><input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" :checked="isAllSelected" :indeterminate="isPartialSelected" @change="toggleAll" /></th>
              <th>Kode</th><th>Nama</th><th>Kelompok</th><th>Jurusan</th><th>JPM</th><th class="text-right">Aksi</th>
            </tr></thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" :class="isSelected(item.id) ? 'bg-primary-50/50' : ''">
                <td><input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" :checked="isSelected(item.id)" @change="toggleOne(item.id)" /></td>
                <td class="font-mono text-xs font-semibold text-primary-700">{{ item.kode }}</td>
                <td class="font-medium text-gray-900">{{ item.nama }}</td>
                <td><span v-if="item.kelompok" class="badge-gray">{{ item.kelompok }}</span><span v-else class="text-gray-400">—</span></td>
                <td>{{ item.jurusan?.kode || 'Semua' }}</td>
                <td class="text-gray-600">{{ item.jam_per_minggu ? item.jam_per_minggu + ' jp' : '—' }}</td>
                <td class="text-right"><button v-if="authStore.hasPermission('mapel:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5"><PencilSquareIcon class="w-4 h-4" /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <BaseEmpty v-else title="Belum ada mata pelajaran" />
    </div>

    <ImportExcelModal v-model="showImport" title="Mata Pelajaran" :import-fn="importFn" @download-template="doTemplate" @imported="handleImported" />
    <BaseConfirm v-model="showBulkConfirm" title="Hapus Massal Mapel" :message="`Nonaktifkan ${selected.length} mata pelajaran yang dipilih?`" confirm-label="Ya, Hapus Semua" :danger-mode="true" :loading="bulkDeleting" @confirm="executeBulkDelete" />
    <BulkDeleteBar :count="selected.length" label="mapel" :deleting="bulkDeleting" @delete="openBulkConfirm" @clear="clearSelected" />
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Mapel' : 'Tambah Mapel'" size="md">
      <form class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Kode <span class="text-red-500">*</span></label><input v-model="form.kode" type="text" class="form-input" required /></div>
        <div class="form-group"><label class="form-label">Jam/Minggu</label><input v-model="form.jam_per_minggu" type="number" class="form-input" /></div>
        <div class="form-group col-span-2"><label class="form-label">Nama Mata Pelajaran <span class="text-red-500">*</span></label><input v-model="form.nama" type="text" class="form-input" required /></div>
        <div class="form-group"><label class="form-label">Kelompok</label><select v-model="form.kelompok" class="form-input"><option value="">--</option><option v-for="k in ['A','B','C','Muatan Lokal','Pengembangan Diri']" :key="k" :value="k">{{ k }}</option></select></div>
        <div class="form-group"><label class="form-label">Jurusan</label><select v-model="form.jurusan_id" class="form-input"><option value="">Semua</option><option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option></select></div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm"><span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simpan</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store'; import { useMasterStore } from '@/stores/master.store'; import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { useExcelIO } from '@/composables/useExcelIO';
import { useBulkDelete } from '@/composables/useBulkDelete';
import BaseModal from '@/components/common/BaseModal.vue'; import BaseEmpty from '@/components/common/BaseEmpty.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import BulkDeleteBar from '@/components/common/BulkDeleteBar.vue';
import { PlusIcon, PencilSquareIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore(); const masterStore = useMasterStore(); const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Mata Pelajaran' }]);

const items = ref([]); const loading = ref(true); const showForm = ref(false); const editItem = ref(null); const formLoading = ref(false);

const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.mapelExport,
  templateFn: masterService.mapelTemplate,
  importFn:   masterService.mapelImport,
  label:      'mapel',
  onImported: () => fetchData(),
});

const { selected, isAllSelected, isPartialSelected, isSelected, toggleAll, toggleOne,
  clearSelected, openBulkConfirm, executeBulkDelete, bulkDeleting, showBulkConfirm,
} = useBulkDelete({
  items,
  deleteFn: masterService.mapelBulkDelete,
  onDeleted: (count) => { notify.success(`${count} mata pelajaran berhasil dihapus`); fetchData(); },
});
const emptyForm = () => ({ kode: '', nama: '', kelompok: '', jurusan_id: '', jam_per_minggu: '' });
const form = ref(emptyForm());
const fetchData = async () => { loading.value = true; try { items.value = (await masterService.mapelList()).data.data || []; } finally { loading.value = false; } };
const openForm = (item = null) => { editItem.value = item; form.value = item ? { kode: item.kode, nama: item.nama, kelompok: item.kelompok || '', jurusan_id: item.jurusan_id || '', jam_per_minggu: item.jam_per_minggu || '' } : emptyForm(); showForm.value = true; };
const submitForm = async () => { formLoading.value = true; try { if (editItem.value) { await masterService.mapelUpdate(editItem.value.id, form.value); notify.success('Mapel diperbarui'); } else { await masterService.mapelCreate(form.value); notify.success('Mapel ditambahkan'); } showForm.value = false; fetchData(); } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; } };
onMounted(fetchData);
</script>
