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
      <button @click="openSalinStruktur" class="btn-secondary gap-1.5">
        <DocumentDuplicateIcon class="w-4 h-4" /> Salin Struktur Kelas
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

    <!-- ── Modal Salin Struktur Kelas ── -->
    <BaseModal v-model="salinStruktur.show" title="Salin Struktur Kelas" size="md">
      <div v-if="!salinStruktur.result" class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
          <DocumentDuplicateIcon class="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-sky-800">
            <p class="font-semibold mb-1">Salin semua kelas dari satu tahun pelajaran ke tahun pelajaran lain</p>
            <ul class="space-y-0.5 text-sky-700">
              <li>• Nama, tingkat, jurusan, kapasitas, dan ruangan ikut tersalin</li>
              <li>• Kelas yang sudah ada di tujuan akan dilewati otomatis</li>
              <li>• Siswa tidak ikut dipindahkan — hanya struktur kelas</li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Dari Tahun Pelajaran <span class="text-red-500">*</span></label>
          <select v-model="salinStruktur.dari_id" class="form-input">
            <option value="">-- Pilih sumber --</option>
            <option v-for="tp in tahunList" :key="tp.id" :value="tp.id">
              {{ tp.nama }} {{ tp.is_aktif ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ke Tahun Pelajaran <span class="text-red-500">*</span></label>
          <select v-model="salinStruktur.ke_id" class="form-input">
            <option value="">-- Pilih tujuan --</option>
            <option v-for="tp in tahunList.filter(t => t.id !== salinStruktur.dari_id)" :key="tp.id" :value="tp.id">
              {{ tp.nama }} {{ tp.is_aktif ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
          <input v-model="salinStruktur.salin_wali_kelas" type="checkbox" id="salin-wali" class="rounded" />
          <label for="salin-wali" class="text-sm text-slate-700">Salin wali kelas juga</label>
        </div>

        <div v-if="salinStruktur.loading" class="flex flex-col items-center gap-3 py-4">
          <div class="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
          <p class="text-sm text-gray-500">Sedang menyalin struktur kelas...</p>
        </div>
      </div>

      <!-- Hasil -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <p class="text-2xl font-bold text-emerald-700">{{ salinStruktur.result.dibuat.length }}</p>
            <p class="text-xs text-emerald-600 mt-0.5">Kelas berhasil disalin</p>
          </div>
          <div class="p-4 rounded-xl border text-center" :class="salinStruktur.result.dilewati.length ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'">
            <p class="text-2xl font-bold" :class="salinStruktur.result.dilewati.length ? 'text-amber-600' : 'text-gray-400'">
              {{ salinStruktur.result.dilewati.length }}
            </p>
            <p class="text-xs mt-0.5" :class="salinStruktur.result.dilewati.length ? 'text-amber-500' : 'text-gray-400'">Dilewati (sudah ada)</p>
          </div>
        </div>
        <div v-if="salinStruktur.result.dibuat.length" class="space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelas yang dibuat</p>
          <div class="max-h-48 overflow-y-auto space-y-1 pr-1">
            <div v-for="(k, i) in salinStruktur.result.dibuat" :key="i"
              class="flex items-center justify-between px-3 py-1.5 bg-emerald-50 rounded-lg text-sm">
              <span class="text-gray-800">{{ k.nama }}</span>
              <span class="text-xs px-1.5 py-0.5 rounded font-semibold"
                :class="{ X: 'bg-blue-100 text-blue-700', XI: 'bg-violet-100 text-violet-700', XII: 'bg-emerald-100 text-emerald-700' }[k.tingkat]">
                {{ k.tingkat }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="salinStruktur.result.dilewati.length" class="space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dilewati</p>
          <div class="max-h-32 overflow-y-auto space-y-1 pr-1">
            <div v-for="(k, i) in salinStruktur.result.dilewati" :key="i"
              class="flex items-center justify-between px-3 py-1.5 bg-amber-50 rounded-lg text-sm">
              <span class="text-gray-800">{{ k.nama }}</span>
              <span class="text-xs text-amber-600">{{ k.alasan }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn-secondary" @click="closeSalinStruktur">
          {{ salinStruktur.result ? 'Tutup' : 'Batal' }}
        </button>
        <button v-if="!salinStruktur.result"
          :disabled="salinStruktur.loading || !salinStruktur.dari_id || !salinStruktur.ke_id"
          class="btn-primary bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-60"
          @click="executeSalinStruktur">
          <span v-if="salinStruktur.loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <DocumentDuplicateIcon v-else class="w-4 h-4" />
          Salin Struktur
        </button>
      </template>
    </BaseModal>
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
  TrashIcon, CheckCircleIcon, DocumentDuplicateIcon,
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

// ── Salin Struktur Kelas ──────────────────────────────────────
const salinStruktur = ref({ show: false, loading: false, result: null, dari_id: '', ke_id: '', salin_wali_kelas: true });

const openSalinStruktur = () => {
  salinStruktur.value = {
    show: true, loading: false, result: null,
    dari_id: tpAktif.value?.id || '',
    ke_id: '',
    salin_wali_kelas: true,
  };
};

const closeSalinStruktur = () => {
  salinStruktur.value = { show: false, loading: false, result: null, dari_id: '', ke_id: '', salin_wali_kelas: true };
};

const executeSalinStruktur = async () => {
  salinStruktur.value.loading = true;
  try {
    const res = await masterService.kelasSalinStruktur({
      dari_tahun_pelajaran_id: salinStruktur.value.dari_id,
      ke_tahun_pelajaran_id:   salinStruktur.value.ke_id,
      salin_wali_kelas:        salinStruktur.value.salin_wali_kelas,
    });
    salinStruktur.value.result = res.data.data;
    notify.success(`${res.data.data.dibuat.length} kelas berhasil disalin`);
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyalin struktur kelas');
  } finally { salinStruktur.value.loading = false; }
};
</script>
