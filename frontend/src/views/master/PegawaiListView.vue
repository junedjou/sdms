<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Pegawai</h1>
        <p class="page-subtitle">Kelola data tenaga kependidikan</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('pegawai:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('pegawai:create')" @click="openForm()" class="btn-primary">
          <PlusIcon class="w-4 h-4" /> Tambah Pegawai
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card p-4">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" @input="debouncedFetch" type="search" placeholder="Cari nama atau NIP..." class="form-input pl-9" />
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
      <template v-else-if="items.length">
        <div class="table-wrapper border-0">
          <table class="table">
            <thead>
              <tr>
                <th class="w-10">
                  <input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    :checked="isAllSelected" :indeterminate="isPartialSelected" @change="toggleAll" />
                </th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Status</th>
                <th>Akun</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" :class="isSelected(item.id) ? 'bg-primary-50/50' : ''">
                <td>
                  <input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    :checked="isSelected(item.id)" @change="toggleOne(item.id)" />
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         :class="getAvatarColor(item.nama)">
                      {{ getInitials(item.nama) }}
                    </div>
                    <p class="font-medium text-gray-900">{{ item.nama }}</p>
                  </div>
                </td>
                <td class="font-mono text-xs text-gray-600">{{ item.nip || '—' }}</td>
                <td class="text-gray-700">{{ item.jabatan || '—' }}</td>
                <td class="text-gray-600">{{ item.unit_kerja || '—' }}</td>
                <td>
                  <span class="badge" :class="item.status_kepegawaian === 'PNS' ? 'badge-blue' : 'badge-green'">
                    {{ item.status_kepegawaian || '—' }}
                  </span>
                </td>
                <!-- Kolom Akun -->
                <td>
                  <span v-if="item.user"
                    :title="item.user.is_active ? `Sudah punya akun (${item.user.username})` : `Akun nonaktif (${item.user.username})`">
                    <CheckCircleIcon class="w-4 h-4" :class="item.user.is_active ? 'text-emerald-500' : 'text-gray-300'" />
                  </span>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <!-- Buat Akun -->
                    <button v-if="authStore.hasPermission('pegawai:update')"
                      @click="openCreateUser(item)"
                      :title="item.user ? `Akun sudah ada (${item.user.username})` : 'Buat Akun Login'"
                      :disabled="!!item.user"
                      :class="item.user
                        ? 'btn-ghost btn-sm p-1.5 text-gray-300 cursor-not-allowed'
                        : 'btn-ghost btn-sm p-1.5 text-emerald-600 hover:bg-emerald-50'">
                      <UserPlusIcon class="w-4 h-4" />
                    </button>
                    <!-- Reset Password -->
                    <button v-if="authStore.hasPermission('pegawai:update')"
                      @click="openResetPassword(item)"
                      :title="item.user ? `Reset password (${item.user.username})` : 'Belum punya akun'"
                      :class="item.user
                        ? 'btn-ghost btn-sm p-1.5 text-amber-500 hover:bg-amber-50'
                        : 'btn-ghost btn-sm p-1.5 text-gray-300 cursor-not-allowed'"
                      :disabled="!item.user">
                      <KeyIcon class="w-4 h-4" />
                    </button>
                    <!-- Edit -->
                    <button v-if="authStore.hasPermission('pegawai:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <!-- Hapus -->
                    <button v-if="authStore.hasPermission('pegawai:delete')" @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Nonaktifkan">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-50">
          <BasePagination :current-page="page" :total-pages="totalPages" :total="total" :limit="limit"
            @change="(p) => { page = p; fetchData(); }"
            @limit-change="(l) => { limit = l; page = 1; fetchData(); }" />
        </div>
      </template>
      <BaseEmpty v-else :title="search ? 'Pegawai tidak ditemukan' : 'Belum ada data pegawai'" />
    </div>

    <!-- ── Bulk Action Bar ── -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">
      <div v-if="selected.length > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl ring-1 ring-white/10">
        <div class="flex items-center gap-2 pr-3 border-r border-white/20">
          <span class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">{{ selected.length }}</span>
          <span class="text-sm font-medium">pegawai dipilih</span>
        </div>
        <button v-if="authStore.hasPermission('pegawai:update')" @click="openBulkCreateUser"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors">
          <UserGroupIcon class="w-4 h-4" /> Buat Akun
        </button>
        <button v-if="authStore.hasPermission('pegawai:update')" @click="openBulkResetPassword"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm font-medium transition-colors">
          <KeyIcon class="w-4 h-4" /> Reset Password
        </button>
        <button v-if="authStore.hasPermission('pegawai:delete')" @click="openBulkConfirm" :disabled="bulkDeleting"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors disabled:opacity-60">
          <TrashIcon class="w-4 h-4" /> {{ bulkDeleting ? 'Menghapus...' : 'Hapus' }}
        </button>
        <button @click="clearSelected" class="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <ImportExcelModal v-model="showImport" title="Pegawai" :import-fn="importFn"
      @download-template="doTemplate" @imported="handleImported" />

    <BaseConfirm v-model="showBulkConfirm" title="Hapus Massal Pegawai"
      :message="`Nonaktifkan ${selected.length} pegawai yang dipilih?`"
      confirm-label="Ya, Hapus Semua" :danger-mode="true" :loading="bulkDeleting"
      @confirm="executeBulkDelete" />

    <!-- ── Form Modal ── -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Pegawai' : 'Tambah Pegawai'" size="lg">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-group sm:col-span-2">
          <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.nama" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">NIP</label>
          <input v-model="form.nip" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Jenis Kelamin</label>
          <select v-model="form.jenis_kelamin" class="form-input">
            <option value="">-- Pilih --</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jabatan</label>
          <input v-model="form.jabatan" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Unit Kerja</label>
          <input v-model="form.unit_kerja" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Status Kepegawaian</label>
          <select v-model="form.status_kepegawaian" class="form-input">
            <option value="">--</option>
            <option v-for="s in ['PNS','PPPK','PTY','PTT','Honor']" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">No. HP</label>
          <input v-model="form.no_hp" type="tel" class="form-input" />
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
          Simpan
        </button>
      </template>
    </BaseModal>

    <BaseConfirm v-model="showConfirm" title="Nonaktifkan Pegawai"
      :message="`Nonaktifkan pegawai ${deleteTarget?.nama}?`"
      confirm-label="Ya" :danger-mode="true" :loading="formLoading"
      @confirm="executeDelete" />

    <!-- ── Modal Buat Akun 1 Pegawai ── -->
    <BaseModal v-model="showCreateUserConfirm" title="Buat Akun Login Pegawai" size="sm">
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <UserPlusIcon class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-emerald-800">
            <p class="font-semibold mb-1">Akun akan dibuat dengan:</p>
            <ul class="space-y-1">
              <li>• <span class="font-medium">Username:</span> {{ createUserTarget?.nip || '—' }}</li>
              <li>• <span class="font-medium">Password default:</span> smkn1kras</li>
            </ul>
          </div>
        </div>
        <div v-if="!createUserTarget?.nip"
          class="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
          <span class="font-semibold">⚠</span>
          <span>Pegawai ini belum memiliki NIP. Isi NIP terlebih dahulu.</span>
        </div>
        <p class="text-sm text-gray-600">
          Buat akun login untuk <span class="font-semibold">{{ createUserTarget?.nama }}</span>?
        </p>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showCreateUserConfirm = false">Batal</button>
        <button class="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          :disabled="creatingUser || !createUserTarget?.nip" @click="executeCreateUser">
          <span v-if="creatingUser" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <UserPlusIcon v-else class="w-4 h-4" />
          Buat Akun
        </button>
      </template>
    </BaseModal>

    <!-- ── Modal Reset Password 1 Pegawai ── -->
    <BaseModal v-model="showResetPassword" title="Reset Password Pegawai" size="sm">
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <KeyIcon class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-amber-800">
            <p class="font-semibold mb-1">Reset password untuk:</p>
            <p class="font-medium">{{ resetPasswordTarget?.nama }}</p>
            <p v-if="resetPasswordTarget?.user" class="text-xs mt-1">
              Username: <span class="font-mono font-semibold">{{ resetPasswordTarget?.user?.username }}</span>
            </p>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password Baru <span class="text-gray-400 text-xs">(kosong = smkn1kras)</span></label>
          <input v-model="resetPasswordValue" type="text" class="form-input font-mono" placeholder="smkn1kras" />
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showResetPassword = false">Tutup</button>
        <button class="btn-primary bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
          :disabled="resettingPassword" @click="executeResetPassword">
          <span v-if="resettingPassword" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <KeyIcon v-else class="w-4 h-4" />
          Reset Password
        </button>
      </template>
    </BaseModal>

    <!-- ── Modal Buat Akun Massal ── -->
    <BaseModal v-model="showBulkCreateUser" title="Buat Akun Login Massal" size="md">
      <div v-if="!bulkCreateResult" class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <UserGroupIcon class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-emerald-800">
            <p class="font-semibold mb-1">Akan dibuatkan akun untuk <span class="text-emerald-900">{{ selected.length }} pegawai</span></p>
            <ul class="space-y-0.5 text-emerald-700">
              <li>• Username = NIP masing-masing pegawai</li>
              <li>• Password default: <span class="font-mono font-semibold">smkn1kras</span></li>
              <li>• Pegawai tanpa NIP akan dilewati otomatis</li>
              <li>• Akun yang sudah ada tidak akan ditimpa</li>
            </ul>
          </div>
        </div>
        <div v-if="bulkCreatingUser" class="flex flex-col items-center gap-3 py-4">
          <div class="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p class="text-sm text-gray-500">Sedang membuat akun...</p>
        </div>
      </div>
      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <p class="text-2xl font-bold text-emerald-700">{{ bulkCreateResult.berhasil.length }}</p>
            <p class="text-xs text-emerald-600 mt-0.5">Akun berhasil dibuat</p>
          </div>
          <div class="p-4 rounded-xl border text-center" :class="bulkCreateResult.gagal.length ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'">
            <p class="text-2xl font-bold" :class="bulkCreateResult.gagal.length ? 'text-red-600' : 'text-gray-400'">{{ bulkCreateResult.gagal.length }}</p>
            <p class="text-xs mt-0.5" :class="bulkCreateResult.gagal.length ? 'text-red-500' : 'text-gray-400'">Dilewati / Gagal</p>
          </div>
        </div>
        <div v-if="bulkCreateResult.berhasil.length" class="space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Berhasil dibuat</p>
          <div class="max-h-36 overflow-y-auto space-y-1 pr-1">
            <div v-for="r in bulkCreateResult.berhasil" :key="r.id"
              class="flex items-center justify-between px-3 py-1.5 bg-emerald-50 rounded-lg text-sm">
              <span class="text-gray-800 truncate">{{ r.nama }}</span>
              <span class="font-mono text-xs text-emerald-700 flex-shrink-0 ml-2">{{ r.username }}</span>
            </div>
          </div>
        </div>
        <div v-if="bulkCreateResult.gagal.length" class="space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dilewati / Gagal</p>
          <div class="max-h-36 overflow-y-auto space-y-1 pr-1">
            <div v-for="r in bulkCreateResult.gagal" :key="r.id"
              class="flex items-center justify-between px-3 py-1.5 bg-red-50 rounded-lg text-sm">
              <span class="text-gray-800 truncate">{{ r.nama || r.id }}</span>
              <span class="text-xs text-red-500 flex-shrink-0 ml-2">{{ r.alasan }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="closeBulkCreateUser">{{ bulkCreateResult ? 'Tutup' : 'Batal' }}</button>
        <button v-if="!bulkCreateResult" class="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          :disabled="bulkCreatingUser" @click="executeBulkCreateUser">
          <span v-if="bulkCreatingUser" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <UserGroupIcon v-else class="w-4 h-4" />
          Buat {{ selected.length }} Akun
        </button>
      </template>
    </BaseModal>

    <!-- ── Modal Reset Password Massal ── -->
    <BaseModal v-model="showBulkResetPassword" title="Reset Password Massal" size="md">
      <div v-if="!bulkResetResult" class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <KeyIcon class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-amber-800">
            <p class="font-semibold mb-1">Reset password untuk <span class="text-amber-900">{{ selected.length }} pegawai</span></p>
            <ul class="space-y-0.5 text-amber-700">
              <li>• Hanya pegawai yang sudah punya akun yang direset</li>
              <li>• Pegawai tanpa akun akan dilewati otomatis</li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password Baru <span class="text-gray-400 text-xs">(kosong = smkn1kras)</span></label>
          <input v-model="bulkResetPasswordValue" type="text" class="form-input font-mono" placeholder="smkn1kras" />
        </div>
        <div v-if="bulkResettingPassword" class="flex flex-col items-center gap-3 py-4">
          <div class="w-10 h-10 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin" />
          <p class="text-sm text-gray-500">Sedang mereset password...</p>
        </div>
      </div>
      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <p class="text-2xl font-bold text-emerald-700">{{ bulkResetResult.berhasil.length }}</p>
            <p class="text-xs text-emerald-600 mt-0.5">Password berhasil direset</p>
          </div>
          <div class="p-4 rounded-xl border text-center" :class="bulkResetResult.gagal.length ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'">
            <p class="text-2xl font-bold" :class="bulkResetResult.gagal.length ? 'text-red-600' : 'text-gray-400'">{{ bulkResetResult.gagal.length }}</p>
            <p class="text-xs mt-0.5" :class="bulkResetResult.gagal.length ? 'text-red-500' : 'text-gray-400'">Dilewati / Gagal</p>
          </div>
        </div>
        <div v-if="bulkResetResult.berhasil.length" class="space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Berhasil direset</p>
          <div class="max-h-36 overflow-y-auto space-y-1 pr-1">
            <div v-for="r in bulkResetResult.berhasil" :key="r.id"
              class="flex items-center justify-between px-3 py-1.5 bg-emerald-50 rounded-lg text-sm">
              <span class="text-gray-800 truncate">{{ r.nama }}</span>
              <span class="font-mono text-xs text-emerald-700 flex-shrink-0 ml-2">{{ r.username }}</span>
            </div>
          </div>
        </div>
        <div v-if="bulkResetResult.gagal.length" class="space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dilewati / Gagal</p>
          <div class="max-h-36 overflow-y-auto space-y-1 pr-1">
            <div v-for="r in bulkResetResult.gagal" :key="r.id"
              class="flex items-center justify-between px-3 py-1.5 bg-red-50 rounded-lg text-sm">
              <span class="text-gray-800 truncate">{{ r.nama || r.id }}</span>
              <span class="text-xs text-red-500 flex-shrink-0 ml-2">{{ r.alasan }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="closeBulkResetPassword">{{ bulkResetResult ? 'Tutup' : 'Batal' }}</button>
        <button v-if="!bulkResetResult" class="btn-primary bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
          :disabled="bulkResettingPassword" @click="executeBulkResetPassword">
          <span v-if="bulkResettingPassword" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <KeyIcon v-else class="w-4 h-4" />
          Reset {{ selected.length }} Password
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { debounce, getInitials, getAvatarColor } from '@/utils/helpers';
import { useExcelIO } from '@/composables/useExcelIO';
import { useBulkDelete } from '@/composables/useBulkDelete';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseConfirm from '@/components/common/BaseConfirm.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import BaseEmpty from '@/components/common/BaseEmpty.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon, XMarkIcon,
  UserPlusIcon, UserGroupIcon, KeyIcon, CheckCircleIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const uiStore   = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Pegawai' }]);

// ── State ────────────────────────────────────────────────────
const items = ref([]); const loading = ref(true);
const page = ref(1); const limit = ref(10); const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit.value));
const search = ref('');
const showForm = ref(false); const editItem = ref(null);
const showConfirm = ref(false); const deleteTarget = ref(null);
const formLoading = ref(false);

// ── Excel IO ─────────────────────────────────────────────────
const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.pegawaiExport,
  templateFn: masterService.pegawaiTemplate,
  importFn:   masterService.pegawaiImport,
  label:      'pegawai',
  onImported: () => fetchData(),
});

// ── Bulk Delete ───────────────────────────────────────────────
const { selected, isAllSelected, isPartialSelected, isSelected, toggleAll, toggleOne,
  clearSelected, openBulkConfirm, executeBulkDelete, bulkDeleting, showBulkConfirm,
} = useBulkDelete({
  items,
  deleteFn: masterService.pegawaiBulkDelete,
  onDeleted: (count) => { notify.success(`${count} pegawai berhasil dihapus`); fetchData(); },
});

// ── Akun — Buat 1 Pegawai ─────────────────────────────────────
const showCreateUserConfirm = ref(false);
const createUserTarget      = ref(null);
const creatingUser          = ref(false);

const openCreateUser = (item) => { createUserTarget.value = item; showCreateUserConfirm.value = true; };

const executeCreateUser = async () => {
  creatingUser.value = true;
  try {
    await masterService.pegawaiCreateUser(createUserTarget.value.id);
    notify.success(`Akun berhasil dibuat untuk ${createUserTarget.value.nama}`);
    showCreateUserConfirm.value = false;
    fetchData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal membuat akun');
  } finally { creatingUser.value = false; }
};

// ── Akun — Reset Password 1 Pegawai ──────────────────────────
const showResetPassword   = ref(false);
const resetPasswordTarget = ref(null);
const resetPasswordValue  = ref('');
const resettingPassword   = ref(false);

const openResetPassword = (item) => {
  resetPasswordTarget.value = item;
  resetPasswordValue.value  = '';
  showResetPassword.value   = true;
};

const executeResetPassword = async () => {
  resettingPassword.value = true;
  try {
    await masterService.pegawaiResetPassword(resetPasswordTarget.value.id, {
      new_password: resetPasswordValue.value || undefined,
    });
    notify.success(`Password akun ${resetPasswordTarget.value.user?.username} berhasil direset`);
    showResetPassword.value = false;
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal reset password');
  } finally { resettingPassword.value = false; }
};

// ── Akun — Buat Massal ────────────────────────────────────────
const showBulkCreateUser = ref(false);
const bulkCreatingUser   = ref(false);
const bulkCreateResult   = ref(null);

const openBulkCreateUser  = () => { bulkCreateResult.value = null; showBulkCreateUser.value = true; };
const closeBulkCreateUser = () => {
  showBulkCreateUser.value = false;
  if (bulkCreateResult.value?.berhasil?.length) { fetchData(); clearSelected(); }
  bulkCreateResult.value = null;
};

const executeBulkCreateUser = async () => {
  bulkCreatingUser.value = true;
  try {
    const res = await masterService.pegawaiBulkCreateUser({ ids: selected.value });
    bulkCreateResult.value = res.data.data;
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal membuat akun massal');
  } finally { bulkCreatingUser.value = false; }
};

// ── Akun — Reset Password Massal ─────────────────────────────
const showBulkResetPassword  = ref(false);
const bulkResettingPassword  = ref(false);
const bulkResetResult        = ref(null);
const bulkResetPasswordValue = ref('');

const openBulkResetPassword  = () => { bulkResetResult.value = null; bulkResetPasswordValue.value = ''; showBulkResetPassword.value = true; };
const closeBulkResetPassword = () => {
  showBulkResetPassword.value = false;
  if (bulkResetResult.value?.berhasil?.length) clearSelected();
  bulkResetResult.value = null;
};

const executeBulkResetPassword = async () => {
  bulkResettingPassword.value = true;
  try {
    const res = await masterService.pegawaiBulkResetPassword({
      ids: selected.value,
      new_password: bulkResetPasswordValue.value || undefined,
    });
    bulkResetResult.value = res.data.data;
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal reset password massal');
  } finally { bulkResettingPassword.value = false; }
};

// ── Form CRUD ─────────────────────────────────────────────────
const emptyForm = () => ({
  nama: '', nip: '', jenis_kelamin: '', jabatan: '',
  unit_kerja: '', status_kepegawaian: '', no_hp: '', alamat: '',
});
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const r = await masterService.pegawaiList({ page: page.value, limit: limit.value, search: search.value });
    items.value = r.data.data || [];
    total.value = r.data.meta?.total || 0;
  } finally { loading.value = false; }
};

const debouncedFetch = debounce(() => { page.value = 1; fetchData(); });

const openForm = (item = null) => {
  editItem.value = item;
  form.value = item ? { ...item } : emptyForm();
  showForm.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) {
      await masterService.pegawaiUpdate(editItem.value.id, form.value);
      notify.success('Pegawai diperbarui');
    } else {
      await masterService.pegawaiCreate(form.value);
      notify.success('Pegawai ditambahkan');
    }
    showForm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); }
  finally { formLoading.value = false; }
};

const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try {
    await masterService.pegawaiDelete(deleteTarget.value.id);
    notify.success('Pegawai dinonaktifkan');
    showConfirm.value = false; fetchData();
  } catch { notify.error('Gagal'); }
  finally { formLoading.value = false; }
};

onMounted(fetchData);
</script>
