<template>
  <div class="space-y-5 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Siswa</h1>
        <p class="page-subtitle">Kelola data peserta didik sekolah</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('siswa:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('siswa:create')" @click="openForm()" class="btn-primary">
          <PlusIcon class="w-4 h-4" /> <span class="hidden sm:inline">Tambah</span> Siswa
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" @input="debouncedFetch" type="search" placeholder="Cari nama, NISN, NIS..." class="form-input pl-9" />
        </div>
        <select v-model="filterKelas" @change="onFilterChange" class="form-input w-full sm:w-44">
          <option value="">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
        <select v-model="filterJurusan" @change="onFilterChange" class="form-input w-full sm:w-44">
          <option value="">Semua Jurusan</option>
          <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
        </select>
        <select v-model="filterStatus" @change="onFilterChange" class="form-input w-full sm:w-36">
          <option value="Aktif">Aktif</option>
          <option value="">Semua Status</option>
          <option v-for="s in ['Lulus','Pindah','Keluar','Meninggal']" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <!-- Active filters -->
      <div v-if="filterKelas || filterJurusan || filterStatus !== 'Aktif'" class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <span class="text-xs text-slate-400">Filter aktif:</span>
        <button v-if="filterKelas" @click="clearFilter('kelas')"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors">
          {{ kelasList.find(k => k.id === filterKelas)?.nama || 'Kelas' }}
          <XMarkIcon class="w-3 h-3" />
        </button>
        <button v-if="filterJurusan" @click="clearFilter('jurusan')"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors">
          {{ masterStore.jurusan.find(j => j.id === filterJurusan)?.kode || 'Jurusan' }}
          <XMarkIcon class="w-3 h-3" />
        </button>
        <button v-if="filterStatus !== 'Aktif'" @click="clearFilter('status')"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors">
          {{ filterStatus || 'Semua Status' }}
          <XMarkIcon class="w-3 h-3" />
        </button>
        <button @click="clearAllFilters" class="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">
          Reset semua
        </button>
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
                <th>NISN / NIS</th>
                <th>Kelas</th>
                <th>Jurusan</th>
                <th>JK</th>
                <th>Tahun Masuk</th>
                <th>Status</th>
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
                         :class="item.jenis_kelamin === 'P' ? 'bg-pink-500' : 'bg-blue-500'">
                      {{ getInitials(item.nama) }}
                    </div>
                    <p class="font-medium text-gray-900">{{ item.nama }}</p>
                  </div>
                </td>
                <td class="font-mono text-xs text-gray-600">
                  <p>{{ item.nisn || '—' }}</p>
                  <p class="text-gray-400">{{ item.nis || '—' }}</p>
                  <!-- Badge akun login -->
                  <span v-if="item.user"
                    class="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                    :class="item.user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      :class="item.user.is_active ? 'bg-emerald-500' : 'bg-gray-400'"></span>
                    {{ item.user.is_active ? 'Punya akun' : 'Akun nonaktif' }}
                  </span>
                </td>
                <td>
                  <span v-if="item.kelas" class="badge-indigo text-xs">{{ item.kelas.nama }}</span>
                  <span v-else class="text-gray-400 text-xs">—</span>
                </td>
                <td>
                  <span v-if="item.jurusan" class="badge-blue text-xs">{{ item.jurusan.kode }}</span>
                  <span v-else class="text-gray-400 text-xs">—</span>
                </td>
                <td>{{ item.jenis_kelamin === 'L' ? '♂ L' : '♀ P' }}</td>
                <td class="text-gray-600">{{ item.tahun_masuk || '—' }}</td>
                <td><span class="badge" :class="statusClass(item.status)">{{ item.status }}</span></td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="authStore.hasPermission('siswa:update')" @click="openCreateUser(item)"
                      :title="item.user ? `Akun sudah ada (${item.user.username})` : 'Buat Akun Login'"
                      :disabled="!!item.user"
                      :class="item.user
                        ? 'btn-ghost btn-sm p-1.5 text-gray-300 cursor-not-allowed'
                        : 'btn-ghost btn-sm p-1.5 text-emerald-600 hover:bg-emerald-50'">
                      <UserPlusIcon class="w-4 h-4" />
                    </button>
                    <button v-if="authStore.hasPermission('siswa:update')" @click="openForm(item)" class="btn-ghost btn-sm p-1.5">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button v-if="authStore.hasPermission('siswa:delete')" @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-50">
          <BasePagination
            :current-page="page" :total-pages="totalPages"
            :total="total" :limit="limit"
            @change="(p) => { page = p; fetchData(); }"
            @limit-change="(l) => { limit = l; page = 1; fetchData(); }"
          />
        </div>
      </template>
      <BaseEmpty v-else :title="search ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'" :icon="search ? 'search' : 'inbox'" />
    </div>

    <!-- ── Bulk Action Bar ── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4">
      <div v-if="selected.length > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl ring-1 ring-white/10">
        <!-- Count badge -->
        <div class="flex items-center gap-2 pr-3 border-r border-white/20">
          <span class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">
            {{ selected.length }}
          </span>
          <span class="text-sm font-medium">siswa dipilih</span>
        </div>
        <!-- Buat Akun Massal -->
        <button
          v-if="authStore.hasPermission('siswa:update')"
          @click="openBulkCreateUser"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors">
          <UserGroupIcon class="w-4 h-4" />
          Buat Akun
        </button>
        <!-- Hapus Massal -->
        <button
          v-if="authStore.hasPermission('siswa:delete')"
          @click="openBulkConfirm"
          :disabled="bulkDeleting"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors disabled:opacity-60">
          <TrashIcon class="w-4 h-4" />
          {{ bulkDeleting ? 'Menghapus...' : 'Hapus' }}
        </button>
        <!-- Batal -->
        <button @click="clearSelected" class="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Batalkan seleksi">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <ImportExcelModal v-model="showImport" title="Siswa" :import-fn="importFn"
      @download-template="doTemplate" @imported="handleImported" />

    <!-- Konfirmasi Hapus Massal -->
    <BaseConfirm v-model="showBulkConfirm"
      title="Hapus Massal Siswa"
      :message="`Hapus permanen ${selected.length} siswa yang dipilih? Tindakan ini tidak bisa dibatalkan.`"
      confirm-label="Ya, Hapus Semua" :danger-mode="true" :loading="bulkDeleting"
      @confirm="executeBulkDelete" />

    <!-- ── Form Modal ── -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit Data Siswa' : 'Tambah Siswa'" size="lg">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-group sm:col-span-2">
          <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.nama" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">NISN</label>
          <input v-model="form.nisn" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">NIS</label>
          <input v-model="form.nis" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Jenis Kelamin <span class="text-red-500">*</span></label>
          <select v-model="form.jenis_kelamin" class="form-input" required>
            <option value="">-- Pilih --</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Kelas</label>
          <select v-model="form.kelas_id" class="form-input">
            <option value="">-- Pilih Kelas --</option>
            <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jurusan</label>
          <select v-model="form.jurusan_id" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="j in masterStore.jurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tahun Masuk</label>
          <input v-model="form.tahun_masuk" type="number" class="form-input" placeholder="2024" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-input">
            <option v-for="s in ['Aktif','Lulus','Pindah','Keluar']" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tempat Lahir</label>
          <input v-model="form.tempat_lahir" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal Lahir</label>
          <input v-model="form.tanggal_lahir" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Agama</label>
          <select v-model="form.agama" class="form-input">
            <option value="">-- Pilih --</option>
            <option v-for="a in ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']" :key="a" :value="a">{{ a }}</option>
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
        <!-- ── Data Orang Tua ── -->
        <div class="sm:col-span-2">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 mb-3 border-t pt-3">Data Orang Tua / Wali</p>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Ayah</label>
          <input v-model="form.nama_ayah" type="text" class="form-input" placeholder="Nama ayah kandung" />
        </div>
        <div class="form-group">
          <label class="form-label">Nama Ibu</label>
          <input v-model="form.nama_ibu" type="text" class="form-input" placeholder="Nama ibu kandung" />
        </div>
        <div class="form-group">
          <label class="form-label">No. HP Orang Tua / Wali</label>
          <input v-model="form.hp_ortu" type="tel" class="form-input" placeholder="Nomor HP yang bisa dihubungi" />
        </div>
        <div class="form-group flex items-center gap-3 pt-6">
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.pernah_dapat_bantuan" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
          <span class="text-sm text-gray-700">Pernah Dapat Bantuan <span class="text-gray-400 text-xs">(KIP, PIP, dll)</span></span>
        </div>
      </form>
      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {{ editItem ? 'Simpan' : 'Tambah Siswa' }}
        </button>
      </template>
    </BaseModal>

    <!-- Konfirmasi hapus 1 siswa -->
    <BaseConfirm v-model="showConfirm" title="Nonaktifkan Siswa"
      :message="`Nonaktifkan siswa ${deleteTarget?.nama}?`"
      confirm-label="Ya" :danger-mode="true" :loading="formLoading" @confirm="executeDelete" />

    <!-- ── Modal Buat Akun 1 Siswa ── -->
    <BaseModal v-model="showCreateUserConfirm" title="Buat Akun Login Siswa" size="sm">
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <KeyIcon class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-emerald-800">
            <p class="font-semibold mb-1">Akun akan dibuat dengan:</p>
            <ul class="space-y-1">
              <li>• <span class="font-medium">Username:</span> {{ createUserTarget?.nisn || '—' }}</li>
              <li>• <span class="font-medium">Password default:</span> smkn1kras</li>
            </ul>
          </div>
        </div>
        <div v-if="!createUserTarget?.nisn" class="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
          <span class="font-semibold">⚠</span>
          <span>Siswa ini belum memiliki NISN. Isi NISN terlebih dahulu.</span>
        </div>
        <p class="text-sm text-gray-600">
          Buat akun login untuk <span class="font-semibold">{{ createUserTarget?.nama }}</span>?
          Siswa login menggunakan NISN dan password default, lalu disarankan segera ganti password.
        </p>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showCreateUserConfirm = false">Batal</button>
        <button class="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          :disabled="creatingUser || !createUserTarget?.nisn" @click="executeCreateUser">
          <span v-if="creatingUser" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <UserPlusIcon v-else class="w-4 h-4" />
          Buat Akun
        </button>
      </template>
    </BaseModal>

    <!-- ── Modal Buat Akun Massal ── -->
    <BaseModal v-model="showBulkCreateUser" title="Buat Akun Login Massal" size="md">
      <!-- Sebelum proses -->
      <div v-if="!bulkCreateResult" class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <UserGroupIcon class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-emerald-800">
            <p class="font-semibold mb-1">Akan dibuatkan akun untuk <span class="text-emerald-900">{{ selected.length }} siswa</span></p>
            <ul class="space-y-0.5 text-emerald-700">
              <li>• Username = NISN masing-masing siswa</li>
              <li>• Password default: <span class="font-mono font-semibold">smkn1kras</span></li>
              <li>• Siswa tanpa NISN akan dilewati otomatis</li>
              <li>• Akun yang sudah ada tidak akan ditimpa</li>
            </ul>
          </div>
        </div>
        <!-- Loading -->
        <div v-if="bulkCreatingUser" class="flex flex-col items-center gap-3 py-4">
          <div class="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p class="text-sm text-gray-500">Sedang membuat akun...</p>
        </div>
      </div>
      <!-- Hasil proses -->
      <div v-else class="space-y-4">
        <!-- Ringkasan -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <p class="text-2xl font-bold text-emerald-700">{{ bulkCreateResult.berhasil.length }}</p>
            <p class="text-xs text-emerald-600 mt-0.5">Akun berhasil dibuat</p>
          </div>
          <div class="p-4 rounded-xl border text-center" :class="bulkCreateResult.gagal.length ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'">
            <p class="text-2xl font-bold" :class="bulkCreateResult.gagal.length ? 'text-red-600' : 'text-gray-400'">
              {{ bulkCreateResult.gagal.length }}
            </p>
            <p class="text-xs mt-0.5" :class="bulkCreateResult.gagal.length ? 'text-red-500' : 'text-gray-400'">Dilewati / Gagal</p>
          </div>
        </div>
        <!-- List berhasil -->
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
        <!-- List gagal -->
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
        <button class="btn-secondary" @click="closeBulkCreateUser">
          {{ bulkCreateResult ? 'Tutup' : 'Batal' }}
        </button>
        <button v-if="!bulkCreateResult"
          class="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          :disabled="bulkCreatingUser" @click="executeBulkCreateUser">
          <span v-if="bulkCreatingUser" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <UserGroupIcon v-else class="w-4 h-4" />
          Buat {{ selected.length }} Akun
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { masterService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useMasterStore } from '@/stores/master.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { debounce, getInitials } from '@/utils/helpers';
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
  UserPlusIcon, UserGroupIcon, KeyIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const masterStore = useMasterStore();
const uiStore = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Master Data' }, { label: 'Data Siswa' }]);

// ── State ────────────────────────────────────────────────────
const items = ref([]); const loading = ref(true);
const page = ref(1); const limit = ref(10); const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit.value));
const search = ref(''); const filterJurusan = ref(''); const filterKelas = ref(''); const filterStatus = ref('Aktif');
const showForm = ref(false); const editItem = ref(null);
const showConfirm = ref(false); const deleteTarget = ref(null); const formLoading = ref(false);

// ── Excel IO ─────────────────────────────────────────────────
const { exporting, showImport, doExport, doTemplate, importFn, handleImported } = useExcelIO({
  exportFn:   masterService.siswaExport,
  templateFn: masterService.siswaTemplate,
  importFn:   masterService.siswaImport,
  label:      'siswa',
  onImported: () => fetchData(),
});

// ── Bulk Delete ───────────────────────────────────────────────
const { selected, isAllSelected, isPartialSelected, isSelected, toggleAll, toggleOne,
  clearSelected, openBulkConfirm, executeBulkDelete, bulkDeleting, showBulkConfirm,
} = useBulkDelete({
  items,
  deleteFn: masterService.siswaBulkDelete,
  onDeleted: (count) => { notify.success(`${count} siswa berhasil dihapus`); fetchData(); },
});

const statusClass = (s) => ({ Aktif: 'badge-green', Lulus: 'badge-blue', Pindah: 'badge-yellow', Keluar: 'badge-red', Meninggal: 'badge-gray' }[s] || 'badge-gray');

// ── Kelas list ────────────────────────────────────────────────
const kelasList = ref([]);
const loadKelas = async () => {
  try {
    const res = await masterService.kelasList({ limit: 200 });
    kelasList.value = res.data.data || [];
  } catch { /* silent */ }
};

// ── Form CRUD ─────────────────────────────────────────────────
const emptyForm = () => ({
  nama: '', nisn: '', nis: '', jenis_kelamin: '', kelas_id: '', jurusan_id: '',
  tahun_masuk: '', status: 'Aktif', tempat_lahir: '', tanggal_lahir: '',
  agama: '', no_hp: '', alamat: '', hp_ortu: '', nama_ayah: '', nama_ibu: '',
  pernah_dapat_bantuan: false,
});
const form = ref(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await masterService.siswaList({
      page: page.value, limit: limit.value, search: search.value,
      jurusan_id: filterJurusan.value || undefined,
      kelas_id: filterKelas.value || undefined,
      status: filterStatus.value || undefined,
    });
    items.value = res.data.data || []; total.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data siswa'); } finally { loading.value = false; }
};

const onFilterChange = () => { page.value = 1; fetchData(); };
const clearFilter = (type) => {
  if (type === 'kelas') filterKelas.value = '';
  else if (type === 'jurusan') filterJurusan.value = '';
  else if (type === 'status') filterStatus.value = 'Aktif';
  onFilterChange();
};
const clearAllFilters = () => { search.value = ''; filterJurusan.value = ''; filterKelas.value = ''; filterStatus.value = 'Aktif'; page.value = 1; fetchData(); };
const debouncedFetch = debounce(() => { page.value = 1; fetchData(); });

const openForm = (item = null) => {
  editItem.value = item;
  form.value = item ? {
    nama: item.nama, nisn: item.nisn || '', nis: item.nis || '',
    jenis_kelamin: item.jenis_kelamin || '', kelas_id: item.kelas_id || '',
    jurusan_id: item.jurusan_id || '', tahun_masuk: item.tahun_masuk || '',
    status: item.status || 'Aktif', tempat_lahir: item.tempat_lahir || '',
    tanggal_lahir: item.tanggal_lahir || '', agama: item.agama || '',
    no_hp: item.no_hp || '', alamat: item.alamat || '',
    hp_ortu: item.hp_ortu || '', nama_ayah: item.nama_ayah || '',
    nama_ibu: item.nama_ibu || '', pernah_dapat_bantuan: item.pernah_dapat_bantuan || false,
  } : emptyForm();
  showForm.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) {
      await masterService.siswaUpdate(editItem.value.id, form.value);
      notify.success('Data siswa diperbarui');
    } else {
      await masterService.siswaCreate(form.value);
      notify.success('Siswa ditambahkan');
    }
    showForm.value = false; fetchData();
  } catch (err) { notify.error(err.response?.data?.message || 'Gagal menyimpan'); }
  finally { formLoading.value = false; }
};

const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try {
    await masterService.siswaDelete(deleteTarget.value.id);
    notify.success('Siswa dinonaktifkan'); showConfirm.value = false; fetchData();
  } catch { notify.error('Gagal menghapus'); } finally { formLoading.value = false; }
};

// ── Buat Akun Login (1 siswa) ─────────────────────────────────
const showCreateUserConfirm = ref(false);
const createUserTarget = ref(null);
const creatingUser = ref(false);

const openCreateUser = (item) => { createUserTarget.value = item; showCreateUserConfirm.value = true; };
const executeCreateUser = async () => {
  creatingUser.value = true;
  try {
    const res = await masterService.siswaCreateUser(createUserTarget.value.id);
    const data = res.data.data;
    notify.success(`Akun berhasil dibuat — username: ${data.username}`);
    showCreateUserConfirm.value = false;
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal membuat akun');
  } finally { creatingUser.value = false; }
};

// ── Buat Akun Login Massal ────────────────────────────────────
const showBulkCreateUser = ref(false);
const bulkCreatingUser = ref(false);
const bulkCreateResult = ref(null);

const openBulkCreateUser = () => {
  bulkCreateResult.value = null;
  showBulkCreateUser.value = true;
};

const closeBulkCreateUser = () => {
  showBulkCreateUser.value = false;
  bulkCreateResult.value = null;
};

const executeBulkCreateUser = async () => {
  bulkCreatingUser.value = true;
  try {
    const res = await masterService.siswaBulkCreateUser({ ids: selected.value });
    bulkCreateResult.value = res.data.data;
    const { berhasil, gagal } = bulkCreateResult.value;
    if (berhasil.length) notify.success(`${berhasil.length} akun berhasil dibuat`);
    if (gagal.length) notify.warning?.(`${gagal.length} siswa dilewati`);
    clearSelected();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal membuat akun massal');
  } finally { bulkCreatingUser.value = false; }
};

onMounted(() => { fetchData(); loadKelas(); masterStore.fetchJurusan(); });
</script>
