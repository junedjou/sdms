<template>
  <BaseModal v-model="show" :title="null" size="xl" @close="$emit('close')">
    <template #default>
      <div v-if="loading" class="py-16 flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
        <p class="text-sm text-slate-400">Memuat data siswa...</p>
      </div>

      <div v-else-if="siswa" class="space-y-0">

        <!-- ── Header Profil ─────────────────────────────── -->
        <div class="relative -mx-6 -mt-6 mb-6 px-6 pt-8 pb-6 rounded-t-2xl overflow-hidden"
          :style="headerBg">
          <!-- Blob dekorasi -->
          <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
            style="background: radial-gradient(circle, #fff, transparent)" />
          <div class="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
            style="background: radial-gradient(circle, #fff, transparent); transform: translate(-30%,30%)" />

          <div class="relative flex items-start gap-5">
            <!-- Avatar -->
            <div class="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-black text-white shadow-lg ring-4 ring-white/20"
              :class="siswa.jenis_kelamin === 'P' ? 'bg-pink-500' : 'bg-blue-500'">
              <img v-if="siswa.foto" :src="siswa.foto" :alt="siswa.nama"
                class="w-full h-full object-cover rounded-2xl" />
              <span v-else>{{ getInitials(siswa.nama) }}</span>
            </div>

            <!-- Info utama -->
            <div class="flex-1 min-w-0 pt-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h2 class="text-xl font-bold text-white leading-tight">{{ siswa.nama }}</h2>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  :class="statusClass(siswa.status)">
                  {{ siswa.status }}
                </span>
              </div>
              <div class="flex flex-wrap gap-3 text-sm text-white/70 mt-1">
                <span v-if="siswa.nisn" class="flex items-center gap-1.5">
                  <IdentificationIcon class="w-3.5 h-3.5" />NISN: <span class="font-mono text-white">{{ siswa.nisn }}</span>
                </span>
                <span v-if="siswa.nis" class="flex items-center gap-1.5">
                  <HashtagIcon class="w-3.5 h-3.5" />NIS: <span class="font-mono text-white">{{ siswa.nis }}</span>
                </span>
                <span v-if="siswa.jenis_kelamin" class="flex items-center gap-1.5">
                  {{ siswa.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan' }}
                </span>
              </div>
              <!-- Kelas & Jurusan -->
              <div class="flex flex-wrap gap-2 mt-3">
                <span v-if="siswa.kelas" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur">
                  <AcademicCapIcon class="w-3.5 h-3.5" />{{ siswa.kelas.nama_kelas || siswa.kelas.nama }}
                </span>
                <span v-if="siswa.jurusan" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur">
                  <BookOpenIcon class="w-3.5 h-3.5" />{{ siswa.jurusan.nama }}
                </span>
                <span v-if="siswa.tahun_masuk" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur">
                  <CalendarIcon class="w-3.5 h-3.5" />Angkatan {{ siswa.tahun_masuk }}
                </span>
              </div>
            </div>

            <!-- Status akun -->
            <div v-if="siswa.user" class="flex-shrink-0 text-right">
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                :class="siswa.user.is_active ? 'bg-emerald-500/30 text-emerald-100' : 'bg-white/10 text-white/50'">
                <span class="w-1.5 h-1.5 rounded-full"
                  :class="siswa.user.is_active ? 'bg-emerald-300 animate-pulse' : 'bg-white/30'" />
                {{ siswa.user.is_active ? 'Akun Aktif' : 'Akun Nonaktif' }}
              </div>
              <p class="text-[11px] text-white/40 mt-1 font-mono">@{{ siswa.user.username }}</p>
            </div>
            <div v-else class="flex-shrink-0">
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 text-white/40">
                <NoSymbolIcon class="w-3.5 h-3.5" />Belum punya akun
              </div>
            </div>
          </div>
        </div>

        <!-- ── Tab navigasi ──────────────────────────────── -->
        <div class="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            :class="['flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all',
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
            <component :is="tab.icon" class="w-3.5 h-3.5" />
            {{ tab.label }}
          </button>
        </div>

        <!-- ── Tab: Data Diri ────────────────────────────── -->
        <div v-show="activeTab === 'diri'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="Nama Lengkap" :value="siswa.nama" />
            <InfoField label="Jenis Kelamin" :value="siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'" />
            <InfoField label="Tempat Lahir" :value="siswa.tempat_lahir" />
            <InfoField label="Tanggal Lahir" :value="formatDate(siswa.tanggal_lahir)" :extra="usia(siswa.tanggal_lahir)" />
            <InfoField label="Agama" :value="siswa.agama" />
            <InfoField label="Email" :value="siswa.email" />
            <InfoField label="No. HP Siswa" :value="siswa.no_hp" icon="phone" />
            <InfoField label="Tahun Masuk" :value="siswa.tahun_masuk?.toString()" />
            <InfoField label="Alamat" :value="siswa.alamat" class="sm:col-span-2" />
          </div>
        </div>

        <!-- ── Tab: Orang Tua ────────────────────────────── -->
        <div v-show="activeTab === 'ortu'" class="space-y-4">
          <!-- Ayah -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <span class="text-sm">👨</span>
              </div>
              <h3 class="text-sm font-bold text-slate-700">Data Ayah</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
              <InfoField label="Nama Ayah" :value="ortu.nama_ayah" />
              <InfoField label="Pekerjaan Ayah" :value="ortu.pekerjaan_ayah" />
              <InfoField label="No. HP Ayah" :value="ortu.no_hp_ayah || siswa.hp_ortu" icon="phone" />
              <InfoField label="Penghasilan Ayah" :value="ortu.penghasilan_ayah" />
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4">
            <!-- Ibu -->
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
                <span class="text-sm">👩</span>
              </div>
              <h3 class="text-sm font-bold text-slate-700">Data Ibu</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
              <InfoField label="Nama Ibu" :value="ortu.nama_ibu" />
              <InfoField label="Pekerjaan Ibu" :value="ortu.pekerjaan_ibu" />
              <InfoField label="No. HP Ibu" :value="ortu.no_hp_ibu" icon="phone" />
              <InfoField label="Penghasilan Ibu" :value="ortu.penghasilan_ibu" />
            </div>
          </div>

          <div v-if="ortu.nama_wali" class="border-t border-slate-100 pt-4">
            <!-- Wali -->
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <span class="text-sm">🧑</span>
              </div>
              <h3 class="text-sm font-bold text-slate-700">Data Wali</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
              <InfoField label="Nama Wali" :value="ortu.nama_wali" />
              <InfoField label="No. HP Wali" :value="ortu.no_hp_wali" icon="phone" />
              <InfoField label="Alamat Wali" :value="ortu.alamat" class="sm:col-span-2" />
            </div>
          </div>

          <!-- Bantuan -->
          <div v-if="siswa.pernah_dapat_bantuan" class="border-t border-slate-100 pt-4">
            <div class="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <span class="text-xl">🎓</span>
              <div>
                <p class="text-xs font-semibold text-amber-700">Penerima Bantuan</p>
                <p class="text-sm text-amber-800 mt-0.5">{{ siswa.pernah_dapat_bantuan }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Tab: Akademik ─────────────────────────────── -->
        <div v-show="activeTab === 'akademik'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="Kelas Aktif" :value="siswa.kelas?.nama_kelas || siswa.kelas?.nama" />
            <InfoField label="Jurusan" :value="siswa.jurusan ? `${siswa.jurusan.nama} (${siswa.jurusan.kode})` : null" />
            <InfoField label="Tahun Masuk" :value="siswa.tahun_masuk?.toString()" />
            <InfoField label="Status Akademik" :value="siswa.status" />
            <InfoField label="NISN" :value="siswa.nisn" mono />
            <InfoField label="NIS" :value="siswa.nis" mono />
          </div>

          <!-- Riwayat kelas -->
          <div v-if="siswa.riwayatKelas?.length" class="mt-2">
            <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-slate-400" />
              Riwayat Kelas
            </h3>
            <div class="space-y-2">
              <div v-for="rk in siswa.riwayatKelas" :key="rk.id"
                class="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <AcademicCapIcon class="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ rk.kelas?.nama_kelas || rk.kelas?.nama || `Kelas #${rk.kelas_id?.slice(-6)}` }}</p>
                    <p class="text-xs text-slate-400">{{ rk.tahunPelajaran?.nama || '' }} {{ rk.semester?.nama || '' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span v-if="rk.nomor_absen" class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                    Absen #{{ rk.nomor_absen }}
                  </span>
                  <span v-if="rk.is_aktif" class="ml-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Aktif</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center text-sm text-slate-400">
            Belum ada riwayat kelas
          </div>
        </div>

      </div>

      <!-- Error state -->
      <div v-else class="py-16 text-center">
        <ExclamationCircleIcon class="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p class="text-sm text-slate-400">Gagal memuat data siswa</p>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <!-- Info terakhir update -->
        <p v-if="siswa?.updated_at" class="text-xs text-slate-400">
          Diperbarui: {{ formatDate(siswa.updated_at) }}
        </p>
        <div v-else />
        <button @click="$emit('close')" class="btn-primary btn-sm">Tutup</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { masterService } from '@/services/api';
import { notify } from '@/utils/toast';
import {
  IdentificationIcon, HashtagIcon, AcademicCapIcon,
  BookOpenIcon, CalendarIcon, ClockIcon,
  NoSymbolIcon, ExclamationCircleIcon,
} from '@heroicons/vue/24/outline';

// ── Props ─────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  siswaId:    { type: String, default: null },
});
const emit = defineEmits(['update:modelValue', 'close']);

// ── State ─────────────────────────────────────────────────────
const show      = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
const siswa     = ref(null);
const loading   = ref(false);
const activeTab = ref('diri');

const tabs = [
  { id: 'diri',    label: 'Data Diri',  icon: IdentificationIcon },
  { id: 'ortu',    label: 'Orang Tua',  icon: BookOpenIcon },
  { id: 'akademik',label: 'Akademik',   icon: AcademicCapIcon },
];

// Gabungan data orang tua dari tabel orangTua atau kolom langsung di siswa
const ortu = computed(() => ({
  nama_ayah:       siswa.value?.orangTua?.nama_ayah  || siswa.value?.nama_ayah  || '',
  nama_ibu:        siswa.value?.orangTua?.nama_ibu   || siswa.value?.nama_ibu   || '',
  nama_wali:       siswa.value?.orangTua?.nama_wali  || '',
  pekerjaan_ayah:  siswa.value?.orangTua?.pekerjaan_ayah || '',
  pekerjaan_ibu:   siswa.value?.orangTua?.pekerjaan_ibu  || '',
  no_hp_ayah:      siswa.value?.orangTua?.no_hp_ayah || siswa.value?.hp_ortu    || '',
  no_hp_ibu:       siswa.value?.orangTua?.no_hp_ibu  || '',
  no_hp_wali:      siswa.value?.orangTua?.no_hp_wali || '',
  penghasilan_ayah:siswa.value?.orangTua?.penghasilan_ayah || '',
  penghasilan_ibu: siswa.value?.orangTua?.penghasilan_ibu  || '',
  alamat:          siswa.value?.orangTua?.alamat     || '',
}));

// Header background mengikuti gender
const headerBg = computed(() => ({
  background: siswa.value?.jenis_kelamin === 'P'
    ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
}));

// ── Fetch data saat modal dibuka ─────────────────────────────
watch(() => props.siswaId, async (id) => {
  if (!id) return;
  loading.value  = true;
  siswa.value    = null;
  activeTab.value = 'diri';
  try {
    const res = await masterService.siswaById(id);
    siswa.value = res.data.data;
  } catch {
    notify.error('Gagal memuat detail siswa');
  } finally {
    loading.value = false;
  }
}, { immediate: true });

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const usia = (tanggal) => {
  if (!tanggal) return '';
  const diff = Date.now() - new Date(tanggal).getTime();
  const age  = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} tahun`;
};

const statusClass = (status) => ({
  'bg-emerald-500/30 text-emerald-100': status === 'Aktif',
  'bg-blue-500/30 text-blue-100':      status === 'Lulus',
  'bg-amber-500/30 text-amber-100':    status === 'Pindah' || status === 'Keluar',
  'bg-red-500/30 text-red-100':        status === 'Meninggal',
});
</script>

<!-- ── Sub-komponen InfoField (inline) ───────────────────────── -->
<script>
// Komponen InfoField untuk menampilkan satu field label-value
export const InfoField = {
  props: {
    label: String,
    value: [String, Number],
    extra: String,
    mono:  Boolean,
    icon:  String,
  },
  template: `
    <div class="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
      <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{{ label }}</p>
      <p v-if="value" :class="['text-sm font-medium text-slate-800 break-words', mono ? 'font-mono' : '']">
        {{ value }}
        <span v-if="extra" class="ml-1.5 text-xs text-slate-400 font-normal">({{ extra }})</span>
      </p>
      <p v-else class="text-sm text-slate-300">—</p>
    </div>
  `,
};
</script>
