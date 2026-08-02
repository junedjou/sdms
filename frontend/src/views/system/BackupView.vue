<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Backup & Restore Database</h1>
        <p class="page-subtitle">Kelola backup data SDMS untuk keamanan data</p>
      </div>
      <button @click="doBackup" class="btn-primary" :disabled="backupLoading">
        <CloudArrowDownIcon class="w-4 h-4" :class="{ 'animate-bounce': backupLoading }" />
        {{ backupLoading ? 'Memproses...' : 'Backup Sekarang' }}
      </button>
    </div>

    <!-- Info Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <CircleStackIcon class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Total Backup</p>
          <p class="text-2xl font-bold text-gray-900">{{ backupFiles.length }}</p>
          <p class="text-xs text-gray-400">file tersimpan</p>
        </div>
      </div>
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <ClockIcon class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Backup Terakhir</p>
          <p class="text-sm font-semibold text-gray-900">{{ lastBackup }}</p>
        </div>
      </div>
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <ServerIcon class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Total Ukuran</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalSize }}</p>
          <p class="text-xs text-gray-400">KB</p>
        </div>
      </div>
    </div>

    <!-- Panduan Backup Lokal -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ComputerDesktopIcon class="w-4 h-4 text-gray-400" />
          Backup Lokal (XAMPP)
        </h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Cara 1: Python Script -->
          <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p class="text-sm font-semibold text-blue-800 mb-2">🐍 Cara 1 — Python Script (Rekomendasi)</p>
            <p class="text-xs text-blue-700 mb-3">Buka terminal, jalankan perintah ini:</p>
            <div class="space-y-2">
              <div class="bg-white rounded-lg p-2 font-mono text-xs text-gray-700 flex items-center justify-between">
                <span>python backup/backup.py</span>
                <button @click="copyCmd('python d:\\WEBSITE\\sdms\\backup\\backup.py')" class="text-blue-500 hover:text-blue-700">
                  <ClipboardDocumentIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="bg-white rounded-lg p-2 font-mono text-xs text-gray-700 flex items-center justify-between">
                <span>python backup/backup.py --list</span>
                <button @click="copyCmd('python d:\\WEBSITE\\sdms\\backup\\backup.py --list')" class="text-blue-500 hover:text-blue-700">
                  <ClipboardDocumentIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="bg-white rounded-lg p-2 font-mono text-xs text-gray-700 flex items-center justify-between">
                <span>python backup/backup.py --restore</span>
                <button @click="copyCmd('python d:\\WEBSITE\\sdms\\backup\\backup.py --restore')" class="text-blue-500 hover:text-blue-700">
                  <ClipboardDocumentIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Cara 2: File BAT -->
          <div class="p-4 rounded-xl bg-green-50 border border-green-100">
            <p class="text-sm font-semibold text-green-800 mb-2">📁 Cara 2 — Klik File .bat</p>
            <p class="text-xs text-green-700 mb-3">Buka folder <code class="bg-green-100 px-1 rounded">d:\WEBSITE\sdms\backup\</code></p>
            <div class="space-y-2 text-xs text-green-700">
              <div class="flex items-center gap-2 bg-white rounded-lg p-2">
                <span class="text-lg">🟢</span>
                <div>
                  <p class="font-semibold">backup-sekarang.bat</p>
                  <p class="text-green-600">Backup database saat ini</p>
                </div>
              </div>
              <div class="flex items-center gap-2 bg-white rounded-lg p-2">
                <span class="text-lg">🔵</span>
                <div>
                  <p class="font-semibold">auto-backup.bat</p>
                  <p class="text-green-600">Auto backup tiap 24 jam</p>
                </div>
              </div>
              <div class="flex items-center gap-2 bg-white rounded-lg p-2">
                <span class="text-lg">🟡</span>
                <div>
                  <p class="font-semibold">restore-database.bat</p>
                  <p class="text-green-600">Restore dari file backup</p>
                </div>
              </div>
              <div class="flex items-center gap-2 bg-white rounded-lg p-2">
                <span class="text-lg">⚙️</span>
                <div>
                  <p class="font-semibold">daftar-task-scheduler.bat</p>
                  <p class="text-green-600">Jadwal backup otomatis Windows</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lokasi file backup -->
        <div class="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-3">
          <FolderOpenIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-gray-600">Lokasi file backup tersimpan:</p>
            <p class="text-xs font-mono text-gray-800 truncate">d:\WEBSITE\sdms\backup\files\</p>
          </div>
          <button @click="copyCmd('d:\\WEBSITE\\sdms\\backup\\files')" class="btn-ghost btn-sm p-1.5" title="Copy path">
            <ClipboardDocumentIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Backup via API (untuk VPS) -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CloudIcon class="w-4 h-4 text-gray-400" />
          Backup via Dashboard (Lokal & VPS)
        </h2>
        <button @click="loadBackupList" class="btn-ghost btn-sm" :disabled="listLoading">
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': listLoading }" />
        </button>
      </div>
      <div class="card-body">
        <!-- Backup now button -->
        <div class="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary-50 border border-primary-100">
          <div>
            <p class="text-sm font-medium text-primary-800">Buat backup sekarang via server</p>
            <p class="text-xs text-primary-600">Backup disimpan di server (folder backup/files)</p>
          </div>
          <button @click="doBackup" class="btn-primary btn-sm" :disabled="backupLoading">
            <CloudArrowDownIcon class="w-4 h-4" />
            {{ backupLoading ? 'Proses...' : 'Backup' }}
          </button>
        </div>

        <!-- Daftar backup -->
        <div v-if="listLoading" class="space-y-2">
          <div v-for="i in 3" :key="i" class="h-12 bg-gray-50 rounded-lg animate-pulse" />
        </div>
        <template v-else-if="backupFiles.length">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Nama File</th>
                  <th>Ukuran</th>
                  <th>Tanggal Dibuat</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(file, idx) in backupFiles" :key="file.file">
                  <td>
                    <div class="flex items-center gap-2">
                      <DocumentTextIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span class="font-mono text-xs text-gray-700">{{ file.file }}</span>
                      <span v-if="idx === 0" class="badge-green text-xs">Terbaru</span>
                    </div>
                  </td>
                  <td class="text-gray-600 text-sm">{{ file.size_kb }} KB</td>
                  <td class="text-gray-600 text-sm">{{ formatDateTime(file.created_at) }}</td>
                  <td class="text-right">
                    <button
                      @click="confirmDeleteBackup(file)"
                      class="btn-ghost btn-sm p-1.5 text-red-400 hover:bg-red-50"
                      title="Hapus file backup ini"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <BaseEmpty v-else title="Belum ada backup" subtitle="Klik 'Backup Sekarang' untuk membuat backup pertama" />
      </div>
    </div>

    <!-- Jadwal backup otomatis -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CalendarDaysIcon class="w-4 h-4 text-gray-400" />
          Rekomendasi Jadwal Backup
        </h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div class="p-3 rounded-lg border border-green-100 bg-green-50">
            <p class="font-semibold text-green-800">✅ Harian</p>
            <p class="text-green-700 text-xs mt-1">Backup setiap hari jam 02:00 pagi</p>
            <p class="text-green-600 text-xs mt-1">Simpan 30 hari terakhir</p>
          </div>
          <div class="p-3 rounded-lg border border-blue-100 bg-blue-50">
            <p class="font-semibold text-blue-800">📅 Mingguan</p>
            <p class="text-blue-700 text-xs mt-1">Backup setiap Minggu jam 01:00</p>
            <p class="text-blue-600 text-xs mt-1">Simpan 12 minggu terakhir</p>
          </div>
          <div class="p-3 rounded-lg border border-purple-100 bg-purple-50">
            <p class="font-semibold text-purple-800">📦 Sebelum Update</p>
            <p class="text-purple-700 text-xs mt-1">Selalu backup sebelum update sistem</p>
            <p class="text-purple-600 text-xs mt-1">Simpan permanen</p>
          </div>
        </div>
        <div class="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-100 flex items-start gap-2">
          <ExclamationTriangleIcon class="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-yellow-800">
            <strong>Penting:</strong> Simpan salinan backup di tempat berbeda (Google Drive, USB drive, atau server lain).
            Backup di server yang sama tidak cukup jika server rusak atau kena ransomware.
          </p>
        </div>
      </div>
    </div>

    <!-- Konfirmasi hapus backup -->
    <BaseConfirm
      v-model="showDeleteConfirm"
      title="Hapus File Backup"
      :message="`Hapus file backup '${deleteTarget?.file}'? File ini tidak bisa dipulihkan.`"
      confirm-label="Hapus"
      :danger-mode="true"
      :loading="deleteLoading"
      @confirm="executeDeleteBackup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { gatewayService } from '@/services/api';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { notify } from '@/utils/toast';
import { formatDateTime } from '@/utils/helpers';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import {
  CloudArrowDownIcon, CircleStackIcon, ClockIcon, ServerIcon,
  ComputerDesktopIcon, CloudIcon, ArrowPathIcon, FolderOpenIcon,
  DocumentTextIcon, TrashIcon, ClipboardDocumentIcon,
  CalendarDaysIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';

const uiStore   = useUIStore();
const authStore = useAuthStore();
uiStore.setBreadcrumbs([{ label: 'Sistem' }, { label: 'Backup Database' }]);

const backupFiles       = ref([]);
const backupLoading     = ref(false);
const listLoading       = ref(false);
const showDeleteConfirm = ref(false);
const deleteTarget      = ref(null);
const deleteLoading     = ref(false);

const lastBackup = computed(() => {
  if (!backupFiles.value.length) return 'Belum pernah';
  return formatDateTime(backupFiles.value[0]?.created_at);
});

const totalSize = computed(() => {
  return backupFiles.value.reduce((sum, f) => sum + (f.size_kb || 0), 0).toFixed(1);
});

const loadBackupList = async () => {
  listLoading.value = true;
  try {
    const res = await gatewayService.backupList();
    backupFiles.value = res.data.data || [];
  } catch {
    // Backup list endpoint mungkin belum ada di lokal — tidak perlu error
    backupFiles.value = [];
  } finally {
    listLoading.value = false;
  }
};

const doBackup = async () => {
  backupLoading.value = true;
  try {
    const res = await gatewayService.doBackup();
    notify.success(`Backup berhasil! (${res.data.data?.size_kb} KB)`);
    await loadBackupList();
  } catch (err) {
    const msg = err.response?.data?.message || 'Backup gagal';
    notify.error(msg);
  } finally {
    backupLoading.value = false;
  }
};

const copyCmd = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => notify.success('Disalin ke clipboard!'))
    .catch(() => notify.error('Gagal menyalin'));
};

const confirmDeleteBackup = (file) => {
  deleteTarget.value = file;
  showDeleteConfirm.value = true;
};

const executeDeleteBackup = async () => {
  deleteLoading.value = true;
  try {
    await gatewayService.deleteBackup(deleteTarget.value.file);
    notify.success('File backup dihapus');
    showDeleteConfirm.value = false;
    await loadBackupList();
  } catch {
    notify.error('Gagal menghapus file backup');
  } finally {
    deleteLoading.value = false;
  }
};

onMounted(loadBackupList);
</script>
