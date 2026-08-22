<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Siswa</h1>
        <p class="page-subtitle">Kelola data peserta didik sekolah</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('siswa:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('siswa:create')" @click="openForm()" class="btn-primary">
          <PlusIcon class="w-4 h-4" /> <span class="hidden sm:inline">Tambah</span> Siswa
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" @input="debouncedFetch" type="search" placeholder="Cari nama, NISN, NIS..." class="form-input pl-9" />
        </div>
        <select v-model="filterKelas" @change="onFilterChange" class="form-input w-full sm:w-44">
          <option value="">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
        <select v-model="filterJurusan" @change="onFilterChange" class="form-input w-full sm:w-44">
          <option value="">Semua Jurusan</option>
          <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
        </select>
        <select v-model="filterStatus" @change="onFilterChange" class="form-input w-full sm:w-36">
          <option value="Aktif">Aktif</option>
          <option value="">Semua Status</option>
          <option v-for="s in ['Lulus','Pindah','Keluar','Meninggal']" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <!-- Active filters -->
      <div v-if="filterKelas || filterJurusan || filterStatus !== 'Aktif'" class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <span class="text-xs text-slate-400">Filter aktif:</span>
        <button v-if="filterKelas" @click="clearFilter('kelas')"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors">
          {{ kelasList.find(k => k.id === filterKelas)?.nama || 'Kelas' }}
          <XMarkIcon class="w-3 h-3" />
        </button>
        <button v-if="filterJurusan" @click="clearFilter('jurusan')"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors">
          {{ masterStore.jurusan.find(j => j.id === filterJurusan)?.kode || 'Jurusan' }}
          <XMarkIcon class="w-3 h-3" />
        </button>
        <button v-if="filterStatus !== 'Aktif'" @click="clearFilter('status')"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors">
          {{ filterStatus || 'Semua Status' }}
          <XMarkIcon class="w-3 h-3" />
        </button>
        <button @click="clearAllFilters"
          class="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">
          Reset semua
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
      <template v-else-if="items.length">
        <div class="table-wrapper border-0">
          <table class="table">
            <thead>
              <tr>
                <th class="w-10">
                  <input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    :checked="isAllSelected" :indeterminate="isPartialSelected" @change="toggleAll" />
                </th>
                <th>Nama</th>
                <th>NISN / NIS</th>
                <th>Kelas</th>
                <th>Jurusan</th>
                <th>JK</th>
                <th>Tahun Masuk</th>
                <th>Status</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" :class="isSelected(item.id) ? 'bg-primary-50/50' : ''">
                <td>
                  <input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    :checked="isSelected(item.id)" @change="toggleOne(item.id)" />
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         :class="item.jenis_kelamin === 'P' ? 'bg-pink-500' : 'bg-blue-500'">
                      {{ getInitials(item.nama) }}
                    </div>
                    <p class="font-medium text-gray-900">{{ item.nama }}</p>
                  </div>
                </td>
                <td class="font-mono text-xs text-gray-600">
                  <p>{{ item.nisn || '—' }}</p>
                  <p class="text-gray-400">{{ item.nis || '—' }}</p>
                </td>
                <td>
                  <span v-if="item.kelas" class="badge-indigo text-xs">{{ item.kelas.nama }}</span>
                  <span v-else class="text-gray-400 text-xs">—</span>
                </td>
                <td>
                  <span v-if="item.jurusan" class="badge-blue text-xs">{{ item.jurusan.kode }}</span>
                  <span v-else class="text-gray-400 text-xs">—</span>
                </td>
                <td>{{ item.jenis_kelamin === 'L' ? '♂ L' : '♀ P' }}</td>
                <td class="text-gray-600">{{ item.tahun_masuk || '—' }}</td>
                <td><span class="badge" :class="statusClass(item.status)">{{ item.status }}</span></td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="authStore.hasPermission('siswa:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button v-if="authStore.hasPermission('siswa:delete')" @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-50">
          <BasePagination
            :current-page="page" :total-pages="totalPages"
            :total="total" :limit="limit"
            @change="(p) => { page = p; fetchData(); }"
            @limit-change="(l) => { limit = l; page = 1; fetchData(); }"
          />
        </div>
      </template>
      <BaseEmpty v-else :title="search ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'" :icon="search ? 'search' : 'inbox'" />
    </div>

    <ImportExcelModal
      v-model="showImport"
      title="Siswa"
      :import-fn="importFn"
      @download-template="doTemplate"
      @imported="handleImported"
    />
    <BaseConfirm v-model="showBulkConfirm" title="Hapus Massal Siswa" :message="`Nonaktifkan ${selected.length} siswa yang dipilih?`" confirm-label="Ya, Hapus Semua" :danger-mode="true" :loading="bulkDeleting" @confirm="executeBulkDelete" />
    <BulkDeleteBar :count="selected.length" label="siswa" :deleting="bulkDeleting" @delete="openBulkConfirm" @clear="clearSelected" />

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Data Siswa' : 'Tambah Siswa'" size="lg">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-group sm:col-span-2">
          <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.nama" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">NISN</label>
          <input v-model="form.nisn" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">NIS</label>
          <input v-model="form.nis" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Jenis Kelamin <span class="text-red-500">*</span></label>
          <select v-model="form.jenis_kelamin" class="form-input" required>
            <option value="">-- Pilih --</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Kelas</label>
          <select v-model="form.kelas_id" class="form-input">
            <option value="">-- Pilih Kelas --</option>
            <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jurusan</label>
          <select v-model="form.jurusan_id" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tahun Masuk</label>
          <input v-model="form.tahun_masuk" type="number" class="form-input" placeholder="2024" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-input">
            <option v-for="s in ['Aktif','Lulus','Pindah','Keluar']" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tempat Lahir</label>
          <input v-model="form.tempat_lahir" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal Lahir</label>
          <input v-model="form.tanggal_lahir" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Agama</label>
          <select v-model="form.agama" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="a in ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">No. HP</label>
          <input v-model="form.no_hp" type="tel" class="form-input" />
        </div>
        <div class="form-group sm:col-span-2">
          <label class="form-label">Alamat</label>
          <textarea v-model="form.alamat" class="form-input" rows="2" />
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {{ editItem ? 'Simpan' : 'Tambah Siswa' }}
        </button>
      </template>
    </BaseModal>

    <BaseConfirm v-model="showConfirm" title="Nonaktifkan Siswa" :message="`Nonaktifkan siswa ${deleteTarget?.nama}?`" confirm-label="Ya" :danger-mode="true" :loading="formLoading" @confirm="executeDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useMasterStore } from '@/stores/master.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { debounce, getInitials, statusBadgeClass } from '@/utils/helpers';
import { useExcelIO } from '@/composables/useExcelIO';
import { useBulkDelete } from '@/composables/useBulkDelete';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import BulkDeleteBar from '@/components/common/BulkDeleteBar.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore(); const masterStore = useMasterStore(); const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Data Siswa' }]);

// ── State (harus di atas composable yang pakai items) ────────
const items = ref([]); const loading = ref(true);
const page = ref(1); const limit = ref(10); const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit.value));
const search = ref(''); const filterJurusan = ref(''); const filterKelas = ref(''); const filterStatus = ref('Aktif');
const showForm = ref(false); const editItem = ref(null);
const showConfirm = ref(false); const deleteTarget = ref(null); const formLoading = ref(false);

const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.siswaExport,
  templateFn: masterService.siswaTemplate,
  importFn:   masterService.siswaImport,
  label:      'siswa',
  onImported: () => fetchData(),
});

const { selected, isAllSelected, isPartialSelected, isSelected, toggleAll, toggleOne,
  clearSelected, openBulkConfirm, executeBulkDelete, bulkDeleting, showBulkConfirm,
} = useBulkDelete({
  items,
  deleteFn: masterService.siswaBulkDelete,
  onDeleted: (count) => { notify.success(`${count} siswa berhasil dihapus`); fetchData(); },
});

const statusClass = (s) => ({ Aktif: 'badge-green', Lulus: 'badge-blue', Pindah: 'badge-yellow', Keluar: 'badge-red', Meninggal: 'badge-gray' }[s] || 'badge-gray');

// ── Load kelas list ──────────────────────────────────────
const kelasList = ref([]);
const loadKelas = async () => {
  try {
    const res = await masterService.kelasList({ limit: 200 });
    kelasList.value = res.data.data || [];
  } catch { /* silent */ }
};

const emptyForm = () => ({ nama: '', nisn: '', nis: '', jenis_kelamin: '', kelas_id: '', jurusan_id: '', tahun_masuk: '', status: 'Aktif', tempat_lahir: '', tanggal_lahir: '', agama: '', no_hp: '', alamat: '' });
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await masterService.siswaList({
      page: page.value, limit: limit.value,
      search: search.value,
      jurusan_id: filterJurusan.value || undefined,
      kelas_id: filterKelas.value || undefined,
      status: filterStatus.value || undefined,
    });
    items.value = res.data.data || []; total.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data siswa'); } finally { loading.value = false; }
};

const onFilterChange = () => { page.value = 1; fetchData(); };
const clearFilter = (type) => {
  if (type === 'kelas') filterKelas.value = '';
  else if (type === 'jurusan') filterJurusan.value = '';
  else if (type === 'status') filterStatus.value = 'Aktif';
  onFilterChange();
};
const clearAllFilters = () => { search.value = ''; filterJurusan.value = ''; filterKelas.value = ''; filterStatus.value = 'Aktif'; page.value = 1; fetchData(); };

const debouncedFetch = debounce(() => { page.value = 1; fetchData(); });
const openForm = (item = null) => { editItem.value = item; form.value = item ? { nama: item.nama, nisn: item.nisn || '', nis: item.nis || '', jenis_kelamin: item.jenis_kelamin || '', kelas_id: item.kelas_id || '', jurusan_id: item.jurusan_id || '', tahun_masuk: item.tahun_masuk || '', status: item.status || 'Aktif', tempat_lahir: item.tempat_lahir || '', tanggal_lahir: item.tanggal_lahir || '', agama: item.agama || '', no_hp: item.no_hp || '', alamat: item.alamat || '' } : emptyForm(); showForm.value = true; };
const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) { await masterService.siswaUpdate(editItem.value.id, form.value); notify.success('Data siswa diperbarui'); }
    else { await masterService.siswaCreate(form.value); notify.success('Siswa ditambahkan'); }
    showForm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; }
};
const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try { await masterService.siswaDelete(deleteTarget.value.id); notify.success('Siswa dinonaktifkan'); showConfirm.value = false; fetchData(); }
  catch { notify.error('Gagal menghapus'); } finally { formLoading.value = false; }
};

onMounted(() => { fetchData(); loadKelas(); });
</script>
