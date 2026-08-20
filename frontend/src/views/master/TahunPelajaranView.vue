<template>
  <div class="space-y-5 animate-fade-in">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Tahun Pelajaran & Semester</h1>
        <p class="page-subtitle">Kelola periode akademik sekolah</p>
      </div>
      <button @click="openTPForm()" class="btn-primary">
        <PlusIcon class="w-4 h-4" /> Tahun Pelajaran
      </button>
    </div>

    <!-- ── Tahun Pelajaran Aktif (highlight card) ─────────── -->
    <div v-if="tpAktif" class="card border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white overflow-hidden">
      <div class="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CalendarDaysIcon class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-slate-900">{{ tpAktif.nama }}</h3>
              <span class="badge-green text-xs">Aktif</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ formatDate(tpAktif.tanggal_mulai) }} – {{ formatDate(tpAktif.tanggal_selesai) }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button @click="openTPForm(tpAktif)" class="btn-ghost btn-sm gap-1.5">
            <PencilSquareIcon class="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </div>

      <!-- Semester inline -->
      <div class="border-t border-emerald-100/80 px-5 py-3 bg-emerald-50/30">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Semester</p>
          <button @click="openSemesterForm(tpAktif)" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors gap-1 flex items-center">
            <PlusIcon class="w-3 h-3" /> Tambah
          </button>
        </div>
        <div v-if="tpAktif.semester?.length" class="flex flex-wrap gap-2">
          <div v-for="s in tpAktif.semester" :key="s.id"
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-100/80 shadow-sm">
            <span class="w-2 h-2 rounded-full" :class="s.is_aktif ? 'bg-emerald-500' : 'bg-slate-300'" />
            <div>
              <p class="text-sm font-medium text-slate-800">Semester {{ s.nama }}</p>
              <p class="text-[11px] text-slate-400">{{ formatDate(s.tanggal_mulai) }} – {{ formatDate(s.tanggal_selesai) }}</p>
            </div>
            <div class="flex items-center gap-0.5 ml-2">
              <span v-if="s.is_aktif" class="badge-green text-[10px] px-1.5 py-0">Aktif</span>
              <button @click="openSemesterForm(tpAktif, s)" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><PencilSquareIcon class="w-3.5 h-3.5" /></button>
              <button @click="confirmDeleteSem(s)" class="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><TrashIcon class="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-slate-400 italic">Belum ada semester</p>
      </div>
    </div>

    <!-- ── Daftar Tahun Pelajaran Lainnya (compact table) ─── -->
    <div class="card overflow-hidden">
      <div class="card-header">
        <h2 class="text-sm font-bold text-slate-800">Semua Tahun Pelajaran</h2>
        <span class="badge-gray text-xs">{{ tahunList.length }} total</span>
      </div>

      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
      </div>

      <template v-else-if="tpLainnya.length">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Tahun Pelajaran</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Semester</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tp in tpLainnya" :key="tp.id">
                <td>
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <CalendarDaysIcon class="w-4 h-4 text-slate-400" />
                    </div>
                    <span class="font-semibold text-slate-800">{{ tp.nama }}</span>
                  </div>
                </td>
                <td class="text-sm text-slate-600">{{ formatDate(tp.tanggal_mulai) }}</td>
                <td class="text-sm text-slate-600">{{ formatDate(tp.tanggal_selesai) }}</td>
                <td>
                  <span v-if="tp.semester?.length" class="badge-gray text-xs">
                    {{ tp.semester.length }} semester
                  </span>
                  <span v-else class="text-xs text-slate-400 italic">—</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="setAktif(tp.id)" class="btn-ghost btn-sm text-xs text-emerald-600 hover:bg-emerald-50 gap-1">
                      <CheckCircleIcon class="w-3.5 h-3.5" /> Aktifkan
                    </button>
                    <button @click="openTPForm(tp)" class="btn-ghost btn-sm p-1.5" title="Edit">
                      <PencilSquareIcon class="w-4 h-4 text-slate-500" />
                    </button>
                    <button @click="confirmDeleteTP(tp)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <BaseEmpty v-else-if="!tpAktif" title="Belum ada tahun pelajaran" subtitle="Klik Tahun Pelajaran untuk menambahkan" class="py-10" />
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- MODALS                                                  -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <!-- Form Tahun Pelajaran -->
    <BaseModal v-model="showTPForm" :title="editTP ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran'" size="md">
      <form class="space-y-4">
        <div class="form-group">
          <label class="form-label">Nama <span class="text-red-500">*</span></label>
          <input v-model="tpForm.nama" type="text" class="form-input" placeholder="2025/2026" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Tanggal Mulai</label>
            <input v-model="tpForm.tanggal_mulai" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Selesai</label>
            <input v-model="tpForm.tanggal_selesai" type="date" class="form-input" />
          </div>
        </div>
        <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
          <input v-model="tpForm.is_aktif" type="checkbox" id="tp-aktif" class="rounded" />
          <label for="tp-aktif" class="text-sm text-slate-700 font-medium">Jadikan tahun pelajaran aktif</label>
        </div>
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
    <BaseModal v-model="showSemForm" :title="editSem ? `Edit Semester` : `Tambah Semester — ${semParent?.nama}`" size="sm">
      <form class="space-y-4">
        <div class="form-group">
          <label class="form-label">Semester</label>
          <select v-model="semForm.nama" class="form-input">
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Tanggal Mulai</label>
            <input v-model="semForm.tanggal_mulai" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Selesai</label>
            <input v-model="semForm.tanggal_selesai" type="date" class="form-input" />
          </div>
        </div>
        <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
          <input v-model="semForm.is_aktif" type="checkbox" id="sem-aktif" class="rounded" />
          <label for="sem-aktif" class="text-sm text-slate-700 font-medium">Jadikan semester aktif</label>
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showSemForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitSem">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-white rounded-full animate-spin" />
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
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store';
import { useMasterStore } from '@/stores/master.store';
import { notify } from '@/utils/toast';
import { formatDate } from '@/utils/helpers';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import {
  PlusIcon, CalendarDaysIcon, PencilSquareIcon,
  TrashIcon, CheckCircleIcon,
} from '@heroicons/vue/24/outline';

const uiStore = useUIStore();
const masterStore = useMasterStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Tahun Pelajaran' }]);

const tahunList = ref([]);
const loading = ref(true);
const showTPForm = ref(false);
const showSemForm = ref(false);
const editTP = ref(null);
const editSem = ref(null);
const semParent = ref(null);
const formLoading = ref(false);

const showDeleteTP = ref(false);
const deleteTPTarget = ref(null);
const showDeleteSem = ref(false);
const deleteSemTarget = ref(null);

// ── Computed: pisahkan aktif & lainnya ─────────────────────
const tpAktif = computed(() => tahunList.value.find(tp => tp.is_aktif) || null);
const tpLainnya = computed(() => tahunList.value.filter(tp => !tp.is_aktif));

const emptyTP = () => ({ nama: '', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false });
const emptySem = () => ({ nama: 'Ganjil', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false });
const tpForm = ref(emptyTP());
const semForm = ref(emptySem());

const fetchData = async () => {
  loading.value = true;
  try { tahunList.value = (await masterService.tahunPelajaranList()).data.data || []; }
  finally { loading.value = false; }
};

// ── Tahun Pelajaran ─────────────────────────────────────────
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

// ── Semester ────────────────────────────────────────────────
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
