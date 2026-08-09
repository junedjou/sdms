<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div><h1 class="page-title">Tahun Pelajaran & Semester</h1><p class="page-subtitle">Kelola periode akademik sekolah</p></div>
      <button @click="openTPForm()" class="btn-primary"><PlusIcon class="w-4 h-4" /> Tahun Pelajaran</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div v-for="tp in tahunList" :key="tp.id" class="card">
        <div class="card-header">
          <div class="flex items-center gap-3">
            <CalendarDaysIcon class="w-5 h-5 text-primary-600" />
            <div>
              <h3 class="font-semibold text-gray-900">{{ tp.nama }}</h3>
              <p class="text-xs text-gray-400">{{ formatDate(tp.tanggal_mulai) }} – {{ formatDate(tp.tanggal_selesai) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="tp.is_aktif" class="badge-green">Aktif</span>
            <button v-else @click="setAktif(tp.id)" class="btn-secondary btn-sm text-xs">Set Aktif</button>
            <button @click="openTPForm(tp)" class="btn-ghost btn-sm p-1.5" title="Edit"><PencilSquareIcon class="w-4 h-4 text-gray-500" /></button>
            <button v-if="!tp.is_aktif" @click="confirmDeleteTP(tp)" class="btn-ghost btn-sm p-1.5" title="Hapus"><TrashIcon class="w-4 h-4 text-red-500" /></button>
          </div>
        </div>
        <div class="card-body">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium text-gray-700">Semester</p>
            <button @click="openSemesterForm(tp)" class="btn-ghost btn-sm text-xs"><PlusIcon class="w-3.5 h-3.5" /> Tambah</button>
          </div>
          <div v-if="tp.semester?.length" class="space-y-2">
            <div v-for="s in tp.semester" :key="s.id" class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
              <div>
                <p class="text-sm font-medium text-gray-800">Semester {{ s.nama }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(s.tanggal_mulai) }} – {{ formatDate(s.tanggal_selesai) }}</p>
              </div>
              <div class="flex items-center gap-1.5">
                <span v-if="s.is_aktif" class="badge-green text-xs">Aktif</span>
                <button @click="openSemesterForm(tp, s)" class="btn-ghost btn-sm p-1" title="Edit"><PencilSquareIcon class="w-3.5 h-3.5 text-gray-500" /></button>
                <button v-if="!s.is_aktif" @click="confirmDeleteSem(s)" class="btn-ghost btn-sm p-1" title="Hapus"><TrashIcon class="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Belum ada semester</p>
        </div>
      </div>
    </div>
    <BaseEmpty v-if="!loading && !tahunList.length" title="Belum ada tahun pelajaran" />

    <!-- Form Tahun Pelajaran -->
    <BaseModal v-model="showTPForm" :title="editTP ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran'" size="md">
      <form class="space-y-4">
        <div class="form-group"><label class="form-label">Nama <span class="text-red-500">*</span></label><input v-model="tpForm.nama" type="text" class="form-input" placeholder="2024/2025" required /></div>
        <div class="form-group"><label class="form-label">Tanggal Mulai</label><input v-model="tpForm.tanggal_mulai" type="date" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Tanggal Selesai</label><input v-model="tpForm.tanggal_selesai" type="date" class="form-input" /></div>
        <div class="flex items-center gap-2"><input v-model="tpForm.is_aktif" type="checkbox" id="tp-aktif" class="rounded" /><label for="tp-aktif" class="text-sm text-gray-700">Jadikan tahun pelajaran aktif</label></div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showTPForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitTP">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Simpan
        </button>
      </template>
    </BaseModal>

    <!-- Form Semester -->
    <BaseModal v-model="showSemForm" :title="editSem ? `Edit Semester — ${semParent?.nama}` : `Tambah Semester — ${semParent?.nama}`" size="md">
      <form class="space-y-4">
        <div class="form-group"><label class="form-label">Semester</label><select v-model="semForm.nama" class="form-input"><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select></div>
        <div class="form-group"><label class="form-label">Tanggal Mulai</label><input v-model="semForm.tanggal_mulai" type="date" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Tanggal Selesai</label><input v-model="semForm.tanggal_selesai" type="date" class="form-input" /></div>
        <div class="flex items-center gap-2"><input v-model="semForm.is_aktif" type="checkbox" id="sem-aktif" class="rounded" /><label for="sem-aktif" class="text-sm text-gray-700">Jadikan semester aktif</label></div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showSemForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitSem">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Simpan
        </button>
      </template>
    </BaseModal>

    <!-- Konfirmasi hapus TP -->
    <BaseConfirm
      v-model="showDeleteTP"
      title="Hapus Tahun Pelajaran"
      :message="`Hapus tahun pelajaran '${deleteTPTarget?.nama}'? Semua semester di dalamnya juga akan dihapus.`"
      confirm-label="Ya, Hapus"
      :danger-mode="true"
      :loading="formLoading"
      @confirm="executeDeleteTP"
    />

    <!-- Konfirmasi hapus Semester -->
    <BaseConfirm
      v-model="showDeleteSem"
      title="Hapus Semester"
      :message="`Hapus semester '${deleteSemTarget?.nama}'?`"
      confirm-label="Ya, Hapus"
      :danger-mode="true"
      :loading="formLoading"
      @confirm="executeDeleteSem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store'; import { useMasterStore } from '@/stores/master.store';
import { notify } from '@/utils/toast'; import { formatDate } from '@/utils/helpers';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import { PlusIcon, CalendarDaysIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

const uiStore = useUIStore(); const masterStore = useMasterStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Tahun Pelajaran' }]);

const tahunList = ref([]); const loading = ref(true);
const showTPForm = ref(false); const showSemForm = ref(false);
const editTP = ref(null); const editSem = ref(null);
const semParent = ref(null); const formLoading = ref(false);

const showDeleteTP = ref(false); const deleteTPTarget = ref(null);
const showDeleteSem = ref(false); const deleteSemTarget = ref(null);

const emptyTP  = () => ({ nama: '', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false });
const emptySem = () => ({ nama: 'Ganjil', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false });
const tpForm  = ref(emptyTP());
const semForm = ref(emptySem());

const fetchData = async () => {
  loading.value = true;
  try { tahunList.value = (await masterService.tahunPelajaranList()).data.data || []; }
  finally { loading.value = false; }
};

// ── Tahun Pelajaran ───────────────────────────────────────────
const openTPForm = (item = null) => {
  editTP.value = item;
  tpForm.value = item
    ? { nama: item.nama, tanggal_mulai: item.tanggal_mulai?.split('T')[0] || '', tanggal_selesai: item.tanggal_selesai?.split('T')[0] || '', is_aktif: item.is_aktif }
    : emptyTP();
  showTPForm.value = true;
};

const submitTP = async () => {
  formLoading.value = true;
  try {
    if (editTP.value) {
      await masterService.tahunPelajaranUpdate(editTP.value.id, tpForm.value);
      notify.success('Tahun pelajaran diperbarui');
    } else {
      await masterService.tahunPelajaranCreate(tpForm.value);
      notify.success('Tahun pelajaran ditambahkan');
    }
    showTPForm.value = false;
    fetchData();
    masterStore.fetchTahunPelajaran();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); }
  finally { formLoading.value = false; }
};

const confirmDeleteTP = (item) => { deleteTPTarget.value = item; showDeleteTP.value = true; };
const executeDeleteTP = async () => {
  formLoading.value = true;
  try {
    await masterService.tahunPelajaranDelete(deleteTPTarget.value.id);
    notify.success('Tahun pelajaran dihapus');
    showDeleteTP.value = false;
    fetchData();
    masterStore.fetchTahunPelajaran();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menghapus'); }
  finally { formLoading.value = false; }
};

const setAktif = async (id) => {
  try {
    await masterService.setTahunAktif(id);
    notify.success('Tahun pelajaran aktif diubah');
    fetchData();
    masterStore.fetchTahunPelajaran();
  } catch { notify.error('Gagal mengubah'); }
};

// ── Semester ──────────────────────────────────────────────────
const openSemesterForm = (tp, sem = null) => {
  semParent.value = tp;
  editSem.value = sem;
  semForm.value = sem
    ? { nama: sem.nama, tanggal_mulai: sem.tanggal_mulai?.split('T')[0] || '', tanggal_selesai: sem.tanggal_selesai?.split('T')[0] || '', is_aktif: sem.is_aktif }
    : emptySem();
  showSemForm.value = true;
};

const submitSem = async () => {
  formLoading.value = true;
  try {
    if (editSem.value) {
      await masterService.semesterUpdate(editSem.value.id, semForm.value);
      notify.success('Semester diperbarui');
    } else {
      await masterService.semesterCreate({ ...semForm.value, tahun_pelajaran_id: semParent.value.id });
      notify.success('Semester ditambahkan');
    }
    showSemForm.value = false;
    fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); }
  finally { formLoading.value = false; }
};

const confirmDeleteSem = (sem) => { deleteSemTarget.value = sem; showDeleteSem.value = true; };
const executeDeleteSem = async () => {
  formLoading.value = true;
  try {
    await masterService.semesterDelete(deleteSemTarget.value.id);
    notify.success('Semester dihapus');
    showDeleteSem.value = false;
    fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menghapus'); }
  finally { formLoading.value = false; }
};

onMounted(fetchData);
</script>
