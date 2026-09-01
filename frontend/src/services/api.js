import axios from 'axios';

/**
 * Axios instance utama SDMS
 * Semua request API melewati instance ini.
 */
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject Authorization header ─────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sdms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 & auto refresh ─────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('sdms_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          const newToken = res.data.data.access_token;

          localStorage.setItem('sdms_token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return api(originalRequest);
        } catch {
          // Refresh gagal — bersihkan dan redirect ke login
          localStorage.removeItem('sdms_token');
          localStorage.removeItem('sdms_refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('sdms_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ── Service helpers ──────────────────────────────────────────

export const authService = {
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  refresh:        (data) => api.post('/auth/refresh', data),
  me:             ()     => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
  // Profil data pribadi siswa
  getMySiswaProfile:    ()     => api.get('/auth/profile/siswa'),
  updateMySiswaProfile: (data) => api.patch('/auth/profile/siswa', data),
};

export const dashboardService = {
  stats:    () => api.get('/dashboard/stats'),
  agenda:   () => api.get('/dashboard/agenda'),
  summary:  () => api.get('/dashboard/summary'),
  appHub:   () => api.get('/dashboard/app-hub'),
  auditLog: (params) => api.get('/dashboard/audit-log', { params }),
};

export const userService = {
  list:          (params) => api.get('/users', { params }),
  byId:          (id)     => api.get(`/users/${id}`),
  create:        (data)   => api.post('/users', data),
  update:        (id, data) => api.put(`/users/${id}`, data),
  delete:        (id)     => api.delete(`/users/${id}`),
  resetPassword: (id, data) => api.patch(`/users/${id}/reset-password`, data),
  roles:         ()       => api.get('/users/roles'),
  export:        (params) => api.get('/users/export', { params, responseType: 'blob' }),
  template:      ()       => api.get('/users/template', { responseType: 'blob' }),
  // Guru Piket
  guruSearch:       (params) => api.get('/users/guru-search', { params }),
  piketUsers:         (params) => api.get('/users/piket', { params }),
  bkUsers:            (params) => api.get('/users/bk', { params }),
  waliKelasUsers:     (params) => api.get('/users/wali-kelas', { params }),
  kepalaSekolahUsers: (params) => api.get('/users/kepala-sekolah', { params }),
  import:           (fd)     => api.post('/users/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const masterService = {
  // Guru
  guruList:     (params) => api.get('/master/guru', { params }),
  guruById:     (id)     => api.get(`/master/guru/${id}`),
  guruCreate:   (data)   => api.post('/master/guru', data),
  guruUpdate:   (id, d)  => api.put(`/master/guru/${id}`, d),
  guruDelete:   (id)     => api.delete(`/master/guru/${id}`),
  guruBulkDelete: (data) => api.delete('/master/guru/bulk', { data }),
  guruExport:   ()       => api.get('/master/guru/export', { responseType: 'blob' }),
  guruTemplate: ()       => api.get('/master/guru/template', { responseType: 'blob' }),
  guruImport:   (fd)     => api.post('/master/guru/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Siswa
  siswaList:     (params) => api.get('/master/siswa', { params }),
  siswaById:     (id)     => api.get(`/master/siswa/${id}`),
  siswaCreate:   (data)   => api.post('/master/siswa', data),
  siswaUpdate:   (id, d)  => api.put(`/master/siswa/${id}`, d),
  siswaDelete:   (id)     => api.delete(`/master/siswa/${id}`),
  siswaBulkDelete: (data) => api.delete('/master/siswa/bulk', { data }),
  siswaExport:   (params) => api.get('/master/siswa/export', { params, responseType: 'blob' }),
  siswaTemplate: ()       => api.get('/master/siswa/template', { responseType: 'blob' }),
  siswaCreateUser: (id)   => api.post(`/master/siswa/${id}/create-user`),
  siswaBulkCreateUser: (data) => api.post('/master/siswa/bulk-create-user', data),
  siswaResetPassword: (id, data) => api.post(`/master/siswa/${id}/reset-password`, data),
  siswaBulkResetPassword: (data) => api.post('/master/siswa/bulk-reset-password', data),
  siswaImport:   (fd)     => api.post('/master/siswa/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Pegawai
  pegawaiList:     (params) => api.get('/master/pegawai', { params }),
  pegawaiCreate:   (data)   => api.post('/master/pegawai', data),
  pegawaiUpdate:   (id, d)  => api.put(`/master/pegawai/${id}`, d),
  pegawaiDelete:   (id)     => api.delete(`/master/pegawai/${id}`),
  pegawaiBulkDelete: (data) => api.delete('/master/pegawai/bulk', { data }),
  pegawaiExport:   ()       => api.get('/master/pegawai/export', { responseType: 'blob' }),
  pegawaiTemplate: ()       => api.get('/master/pegawai/template', { responseType: 'blob' }),
  pegawaiImport:   (fd)     => api.post('/master/pegawai/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Jurusan
  jurusanList:     (params) => api.get('/master/jurusan', { params }),
  jurusanCreate:   (data)   => api.post('/master/jurusan', data),
  jurusanUpdate:   (id, d)  => api.put(`/master/jurusan/${id}`, d),
  jurusanBulkDelete: (data) => api.delete('/master/jurusan/bulk', { data }),
  jurusanExport:   ()       => api.get('/master/jurusan/export', { responseType: 'blob' }),
  jurusanTemplate: ()       => api.get('/master/jurusan/template', { responseType: 'blob' }),
  jurusanImport:   (fd)     => api.post('/master/jurusan/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Kelas
  kelasList:     (params) => api.get('/master/kelas', { params }),
  kelasCreate:   (data)   => api.post('/master/kelas', data),
  kelasUpdate:   (id, d)  => api.put(`/master/kelas/${id}`, d),
  kelasBulkDelete: (data) => api.delete('/master/kelas/bulk', { data }),
  kelasExport:   ()       => api.get('/master/kelas/export', { responseType: 'blob' }),
  kelasTemplate: ()       => api.get('/master/kelas/template', { responseType: 'blob' }),
  kelasImport:   (fd)     => api.post('/master/kelas/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Mapel
  mapelList:     (params) => api.get('/master/mapel', { params }),
  mapelCreate:   (data)   => api.post('/master/mapel', data),
  mapelUpdate:   (id, d)  => api.put(`/master/mapel/${id}`, d),
  mapelBulkDelete: (data) => api.delete('/master/mapel/bulk', { data }),
  mapelExport:   ()       => api.get('/master/mapel/export', { responseType: 'blob' }),
  mapelTemplate: ()       => api.get('/master/mapel/template', { responseType: 'blob' }),
  mapelImport:   (fd)     => api.post('/master/mapel/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Tahun Pelajaran & Semester
  tahunPelajaranList:   ()     => api.get('/master/tahun-pelajaran'),
  tahunPelajaranCreate: (data) => api.post('/master/tahun-pelajaran', data),
  tahunPelajaranUpdate: (id,d) => api.put(`/master/tahun-pelajaran/${id}`, d),
  tahunPelajaranDelete: (id)   => api.delete(`/master/tahun-pelajaran/${id}`),
  setTahunAktif:        (id)   => api.patch(`/master/tahun-pelajaran/${id}/aktif`),
  semesterList:         (p)    => api.get('/master/semester', { params: p }),
  semesterCreate:       (data) => api.post('/master/semester', data),
  semesterUpdate:       (id,d) => api.put(`/master/semester/${id}`, d),
  semesterDelete:       (id)   => api.delete(`/master/semester/${id}`),

  // Kalender
  kalenderList:   (p)    => api.get('/master/kalender', { params: p }),
  kalenderCreate: (data) => api.post('/master/kalender', data),
  kalenderUpdate: (id,d) => api.put(`/master/kalender/${id}`, d),
  kalenderDelete: (id)   => api.delete(`/master/kalender/${id}`),
};

export const gatewayService = {
  ssoToken:    (app)  => api.get(`/gateway/sso/token?app=${app}`),
  health:      ()     => api.get('/gateway/health'),
  syncTargets: ()     => api.get('/gateway/sync/targets'),
  bulkSync:    (data) => api.post('/gateway/sync/bulk', data),
  apps:        ()     => api.get('/gateway/apps'),
  // Jurnal Guru Sync
  jurnalTest:  ()     => api.get('/gateway/jurnal/test'),
  jurnalSync:  (data) => api.post('/gateway/jurnal/sync', data),
  // Backup
  doBackup:    ()     => api.post('/gateway/backup'),
  backupList:  ()     => api.get('/gateway/backup/list'),
  deleteBackup: (file) => api.delete(`/gateway/backup/${file}`),
};

export const apiHubService = {
  // Clients
  listClients:     ()       => api.get('/apihub/clients'),
  getClient:       (id)     => api.get(`/apihub/clients/${id}`),
  createClient:    (data)   => api.post('/apihub/clients', data),
  updateClient:    (id, d)  => api.put(`/apihub/clients/${id}`, d),
  deleteClient:    (id)     => api.delete(`/apihub/clients/${id}`),
  regenerateKeys:  (id)     => api.post(`/apihub/clients/${id}/regenerate-key`),
  testWebhook:     (id)     => api.post(`/apihub/clients/${id}/test`),
  bulkSync:        (data)   => api.post('/apihub/bulk-sync', data),
  // Events
  availableEvents: ()       => api.get('/apihub/events'),
  // Logs
  getLogs:         (params) => api.get('/apihub/logs', { params }),
  clearLogs:       (data)   => api.delete('/apihub/logs', { data }),
};

export const settingsService = {
  get:        ()       => api.get('/settings'),
  save:       (data)   => api.put('/settings', { settings: data }),
  uploadLogo: (fd)     => api.post('/settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteLogo: ()       => api.delete('/settings/logo'),
};
