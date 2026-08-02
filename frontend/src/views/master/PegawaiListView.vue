<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div><h1 class="page-title">Data Pegawai</h1><p class="page-subtitle">Kelola data tenaga kependidikan</p></div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('pegawai:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('pegawai:create')" @click="openForm()" class="btn-primary"><PlusIcon class="w-4 h-4" /> Tambah Pegawai</button>
      </div>
    </div>
    <div class="card p-4"><div class="relative"><MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input v-model="search" @input="debouncedFetch" type="search" placeholder="Cari nama atau NIP..." class="form-input pl-9" /></div></div>
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center"><div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" /></div>
      <template v-else-if="items.length">
        <div class="table-container border-0">
          <table class="table">
            <thead><tr>
              <th class="w-10"><input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" :checked="isAllSelected" :indeterminate="isPartialSelected" @change="toggleAll" /></th>
              <th>Nama</th><th>NIP</th><th>Jabatan</th><th>Unit Kerja</th><th>Status</th><th class="text-right">Aksi</th>
            </tr></thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" :class="isSelected(item.id) ? 'bg-primary-50/50' : ''">
                <td><input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer" :checked="isSelected(item.id)" @change="toggleOne(item.id)" /></td>
                <td><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" :class="getAvatarColor(item.nama)">{{ getInitials(item.nama) }}</div><p class="font-medium text-gray-900">{{ item.nama }}</p></div></td>
                <td class="font-mono text-xs text-gray-600">{{ item.nip || '—' }}</td>
                <td class="text-gray-700">{{ item.jabatan || '—' }}</td>
                <td class="text-gray-600">{{ item.unit_kerja || '—' }}</td>
                <td><span class="badge" :class="item.status_kepegawaian === 'PNS' ? 'badge-blue' : 'badge-green'">{{ item.status_kepegawaian || '—' }}</span></td>
                <td class="text-right"><div class="flex items-center justify-end gap-1">
                  <button v-if="authStore.hasPermission('pegawai:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5"><PencilSquareIcon class="w-4 h-4" /></button>
                  <button v-if="authStore.hasPermission('pegawai:delete')" @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50"><TrashIcon class="w-4 h-4" /></button>
                </div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-50"><BasePagination :current-page="page" :total-pages="totalPages" :total="total" :limit="limit" @change="(p) => { page = p; fetchData(); }" /></div>
      </template>
      <BaseEmpty v-else :title="search ? 'Pegawai tidak ditemukan' : 'Belum ada data pegawai'" />
    </div>

    <ImportExcelModal v-model="showImport" title="Pegawai" :import-fn="importFn" @download-template="doTemplate" @imported="handleImported" />
    <BaseConfirm v-model="showBulkConfirm" title="Hapus Massal Pegawai" :message="`Nonaktifkan ${selected.length} pegawai yang dipilih?`" confirm-label="Ya, Hapus Semua" :danger-mode="true" :loading="bulkDeleting" @confirm="executeBulkDelete" />
    <BulkDeleteBar :count="selected.length" label="pegawai" :deleting="bulkDeleting" @delete="openBulkConfirm" @clear="clearSelected" />
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Pegawai' : 'Tambah Pegawai'" size="lg">
      <form class="grid grid-cols-2 gap-4">
        <div class="form-group col-span-2"><label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label><input v-model="form.nama" type="text" class="form-input" required /></div>
        <div class="form-group"><label class="form-label">NIP</label><input v-model="form.nip" type="text" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Jenis Kelamin</label><select v-model="form.jenis_kelamin" class="form-input"><option value="">-- Pilih --</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
        <div class="form-group"><label class="form-label">Jabatan</label><input v-model="form.jabatan" type="text" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Unit Kerja</label><input v-model="form.unit_kerja" type="text" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Status Kepegawaian</label><select v-model="form.status_kepegawaian" class="form-input"><option value="">--</option><option v-for="s in ['PNS','PPPK','PTY','PTT','Honor']" :key="s" :value="s">{{ s }}</option></select></div>
        <div class="form-group"><label class="form-label">No. HP</label><input v-model="form.no_hp" type="tel" class="form-input" /></div>
        <div class="form-group col-span-2"><label class="form-label">Alamat</label><textarea v-model="form.alamat" class="form-input" rows="2" /></div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm"><span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simpan</button>
      </template>
    </BaseModal>
    <BaseConfirm v-model="showConfirm" title="Nonaktifkan Pegawai" :message="`Nonaktifkan pegawai ${deleteTarget?.nama}?`" confirm-label="Ya" :danger-mode="true" :loading="formLoading" @confirm="executeDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store'; import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast'; import { debounce, getInitials, getAvatarColor } from '@/utils/helpers';
import { useExcelIO } from '@/composables/useExcelIO';
import { useBulkDelete } from '@/composables/useBulkDelete';
import BaseModal from '@/components/common/BaseModal.vue'; import BaseConfirm from '@/components/common/BaseConfirm.vue'; import BasePagination from '@/components/common/BasePagination.vue'; import BaseEmpty from '@/components/common/BaseEmpty.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import BulkDeleteBar from '@/components/common/BulkDeleteBar.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore(); const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Pegawai' }]);

const items = ref([]); const loading = ref(true); const page = ref(1); const limit = 10; const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit));
const search = ref(''); const showForm = ref(false); const editItem = ref(null);
const showConfirm = ref(false); const deleteTarget = ref(null); const formLoading = ref(false);

const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.pegawaiExport,
  templateFn: masterService.pegawaiTemplate,
  importFn:   masterService.pegawaiImport,
  label:      'pegawai',
  onImported: () => fetchData(),
});

const { selected, isAllSelected, isPartialSelected, isSelected, toggleAll, toggleOne,
  clearSelected, openBulkConfirm, executeBulkDelete, bulkDeleting, showBulkConfirm,
} = useBulkDelete({
  items,
  deleteFn: masterService.pegawaiBulkDelete,
  onDeleted: (count) => { notify.success(`${count} pegawai berhasil dihapus`); fetchData(); },
});
const emptyForm = () => ({ nama: '', nip: '', jenis_kelamin: '', jabatan: '', unit_kerja: '', status_kepegawaian: '', no_hp: '', alamat: '' });
const form = ref(emptyForm());
const fetchData = async () => { loading.value = true; try { const r = await masterService.pegawaiList({ page: page.value, limit, search: search.value }); items.value = r.data.data || []; total.value = r.data.meta?.total || 0; } finally { loading.value = false; } };
const debouncedFetch = debounce(() => { page.value = 1; fetchData(); });
const openForm = (item = null) => { editItem.value = item; form.value = item ? { ...item } : emptyForm(); showForm.value = true; };
const submitForm = async () => { formLoading.value = true; try { if (editItem.value) { await masterService.pegawaiUpdate(editItem.value.id, form.value); notify.success('Pegawai diperbarui'); } else { await masterService.pegawaiCreate(form.value); notify.success('Pegawai ditambahkan'); } showForm.value = false; fetchData(); } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; } };
const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => { formLoading.value = true; try { await masterService.pegawaiDelete(deleteTarget.value.id); notify.success('Pegawai dinonaktifkan'); showConfirm.value = false; fetchData(); } catch { notify.error('Gagal'); } finally { formLoading.value = false; } };
onMounted(fetchData);
</script>
