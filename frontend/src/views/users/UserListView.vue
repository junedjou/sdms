<template>
  <div class="space-y-5 animate-fade-in">

    <!-- ── Page Header ─────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen User</h1>
        <p class="page-subtitle">Kelola akun dan hak akses pengguna sistem</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex items-center gap-1.5">
          <button @click="doExport" :disabled="exporting" class="btn-secondary btn-sm gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ exporting ? 'Exporting...' : 'Export' }}</span>
          </button>
          <button v-if="authStore.hasPermission('user:create')" @click="showImport = true" class="btn-secondary btn-sm gap-1.5">
            <ArrowUpTrayIcon class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Import</span>
          </button>
        </div>
        <button v-if="authStore.hasPermission('user:create')" @click="openForm()" class="btn-primary">
          <PlusIcon class="w-4 h-4" /> Tambah User
        </button>
      </div>
    </div>

    <!-- ── Tabs ─────────────────────────────────────────────── -->
    <div class="flex gap-1 border-b border-gray-200">
      <button
        v-for="t in tabs" :key="t.key"
        class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === t.key
          ? 'border-primary-600 text-primary-700'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        @click="switchTab(t.key)"
      >
        {{ t.label }}
        <span v-if="t.key === 'piket' && piketTotal > 0"
          class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
          {{ piketTotal }}
        </span>
        <span v-if="t.key === 'bk' && bkTotal > 0"
          class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">
          {{ bkTotal }}
        </span>
        <span v-if="t.key === 'wali_kelas' && waliTotal > 0"
          class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
          {{ waliTotal }}
        </span>
        <span v-if="t.key === 'kepala_sekolah' && kepalaTotal > 0"
          class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
          {{ kepalaTotal }}
        </span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- TAB: SEMUA USER                                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'semua'">

      <!-- Filter -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" @input="debouncedFetch" type="search"
            placeholder="Cari nama, username, email..." class="form-input pl-9" />
        </div>
        <select v-model="filterRole" @change="fetchData" class="form-input w-full sm:w-44">
          <option value="">Semua Role</option>
          <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.label }}</option>
        </select>
      </div>

      <!-- Tabel Semua User -->
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
                  <th>User</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Login Terakhir</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id" :class="isSelected(item.id) ? 'bg-primary-50/50' : ''">
                  <td>
                    <input type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      :checked="isSelected(item.id)" @change="toggleOne(item.id)"
                      :disabled="item.id === authStore.user?.id" />
                  </td>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           :class="getAvatarColor(item.full_name)">
                        {{ getInitials(item.full_name) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ item.full_name }}</p>
                        <p class="text-xs text-gray-400">{{ item.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-sm text-gray-700">{{ item.username }}</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span class="badge" :class="roleBadge(item.role?.name)">{{ item.role?.label }}</span>
                      <span v-if="(item.extra_roles || []).includes('petugas_piket')"
                        class="badge badge-indigo text-xs">🔔 Piket</span>
                      <span v-for="er in extraRolesDisplay(item.extra_roles, item.role?.name)" :key="er"
                        class="badge badge-gray text-xs">+{{ er }}</span>
                    </div>
                  </td>
                  <td class="text-sm text-gray-500">{{ formatDateTime(item.last_login_at) }}</td>
                  <td>
                    <span class="badge" :class="item.is_active ? 'badge-green' : 'badge-red'">
                      {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button v-if="authStore.hasPermission('user:update')"
                        @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                        <PencilSquareIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.isAdmin"
                        @click="openResetPw(item)" class="btn-ghost btn-sm p-1.5 text-yellow-600 hover:bg-yellow-50" title="Reset Password">
                        <KeyIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.hasPermission('user:delete') && item.id !== authStore.user?.id"
                        @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
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
        <BaseEmpty v-else :title="search ? 'User tidak ditemukan' : 'Belum ada user'"
          :icon="search ? 'search' : 'inbox'" />
      </div>

    </template>
    <!-- END TAB: SEMUA USER -->

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- TAB: GURU PIKET                                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'piket'">

      <!-- Info banner -->
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <ShieldCheckIcon class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-semibold text-blue-800">Sinkronisasi Otomatis dengan Aplikasi Piket</p>
          <p class="text-xs text-blue-600 mt-0.5">
            User di bawah akan otomatis mendapat akses ke Aplikasi Piket saat login via SSO.
            Guru dengan role tambahan <strong>Petugas Piket</strong> dipetakan ke role
            <code class="bg-blue-100 px-1 rounded">PETUGAS_PIKET</code> di Piket.
            Lihat juga tab <strong>Wali Kelas</strong> dan <strong>Kepala Sekolah</strong> untuk role lainnya.
          </p>
        </div>
      </div>

      <!-- Filter piket -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="piketSearch" @input="debouncedFetchPiket" type="search"
            placeholder="Cari nama, username..." class="form-input pl-9" />
        </div>
        <button @click="openForm()" v-if="authStore.hasPermission('user:create')"
          class="btn-primary whitespace-nowrap">
          <PlusIcon class="w-4 h-4" /> Tambah Guru Piket
        </button>
      </div>

      <!-- Tabel Guru Piket -->
      <div class="card overflow-hidden">
        <div v-if="piketLoading" class="p-8 flex justify-center">
          <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <template v-else-if="piketItems.length">
          <div class="table-wrapper border-0">
            <table class="table">
              <thead>
                <tr>
                  <th>Guru</th>
                  <th>Username</th>
                  <th>Role di SDMS</th>
                  <th>Role di Piket</th>
                  <th>Login Terakhir</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in piketItems" :key="item.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           :class="getAvatarColor(item.full_name)">
                        {{ getInitials(item.full_name) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ item.full_name }}</p>
                        <p class="text-xs text-gray-400">
                          {{ item.guru?.nip || item.guru?.niy || '' }}
                          <span v-if="item.guru?.jabatan"> · {{ item.guru.jabatan }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-sm text-gray-700">{{ item.username }}</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span class="badge" :class="roleBadge(item.role?.name)">{{ item.role?.label }}</span>
                      <span v-for="er in (item.extra_roles || [])" :key="er"
                        class="badge badge-indigo text-xs">+{{ er }}</span>
                    </div>
                  </td>
                  <td>
                    <!-- Role yang akan diterima di Piket berdasarkan pemetaan SSO -->
                    <div class="flex flex-wrap gap-1">
                      <span v-if="item.role?.name === 'petugas_piket'" class="badge badge-indigo">PETUGAS_PIKET</span>
                      <template v-else>
                        <span class="badge badge-green">GURU</span>
                        <span v-if="(item.extra_roles||[]).includes('petugas_piket')" class="badge badge-indigo">PETUGAS_PIKET</span>
                        <span v-if="(item.extra_roles||[]).includes('wali_kelas')" class="badge badge-yellow">WALI_KELAS</span>
                        <span v-if="(item.extra_roles||[]).includes('bk')" class="badge badge-purple">BK</span>
                      </template>
                    </div>
                  </td>
                  <td class="text-sm text-gray-500">{{ formatDateTime(item.last_login_at) }}</td>
                  <td>
                    <span class="badge" :class="item.is_active ? 'badge-green' : 'badge-red'">
                      {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button v-if="authStore.hasPermission('user:update')"
                        @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                        <PencilSquareIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.isAdmin"
                        @click="openResetPw(item)" class="btn-ghost btn-sm p-1.5 text-yellow-600 hover:bg-yellow-50" title="Reset Password">
                        <KeyIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.hasPermission('user:delete') && item.id !== authStore.user?.id"
                        @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
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
              :current-page="piketPage" :total-pages="piketTotalPages"
              :total="piketTotal" :limit="piketLimit"
              @change="(p) => { piketPage = p; fetchPiketData(); }"
              @limit-change="(l) => { piketLimit = l; piketPage = 1; fetchPiketData(); }"
            />
          </div>
        </template>
        <BaseEmpty v-else
          title="Belum ada guru piket"
          description="Tambahkan user dengan role utama atau role tambahan Petugas Piket"
          icon="inbox" />
      </div>

    </template>
    <!-- END TAB: GURU PIKET -->

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- TAB: GURU BK                                           -->
    <!-- ══════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'bk'">

      <!-- Info banner -->
      <div class="p-4 bg-teal-50 border border-teal-200 rounded-xl flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
          <ShieldCheckIcon class="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <p class="text-sm font-semibold text-teal-800">Guru BK (Bimbingan Konseling) — Sinkronisasi ke Aplikasi Piket</p>
          <p class="text-xs text-teal-700 mt-0.5">
            User dengan role <strong>Guru BK</strong> (utama atau tambahan) akan dipetakan ke role
            <code class="bg-teal-100 px-1 rounded">BK</code> di Aplikasi Piket saat login via SSO.
            Guru BK dapat mengakses data siswa, rekap pelanggaran, dan fitur konseling.
          </p>
        </div>
      </div>

      <!-- Filter BK -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="bkSearch" @input="debouncedFetchBK" type="search"
            placeholder="Cari nama, username..." class="form-input pl-9" />
        </div>
        <button @click="openForm()" v-if="authStore.hasPermission('user:create')"
          class="btn-primary whitespace-nowrap">
          <PlusIcon class="w-4 h-4" /> Tambah Guru BK
        </button>
      </div>

      <!-- Tabel Guru BK -->
      <div class="card overflow-hidden">
        <div v-if="bkLoading" class="p-8 flex justify-center">
          <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <template v-else-if="bkItems.length">
          <div class="table-wrapper border-0">
            <table class="table">
              <thead>
                <tr>
                  <th>Guru</th>
                  <th>Username</th>
                  <th>Role di SDMS</th>
                  <th>Role di Piket</th>
                  <th>Login Terakhir</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in bkItems" :key="item.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           :class="getAvatarColor(item.full_name)">
                        {{ getInitials(item.full_name) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ item.full_name }}</p>
                        <p class="text-xs text-gray-400">
                          {{ item.guru?.nip || item.guru?.niy || '' }}
                          <span v-if="item.guru?.jabatan"> · {{ item.guru.jabatan }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-sm text-gray-700">{{ item.username }}</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span class="badge" :class="roleBadge(item.role?.name)">{{ item.role?.label }}</span>
                      <span v-for="er in (item.extra_roles || [])" :key="er"
                        class="badge badge-indigo text-xs">+{{ er }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span v-if="item.role?.name === 'bk'" class="badge badge-teal">BK</span>
                      <template v-else>
                        <span class="badge badge-green">GURU</span>
                        <span class="badge badge-teal">BK</span>
                      </template>
                      <span v-if="(item.extra_roles||[]).includes('petugas_piket')" class="badge badge-indigo">PETUGAS_PIKET</span>
                    </div>
                  </td>
                  <td class="text-sm text-gray-500">{{ formatDateTime(item.last_login_at) }}</td>
                  <td>
                    <span class="badge" :class="item.is_active ? 'badge-green' : 'badge-red'">
                      {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button v-if="authStore.hasPermission('user:update')"
                        @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                        <PencilSquareIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.isAdmin"
                        @click="openResetPw(item)" class="btn-ghost btn-sm p-1.5 text-yellow-600 hover:bg-yellow-50" title="Reset Password">
                        <KeyIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.hasPermission('user:delete') && item.id !== authStore.user?.id"
                        @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
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
              :current-page="bkPage" :total-pages="bkTotalPages"
              :total="bkTotal" :limit="bkLimit"
              @change="(p) => { bkPage = p; fetchBKData(); }"
              @limit-change="(l) => { bkLimit = l; bkPage = 1; fetchBKData(); }"
            />
          </div>
        </template>
        <BaseEmpty v-else
          title="Belum ada guru BK"
          description="Tambahkan user dengan role utama atau role tambahan Guru BK"
          icon="inbox" />
      </div>

    </template>
    <!-- END TAB: GURU BK -->

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- TAB: WALI KELAS                                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'wali_kelas'">

      <!-- Info banner -->
      <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <ShieldCheckIcon class="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <p class="text-sm font-semibold text-yellow-800">Wali Kelas — Sinkronisasi ke Aplikasi Piket</p>
          <p class="text-xs text-yellow-700 mt-0.5">
            User dengan role <strong>Wali Kelas</strong> (utama atau tambahan) akan dipetakan ke role
            <code class="bg-yellow-100 px-1 rounded">WALI_KELAS</code> di Aplikasi Piket saat login via SSO.
            Wali kelas dapat memantau absensi dan rekap siswa kelasnya.
          </p>
        </div>
      </div>

      <!-- Filter wali kelas -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="waliSearch" @input="debouncedFetchWali" type="search"
            placeholder="Cari nama, username..." class="form-input pl-9" />
        </div>
        <button @click="openForm()" v-if="authStore.hasPermission('user:create')"
          class="btn-primary whitespace-nowrap">
          <PlusIcon class="w-4 h-4" /> Tambah Wali Kelas
        </button>
      </div>

      <!-- Tabel Wali Kelas -->
      <div class="card overflow-hidden">
        <div v-if="waliLoading" class="p-8 flex justify-center">
          <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <template v-else-if="waliItems.length">
          <div class="table-wrapper border-0">
            <table class="table">
              <thead>
                <tr>
                  <th>Guru</th>
                  <th>Username</th>
                  <th>Role di SDMS</th>
                  <th>Role di Piket</th>
                  <th>Login Terakhir</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in waliItems" :key="item.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           :class="getAvatarColor(item.full_name)">
                        {{ getInitials(item.full_name) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ item.full_name }}</p>
                        <p class="text-xs text-gray-400">
                          {{ item.guru?.nip || item.guru?.niy || '' }}
                          <span v-if="item.guru?.jabatan"> · {{ item.guru.jabatan }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-sm text-gray-700">{{ item.username }}</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span class="badge" :class="roleBadge(item.role?.name)">{{ item.role?.label }}</span>
                      <span v-for="er in (item.extra_roles || [])" :key="er"
                        class="badge badge-indigo text-xs">+{{ er }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span v-if="item.role?.name === 'wali_kelas'" class="badge badge-yellow">WALI_KELAS</span>
                      <template v-else>
                        <span class="badge badge-green">GURU</span>
                        <span class="badge badge-yellow">WALI_KELAS</span>
                      </template>
                      <span v-if="(item.extra_roles||[]).includes('petugas_piket')" class="badge badge-indigo">PETUGAS_PIKET</span>
                    </div>
                  </td>
                  <td class="text-sm text-gray-500">{{ formatDateTime(item.last_login_at) }}</td>
                  <td>
                    <span class="badge" :class="item.is_active ? 'badge-green' : 'badge-red'">
                      {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button v-if="authStore.hasPermission('user:update')"
                        @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                        <PencilSquareIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.isAdmin"
                        @click="openResetPw(item)" class="btn-ghost btn-sm p-1.5 text-yellow-600 hover:bg-yellow-50" title="Reset Password">
                        <KeyIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.hasPermission('user:delete') && item.id !== authStore.user?.id"
                        @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
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
              :current-page="waliPage" :total-pages="waliTotalPages"
              :total="waliTotal" :limit="waliLimit"
              @change="(p) => { waliPage = p; fetchWaliData(); }"
              @limit-change="(l) => { waliLimit = l; waliPage = 1; fetchWaliData(); }"
            />
          </div>
        </template>
        <BaseEmpty v-else
          title="Belum ada wali kelas"
          description="Tambahkan user dengan role utama atau role tambahan Wali Kelas"
          icon="inbox" />
      </div>

    </template>
    <!-- END TAB: WALI KELAS -->

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- TAB: KEPALA SEKOLAH                                    -->
    <!-- ══════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'kepala_sekolah'">

      <!-- Info banner -->
      <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <ShieldCheckIcon class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p class="text-sm font-semibold text-purple-800">Kepala Sekolah — Sinkronisasi ke Aplikasi Piket</p>
          <p class="text-xs text-purple-700 mt-0.5">
            User dengan role <strong>Kepala Sekolah</strong> (utama atau tambahan) akan dipetakan ke role
            <code class="bg-purple-100 px-1 rounded">KEPALA_SEKOLAH</code> di Aplikasi Piket saat login via SSO.
            Kepala sekolah mendapat akses monitoring penuh: absensi, rekap, pelanggaran, dan laporan.
          </p>
        </div>
      </div>

      <!-- Filter kepala sekolah -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="kepalaSearch" @input="debouncedFetchKepala" type="search"
            placeholder="Cari nama, username..." class="form-input pl-9" />
        </div>
        <button @click="openForm()" v-if="authStore.hasPermission('user:create')"
          class="btn-primary whitespace-nowrap">
          <PlusIcon class="w-4 h-4" /> Tambah Kepala Sekolah
        </button>
      </div>

      <!-- Tabel Kepala Sekolah -->
      <div class="card overflow-hidden">
        <div v-if="kepalaLoading" class="p-8 flex justify-center">
          <div class="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <template v-else-if="kepalaItems.length">
          <div class="table-wrapper border-0">
            <table class="table">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Username</th>
                  <th>Role di SDMS</th>
                  <th>Role di Piket</th>
                  <th>Login Terakhir</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in kepalaItems" :key="item.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           :class="getAvatarColor(item.full_name)">
                        {{ getInitials(item.full_name) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ item.full_name }}</p>
                        <p class="text-xs text-gray-400">
                          {{ item.guru?.nip || item.guru?.niy || '' }}
                          <span v-if="item.guru?.jabatan"> · {{ item.guru.jabatan }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-sm text-gray-700">{{ item.username }}</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span class="badge" :class="roleBadge(item.role?.name)">{{ item.role?.label }}</span>
                      <span v-for="er in (item.extra_roles || [])" :key="er"
                        class="badge badge-indigo text-xs">+{{ er }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <span v-if="item.role?.name === 'kepala_sekolah'" class="badge badge-purple">KEPALA_SEKOLAH</span>
                      <template v-else>
                        <span class="badge badge-green">GURU</span>
                        <span class="badge badge-purple">KEPALA_SEKOLAH</span>
                      </template>
                    </div>
                  </td>
                  <td class="text-sm text-gray-500">{{ formatDateTime(item.last_login_at) }}</td>
                  <td>
                    <span class="badge" :class="item.is_active ? 'badge-green' : 'badge-red'">
                      {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button v-if="authStore.hasPermission('user:update')"
                        @click="openForm(item)" class="btn-ghost btn-sm p-1.5" title="Edit">
                        <PencilSquareIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.isAdmin"
                        @click="openResetPw(item)" class="btn-ghost btn-sm p-1.5 text-yellow-600 hover:bg-yellow-50" title="Reset Password">
                        <KeyIcon class="w-4 h-4" />
                      </button>
                      <button v-if="authStore.hasPermission('user:delete') && item.id !== authStore.user?.id"
                        @click="confirmDelete(item)" class="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
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
              :current-page="kepalaPage" :total-pages="kepalaTotalPages"
              :total="kepalaTotal" :limit="kepalaLimit"
              @change="(p) => { kepalaPage = p; fetchKepalaData(); }"
              @limit-change="(l) => { kepalaLimit = l; kepalaPage = 1; fetchKepalaData(); }"
            />
          </div>
        </template>
        <BaseEmpty v-else
          title="Belum ada kepala sekolah"
          description="Tambahkan user dengan role utama atau role tambahan Kepala Sekolah"
          icon="inbox" />
      </div>

    </template>
    <!-- END TAB: KEPALA SEKOLAH -->

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- SHARED MODALS                                          -->
    <!-- ══════════════════════════════════════════════════════ -->

    <!-- Import Modal -->
    <ImportExcelModal
      v-model="showImport"
      title="User"
      :import-fn="userService.import"
      @download-template="doTemplate"
      @imported="(count) => { notify.success(`${count} user berhasil diimport`); fetchData(); }"
    />

    <!-- Bulk delete confirm -->
    <BaseConfirm
      v-model="showBulkConfirm"
      title="Hapus Massal User"
      :message="`Hapus permanen ${selected.length} user yang dipilih? Tindakan ini tidak bisa dibatalkan.`"
      confirm-label="Ya, Hapus Semua"
      :danger-mode="true"
      :loading="bulkDeleting"
      @confirm="executeBulkDelete"
    />

    <!-- Floating bulk bar -->
    <BulkDeleteBar
      :count="selected.length"
      label="user"
      :deleting="bulkDeleting"
      @delete="showBulkConfirm = true"
      @clear="clearSelected"
    />

    <!-- ── Form Modal: Tambah / Edit User ──────────────────── -->
    <BaseModal v-model="showForm" :title="editItem ? 'Edit User' : 'Tambah User'" size="md">
      <form class="space-y-4" @submit.prevent="submitForm">

        <!-- ── Pencarian Guru ─────────────────────────────── -->
        <div v-if="!editItem" class="form-group">
          <label class="form-label">
            Pilih dari Data Guru
            <span class="text-xs font-normal text-gray-400">(opsional — isi form otomatis)</span>
          </label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="guruSearchQuery"
              type="text"
              class="form-input pl-9"
              placeholder="Cari nama atau NIP/NIY guru..."
              @input="onGuruSearch"
              @focus="showGuruDropdown = true"
              @blur="() => setTimeout(() => { showGuruDropdown = false }, 200)"
              autocomplete="off"
            />
            <div v-if="guruSearchLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
              <div class="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
            </div>
          </div>

          <!-- Dropdown hasil pencarian -->
          <div v-if="showGuruDropdown && guruResults.length" class="relative z-50">
            <div class="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              <div
                v-for="g in guruResults" :key="g.id"
                class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                :class="g.has_account ? 'hover:bg-amber-50' : 'hover:bg-primary-50'"
                @mousedown.prevent="selectGuru(g)"
              >
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     :class="getAvatarColor(g.nama)">
                  {{ getInitials(g.nama) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ g.nama }}</p>
                  <p class="text-xs text-gray-400">
                    {{ g.nip || g.niy || 'Tanpa NIP' }}
                    <span v-if="g.jabatan"> · {{ g.jabatan }}</span>
                  </p>
                </div>
                <!-- Badge status akun -->
                <div class="flex-shrink-0">
                  <span v-if="g.has_account && g.account_is_piket"
                    class="badge badge-indigo text-xs">✓ Piket</span>
                  <span v-else-if="g.has_account"
                    class="badge badge-yellow text-xs">Sudah Punya Akun</span>
                  <span v-else
                    class="badge badge-green text-xs">Belum Punya Akun</span>
                </div>
              </div>
              <div v-if="guruResults.length === 0 && guruSearchQuery" class="px-4 py-3 text-sm text-gray-400 text-center">
                Guru tidak ditemukan
              </div>
            </div>
          </div>

          <!-- Info guru terpilih -->
          <div v-if="selectedGuru" class="mt-2 flex items-center gap-2 p-2.5 bg-primary-50 border border-primary-200 rounded-lg">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 :class="getAvatarColor(selectedGuru.nama)">
              {{ getInitials(selectedGuru.nama) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-primary-800 truncate">{{ selectedGuru.nama }}</p>
              <p class="text-xs text-primary-600">{{ selectedGuru.nip || selectedGuru.niy || '' }}
                <span v-if="selectedGuru.jabatan"> · {{ selectedGuru.jabatan }}</span>
              </p>
            </div>
            <button type="button" @click="clearGuruSelection"
              class="w-5 h-5 flex items-center justify-center text-primary-400 hover:text-red-500 transition-colors">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
          <p v-if="selectedGuru?.has_account && !selectedGuru?.account_is_piket"
            class="text-xs text-amber-600 mt-1 flex items-center gap-1">
            ⚠️ Guru ini sudah punya akun (<strong>{{ selectedGuru.account_username }}</strong>).
            Edit user yang ada untuk menambah role piket.
          </p>
        </div>

        <!-- ── Field nama, username, email, password ──────── -->
        <div class="form-group">
          <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.full_name" type="text" class="form-input" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Username <span class="text-red-500">*</span></label>
            <input v-model="form.username" type="text" class="form-input" required autocomplete="off" />
            <p class="text-xs text-gray-400 mt-1">Gunakan NIP/NIY atau username unik</p>
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="text-xs text-gray-400">(opsional)</span></label>
            <input v-model="form.email" type="email" class="form-input" placeholder="Kosongkan jika tidak ada" />
          </div>
        </div>
        <div v-if="!editItem" class="form-group">
          <label class="form-label">Password <span class="text-red-500">*</span></label>
          <input v-model="form.password" type="password" class="form-input" required minlength="8" autocomplete="new-password" />
          <p class="text-xs text-gray-400 mt-1">Minimal 8 karakter</p>
        </div>

        <!-- ── Role / Jabatan ─────────────────────────────── -->
        <div class="form-group">
          <label class="form-label">Role / Jabatan <span class="text-red-500">*</span></label>
          <p class="text-xs text-gray-400 mb-2">
            Role utama menentukan akses sistem. Centang <strong>Tambahan</strong> jika guru merangkap jabatan
            (misal: Guru + Petugas Piket).
          </p>
          <div class="space-y-1.5 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
            <div
              v-for="r in roles" :key="r.id"
              class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
              :class="form.role_id === r.id
                ? 'bg-primary-50 border border-primary-200'
                : 'bg-white border border-transparent hover:border-gray-200'"
              @click="selectMainRole(r)"
            >
              <input type="radio" :value="r.id" v-model="form.role_id"
                class="text-primary-600 focus:ring-primary-500" @click.stop />
              <span class="text-sm font-medium text-gray-800 flex-1">{{ r.label }}</span>
              <div v-if="form.role_id !== r.id" class="flex items-center gap-1.5" @click.stop>
                <input type="checkbox" :value="r.name" v-model="form.extra_roles"
                  class="rounded text-primary-600 focus:ring-primary-500" />
                <span class="text-xs text-gray-500">Tambahan</span>
              </div>
              <span v-else class="text-xs text-primary-500 font-medium">Utama</span>
            </div>
          </div>
          <div v-if="form.extra_roles.length" class="mt-2 flex flex-wrap gap-1.5">
            <span v-for="er in form.extra_roles" :key="er" class="badge badge-indigo text-xs">
              +{{ er }}
            </span>
          </div>
        </div>

        <!-- ── Info Sinkronisasi Piket ────────────────────── -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p class="text-xs text-blue-700 font-semibold mb-1 flex items-center gap-1.5">
            <ShieldCheckIcon class="w-3.5 h-3.5" /> Sinkronisasi Piket (SSO)
          </p>
          <p class="text-xs text-blue-600 leading-relaxed">
            User akan otomatis masuk ke Aplikasi Piket saat login via SSO.
          </p>
          <div v-if="piketRolesPreview.length" class="mt-1.5 flex flex-wrap gap-1">
            <span class="text-xs text-blue-600">Role di Piket:</span>
            <code v-for="r in piketRolesPreview" :key="r"
              class="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-semibold">
              {{ r }}
            </code>
          </div>
          <p v-else class="text-xs text-blue-500 mt-1">
            Pilih role terlebih dahulu untuk melihat pemetaan ke Aplikasi Piket.
          </p>
        </div>

        <!-- ── Status aktif (edit only) ───────────────────── -->
        <div v-if="editItem" class="flex items-center gap-2">
          <input v-model="form.is_active" type="checkbox" id="user-aktif" class="rounded" />
          <label for="user-aktif" class="text-sm text-gray-700">User aktif</label>
        </div>
      </form>

      <template #footer>
        <button class="btn-secondary" @click="showForm = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="submitForm">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {{ editItem ? 'Simpan Perubahan' : 'Buat User' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal Reset Password -->
    <BaseModal v-model="showResetPw" title="Reset Password" size="sm">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Reset password untuk user <strong>{{ resetTarget?.username }}</strong>.
        </p>
        <div class="form-group">
          <label class="form-label">Password Baru <span class="text-red-500">*</span></label>
          <input v-model="newPassword" type="password" class="form-input" minlength="8"
            placeholder="Minimal 8 karakter" />
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showResetPw = false">Batal</button>
        <button class="btn-primary" :disabled="formLoading" @click="executeResetPw">
          <span v-if="formLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Reset Password
        </button>
      </template>
    </BaseModal>

    <!-- Konfirmasi hapus -->
    <BaseConfirm
      v-model="showConfirm"
      title="Hapus User"
      :message="`Hapus user '${deleteTarget?.username}'? Tindakan ini tidak bisa dibatalkan.`"
      confirm-label="Hapus User"
      :danger-mode="true"
      :loading="formLoading"
      @confirm="executeDelete"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { notify } from '@/utils/toast';
import { debounce, getInitials, getAvatarColor, formatDateTime } from '@/utils/helpers';
import { saveAs } from 'file-saver';
import BaseModal      from '@/components/common/BaseModal.vue';
import BaseConfirm    from '@/components/common/BaseConfirm.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import BaseEmpty      from '@/components/common/BaseEmpty.vue';
import ImportExcelModal from '@/components/common/ImportExcelModal.vue';
import BulkDeleteBar  from '@/components/common/BulkDeleteBar.vue';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, KeyIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon,
  ShieldCheckIcon, XMarkIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const uiStore   = useUIStore();
uiStore.setBreadcrumbs([{ label: 'Administrasi' }, { label: 'Manajemen User' }]);

// ── Tabs ──────────────────────────────────────────────────────
const tabs = [
  { key: 'semua',          label: 'Semua User' },
  { key: 'piket',          label: 'Guru Piket' },
  { key: 'bk',             label: 'Guru BK' },
  { key: 'wali_kelas',     label: 'Wali Kelas' },
  { key: 'kepala_sekolah', label: 'Kepala Sekolah' },
];
const activeTab = ref('semua');

const switchTab = (key) => {
  activeTab.value = key;
  if (key === 'piket' && piketItems.value.length === 0) fetchPiketData();
  if (key === 'bk' && bkItems.value.length === 0) fetchBKData();
  if (key === 'wali_kelas' && waliItems.value.length === 0) fetchWaliData();
  if (key === 'kepala_sekolah' && kepalaItems.value.length === 0) fetchKepalaData();
};

// ── State Semua User ──────────────────────────────────────────
const items      = ref([]); const loading   = ref(true); const roles     = ref([]);
const page       = ref(1);  const limit     = ref(10);   const total     = ref(0);
const totalPages = computed(() => Math.ceil(total.value / limit.value));
const search     = ref(''); const filterRole = ref('');

// ── State Guru Piket ──────────────────────────────────────────
const piketItems      = ref([]); const piketLoading    = ref(false);
const piketPage       = ref(1);  const piketLimit      = ref(10);
const piketTotal      = ref(0);  const piketSearch     = ref('');
const piketTotalPages = computed(() => Math.ceil(piketTotal.value / piketLimit.value));

// ── State Guru BK ─────────────────────────────────────────────
const bkItems      = ref([]); const bkLoading    = ref(false);
const bkPage       = ref(1);  const bkLimit      = ref(10);
const bkTotal      = ref(0);  const bkSearch     = ref('');
const bkTotalPages = computed(() => Math.ceil(bkTotal.value / bkLimit.value));

// ── State Wali Kelas ──────────────────────────────────────────
const waliItems      = ref([]); const waliLoading    = ref(false);
const waliPage       = ref(1);  const waliLimit      = ref(10);
const waliTotal      = ref(0);  const waliSearch     = ref('');
const waliTotalPages = computed(() => Math.ceil(waliTotal.value / waliLimit.value));

// ── State Kepala Sekolah ──────────────────────────────────────
const kepalaItems      = ref([]); const kepalaLoading    = ref(false);
const kepalaPage       = ref(1);  const kepalaLimit      = ref(10);
const kepalaTotal      = ref(0);  const kepalaSearch     = ref('');
const kepalaTotalPages = computed(() => Math.ceil(kepalaTotal.value / kepalaLimit.value));

// ── Modals ────────────────────────────────────────────────────
const showForm    = ref(false); const editItem    = ref(null); const formLoading = ref(false);
const showConfirm = ref(false); const deleteTarget = ref(null);
const showResetPw = ref(false); const resetTarget  = ref(null); const newPassword = ref('');
const showImport  = ref(false);

// ── Bulk delete ───────────────────────────────────────────────
const selected          = ref([]);
const showBulkConfirm   = ref(false);
const bulkDeleting      = ref(false);
const isAllSelected     = computed(() => items.value.length > 0 && items.value.every(i => selected.value.includes(i.id)));
const isPartialSelected = computed(() => selected.value.length > 0 && !isAllSelected.value);
const isSelected        = (id) => selected.value.includes(id);

const toggleAll = () => {
  if (isAllSelected.value) {
    const pageIds = items.value.map(i => i.id);
    selected.value = selected.value.filter(id => !pageIds.includes(id));
  } else {
    const merged = new Set([...selected.value, ...items.value.map(i => i.id)]);
    selected.value = Array.from(merged);
  }
};
const toggleOne     = (id) => {
  const idx = selected.value.indexOf(id);
  if (idx > -1) selected.value.splice(idx, 1); else selected.value.push(id);
};
const clearSelected = () => { selected.value = []; };

const executeBulkDelete = async () => {
  bulkDeleting.value = true;
  try {
    await Promise.all(selected.value.map(id => userService.delete(id)));
    notify.success(`${selected.value.length} user berhasil dihapus`);
    clearSelected(); showBulkConfirm.value = false; fetchData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menghapus user');
  } finally { bulkDeleting.value = false; }
};

// ── Pencarian Guru (form) ─────────────────────────────────────
const guruSearchQuery  = ref('');
const guruResults      = ref([]);
const showGuruDropdown = ref(false);
const selectedGuru     = ref(null);
const guruSearchLoading = ref(false);

// Debounced search guru menggunakan endpoint guru-search
const doGuruSearch = debounce(async () => {
  const q = guruSearchQuery.value.trim();
  guruSearchLoading.value = true;
  try {
    const res = await userService.guruSearch({ search: q, limit: 20 });
    guruResults.value = res.data.data || [];
    showGuruDropdown.value = true;
  } catch {
    guruResults.value = [];
  } finally {
    guruSearchLoading.value = false;
  }
}, 300);

const onGuruSearch = () => {
  if (!guruSearchQuery.value.trim()) {
    guruResults.value = [];
    showGuruDropdown.value = false;
    return;
  }
  doGuruSearch();
};

const selectGuru = (guru) => {
  selectedGuru.value    = guru;
  guruSearchQuery.value = guru.nama;
  showGuruDropdown.value = false;
  // Auto-fill form
  form.value.full_name = guru.nama;
  form.value.username  = guru.nip || guru.niy || '';
  form.value.email     = guru.email || '';
  form.value.guru_id   = guru.id;
};

const clearGuruSelection = () => {
  selectedGuru.value     = null;
  guruSearchQuery.value  = '';
  guruResults.value      = [];
  form.value.guru_id     = null;
};

// ── Form ──────────────────────────────────────────────────────
const emptyForm = () => ({
  full_name: '', username: '', email: '', password: '',
  role_id: '', extra_roles: [], is_active: true, guru_id: null,
});
const form = ref(emptyForm());

// Computed: apakah user yang akan dibuat akan punya role piket di aplikasi piket
const willHavePiketRole = computed(() => {
  const mainRole = roles.value.find(r => r.id === form.value.role_id);
  return mainRole?.name === 'petugas_piket' || (form.value.extra_roles || []).includes('petugas_piket');
});

// Computed: role-role yang akan aktif di Aplikasi Piket (untuk SSO info box)
const piketRolesPreview = computed(() => {
  const mainRole = roles.value.find(r => r.id === form.value.role_id);
  const mainName = mainRole?.name || '';
  const extras   = form.value.extra_roles || [];

  const SSO_MAP = {
    super_admin:    'SUPER_ADMIN',
    admin:          'ADMIN',
    guru:           'GURU',
    bk:             'BK',
    wali_kelas:     'WALI_KELAS',
    kepala_sekolah: 'KEPALA_SEKOLAH',
    petugas_piket:  'PETUGAS_PIKET',
    pegawai:        'GURU',
    operator:       'GURU',
  };

  const mapped = [mainName, ...extras]
    .map(r => SSO_MAP[r])
    .filter(Boolean);

  return [...new Set(mapped)];
});

// Helper: extra roles yang ditampilkan di badge (kecuali role utama)
const extraRolesDisplay = (extraRoles, mainRoleName) => {
  if (!extraRoles || !extraRoles.length) return [];
  return extraRoles.filter(er => er !== mainRoleName && er !== 'petugas_piket');
};

const roleBadge = (name) => ({
  super_admin:     'badge-red',
  admin:           'badge-blue',
  guru:            'badge-green',
  bk:              'badge-teal',
  wali_kelas:      'badge-yellow',
  kepala_sekolah:  'badge-purple',
  petugas_piket:   'badge-indigo',
  operator:        'badge-gray',
  pegawai:         'badge-yellow',
  siswa:           'badge-gray',
}[name] || 'badge-gray');

const selectMainRole = (r) => {
  form.value.role_id     = r.id;
  form.value.extra_roles = (form.value.extra_roles || []).filter(er => er !== r.name);
};

// ── Fetch Data ────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await userService.list({
      page: page.value, limit: limit.value,
      search: search.value,
      role: filterRole.value || undefined,
    });
    items.value = res.data.data || [];
    total.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data user'); } finally { loading.value = false; }
};

const fetchPiketData = async () => {
  piketLoading.value = true;
  try {
    const res = await userService.piketUsers({
      page: piketPage.value, limit: piketLimit.value,
      search: piketSearch.value,
    });
    piketItems.value = res.data.data || [];
    piketTotal.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data guru piket'); } finally { piketLoading.value = false; }
};

const fetchBKData = async () => {
  bkLoading.value = true;
  try {
    const res = await userService.bkUsers({
      page: bkPage.value, limit: bkLimit.value,
      search: bkSearch.value,
    });
    bkItems.value = res.data.data || [];
    bkTotal.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data guru BK'); } finally { bkLoading.value = false; }
};

const fetchWaliData = async () => {
  waliLoading.value = true;
  try {
    const res = await userService.waliKelasUsers({
      page: waliPage.value, limit: waliLimit.value,
      search: waliSearch.value,
    });
    waliItems.value = res.data.data || [];
    waliTotal.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data wali kelas'); } finally { waliLoading.value = false; }
};

const fetchKepalaData = async () => {
  kepalaLoading.value = true;
  try {
    const res = await userService.kepalaSekolahUsers({
      page: kepalaPage.value, limit: kepalaLimit.value,
      search: kepalaSearch.value,
    });
    kepalaItems.value = res.data.data || [];
    kepalaTotal.value = res.data.meta?.total || 0;
  } catch { notify.error('Gagal memuat data kepala sekolah'); } finally { kepalaLoading.value = false; }
};

const fetchRoles = async () => {
  try { roles.value = (await userService.roles()).data.data || []; } catch { /* skip */ }
};

const debouncedFetch       = debounce(() => { page.value = 1; fetchData(); });
const debouncedFetchPiket  = debounce(() => { piketPage.value = 1; fetchPiketData(); });
const debouncedFetchBK     = debounce(() => { bkPage.value = 1; fetchBKData(); });
const debouncedFetchWali   = debounce(() => { waliPage.value = 1; fetchWaliData(); });
const debouncedFetchKepala = debounce(() => { kepalaPage.value = 1; fetchKepalaData(); });

// ── Open / Submit Form ────────────────────────────────────────
const openForm = (item = null) => {
  editItem.value = item;
  form.value = item
    ? {
        full_name:   item.full_name,
        username:    item.username,
        email:       item.email,
        role_id:     item.role?.id || '',
        extra_roles: item.extra_roles || [],
        is_active:   item.is_active,
        password:    '',
        guru_id:     item.guru_id || null,
      }
    : emptyForm();
  // Reset guru search state
  guruSearchQuery.value  = '';
  selectedGuru.value     = null;
  guruResults.value      = [];
  showGuruDropdown.value = false;
  showForm.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  try {
    if (editItem.value) {
      await userService.update(editItem.value.id, {
        full_name:   form.value.full_name,
        username:    form.value.username,
        email:       form.value.email || undefined,
        role_id:     form.value.role_id,
        extra_roles: form.value.extra_roles,
        is_active:   form.value.is_active,
        guru_id:     form.value.guru_id,
      });
      notify.success('User berhasil diperbarui');
    } else {
      const payload = { ...form.value };
      if (!payload.email) delete payload.email;  // biarkan backend generate dummy
      await userService.create(payload);
      notify.success('User berhasil dibuat');
    }
    showForm.value = false;
    fetchData();
    if (activeTab.value === 'piket') fetchPiketData();
    if (activeTab.value === 'bk') fetchBKData();
    if (activeTab.value === 'wali_kelas') fetchWaliData();
    if (activeTab.value === 'kepala_sekolah') fetchKepalaData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menyimpan user');
  } finally { formLoading.value = false; }
};

// ── Reset Password ────────────────────────────────────────────
const openResetPw = (item) => {
  resetTarget.value = item; newPassword.value = ''; showResetPw.value = true;
};
const executeResetPw = async () => {
  if (!newPassword.value || newPassword.value.length < 8) {
    notify.error('Password minimal 8 karakter'); return;
  }
  formLoading.value = true;
  try {
    await userService.resetPassword(resetTarget.value.id, { new_password: newPassword.value });
    notify.success(`Password ${resetTarget.value.username} berhasil direset`);
    showResetPw.value = false;
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal reset password');
  } finally { formLoading.value = false; }
};

// ── Delete ────────────────────────────────────────────────────
const confirmDelete = (item) => { deleteTarget.value = item; showConfirm.value = true; };
const executeDelete = async () => {
  formLoading.value = true;
  try {
    await userService.delete(deleteTarget.value.id);
    notify.success('User berhasil dihapus');
    showConfirm.value = false;
    fetchData();
    if (activeTab.value === 'piket') fetchPiketData();
    if (activeTab.value === 'bk') fetchBKData();
    if (activeTab.value === 'wali_kelas') fetchWaliData();
    if (activeTab.value === 'kepala_sekolah') fetchKepalaData();
  } catch (err) {
    notify.error(err.response?.data?.message || 'Gagal menghapus user');
  } finally { formLoading.value = false; }
};

// ── Export / Import ───────────────────────────────────────────
const exporting = ref(false);
const doExport = async () => {
  exporting.value = true;
  try {
    const res  = await userService.export(filterRole.value ? { role: filterRole.value } : {});
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `data_user_${new Date().toISOString().slice(0,10)}.xlsx`);
    notify.success('Data user berhasil diexport');
  } catch { notify.error('Gagal export data user'); } finally { exporting.value = false; }
};
const doTemplate = async () => {
  try {
    const res  = await userService.template();
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'template_import_user.xlsx');
    notify.success('Template berhasil didownload');
  } catch { notify.error('Gagal download template'); }
};

// ── Init ──────────────────────────────────────────────────────
onMounted(() => { fetchData(); fetchRoles(); });
</script>
