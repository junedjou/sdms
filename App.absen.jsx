/**
 * App.absen.jsx — Router Utama Aplikasi Absen
 * =============================================
 * Digunakan sebagai root component aplikasi Absen (sistem absensi digital).
 * Mendukung SSO dari SDMS — route /sso/callback menangani redirect otomatis
 * dari SDMS App Hub tanpa perlu login manual.
 *
 * Role yang didukung (dari pemetaan SDMS):
 *   SUPER_ADMIN, ADMIN, GURU, WALI_KELAS, BK, KEPALA_SEKOLAH,
 *   PETUGAS_PIKET, OPERATOR, SISWA
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/layout/Layout';
import { Component } from 'react';

/* ── Error Boundary ─────────────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: '#f87171', fontFamily: 'monospace', background: '#0f172a', minHeight: '100vh' }}>
          <h2 style={{ color: '#ef4444' }}>⚠ Terjadi Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#94a3b8' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Auth Pages ────────────────────────────────────────────────
import LoginPage       from '@/pages/auth/LoginPage';
import SSOCallbackPage from '@/pages/auth/SSOCallbackPage';
// SSOCallbackPage bertugas:
//   1. Baca ?token= dari URL
//   2. POST ke /api/auth/sso/callback (memanggil ssoCallback di auth.controller.absen.js)
//      ATAU langsung simpan token jika backend sudah mengembalikan via redirect
//   3. Simpan accessToken + refreshToken ke localStorage/store
//   4. Redirect ke /dashboard

// ── Dashboard ─────────────────────────────────────────────────
import DashboardPage        from '@/pages/dashboard/DashboardPage';
import DashboardAdminPage   from '@/pages/dashboard/DashboardAdminPage';
import DashboardGuruPage    from '@/pages/dashboard/DashboardGuruPage';
import DashboardSiswaPage   from '@/pages/dashboard/DashboardSiswaPage';

// ── Absensi (fitur inti) ──────────────────────────────────────
import AbsensiPage        from '@/pages/absensi/AbsensiPage';
import AbsensiWajahPage   from '@/pages/absensi/AbsensiWajahPage';
import AbsensiQRPage      from '@/pages/absensi/AbsensiQRPage';
import AbsensiKartuPage   from '@/pages/absensi/AbsensiKartuPage';
import AbsensiMassalPage  from '@/pages/absensi/AbsensiMassalPage';
import AbsensiRiwayatPage from '@/pages/absensi/AbsensiRiwayatPage';
import AbsensiRekapPage   from '@/pages/absensi/AbsensiRekapPage';
import AbsensiLaporanPage from '@/pages/absensi/AbsensiLaporanPage';

// ── Master Data ───────────────────────────────────────────────
import SiswaPage    from '@/pages/master/SiswaPage';
import GuruPage     from '@/pages/master/GuruPage';
import KelasPage    from '@/pages/master/KelasPage';
import JurusanPage  from '@/pages/master/JurusanPage';
import HariLiburPage from '@/pages/master/HariLiburPage';

// ── Admin ─────────────────────────────────────────────────────
import UserPage       from '@/pages/admin/UserPage';
import PengaturanPage from '@/pages/admin/PengaturanPage';

// ── Profile ───────────────────────────────────────────────────
import ProfilePage from '@/pages/profile/ProfilePage';

// ── 404 ───────────────────────────────────────────────────────
import NotFoundPage from '@/pages/NotFoundPage';

// ── Hierarki level role (semakin kecil = semakin tinggi) ──────
const ROLE_LEVEL = {
  SUPER_ADMIN:    0,
  ADMIN:          1,
  BK:             2,
  KEPALA_SEKOLAH: 2,
  OPERATOR:       3,
  WALI_KELAS:     3,
  PETUGAS_PIKET:  4,
  GURU:           5,
  SISWA:          6,
};

// ── Grup role ─────────────────────────────────────────────────
const ALL_ROLES        = ['SUPER_ADMIN','ADMIN','BK','KEPALA_SEKOLAH','OPERATOR','WALI_KELAS','PETUGAS_PIKET','GURU','SISWA'];
const ADMIN_ROLES      = ['SUPER_ADMIN','ADMIN'];
const SUPER_ADMIN_ONLY = ['SUPER_ADMIN'];
const STAFF_ROLES      = ['SUPER_ADMIN','ADMIN','BK','KEPALA_SEKOLAH','OPERATOR','WALI_KELAS','PETUGAS_PIKET','GURU'];
const INPUT_ROLES      = ['SUPER_ADMIN','ADMIN','OPERATOR','PETUGAS_PIKET']; // yang bisa input absensi

// ── Route guard ───────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRoles = user?.roles || [user?.role];
    const maxAllowedLevel = Math.max(...roles.map(r => ROLE_LEVEL[r] ?? -1));
    const userMinLevel    = Math.min(...userRoles.map(r => ROLE_LEVEL[r] ?? 99));

    if (userMinLevel > maxAllowedLevel) {
      // Redirect sesuai konteks
      const isSiswa = userRoles.includes('SISWA');
      if (isSiswa) return <Navigate to="/absensi/riwayat" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

// ── Komponen Dashboard sesuai role ────────────────────────────
function SmartDashboard() {
  const { user } = useAuthStore();
  const roles = user?.roles || [user?.role];

  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('OPERATOR')) {
    return <DashboardAdminPage />;
  }
  if (roles.includes('SISWA')) {
    return <DashboardSiswaPage />;
  }
  // GURU, WALI_KELAS, BK, KEPALA_SEKOLAH, PETUGAS_PIKET
  return <DashboardGuruPage />;
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ── */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          {/* ── SSO Callback dari SDMS App Hub ── */}
          {/* Menerima: /sso/callback?token=<sso_token>&from=sdms           */}
          {/* SSOCallbackPage kirim token ke backend → terima accessToken   */}
          {/* → simpan ke store → redirect ke /dashboard                    */}
          <Route path="/sso/callback" element={<SSOCallbackPage />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── Protected routes (semua butuh autentikasi) ── */}
          <Route element={<ProtectedRoute roles={ALL_ROLES}><Layout /></ProtectedRoute>}>

            {/* Dashboard otomatis sesuai role */}
            <Route path="/dashboard" element={<SmartDashboard />} />

            {/* ── Absensi — input hanya ADMIN/OPERATOR/PETUGAS_PIKET ── */}
            <Route path="/absensi"
              element={<ProtectedRoute roles={INPUT_ROLES}><AbsensiPage /></ProtectedRoute>}
            />
            <Route path="/absensi/wajah"
              element={<ProtectedRoute roles={INPUT_ROLES}><AbsensiWajahPage /></ProtectedRoute>}
            />
            <Route path="/absensi/qr"
              element={<ProtectedRoute roles={INPUT_ROLES}><AbsensiQRPage /></ProtectedRoute>}
            />
            <Route path="/absensi/kartu"
              element={<ProtectedRoute roles={INPUT_ROLES}><AbsensiKartuPage /></ProtectedRoute>}
            />
            <Route path="/absensi/massal"
              element={<ProtectedRoute roles={ADMIN_ROLES}><AbsensiMassalPage /></ProtectedRoute>}
            />

            {/* ── Riwayat & Rekap — semua role bisa lihat miliknya ── */}
            <Route path="/absensi/riwayat" element={<AbsensiRiwayatPage />} />
            <Route path="/absensi/rekap"   element={<AbsensiRekapPage />} />

            {/* ── Laporan — staff saja ── */}
            <Route path="/laporan"
              element={<ProtectedRoute roles={STAFF_ROLES}><AbsensiLaporanPage /></ProtectedRoute>}
            />

            {/* ── Master Data — read only untuk semua staff ── */}
            <Route path="/siswa"    element={<ProtectedRoute roles={STAFF_ROLES}><SiswaPage /></ProtectedRoute>} />
            <Route path="/guru"     element={<ProtectedRoute roles={STAFF_ROLES}><GuruPage /></ProtectedRoute>} />
            <Route path="/kelas"    element={<ProtectedRoute roles={STAFF_ROLES}><KelasPage /></ProtectedRoute>} />
            <Route path="/jurusan"  element={<ProtectedRoute roles={STAFF_ROLES}><JurusanPage /></ProtectedRoute>} />
            <Route path="/hari-libur" element={<ProtectedRoute roles={ADMIN_ROLES}><HariLiburPage /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/users"
              element={<ProtectedRoute roles={SUPER_ADMIN_ONLY}><UserPage /></ProtectedRoute>}
            />
            <Route path="/pengaturan"
              element={<ProtectedRoute roles={ADMIN_ROLES}><PengaturanPage /></ProtectedRoute>}
            />

            {/* ── Profile — semua role ── */}
            <Route path="/profile" element={<ProfilePage />} />

          </Route>

          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
