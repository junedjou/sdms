<template>
  <BaseModal v-model="show" :title="null" size="xl" @close="$emit('close')">
    <template #default>

      <!-- ── Header ─────────────────────────────────────── -->
      <div class="relative -mx-6 -mt-6 mb-6 px-6 pt-6 pb-5 rounded-t-2xl overflow-hidden"
        :style="headerBg">
        <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style="background: radial-gradient(circle, #fff, transparent)" />
        <div class="flex items-center gap-4">
          <!-- Avatar / inisial -->
          <div class="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-black text-white shadow-lg ring-4 ring-white/20"
            :class="form.jenis_kelamin === 'P' ? 'bg-pink-400' : 'bg-blue-400'">
            {{ getInitials(form.nama) || (isEdit ? '✏️' : '➕') }}
          </div>
          <div>
            <p class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-0.5">
              {{ isEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru' }}
            </p>
            <h2 class="text-lg font-bold text-white leading-tight">
              {{ form.nama || (isEdit ? 'Edit Siswa' : 'Siswa Baru') }}
            </h2>
            <p v-if="form.kelas || form.jurusan_nama" class="text-xs text-white/60 mt-0.5">
              {{ form.kelas_nama }} {{ form.jurusan_nama ? `· ${form.jurusan_nama}` : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Tab Navigasi ──────────────────────────────── -->
      <div class="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" type="button"
          :class="['flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all',
            activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
          <span>{{ tab.icon }}</span>{{ tab.label }}
          <!-- Dot error indikator -->
          <span v-if="tabHasError(tab.id)" class="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5" />
        </button>
      </div>

      <form @submit.prevent="$emit('submit', form)" novalidate>

        <!-- ══ Tab: Data Diri ══════════════════════════════ -->
        <div v-show="activeTab === 'diri'" class="space-y-4">

          <!-- Nama Lengkap -->
          <div>
            <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
            <input v-model="form.nama" type="text" class="form-input"
              :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': errors.nama }"
              placeholder="Nama lengkap siswa" @input="clearError('nama')" />
            <p v-if="errors.nama" class="mt-1 text-xs text-red-500">{{ errors.nama }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- NISN -->
            <div>
              <label class="form-label">NISN</label>
              <input v-model="form.nisn" type="text" class="form-input font-mono"
                placeholder="Nomor Induk Siswa Nasional" maxlength="20" />
            </div>
            <!-- NIS -->
            <div>
              <label class="form-label">NIS</label>
              <input v-model="form.nis" type="text" class="form-input font-mono"
                placeholder="Nomor Induk Sekolah" maxlength="20" />
            </div>

            <!-- Jenis Kelamin -->
            <div>
              <label class="form-label">Jenis Kelamin <span class="text-red-500">*</span></label>
              <div class="flex gap-3 mt-1.5">
                <label v-for="jk in [{ val:'L', label:'♂ Laki-laki', cls:'blue' }, { val:'P', label:'♀ Perempuan', cls:'pink' }]"
                  :key="jk.val"
                  :class="['flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all font-medium text-sm',
                    form.jenis_kelamin === jk.val
                      ? (jk.cls === 'blue' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-pink-400 bg-pink-50 text-pink-700')
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300']">
                  <input type="radio" v-model="form.jenis_kelamin" :value="jk.val" class="sr-only" />
                  {{ jk.label }}
                </label>
              </div>
              <p v-if="errors.jenis_kelamin" class="mt-1 text-xs text-red-500">{{ errors.jenis_kelamin }}</p>
            </div>

            <!-- Status -->
            <div>
              <label class="form-label">Status</label>
              <div class="flex flex-wrap gap-2 mt-1.5">
                <label v-for="s in ['Aktif','Lulus','Pindah','Keluar','Meninggal']" :key="s"
                  :class="['px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all text-xs font-semibold',
                    form.status === s ? statusActiveClass(s) : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300']">
                  <input type="radio" v-model="form.status" :value="s" class="sr-only" />
                  {{ s }}
                </label>
              </div>
            </div>

            <!-- Tempat Lahir -->
            <div>
              <label class="form-label">Tempat Lahir</label>
              <input v-model="form.tempat_lahir" type="text" class="form-input" placeholder="Kota / Kabupaten" />
            </div>
            <!-- Tanggal Lahir -->
            <div>
              <label class="form-label">Tanggal Lahir</label>
              <input v-model="form.tanggal_lahir" type="date" class="form-input" />
              <p v-if="form.tanggal_lahir" class="mt-1 text-xs text-slate-400">
                Usia: {{ hitungUsia(form.tanggal_lahir) }}
              </p>
            </div>

            <!-- Agama -->
            <div>
              <label class="form-label">Agama</label>
              <select v-model="form.agama" class="form-input">
                <option value="">-- Pilih Agama --</option>
                <option v-for="a in agamaList" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <!-- Email -->
            <div>
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-input"
                :class="{ 'border-red-300': errors.email }"
                placeholder="email@siswa.sch.id" @input="clearError('email')" />
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
            </div>

            <!-- No. HP Siswa -->
            <div>
              <label class="form-label">No. HP Siswa</label>
              <input v-model="form.no_hp" type="tel" class="form-input" placeholder="08xxxxxxxxxx" />
            </div>
            <!-- Tahun Masuk -->
            <div>
              <label class="form-label">Tahun Masuk</label>
              <input v-model.number="form.tahun_masuk" type="number" class="form-input"
                placeholder="2024" min="2000" :max="new Date().getFullYear()" />
            </div>
          </div>

          <!-- Alamat -->
          <div>
            <label class="form-label">Alamat</label>
            <textarea v-model="form.alamat" class="form-input" rows="2"
              placeholder="Jalan, desa/kelurahan, kecamatan, kota..." />
          </div>
        </div>

        <!-- ══ Tab: Data Orang Tua ════════════════════════ -->
        <div v-show="activeTab === 'ortu'" class="space-y-5">

          <!-- Ayah -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-base">👨</div>
              <h3 class="text-sm font-bold text-slate-700">Data Ayah</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nama Ayah</label>
                <input v-model="form.orang_tua.nama_ayah" type="text" class="form-input" placeholder="Nama ayah kandung" />
              </div>
              <div>
                <label class="form-label">No. HP Ayah</label>
                <input v-model="form.orang_tua.no_hp_ayah" type="tel" class="form-input" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label class="form-label">Pekerjaan Ayah</label>
                <input v-model="form.orang_tua.pekerjaan_ayah" type="text" class="form-input"
                  list="pekerjaan-list" placeholder="Misal: PNS, Wiraswasta, Petani..." />
              </div>
              <div>
                <label class="form-label">Penghasilan Ayah <span class="text-slate-400 text-xs font-normal">(per bulan)</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                  <input v-model.number="form.orang_tua.penghasilan_ayah" type="number" min="0"
                    class="form-input pl-9" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <!-- Ibu -->
          <div class="border-t border-slate-100 pt-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-base">👩</div>
              <h3 class="text-sm font-bold text-slate-700">Data Ibu</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nama Ibu</label>
                <input v-model="form.orang_tua.nama_ibu" type="text" class="form-input" placeholder="Nama ibu kandung" />
              </div>
              <div>
                <label class="form-label">No. HP Ibu</label>
                <input v-model="form.orang_tua.no_hp_ibu" type="tel" class="form-input" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label class="form-label">Pekerjaan Ibu</label>
                <input v-model="form.orang_tua.pekerjaan_ibu" type="text" class="form-input"
                  list="pekerjaan-list" placeholder="Misal: Ibu Rumah Tangga, PNS, Pedagang..." />
              </div>
              <div>
                <label class="form-label">Penghasilan Ibu <span class="text-slate-400 text-xs font-normal">(per bulan)</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                  <input v-model.number="form.orang_tua.penghasilan_ibu" type="number" min="0"
                    class="form-input pl-9" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <!-- Wali (opsional) -->
          <div class="border-t border-slate-100 pt-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-base">🧑</div>
                <h3 class="text-sm font-bold text-slate-700">Data Wali <span class="text-slate-400 text-xs font-normal">(jika bukan ayah/ibu)</span></h3>
              </div>
              <button type="button" @click="showWali = !showWali"
                class="text-xs text-indigo-600 hover:underline">
                {{ showWali ? 'Sembunyikan' : 'Tambah Data Wali' }}
              </button>
            </div>
            <div v-if="showWali" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nama Wali</label>
                <input v-model="form.orang_tua.nama_wali" type="text" class="form-input" placeholder="Nama wali siswa" />
              </div>
              <div>
                <label class="form-label">No. HP Wali</label>
                <input v-model="form.orang_tua.no_hp_wali" type="tel" class="form-input" placeholder="08xxxxxxxxxx" />
              </div>
              <div class="sm:col-span-2">
                <label class="form-label">Alamat Wali</label>
                <textarea v-model="form.orang_tua.alamat" class="form-input" rows="2"
                  placeholder="Alamat lengkap wali siswa" />
              </div>
            </div>
          </div>

          <!-- No HP Ortu (shortcut — sinkron dengan no_hp_ayah) -->
          <div class="border-t border-slate-100 pt-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base">📱</div>
              <div>
                <h3 class="text-sm font-bold text-slate-700">Kontak Darurat</h3>
                <p class="text-xs text-slate-400">Nomor utama yang bisa dihubungi (otomatis terisi dari HP Ayah)</p>
              </div>
            </div>
            <div>
              <label class="form-label">No. HP Orang Tua / Wali (Kontak Darurat)</label>
              <input v-model="form.hp_ortu" type="tel" class="form-input" placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          <!-- Bantuan -->
          <div class="border-t border-slate-100 pt-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-base">🎓</div>
              <h3 class="text-sm font-bold text-slate-700">Penerima Bantuan</h3>
            </div>
            <div>
              <label class="form-label">Jenis Bantuan <span class="text-slate-400 text-xs font-normal">(kosongkan jika tidak ada)</span></label>
              <input v-model="form.pernah_dapat_bantuan" type="text" list="bantuan-list" class="form-input"
                placeholder="KIP, PIP, PKH, BSM — kosong jika tidak ada" />
              <datalist id="bantuan-list">
                <option value="KIP">KIP (Kartu Indonesia Pintar)</option>
                <option value="PIP">PIP (Program Indonesia Pintar)</option>
                <option value="PKH">PKH (Program Keluarga Harapan)</option>
                <option value="BSM">BSM (Bantuan Siswa Miskin)</option>
                <option value="BPNT">BPNT (Bantuan Pangan Non Tunai)</option>
                <option value="KIP + PKH">KIP + PKH</option>
              </datalist>
              <p class="mt-1 text-xs text-slate-400">Contoh: KIP, PIP, PKH, BSM, BPNT</p>
            </div>
          </div>

          <!-- Datalist pekerjaan (shared) -->
          <datalist id="pekerjaan-list">
            <option value="PNS" /><option value="TNI/Polri" /><option value="Wiraswasta" />
            <option value="Petani" /><option value="Pedagang" /><option value="Nelayan" />
            <option value="Buruh" /><option value="Karyawan Swasta" />
            <option value="Ibu Rumah Tangga" /><option value="Tidak Bekerja" />
            <option value="Pensiunan" /><option value="Dokter" /><option value="Guru/Dosen" />
          </datalist>
        </div>

        <!-- ══ Tab: Akademik ══════════════════════════════ -->
        <div v-show="activeTab === 'akademik'" class="space-y-4">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Kelas -->
            <div>
              <label class="form-label">Kelas</label>
              <select v-model="form.kelas_id" class="form-input" @change="onKelasChange">
                <option value="">-- Pilih Kelas --</option>
                <option v-for="k in kelasList" :key="k.id" :value="k.id">
                  {{ k.nama_kelas || k.nama }}
                </option>
              </select>
            </div>
            <!-- Jurusan -->
            <div>
              <label class="form-label">Jurusan</label>
              <select v-model="form.jurusan_id" class="form-input">
                <option value="">-- Pilih Jurusan --</option>
                <option v-for="j in jurusanList" :key="j.id" :value="j.id">
                  {{ j.nama }} ({{ j.kode }})
                </option>
              </select>
            </div>
          </div>

          <!-- Info kelas terpilih -->
          <div v-if="selectedKelas" class="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
            <span class="text-lg mt-0.5">🏫</span>
            <div>
              <p class="text-sm font-semibold text-indigo-800">{{ selectedKelas.nama_kelas || selectedKelas.nama }}</p>
              <p class="text-xs text-indigo-600 mt-0.5">
                Tingkat {{ selectedKelas.tingkat || '-' }}
                <span v-if="selectedKelas.jurusan"> · {{ selectedKelas.jurusan.nama }}</span>
                <span v-if="selectedKelas.waliKelas"> · Wali: {{ selectedKelas.waliKelas.nama_lengkap }}</span>
              </p>
            </div>
          </div>

        </div>
      </form>

    </template>

    <!-- ── Footer ──────────────────────────────────────── -->
    <template #footer>
      <div class="flex items-center justify-between w-full gap-3">
        <!-- Navigasi antar tab di footer -->
        <div class="flex gap-2">
          <button v-if="activeTab !== 'diri'" type="button" @click="prevTab"
            class="btn-secondary btn-sm gap-1.5">
            ← Sebelumnya
          </button>
          <button v-if="activeTab !== 'akademik'" type="button" @click="nextTab"
            class="btn-secondary btn-sm gap-1.5">
            Selanjutnya →
          </button>
        </div>
        <!-- Aksi simpan -->
        <div class="flex gap-2">
          <button type="button" @click="$emit('close')" class="btn-secondary btn-sm">Batal</button>
          <button type="button" @click="handleSubmit" :disabled="saving"
            class="btn-primary btn-sm gap-2 min-w-[110px]">
            <span v-if="saving" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span v-else>{{ isEdit ? '💾 Simpan' : '➕ Tambah Siswa' }}</span>
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';

// ── Props & Emits ─────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData:   { type: Object,  default: null },   // null = mode tambah
  kelasList:  { type: Array,   default: () => [] },
  jurusanList:{ type: Array,   default: () => [] },
  saving:     { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'close', 'submit']);

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const isEdit = computed(() => !!props.editData);

// ── Tab ───────────────────────────────────────────────────────
const activeTab = ref('diri');
const tabs = [
  { id: 'diri',     label: 'Data Diri',  icon: '👤' },
  { id: 'ortu',     label: 'Orang Tua',  icon: '👨‍👩‍👧' },
  { id: 'akademik', label: 'Akademik',   icon: '🎓' },
];
const tabOrder = ['diri', 'ortu', 'akademik'];
const nextTab = () => {
  const i = tabOrder.indexOf(activeTab.value);
  if (i < tabOrder.length - 1) activeTab.value = tabOrder[i + 1];
};
const prevTab = () => {
  const i = tabOrder.indexOf(activeTab.value);
  if (i > 0) activeTab.value = tabOrder[i - 1];
};

// ── Form State ────────────────────────────────────────────────
const agamaList = ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'];

// State toggle section wali
const showWali = ref(false);

const emptyOrangTua = () => ({
  nama_ayah: '', no_hp_ayah: '', pekerjaan_ayah: '', penghasilan_ayah: null,
  nama_ibu:  '', no_hp_ibu:  '', pekerjaan_ibu:  '', penghasilan_ibu:  null,
  nama_wali: '', no_hp_wali: '', alamat: '',
});

const emptyForm = () => ({
  nama: '', nisn: '', nis: '', jenis_kelamin: '', kelas_id: '', jurusan_id: '',
  tahun_masuk: '', status: 'Aktif', tempat_lahir: '', tanggal_lahir: '',
  agama: '', email: '', no_hp: '', alamat: '', hp_ortu: '',
  nama_ayah: '', nama_ibu: '', pernah_dapat_bantuan: '',
  orang_tua: emptyOrangTua(),
  // computed display helpers (tidak dikirim ke API)
  kelas_nama: '', jurusan_nama: '',
});

const form   = ref(emptyForm());
const errors = ref({});

// Sinkron hp_ortu otomatis dari no_hp_ayah jika hp_ortu masih kosong
watch(() => form.value.orang_tua.no_hp_ayah, (val) => {
  if (!form.value.hp_ortu) form.value.hp_ortu = val;
});

// Isi form saat editData berubah
watch(() => props.editData, (data) => {
  activeTab.value = 'diri';
  showWali.value  = false;
  errors.value    = {};
  if (data) {
    const ot = data.orangTua || {};
    form.value = {
      nama:                data.nama              || '',
      nisn:                data.nisn              || '',
      nis:                 data.nis               || '',
      jenis_kelamin:       data.jenis_kelamin     || '',
      kelas_id:            data.kelas_id          || '',
      jurusan_id:          data.jurusan_id        || '',
      tahun_masuk:         data.tahun_masuk       || '',
      status:              data.status            || 'Aktif',
      tempat_lahir:        data.tempat_lahir      || '',
      tanggal_lahir:       data.tanggal_lahir     || '',
      agama:               data.agama             || '',
      email:               data.email             || '',
      no_hp:               data.no_hp             || '',
      alamat:              data.alamat            || '',
      hp_ortu:             data.hp_ortu           || ot.no_hp_ayah || '',
      nama_ayah:           data.nama_ayah         || ot.nama_ayah  || '',
      nama_ibu:            data.nama_ibu          || ot.nama_ibu   || '',
      pernah_dapat_bantuan:data.pernah_dapat_bantuan || '',
      orang_tua: {
        nama_ayah:      ot.nama_ayah      || data.nama_ayah || '',
        no_hp_ayah:     ot.no_hp_ayah     || data.hp_ortu   || '',
        pekerjaan_ayah: ot.pekerjaan_ayah || '',
        penghasilan_ayah: ot.penghasilan_ayah != null ? Number(ot.penghasilan_ayah) : null,
        nama_ibu:       ot.nama_ibu       || data.nama_ibu  || '',
        no_hp_ibu:      ot.no_hp_ibu      || '',
        pekerjaan_ibu:  ot.pekerjaan_ibu  || '',
        penghasilan_ibu: ot.penghasilan_ibu != null ? Number(ot.penghasilan_ibu) : null,
        nama_wali:      ot.nama_wali      || '',
        no_hp_wali:     ot.no_hp_wali     || '',
        alamat:         ot.alamat         || '',
      },
      kelas_nama:   data.kelas?.nama_kelas || data.kelas?.nama || '',
      jurusan_nama: data.jurusan?.nama     || '',
    };
    // Tampilkan seksi wali jika ada datanya
    showWali.value = !!(ot.nama_wali);
  } else {
    form.value = emptyForm();
  }
}, { immediate: true });

// Header gradient mengikuti gender
const headerBg = computed(() => ({
  background: form.value.jenis_kelamin === 'P'
    ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
}));

// Info kelas terpilih
const selectedKelas = computed(() =>
  props.kelasList.find(k => k.id === form.value.kelas_id) || null
);

// Saat kelas dipilih, auto-isi jurusan jika kelas punya jurusan
const onKelasChange = () => {
  const k = selectedKelas.value;
  if (k?.jurusan_id && !form.value.jurusan_id) {
    form.value.jurusan_id = k.jurusan_id;
  }
  form.value.kelas_nama   = k?.nama_kelas || k?.nama || '';
  form.value.jurusan_nama = k?.jurusan?.nama || '';
};

// ── Validasi ──────────────────────────────────────────────────
const validate = () => {
  const e = {};
  if (!form.value.nama.trim())     e.nama          = 'Nama lengkap wajib diisi';
  if (!form.value.jenis_kelamin)   e.jenis_kelamin = 'Jenis kelamin wajib dipilih';
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    e.email = 'Format email tidak valid';
  }
  errors.value = e;
  // Pindah ke tab yang punya error
  if (e.nama || e.jenis_kelamin || e.email) activeTab.value = 'diri';
  return Object.keys(e).length === 0;
};

const tabHasError = (tabId) => {
  if (tabId === 'diri') return !!(errors.value.nama || errors.value.jenis_kelamin || errors.value.email);
  return false;
};

const clearError = (field) => { delete errors.value[field]; };

const handleSubmit = () => {
  if (!validate()) return;
  // Sinkron field shortcut di tabel siswa dari orang_tua object
  const ot = form.value.orang_tua;
  const payload = { ...form.value };
  payload.nama_ayah = ot.nama_ayah || form.value.nama_ayah || '';
  payload.nama_ibu  = ot.nama_ibu  || form.value.nama_ibu  || '';
  if (!payload.hp_ortu) payload.hp_ortu = ot.no_hp_ayah || '';

  // Bersihkan field orang_tua yang semua kosong (tidak kirim object kosong)
  const otHasData = Object.values(ot).some(v => v !== '' && v !== null && v !== undefined);
  if (!otHasData) delete payload.orang_tua;

  // Bersihkan field display helper
  delete payload.kelas_nama;
  delete payload.jurusan_nama;
  emit('submit', payload);
};

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

const hitungUsia = (tanggal) => {
  if (!tanggal) return '';
  const age = Math.floor((Date.now() - new Date(tanggal)) / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} tahun`;
};

const statusActiveClass = (s) => ({
  'Aktif':     'border-emerald-400 bg-emerald-50 text-emerald-700',
  'Lulus':     'border-blue-400 bg-blue-50 text-blue-700',
  'Pindah':    'border-amber-400 bg-amber-50 text-amber-700',
  'Keluar':    'border-orange-400 bg-orange-50 text-orange-700',
  'Meninggal': 'border-red-400 bg-red-50 text-red-700',
}[s] || '');
</script>
