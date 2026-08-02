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
              <span v-if="s.is_aktif" class="badge-green text-xs">Aktif</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Belum ada semester</p>
        </div>
      </div>
    </div>
    <BaseEmpty v-if="!loading && !tahunList.length" title="Belum ada tahun pelajaran" />

    <!-- Form Tahun Pelajaran -->
    <BaseModal v-model="showTPForm" title="Tambah Tahun Pelajaran" size="md">
      <form class="space-y-4">
        <div class="form-group"><label class="form-label">Nama <span class="text-red-500">*</span></label><input v-model="tpForm.nama" type="text" class="form-input" placeholder="2024/2025" required /></div>
        <div class="form-group"><label class="form-label">Tanggal Mulai</label><input v-model="tpForm.tanggal_mulai" type="date" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Tanggal Selesai</label><input v-model="tpForm.tanggal_selesai" type="date" class="form-input" /></div>
        <div class="flex items-center gap-2"><input v-model="tpForm.is_aktif" type="checkbox" id="tp-aktif" class="rounded" /><label for="tp-aktif" class="text-sm text-gray-700">Jadikan tahun pelajaran aktif</label></div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showTPForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitTP"><span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simpan</button>
      </template>
    </BaseModal>

    <!-- Form Semester -->
    <BaseModal v-model="showSemForm" :title="`Tambah Semester — ${semParent?.nama}`" size="md">
      <form class="space-y-4">
        <div class="form-group"><label class="form-label">Semester</label><select v-model="semForm.nama" class="form-input"><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select></div>
        <div class="form-group"><label class="form-label">Tanggal Mulai</label><input v-model="semForm.tanggal_mulai" type="date" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Tanggal Selesai</label><input v-model="semForm.tanggal_selesai" type="date" class="form-input" /></div>
        <div class="flex items-center gap-2"><input v-model="semForm.is_aktif" type="checkbox" id="sem-aktif" class="rounded" /><label for="sem-aktif" class="text-sm text-gray-700">Jadikan semester aktif</label></div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showSemForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitSem"><span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simpan</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store'; import { useMasterStore } from '@/stores/master.store';
import { notify } from '@/utils/toast'; import { formatDate } from '@/utils/helpers';
import BaseModal from '@/components/common/BaseModal.vue'; import BaseEmpty from '@/components/common/BaseEmpty.vue';
import { PlusIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline';

const uiStore = useUIStore(); const masterStore = useMasterStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Tahun Pelajaran' }]);

const tahunList = ref([]); const loading = ref(true);
const showTPForm = ref(false); const showSemForm = ref(false);
const semParent = ref(null); const formLoading = ref(false);
const tpForm = ref({ nama: '', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false });
const semForm = ref({ nama: 'Ganjil', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false });

const fetchData = async () => { loading.value = true; try { tahunList.value = (await masterService.tahunPelajaranList()).data.data || []; } finally { loading.value = false; } };
const openTPForm = () => { tpForm.value = { nama: '', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false }; showTPForm.value = true; };
const openSemesterForm = (tp) => { semParent.value = tp; semForm.value = { nama: 'Ganjil', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false, tahun_pelajaran_id: tp.id }; showSemForm.value = true; };
const submitTP = async () => { formLoading.value = true; try { await masterService.tahunPelajaranCreate(tpForm.value); notify.success('Tahun pelajaran ditambahkan'); showTPForm.value = false; fetchData(); masterStore.fetchTahunPelajaran(); } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; } };
const submitSem = async () => { formLoading.value = true; try { await masterService.semesterCreate({ ...semForm.value, tahun_pelajaran_id: semParent.value.id }); notify.success('Semester ditambahkan'); showSemForm.value = false; fetchData(); } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); } finally { formLoading.value = false; } };
const setAktif = async (id) => { try { await masterService.setTahunAktif(id); notify.success('Tahun pelajaran aktif diubah'); fetchData(); masterStore.fetchTahunPelajaran(); } catch { notify.error('Gagal mengubah'); } };

onMounted(fetchData);
</script>
