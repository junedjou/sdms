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
};

export const masterService = {
  // Guru
  guruList:   (params) => api.get('/master/guru', { params }),
  guruById:   (id)     => api.get(`/master/guru/${id}`),
  guruCreate: (data)   => api.post('/master/guru', data),
  guruUpdate: (id, d)  => api.put(`/master/guru/${id}`, d),
  guruDelete: (id)     => api.delete(`/master/guru/${id}`),

  // Siswa
  siswaList:   (params) => api.get('/master/siswa', { params }),
  siswaById:   (id)     => api.get(`/master/siswa/${id}`),
  siswaCreate: (data)   => api.post('/master/siswa', data),
  siswaUpdate: (id, d)  => api.put(`/master/siswa/${id}`, d),
  siswaDelete: (id)     => api.delete(`/master/siswa/${id}`),

  // Pegawai
  pegawaiList:   (params) => api.get('/master/pegawai', { params }),
  pegawaiCreate: (data)   => api.post('/master/pegawai', data),
  pegawaiUpdate: (id, d)  => api.put(`/master/pegawai/${id}`, d),
  pegawaiDelete: (id)     => api.delete(`/master/pegawai/${id}`),

  // Jurusan
  jurusanList:   (params) => api.get('/master/jurusan', { params }),
  jurusanCreate: (data)   => api.post('/master/jurusan', data),
  jurusanUpdate: (id, d)  => api.put(`/master/jurusan/${id}`, d),

  // Kelas
  kelasList:   (params) => api.get('/master/kelas', { params }),
  kelasCreate: (data)   => api.post('/master/kelas', data),
  kelasUpdate: (id, d)  => api.put(`/master/kelas/${id}`, d),

  // Mapel
  mapelList:   (params) => api.get('/master/mapel', { params }),
  mapelCreate: (data)   => api.post('/master/mapel', data),
  mapelUpdate: (id, d)  => api.put(`/master/mapel/${id}`, d),

  // Tahun Pelajaran & Semester
  tahunPelajaranList:   ()     => api.get('/master/tahun-pelajaran'),
  tahunPelajaranCreate: (data) => api.post('/master/tahun-pelajaran', data),
  setTahunAktif:        (id)   => api.patch(`/master/tahun-pelajaran/${id}/aktif`),
  semesterList:         (p)    => api.get('/master/semester', { params: p }),
  semesterCreate:       (data) => api.post('/master/semester', data),

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
  // Backup
  doBackup:    ()     => api.post('/gateway/backup'),
  backupList:  ()     => api.get('/gateway/backup/list'),
  deleteBackup: (file) => api.delete(`/gateway/backup/${file}`),
};
