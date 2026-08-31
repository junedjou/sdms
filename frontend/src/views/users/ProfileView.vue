<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Saya</h1>
        <p class="page-subtitle">Informasi akun dan data pribadi</p>
      </div>
    </div>

    <!-- Info Akun -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700">Informasi Akun</h2>
      </div>
      <div class="card-body">
        <div class="flex items-center gap-5 mb-6">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-lg ring-2 ring-white/20"
            :class="avatarColor">
            {{ initials }}
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">{{ user?.full_name }}</h3>
            <p class="text-sm text-gray-500">{{ user?.email }}</p>
            <span class="badge-blue mt-1 inline-block">{{ user?.role_label }}</span>
          </div>
        </div>
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-gray-400 font-medium">Username</dt>
            <dd class="text-gray-800 mt-0.5">{{ user?.username }}</dd>
          </div>
          <div>
            <dt class="text-gray-400 font-medium">Role</dt>
            <dd class="text-gray-800 mt-0.5">{{ user?.role_label }}</dd>
          </div>
          <div>
            <dt class="text-gray-400 font-medium">Login Terakhir</dt>
            <dd class="text-gray-800 mt-0.5">{{ formatDateTime(user?.last_login_at) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- ── Data Pribadi Siswa (hanya muncul jika role = siswa) ── -->
    <div v-if="isSiswa" class="card">
      <div class="card-header">
        <div class="flex items-center gap-2">
          <IdentificationIcon class="w-4 h-4 text-primary-600" />
          <h2 class="text-sm font-semibold text-gray-700">Data Pribadi</h2>
        </div>
        <span class="text-xs text-gray-400">Data yang tidak bisa diubah ditampilkan abu-abu</span>
      </div>
      <div class="card-body">
        <!-- Loading -->
        <div v-if="siswaLoading" class="flex justify-center py-8">
          <div class="w-7 h-7 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </div>

        <!-- Error -->
        <div v-else-if="siswaError" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          {{ siswaError }}
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleUpdateSiswa" class="space-y-5">

          <!-- Read-only info akademik -->
          <div class="p-4 bg-gray-50 rounded-xl space-y-3">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data Akademik (tidak bisa diubah)</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p class="text-gray-400 text-xs">Nama</p>
                <p class="font-medium text-gray-800">{{ siswaData.nama || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">NISN</p>
                <p class="font-mono font-medium text-gray-800">{{ siswaData.nisn || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">NIS</p>
                <p class="font-mono font-medium text-gray-800">{{ siswaData.nis || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Kelas</p>
                <p class="font-medium text-gray-800">{{ siswaData.kelas?.nama || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Jurusan</p>
                <p class="font-medium text-gray-800">{{ siswaData.jurusan?.nama || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Status</p>
                <span class="badge text-xs" :class="statusClass(siswaData.status)">{{ siswaData.status || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Data yang bisa diedit -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Data yang Bisa Diperbarui</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Tempat Lahir</label>
                <input v-model="siswaForm.tempat_lahir" type="text" class="form-input" placeholder="Kota tempat lahir" />
              </div>
              <div class="form-group">
                <label class="form-label">Tanggal Lahir</label>
                <input v-model="siswaForm.tanggal_lahir" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Agama</label>
                <select v-model="siswaForm.agama" class="form-input">
                  <option value="">-- Pilih --</option>
                  <option v-for="a in ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">No. HP Siswa</label>
                <input v-model="siswaForm.no_hp" type="tel" class="form-input" placeholder="Nomor HP aktif" />
              </div>
              <div class="form-group sm:col-span-2">
                <label class="form-label">Alamat</label>
                <textarea v-model="siswaForm.alamat" class="form-input" rows="2" placeholder="Alamat lengkap tempat tinggal" />
              </div>
            </div>
          </div>

          <!-- Data Orang Tua -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-t pt-4">Data Orang Tua / Wali</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Nama Ayah</label>
                <input v-model="siswaForm.nama_ayah" type="text" class="form-input" placeholder="Nama ayah kandung" />
              </div>
              <div class="form-group">
                <label class="form-label">Nama Ibu</label>
                <input v-model="siswaForm.nama_ibu" type="text" class="form-input" placeholder="Nama ibu kandung" />
              </div>
              <div class="form-group">
                <label class="form-label">No. HP Orang Tua / Wali</label>
                <input v-model="siswaForm.hp_ortu" type="tel" class="form-input" placeholder="Nomor yang bisa dihubungi" />
              </div>
              <div class="form-group">
                <label class="form-label">Bantuan yang Diterima</label>
                <input v-model="siswaForm.pernah_dapat_bantuan" type="text" list="bantuan-opts" class="form-input"
                  placeholder="Contoh: KIP — kosong jika tidak ada" />
                <datalist id="bantuan-opts">
                  <option value="KIP" /><option value="PIP" />
                  <option value="PKH" /><option value="BSM" />
                  <option value="BPNT" /><option value="KIP + PKH" />
                </datalist>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="btn-primary" :disabled="siswaSubmitting">
              <span v-if="siswaSubmitting" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <CheckIcon v-else class="w-4 h-4" />
              Simpan Data Pribadi
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Permissions (sembunyikan untuk siswa agar tidak membingungkan) -->
    <div v-if="!isSiswa" class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700">Permissions Anda</h2>
        <span class="badge-blue">{{ user?.permissions?.length || 0 }} akses</span>
      </div>
      <div class="card-body">
        <div class="flex flex-wrap gap-2">
          <span v-for="perm in user?.permissions" :key="perm" class="badge-gray text-xs font-mono">{{ perm }}</span>
          <p v-if="!user?.permissions?.length" class="text-sm text-gray-400">Tidak ada permission terdaftar</p>
        </div>
      </div>
    </div>

    <!-- Ganti Password -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700">Ganti Password</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleChangePassword" class="space-y-4 sm:space-y-5 max-w-md">
          <div class="form-group">
            <label class="form-label">Password Lama</label>
            <input v-model="pwForm.old_password" type="password" class="form-input" placeholder="Password saat ini" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password Baru</label>
            <input v-model="pwForm.new_password" type="password" class="form-input" placeholder="Minimal 8 karakter" required minlength="8" />
          </div>
          <div class="form-group">
            <label class="form-label">Konfirmasi Password Baru</label>
            <input v-model="pwForm.confirm_password" type="password" class="form-input" placeholder="Ulangi password baru" required />
            <p v-if="pwForm.new_password && pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password" class="form-error">
              Password tidak cocok
            </p>
          </div>
          <button type="submit" class="btn-primary" :disabled="pwLoading">
            <span v-if="pwLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { authService } from '@/services/api';
import { getInitials, getAvatarColor, formatDateTime } from '@/utils/helpers';
import { notify } from '@/utils/toast';
import { IdentificationIcon, CheckIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const uiStore   = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Profil Saya' }]);

const user        = computed(() => authStore.user);
const initials    = computed(() => getInitials(user.value?.full_name));
const avatarColor = computed(() => getAvatarColor(user.value?.full_name));
const isSiswa     = computed(() => authStore.userRole === 'siswa');

const statusClass = (s) => ({
  Aktif: 'badge-green', Lulus: 'badge-blue',
  Pindah: 'badge-yellow', Keluar: 'badge-red', Meninggal: 'badge-gray',
}[s] || 'badge-gray');

// ── Ganti Password ─────────────────────────────────────────
const pwForm    = ref({ old_password: '', new_password: '', confirm_password: '' });
const pwLoading = ref(false);

const handleChangePassword = async () => {
  if (pwForm.value.new_password !== pwForm.value.confirm_password) {
    notify.error('Konfirmasi password tidak cocok');
    return;
  }
  pwLoading.value = true;
  try {
    await authService.changePassword({
      old_password:     pwForm.value.old_password,
      new_password:     pwForm.value.new_password,
      confirm_password: pwForm.value.confirm_password,
    });
    notify.success('Password berhasil diubah');
    pwForm.value = { old_password: '', new_password: '', confirm_password: '' };
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal mengubah password');
  } finally { pwLoading.value = false; }
};

// ── Data Pribadi Siswa ─────────────────────────────────────
const siswaLoading    = ref(false);
const siswaError      = ref('');
const siswaSubmitting = ref(false);
const siswaData       = ref({});

const siswaForm = ref({
  tempat_lahir: '', tanggal_lahir: '', agama: '',
  no_hp: '', alamat: '',
  nama_ayah: '', nama_ibu: '', hp_ortu: '', pernah_dapat_bantuan: '',
});

const loadSiswaProfile = async () => {
  if (!isSiswa.value) return;
  siswaLoading.value = true;
  siswaError.value   = '';
  try {
    const res = await authService.getMySiswaProfile();
    siswaData.value = res.data.data || {};
    const d = siswaData.value;
    siswaForm.value = {
      tempat_lahir:         d.tempat_lahir         || '',
      tanggal_lahir:        d.tanggal_lahir         ? String(d.tanggal_lahir).slice(0, 10) : '',
      agama:                d.agama                 || '',
      no_hp:                d.no_hp                 || '',
      alamat:               d.alamat                || '',
      nama_ayah:            d.nama_ayah             || '',
      nama_ibu:             d.nama_ibu              || '',
      hp_ortu:              d.hp_ortu               || '',
      pernah_dapat_bantuan: d.pernah_dapat_bantuan  || '',
    };
  } catch (err) {
    siswaError.value = err.response?.data?.message || 'Gagal memuat data pribadi';
  } finally { siswaLoading.value = false; }
};

const handleUpdateSiswa = async () => {
  siswaSubmitting.value = true;
  try {
    const res = await authService.updateMySiswaProfile(siswaForm.value);
    siswaData.value = res.data.data || siswaData.value;
    notify.success('Data pribadi berhasil disimpan');
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyimpan data pribadi');
  } finally { siswaSubmitting.value = false; }
};

onMounted(() => { loadSiswaProfile(); });
</script>
