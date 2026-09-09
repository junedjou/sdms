<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🏠 Application Hub</h1>
        <p class="page-subtitle">Aplikasi terhubung — klik untuk langsung membuka</p>
      </div>
      <div class="flex gap-2">
        <button @click="runHealthCheck" class="btn-secondary btn-sm" :disabled="checkingHealth">
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': checkingHealth }" />
          <span class="hidden sm:inline ml-1">Cek Koneksi</span>
        </button>
        <button v-if="authStore.isAdmin" @click="openSettings" class="btn-secondary btn-sm">
          <Cog6ToothIcon class="w-4 h-4" />
          <span class="hidden sm:inline ml-1">Pengaturan Hub</span>
        </button>
        <button v-if="authStore.isAdmin" @click="showRegisterModal = true" class="btn-primary btn-sm">
          <PlusIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Kelola Aplikasi</span>
        </button>
      </div>
    </div>

    <!-- Status Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-gray-900">{{ apps.length }}</div>
        <div class="text-xs text-gray-500 mt-1">Total Aplikasi</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-emerald-600">{{ onlineCount }}</div>
        <div class="text-xs text-gray-500 mt-1">🟢 Online</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-red-500">{{ offlineCount }}</div>
        <div class="text-xs text-gray-500 mt-1">🔴 Offline</div>
      </div>
      <div class="card p-4 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-blue-600">{{ ssoEnabledCount }}</div>
        <div class="text-xs text-gray-500 mt-1">🔑 SSO Aktif</div>
      </div>
    </div>



    <!-- App Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      <div
        v-for="app in apps"
        :key="app.id"
        class="card group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        @click="launchApp(app)"
      >
        <!-- Gradient Header -->
        <div
          class="h-24 flex items-center justify-center relative overflow-hidden"
          :style="{ background: app.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' }"
        >
          <!-- Decorative circles -->
          <div class="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
          <div class="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

          <!-- App Icon -->
          <div class="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <component :is="app.icon" class="w-7 h-7 text-white drop-shadow" />
          </div>

          <!-- Status badge -->
          <div class="absolute top-3 right-3 flex items-center gap-1.5 backdrop-blur-sm rounded-full px-2.5 py-1"
               :class="statusBgClass(app.status, app.is_maintenance)">
            <span class="w-2 h-2 rounded-full" :class="statusDotClass(app.status, app.is_maintenance)" />
            <span class="text-[10px] font-medium text-white">
              {{ statusLabel(app) }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <h3 class="font-bold text-gray-900 text-base mb-1">{{ app.name }}</h3>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ app.description }}</p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span v-if="app.sso_enabled" class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              🔑 SSO
            </span>
            <span v-if="app.sync_enabled" class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              🔄 Sync
            </span>
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
              {{ app.category || 'Umum' }}
            </span>
            <span v-if="app.latency" class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
              ⚡ {{ app.latency }}ms
            </span>
          </div>

          <!-- Launch Button -->
          <button
            class="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            :style="{ background: app.is_maintenance ? 'linear-gradient(135deg,#f59e0b,#d97706)' : (app.gradient || 'linear-gradient(135deg, #667eea, #764ba2)') }"
            :disabled="launching === app.id || (app.is_maintenance && !authStore.isAdmin)"
          >
            <span v-if="app.is_maintenance && !authStore.isAdmin" class="flex items-center justify-center gap-2">
              <WrenchScrewdriverIcon class="w-4 h-4" /> Maintenance
            </span>
            <span v-else-if="launching === app.id" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Membuka...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <ArrowTopRightOnSquareIcon class="w-4 h-4" />
              <span v-if="app.is_maintenance">Buka {{ app.name }} (Maintenance)</span>
              <span v-else>Buka {{ app.name }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="apps.length === 0 && !loading" class="card p-12 text-center">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
        <Squares2X2Icon class="w-8 h-8 text-indigo-400" />
      </div>
      <p class="text-gray-700 font-semibold">Belum ada aplikasi</p>
      <p class="text-sm text-gray-400 mt-1 mb-4">Aplikasi yang terhubung ke SDMS akan muncul di sini</p>
      <button v-if="authStore.isSuperAdmin" @click="showRegisterModal = true" class="btn-primary btn-sm">
        <PlusIcon class="w-4 h-4" /> Daftarkan Aplikasi
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Admin: Register / Edit Modal -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <BaseModal
      v-model="showRegisterModal"
      :title="showEditModal ? 'Edit Aplikasi' : 'Daftarkan Aplikasi Baru'"
      size="lg"
      @close="closeModals"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi *</label>
          <input v-model="form.name" class="input-field" placeholder="Contoh: LMS Sekolah" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL Aplikasi *</label>
          <input v-model="form.webhook_url" class="input-field font-mono text-sm"
            placeholder="https://lms.sekolah.id" />
          <p class="text-xs text-gray-400 mt-1">URL lengkap server aplikasi (untuk health check & SSO)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">SSO App ID</label>
          <input v-model="form.slug" class="input-field font-mono text-sm"
            placeholder="lms" />
          <p class="text-xs text-gray-400 mt-1">ID aplikasi untuk SSO (contoh: lms, piket, sholat, absen)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="form.description" class="input-field" placeholder="Deskripsi singkat" />
        </div>
      </div>
      <template #footer>
        <button @click="closeModals" class="btn-secondary btn-sm">Batal</button>
        <button @click="saveClient" class="btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Menyimpan...' : (showEditModal ? 'Simpan' : 'Daftarkan') }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal v-model="showDeleteConfirm" title="Hapus Aplikasi" size="sm">
      <p class="text-sm text-gray-600">
        Yakin ingin menghapus <strong>{{ deleteTarget?.name }}</strong>?
      </p>
      <template #footer>
        <button @click="showDeleteConfirm = false" class="btn-secondary btn-sm">Batal</button>
        <button @click="doDelete" class="btn-danger btn-sm" :disabled="deleting">
          {{ deleting ? 'Menghapus...' : 'Hapus' }}
        </button>
      </template>
    </BaseModal>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Admin: Sinkronisasi Panel -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="authStore.isAdmin" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">🔄 Sinkronisasi Data</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Sync Jurnal Guru -->
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
              <ClipboardDocumentListIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Jurnal Guru</h3>
              <p class="text-xs text-gray-500">Sinkron data guru & siswa ke Jurnal Guru</p>
            </div>
          </div>

          <!-- Connection Status -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs text-gray-500">Status:</span>
            <span v-if="jurnalConnection === 'checking'" class="text-xs text-amber-600 flex items-center gap-1">
              <div class="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" /> Mengecek...
            </span>
            <span v-else-if="jurnalConnection === 'online'" class="text-xs text-emerald-600">🟢 Terhubung</span>
            <span v-else-if="jurnalConnection === 'offline'" class="text-xs text-red-500">🔴 Terputus</span>
            <span v-else-if="jurnalConnection === 'no-credentials'" class="text-xs text-amber-600">⚠️ Belum diatur</span>
            <span v-else class="text-xs text-gray-400">—</span>
            <span v-if="jurnalLatency" class="text-[10px] text-gray-400">{{ jurnalLatency }}ms</span>
          </div>

          <!-- Sync Buttons -->
          <div class="space-y-2">
            <button
              @click="syncJurnal('full')"
              class="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
              :disabled="jurnalSyncing"
            >
              <span v-if="jurnalSyncing" class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sinkronisasi...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <ArrowPathIcon class="w-4 h-4" /> Sinkron Semua Data
              </span>
            </button>

            <div class="grid grid-cols-2 gap-2">
              <button @click="syncJurnal('kelas')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">🏫 Kelas</button>
              <button @click="syncJurnal('siswa')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">👩‍🎓 Siswa</button>
              <button @click="syncJurnal('guru')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">👨‍🏫 Guru</button>
              <button @click="syncJurnal('mapel')" class="py-1.5 rounded-lg text-[11px] font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 transition-colors" :disabled="jurnalSyncing">📚 Mapel</button>
            </div>
          </div>

          <p class="text-[10px] text-gray-400 mt-2 text-center">
            Push data dari SDMS ke Jurnal Guru (https://jurnal.smkn1kras.sch.id)
          </p>
        </div>

        <!-- Sync Info -->
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <ExclamationTriangleIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Yang Disinkronkan</h3>
              <p class="text-xs text-gray-500">Data yang dikirim ke aplikasi lain</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">👨‍🏫 Data Guru</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">👩‍🎓 Data Siswa</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">🏫 Data Kelas</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">📚 Mata Pelajaran</span>
              <span class="text-xs text-emerald-600 font-medium">Otomas saat update</span>
            </div>
          </div>

          <div class="mt-3 p-2 bg-blue-50 rounded-lg">
            <p class="text-[11px] text-blue-600">
              💡 <strong>Otomatis:</strong> Setiap kali admin update data guru/siswa di SDMS, data langsung dikirim ke aplikasi terhubung. Sinkron manual hanya untuk first-time setup atau pemulihan data.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin: Manage Apps Table -->
    <div v-if="authStore.isAdmin && clients.length > 0" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">⚙️ Kelola Aplikasi (Admin)</h2>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>SSO ID</th>
              <th>URL</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.id">
              <td class="font-medium text-gray-900">{{ client.name }}</td>
              <td><code class="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{{ client.slug || '-' }}</code></td>
              <td class="text-xs text-gray-500 break-all max-w-[200px] truncate">{{ client.webhook_url || '-' }}</td>
              <td>
                <span class="badge text-xs" :class="client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'">
                  {{ client.status }}
                </span>
              </td>
              <td>
                <div class="flex gap-1">
                  <button @click="editClient(client)" class="btn-secondary btn-sm text-xs px-2">
                    <PencilIcon class="w-3.5 h-3.5" />
                  </button>
                  <button @click="confirmDelete(client)" class="btn-secondary btn-sm text-xs px-2 text-red-500 hover:bg-red-50">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- Admin: Modal Pengaturan App Hub -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <BaseModal
      v-model="showSettingModal"
      title="⚙️ Pengaturan App Hub"
      size="xl"
      @close="showSettingModal = false"
    >
      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <p class="text-sm text-gray-500">Atur visibilitas setiap aplikasi per role pengguna dan status maintenance.</p>

        <div v-for="item in settingDraft" :key="item.id" class="border border-gray-200 rounded-xl p-4">
          <!-- Header app -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ item.name }}</span>
              <code class="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-500">{{ item.id }}</code>
            </div>
            <!-- Toggle maintenance -->
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <span class="text-xs font-medium" :class="item.is_maintenance ? 'text-amber-600' : 'text-gray-400'">
                <WrenchScrewdriverIcon class="w-4 h-4 inline -mt-0.5" />
                Maintenance
              </span>
              <button
                type="button"
                @click="item.is_maintenance = !item.is_maintenance"
                :class="[
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  item.is_maintenance ? 'bg-amber-500' : 'bg-gray-200',
                ]"
              >
                <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', item.is_maintenance ? 'translate-x-5' : 'translate-x-0.5']" />
              </button>
            </label>
          </div>

          <!-- Role checkboxes -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-gray-500">Tampilkan untuk role:</span>
              <button type="button" @click="toggleAllRoles(item)" class="text-xs text-indigo-600 hover:underline">
                {{ item.visible_roles.length === ALL_ROLES.length ? 'Hapus Semua' : 'Pilih Semua' }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="role in ALL_ROLES" :key="role.value"
                class="flex items-center gap-1.5 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  :checked="item.visible_roles.includes(role.value)"
                  @change="toggleRole(item, role.value)"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-xs px-2 py-0.5 rounded-full"
                  :class="item.visible_roles.includes(role.value)
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'bg-gray-50 text-gray-400'">
                  {{ role.label }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="showSettingModal = false" class="btn-secondary btn-sm">Batal</button>
        <button @click="saveSettings" class="btn-primary btn-sm" :disabled="savingSettings">
          {{ savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiHubService, gatewayService, settingsService } from '@/services/api';
import { notify } from '@/utils/toast';
import BaseModal from '@/components/common/BaseModal.vue';
import {
  ArrowPathIcon, PlusIcon, ArrowTopRightOnSquareIcon, Squares2X2Icon,
  ExclamationTriangleIcon, Cog6ToothIcon,
  BookOpenIcon, ClipboardDocumentListIcon, MoonIcon,
  CalendarDaysIcon, AcademicCapIcon, GlobeAltIcon, LinkIcon,
  PencilIcon, TrashIcon, WrenchScrewdriverIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ── Semua role yang ada di SDMS ─────────────────────────────
const ALL_ROLES = [
  { value: 'super_admin',    label: 'Super Admin' },
  { value: 'admin',          label: 'Admin' },
  { value: 'guru',           label: 'Guru' },
  { value: 'wali_kelas',     label: 'Wali Kelas' },
  { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
  { value: 'pegawai',        label: 'Pegawai' },
  { value: 'petugas_piket',  label: 'Petugas Piket' },
  { value: 'siswa',          label: 'Siswa' },
];

// ── App definitions (built-in) ──────────────────────────────
const builtinApps = [
  {
    id: 'lms', name: 'LMS Sekolah', slug: 'lms',
    description: 'Learning Management System — belajar online, tugas, ujian',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: BookOpenIcon, category: 'Akademik',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'piket', name: 'Jurnal Piket', slug: 'piket',
    description: 'Catatan piket harian — guru piket, siswa melanggar, laporan',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: ClipboardDocumentListIcon, category: 'Kesiswaan',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'jurnal', name: 'Jurnal Guru', slug: 'jurnal',
    description: 'E-Journal Guru — jurnal harian, absensi kelas, nilai, rekap',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    icon: ClipboardDocumentListIcon, category: 'Akademik',
    sso_enabled: true, sync_enabled: true,
    app_url: 'https://jurnal.smkn1kras.sch.id',
    status: 'unknown', latency: null,
  },
  {
    id: 'absen', name: 'Absen', slug: 'absen',
    description: 'Sistem absensi digital — wajah, QR, kartu, laporan',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: CalendarDaysIcon, category: 'Kehadiran',
    sso_enabled: true, sync_enabled: true,
    app_url: 'https://absen.smkn1kras.sch.id',
    status: 'unknown', latency: null,
  },
  {
    id: 'sholat', name: 'Sholat & Ibadah', slug: 'sholat',
    description: 'Monitoring sholat berjamaah, absensi keagamaan',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: MoonIcon, category: 'Keagamaan',
    sso_enabled: true, sync_enabled: true,
    status: 'unknown', latency: null,
  },
  {
    id: 'kegiatan', name: 'Kegiatan Sekolah', slug: 'kegiatan',
    description: 'Event, ekstrakurikuler, jadwal kegiatan',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: CalendarDaysIcon, category: 'Kegiatan',
    sso_enabled: true, sync_enabled: false,
    status: 'unknown', latency: null,
  },
  {
    id: 'kelulusan', name: 'Kelulusan', slug: 'kelulusan',
    description: 'Manajemen kelulusan, rapor, transkrip',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: AcademicCapIcon, category: 'Akademik',
    sso_enabled: true, sync_enabled: false,
    status: 'unknown', latency: null,
  },
  {
    id: 'website', name: 'Website Sekolah', slug: 'website',
    description: 'Portal website resmi sekolah',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    icon: GlobeAltIcon, category: 'Publik',
    sso_enabled: false, sync_enabled: true,
    status: 'unknown', latency: null,
  },
];

// ── State ───────────────────────────────────────────────────
const allApps     = ref(JSON.parse(JSON.stringify(builtinApps))); // semua app (admin)
const apps        = ref([]);   // app yang ditampilkan (sudah difilter per role)
const appHubConfig = ref([]);  // config dari backend {id, visible_roles, is_maintenance}
const clients     = ref([]);
const loading     = ref(false);
const saving      = ref(false);
const deleting    = ref(false);
const launching   = ref(null);
const checkingHealth  = ref(false);
const healthChecked   = ref(false);
const jurnalSyncing   = ref(false);
const jurnalConnection = ref('checking');
const jurnalLatency   = ref(null);

// App Hub Setting modal
const showSettingModal = ref(false);
const settingDraft     = ref([]); // copy untuk di-edit
const savingSettings   = ref(false);

// Register / Edit / Delete modals
const showRegisterModal = ref(false);
const showEditModal     = ref(false);
const showDeleteConfirm = ref(false);
const deleteTarget      = ref(null);
const editTarget        = ref(null);
const form = ref({ name: '', webhook_url: '', slug: '', description: '', events: ['*'] });

// ── Computed ────────────────────────────────────────────────
const onlineCount    = computed(() => apps.value.filter(a => a.status === 'online').length);
const offlineCount   = computed(() => apps.value.filter(a => a.status === 'offline').length);
const ssoEnabledCount = computed(() => apps.value.filter(a => a.sso_enabled).length);

// ── Helpers: gabungkan config backend ke app list ───────────
const applyConfig = (appList, config) => {
  return appList.map(app => {
    const cfg = config.find(c => c.id === app.id);
    return {
      ...app,
      is_maintenance: cfg?.is_maintenance ?? false,
      // Jika cfg tidak ditemukan (belum pernah dikonfigurasi), default ke semua role.
      // Jika cfg ditemukan tapi visible_roles kosong ([]), artinya memang sengaja disembunyikan.
      visible_roles: cfg !== undefined ? cfg.visible_roles : ALL_ROLES.map(r => r.value),
    };
  });
};

// ── Filter apps berdasarkan role user ───────────────────────
const filterForUser = (appList) => {
  if (authStore.isAdmin) return appList; // admin lihat semua
  const userRoles = [authStore.userRole, ...(authStore.user?.extra_roles || [])];
  return appList.filter(app => {
    // Jika visible_roles kosong = tidak tampil untuk siapapun (kecuali admin)
    if (!app.visible_roles || app.visible_roles.length === 0) return false;
    return app.visible_roles.some(r => userRoles.includes(r));
  });
};

// ── Load App Hub config dari backend ───────────────────────
const loadAppHubConfig = async () => {
  try {
    const res = await settingsService.getAppHubConfig();
    const config = res.data.data?.config || [];
    appHubConfig.value = config;

    // Apply config ke semua app
    const configured = applyConfig(allApps.value, config);
    allApps.value = configured;

    // Filter untuk user yang login
    apps.value = filterForUser(configured);
  } catch {
    // Fallback: tampilkan semua
    apps.value = filterForUser(allApps.value);
  }
};

// ── Status helpers ──────────────────────────────────────────
const statusLabel = (app) => {
  if (app.is_maintenance) return 'Maintenance';
  if (app.status === 'online')  return 'Online';
  if (app.status === 'offline') return 'Offline';
  return 'Cek Koneksi';
};
const statusBgClass = (status, maintenance) => {
  if (maintenance) return 'bg-amber-500/70';
  return 'bg-black/30';
};
const statusDotClass = (status, maintenance) => {
  if (maintenance)             return 'bg-amber-300';
  if (status === 'online')     return 'bg-emerald-400';
  if (status === 'offline')    return 'bg-red-400';
  return 'bg-amber-400';
};

// ── Health Check ────────────────────────────────────────────
const runHealthCheck = async (silent = false) => {
  checkingHealth.value = true;
  apps.value.forEach(a => { a.status = 'checking'; a.latency = null; });
  try {
    const res = await gatewayService.health();
    const integrations = res.data.data?.integrations || res.data.integrations || [];
    integrations.forEach(item => {
      const found = apps.value.find(a => a.slug === item.app || a.id === item.app);
      if (found) { found.status = item.status; found.latency = item.latency_ms || null; }
    });
    apps.value.forEach(a => { if (a.status === 'checking') a.status = 'unknown'; });
    healthChecked.value = true;

    if (silent) {
      // Auto-run: status kartu sudah menunjukkan online/offline,
      // tidak perlu notif tambahan agar tidak mengganggu
    } else {
      // Manual: tampilkan ringkasan lengkap
      const online = integrations.filter(i => i.status === 'online').length;
      notify.success(`Cek koneksi selesai: ${online}/${integrations.length} aplikasi online`);
    }
  } catch {
    apps.value.forEach(a => { if (a.status === 'checking') a.status = 'unknown'; });
    if (!silent) notify.error('Gagal menjalankan health check');
  } finally {
    checkingHealth.value = false;
  }
};

// ── SSO Launch ──────────────────────────────────────────────
const launchApp = async (app) => {
  if (app.is_maintenance && !authStore.isAdmin) {
    notify.warning(`${app.name} sedang dalam maintenance. Coba lagi nanti.`);
    return;
  }
  launching.value = app.id;
  try {
    if (app.sso_enabled) {
      try {
        const res = await gatewayService.ssoToken(app.slug);
        const { redirect_url } = res.data.data;
        if (redirect_url) {
          // Buka popup dulu, baru notify — supaya browser tidak blok popup
          const popup = window.open(redirect_url, '_blank', 'noopener,noreferrer');
          if (popup) {
            notify.success(`Membuka ${app.name} via SSO...`);
          } else {
            // Popup diblokir browser — fallback ke same-tab redirect dengan konfirmasi
            notify.warning(`Popup diblokir browser. Mengalihkan halaman ke ${app.name}...`);
            setTimeout(() => { window.location.href = redirect_url; }, 1500);
          }
          return;
        }
        // redirect_url kosong tapi tidak error — buka URL langsung
        throw new Error('redirect_url kosong dari server');
      } catch (ssoErr) {
        // Bedakan jenis error agar pesan lebih informatif
        const status = ssoErr.response?.status;
        const msg    = ssoErr.response?.data?.message || ssoErr.message || '';

        if (status === 401 || status === 403) {
          notify.error(`Sesi habis. Silakan login ulang ke SDMS.`);
          return; // jangan buka fallback jika sesi tidak valid
        } else if (status === 400) {
          // Aplikasi belum dikonfigurasi SSO di backend
          notify.warning(`SSO ${app.name} belum dikonfigurasi. ${msg}`);
        } else if (ssoErr.code === 'ERR_NETWORK' || ssoErr.code === 'ECONNREFUSED') {
          notify.warning(`Server SDMS tidak terjangkau. Membuka ${app.name} tanpa SSO...`);
        } else {
          // Error tak terduga — catat di console, tampilkan fallback notice
          console.warn(`[SSO] Gagal untuk ${app.name}:`, ssoErr.message);
          notify.warning(`SSO gagal. Membuka ${app.name} — silakan login manual.`);
        }
      }
    }
    // Fallback: buka URL langsung tanpa SSO
    if (app.app_url) {
      window.open(app.app_url, '_blank', 'noopener,noreferrer');
    } else {
      notify.error(`Tidak dapat membuka ${app.name} — URL aplikasi belum dikonfigurasi.`);
    }
  } finally {
    launching.value = null;
  }
};

// ── Admin: Load DB clients ──────────────────────────────────
const loadClients = async () => {
  if (!authStore.isAdmin) return;
  loading.value = true;
  try {
    const res = await apiHubService.listClients();
    clients.value = res.data.data || [];
    clients.value.forEach(client => {
      if (!client.slug) return;
      const existing = allApps.value.find(a => a.id === client.slug || a.slug === client.slug);
      if (!existing) {
        allApps.value.push({
          id: client.slug || client.id, name: client.name, slug: client.slug,
          description: client.description || '',
          gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
          icon: LinkIcon, category: 'Terdaftar',
          sso_enabled: true, sync_enabled: !!client.webhook_url,
          status: 'unknown', latency: null, client_id: client.id,
        });
      }
    });
  } catch { /* silent */ } finally { loading.value = false; }
};

// ── Admin: App Hub Settings ─────────────────────────────────
const openSettings = () => {
  // Buat draft copy untuk diedit
  settingDraft.value = allApps.value.map(app => ({
    id: app.id,
    name: app.name,
    is_maintenance: app.is_maintenance ?? false,
    // Gunakan Array.isArray agar array kosong [] (sengaja dikosongkan) tetap dihormati
    visible_roles: Array.isArray(app.visible_roles) ? [...app.visible_roles] : ALL_ROLES.map(r => r.value),
  }));
  showSettingModal.value = true;
};

const toggleRole = (appDraft, role) => {
  const idx = appDraft.visible_roles.indexOf(role);
  if (idx >= 0) appDraft.visible_roles.splice(idx, 1);
  else appDraft.visible_roles.push(role);
};

const toggleAllRoles = (appDraft) => {
  if (appDraft.visible_roles.length === ALL_ROLES.length) {
    appDraft.visible_roles = [];
  } else {
    appDraft.visible_roles = ALL_ROLES.map(r => r.value);
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    const config = settingDraft.value.map(d => ({
      id: d.id,
      visible_roles: d.visible_roles,
      is_maintenance: d.is_maintenance,
    }));
    await settingsService.saveAppHubConfig(config);
    appHubConfig.value = config;
    // Apply ke allApps & filter ulang
    allApps.value = applyConfig(allApps.value, config);
    apps.value = filterForUser(allApps.value);
    showSettingModal.value = false;
    notify.success('Konfigurasi App Hub berhasil disimpan');
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyimpan konfigurasi');
  } finally {
    savingSettings.value = false;
  }
};

// ── Admin: Register / Edit / Delete App ─────────────────────
const closeModals = () => {
  showRegisterModal.value = false;
  showEditModal.value = false;
  form.value = { name: '', webhook_url: '', slug: '', description: '', events: ['*'] };
  editTarget.value = null;
};

const saveClient = async () => {
  if (!form.value.name) { notify.warning('Nama wajib diisi'); return; }
  saving.value = true;
  try {
    if (showEditModal.value && editTarget.value) {
      await apiHubService.updateClient(editTarget.value.id, form.value);
      notify.success('Aplikasi berhasil diperbarui');
    } else {
      await apiHubService.createClient(form.value);
      notify.success('Aplikasi berhasil didaftarkan!');
    }
    closeModals();
    loadClients();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyimpan');
  } finally { saving.value = false; }
};

const editClient = (client) => {
  editTarget.value = client;
  form.value = { name: client.name, webhook_url: client.webhook_url || '', slug: client.slug || '', description: client.description || '', events: client.events || ['*'] };
  showEditModal.value = true;
  showRegisterModal.value = true;
};

const confirmDelete = (client) => { deleteTarget.value = client; showDeleteConfirm.value = true; };
const doDelete = async () => {
  deleting.value = true;
  try {
    await apiHubService.deleteClient(deleteTarget.value.id);
    notify.success(`${deleteTarget.value.name} dihapus`);
    showDeleteConfirm.value = false;
    loadClients();
  } catch { notify.error('Gagal menghapus'); } finally { deleting.value = false; }
};

// ── Jurnal Sync ─────────────────────────────────────────────
const checkJurnalConnection = async () => {
  jurnalConnection.value = 'checking';
  try {
    const res = await gatewayService.jurnalTest();
    const data = res.data.data;
    if (data.success) { jurnalConnection.value = 'online'; jurnalLatency.value = data.latency_ms; }
    else if (data.error?.includes('belum di-set')) jurnalConnection.value = 'no-credentials';
    else jurnalConnection.value = 'offline';
  } catch { jurnalConnection.value = 'offline'; }
};

const syncJurnal = async (type = 'full') => {
  jurnalSyncing.value = true;
  try {
    const res = await gatewayService.jurnalSync({ type });
    notify.success(`✅ ${res.data?.message || 'Sinkronisasi dimulai'}...`);
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal sinkronisasi');
  } finally { jurnalSyncing.value = false; }
};

// ── On mount ─────────────────────────────────────────────────
onMounted(async () => {
  await loadClients();         // sudah guard isAdmin di dalamnya
  await loadAppHubConfig();

  // Health check otomatis (silent) untuk semua user — notif hanya jika ada yang offline
  // Jurnal test tetap admin only (endpoint adminOnly di backend)
  const tasks = [runHealthCheck(true)];
  if (authStore.isAdmin) tasks.push(checkJurnalConnection());
  await Promise.all(tasks);
});
</script>
