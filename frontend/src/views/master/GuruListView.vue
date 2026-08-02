<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Guru</h1>
        <p class="page-subtitle">Kelola data tenaga pendidik sekolah</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <!-- Export & Import buttons -->
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('guru:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('guru:create')" @click="openForm()" class="btn-primary">
          <PlusIcon class="w-4 h-4" /> Tambah Guru
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card p-4 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" @input="debouncedFetch" type="search" placeholder="Cari nama atau NIP..." class="form-input pl-9" />
      </div>
      <select v-model="filterJurusan" @change="fetchData" class="form-input w-full sm:w-48">
        <option value="">Semua Jurusan</option>
        <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
      <template v-else-if="items.length">
        <div class="table-container border-0">
          <table class="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIP / NIY</th>
                <th>Jurusan</th>
                <th>Status</th>
                <th>Mata Pelajaran</th>
                <th>No. HP</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         :class="getAvatarColor(item.nama)">
                      {{ getInitials(item.nama) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ item.nama }}</p>
                      <p class="text-xs text-gray-400">{{ item.jabatan || '—' }}</p>
                    </div>
                  </div>
                </td>
                <td class="text-gray-600 font-mono text-xs">{{ item.nip || item.niy || '—' }}</td>
                <td>
                  <span v-if="item.jurusan" class="badge-blue">{{ item.jurusan.kode }}</span>
                  <span v-else class="text-gray-400">Umum</span>
                </td>
                <td>
                  <span class="badge" :class="item.status_kepegawaian === 'PNS' ? 'badge-blue' : 'badge-green'">
                    {{ item.status_kepegawaian || '—' }}
                  </span>
                </td>
                <td class="text-gray-600 text-sm">{{ item.mata_pelajaran || '—' }}</td>
                <td class="text-gray-600 text-sm">{{ item.no_hp || '—' }}</td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="authStore.hasPermission('guru:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button v-if="authStore.hasPermission('guru:delete')" @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Nonaktifkan">
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
      <BaseEmpty v-else :title="search ? 'Guru tidak ditemukan' : 'Belum ada data guru'" :icon="search ? 'search' : 'inbox'" />
    </div>

    <!-- Import Modal -->
    <ImportExcelModal
      v-model="showImport"
      title="Guru"
      :import-fn="importFn"
      @download-template="doTemplate"
      @imported="handleImported"
    />

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Data Guru' : 'Tambah Guru'" size="lg">
      <form @submit.prevent="submitForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-group sm:col-span-2">
          <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.nama" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">NIP</label>
          <input v-model="form.nip" type="text" class="form-input" placeholder="Opsional" />
        </div>
        <div class="form-group">
          <label class="form-label">NIY</label>
          <input v-model="form.niy" type="text" class="form-input" placeholder="Opsional" />
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
          <label class="form-label">Status Kepegawaian</label>
          <select v-model="form.status_kepegawaian" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="s in ['PNS','PPPK','GTY','GTT','Honor']" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jurusan</label>
          <select v-model="form.jurusan_id" class="form-input">
            <option value="">Semua Jurusan</option>
            <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jabatan</label>
          <input v-model="form.jabatan" type="text" class="form-input" placeholder="Wali Kelas, Wakasek, dst." />
        </div>
        <div class="form-group">
          <label class="form-label">Mata Pelajaran</label>
          <input v-model="form.mata_pelajaran" type="text" class="form-input" placeholder="Matematika, Fisika, dst." />
        </div>
        <div class="form-group">
          <label class="form-label">No. HP</label>
          <input v-model="form.no_hp" type="tel" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-input" />
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
        <div class="form-group sm:col-span-2">
          <label class="form-label">Alamat</label>
          <textarea v-model="form.alamat" class="form-input" rows="2" />
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {{ editItem ? 'Simpan Perubahan' : 'Tambah Guru' }}
        </button>
      </template>
    </BaseModal>

    <!-- Konfirmasi hapus -->
    <BaseConfirm
      v-model="showConfirm"
      title="Nonaktifkan Guru"
      :message="`Nonaktifkan guru ${deleteTarget?.nama}?`"
      confirm-label="Ya, Nonaktifkan"
      :danger-mode="true"
      :loading="formLoading"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useMasterStore } from '@/stores/master.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { debounce, getInitials, getAvatarColor } from '@/utils/helpers';
import { useExcelIO } from '@/composables/useExcelIO';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';

const authStore   = useAuthStore();
const masterStore = useMasterStore();
const uiStore     = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Data Guru' }]);

const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.guruExport,
  templateFn: masterService.guruTemplate,
  importFn:   masterService.guruImport,
  label:      'guru',
  onImported: () => fetchData(),
});

const items = ref([]); const loading = ref(true);
const page = ref(1); const limit = 10; const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit));
const search = ref(''); const filterJurusan = ref('');
const showForm = ref(false); const editItem = ref(null);
const showConfirm = ref(false); const deleteTarget = ref(null);
const formLoading = ref(false);

const emptyForm = () => ({ nama: '', nip: '', niy: '', jenis_kelamin: '', status_kepegawaian: '', jurusan_id: '', jabatan: '', mata_pelajaran: '', no_hp: '', email: '', tempat_lahir: '', tanggal_lahir: '', agama: '', alamat: '' });
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await masterService.guruList({ page: page.value, limit, search: search.value, jurusan_id: filterJurusan.value || undefined });
    items.value = res.data.data || [];
    total.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data guru'); } finally { loading.value = false; }
};

const debouncedFetch = debounce(() => { page.value = 1; fetchData(); });

const openForm = (item = null) => {
  editItem.value = item;
  form.value = item ? { ...item, jurusan_id: item.jurusan_id || '' } : emptyForm();
  showForm.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) { await masterService.guruUpdate(editItem.value.id, form.value); notify.success('Data guru berhasil diperbarui'); }
    else { await masterService.guruCreate(form.value); notify.success('Guru berhasil ditambahkan'); }
    showForm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan data'); } finally { formLoading.value = false; }
};

const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try { await masterService.guruDelete(deleteTarget.value.id); notify.success('Guru berhasil dinonaktifkan'); showConfirm.value = false; fetchData(); }
  catch (err) { notify.error(err.response?.data?.message || 'Gagal menghapus data'); } finally { formLoading.value = false; }
};

onMounted(fetchData);
</script>
