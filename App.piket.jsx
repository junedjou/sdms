import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/layout/Layout';
import { Component } from 'react';

/* ── Error Boundary ── */
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

// Auth
import LoginPage from '@/pages/auth/LoginPage';
import SSOCallbackPage from '@/pages/auth/SSOCallbackPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DashboardPiketPage from '@/pages/dashboard/DashboardPiketPage';

// Master Data
import SiswaPage             from '@/pages/master/SiswaPage';
import SiswaDetailPage       from '@/pages/master/SiswaDetailPage';
import GuruPage              from '@/pages/master/GuruPage';
import KelasPage             from '@/pages/master/KelasPage';
import JurusanPage           from '@/pages/master/JurusanPage';
import TahunAjaranPage       from '@/pages/master/TahunAjaranPage';
import UserPage              from '@/pages/master/UserPage';
import HariLiburPage         from '@/pages/master/HariLiburPage';
import KalenderPage          from '@/pages/master/KalenderPage';
import JenisPelanggaranPage  from '@/pages/master/JenisPelanggaranPage';
import PetugasPiketPage      from '@/pages/master/PetugasPiketPage';

// Absensi
import AbsensiPage       from '@/pages/absensi/AbsensiPage';
import AbsensiRiwayatPage from '@/pages/absensi/AbsensiRiwayatPage';
import AbsensiRekapPage  from '@/pages/absensi/AbsensiRekapPage';
import AutoAbsensiPage   from '@/pages/absensi/AutoAbsensiPage';
import AbsensiMassalPage from '@/pages/absensi/AbsensiMassalPage';

// Pelanggaran
import PelanggaranPage          from '@/pages/pelanggaran/PelanggaranPage';
import PelanggaranAkumulasiPage from '@/pages/pelanggaran/PelanggaranAkumulasiPage';

// Surat & BK
import SuratPage              from '@/pages/surat/SuratPage';
import LaporanPage            from '@/pages/laporan/LaporanPage';
import DashboardBKPage        from '@/pages/bk/DashboardBKPage';
import DashboardWaliKelasPage from '@/pages/walikelas/DashboardWaliKelasPage';

// QR & Profile
import QRCodePage    from '@/pages/qr/QRCodePage';
import ProfilePage   from '@/pages/profile/ProfilePage';
import PengaturanPage from '@/pages/pengaturan/PengaturanPage';

// Piket
import PiketSiswaPage from '@/pages/piket/PiketSiswaPage';

// 404
import NotFoundPage from '@/pages/NotFoundPage';

// ── Hierarki role ─────────────────────────────────────────────
const ROLE_LEVEL = {
  SUPER_ADMIN: 0, ADMIN: 1, BK: 2, KEPALA_SEKOLAH: 2,
  WALI_KELAS: 3, PETUGAS_PIKET: 4, GURU: 5,
};

// ── Konstanta grup role ───────────────────────────────────────
const ALL_ROLES      = ['SUPER_ADMIN','ADMIN','PETUGAS_PIKET','BK','WALI_KELAS','GURU','KEPALA_SEKOLAH'];
const ADMIN_ROLES    = ['SUPER_ADMIN','ADMIN'];
const SUPER_ADMIN_ONLY = ['SUPER_ADMIN'];

// Route yang bisa diakses GURU (read-only master data)
const GURU_ALLOWED   = ['SUPER_ADMIN','ADMIN','BK','WALI_KELAS','GURU','KEPALA_SEKOLAH'];

// Route yang TIDAK bisa diakses GURU (absensi input, laporan mendalam, dll)
const NOT_GURU       = ['SUPER_ADMIN','ADMIN','BK','WALI_KELAS','KEPALA_SEKOLAH'];

// ── Route guard ───────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRoles = user?.roles || [user?.role];
    const maxAllowedLevel = Math.max(...roles.map(r => ROLE_LEVEL[r] ?? -1));
    const userMinLevel = Math.min(...userRoles.map(r => ROLE_LEVEL[r] ?? 99));

    if (userMinLevel > maxAllowedLevel) {
      // Redirect sesuai role
      const isOnlyPiket = userRoles.length === 1 && userRoles.includes('PETUGAS_PIKET');
      if (isOnlyPiket) return <Navigate to="/absensi" replace />;
      const isOnlyGuru = userRoles.length === 1 && userRoles.includes('GURU');
      if (isOnlyGuru) return <Navigate to="/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Cek apakah user adalah GURU murni (tidak merangkap role lain)
  const isGuru = user?.roles?.length === 1 && user?.roles.includes('GURU');

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route path="/sso/callback" element={<SSOCallbackPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<ProtectedRoute roles={ALL_ROLES}><Layout /></ProtectedRoute>}>

          {/* Dashboard */}
          <Route path="/dashboard" element={
            user?.roles?.length === 1 && user?.roles.includes('PETUGAS_PIKET')
              ? <DashboardPiketPage />
              : <DashboardPage />
          } />

          {/* ── Master Data — GURU bisa lihat (read-only) ── */}
          <Route path="/siswa"     element={<ProtectedRoute roles={GURU_ALLOWED}><SiswaPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/siswa/:id" element={<ProtectedRoute roles={GURU_ALLOWED}><SiswaDetailPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/guru"      element={<ProtectedRoute roles={GURU_ALLOWED}><GuruPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/kelas"     element={<ProtectedRoute roles={GURU_ALLOWED}><KelasPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/jurusan"   element={<ProtectedRoute roles={GURU_ALLOWED}><JurusanPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/hari-libur" element={<ProtectedRoute roles={GURU_ALLOWED}><HariLiburPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/kalender"  element={<ProtectedRoute roles={GURU_ALLOWED}><KalenderPage readOnly={isGuru} /></ProtectedRoute>} />

          {/* ── Master Data — GURU tidak bisa akses ── */}
          <Route path="/tahun-ajaran"      element={<ProtectedRoute roles={NOT_GURU}><TahunAjaranPage /></ProtectedRoute>} />
          <Route path="/jenis-pelanggaran" element={<ProtectedRoute roles={NOT_GURU}><JenisPelanggaranPage /></ProtectedRoute>} />
          <Route path="/users"             element={<ProtectedRoute roles={SUPER_ADMIN_ONLY}><UserPage /></ProtectedRoute>} />
          <Route path="/petugas-piket"     element={<ProtectedRoute roles={ADMIN_ROLES}><PetugasPiketPage /></ProtectedRoute>} />

          {/* ── Absensi — GURU tidak bisa input ── */}
          <Route path="/absensi"         element={<ProtectedRoute roles={NOT_GURU}><AbsensiPage /></ProtectedRoute>} />
          <Route path="/absensi/rekap"   element={<AbsensiRekapPage />} />
          <Route path="/absensi/riwayat" element={<AbsensiRiwayatPage />} />
          <Route path="/absensi/massal"  element={<ProtectedRoute roles={ADMIN_ROLES}><AbsensiMassalPage /></ProtectedRoute>} />
          <Route path="/absensi/auto"    element={<ProtectedRoute roles={ADMIN_ROLES}><AutoAbsensiPage /></ProtectedRoute>} />

          {/* ── Pelanggaran — GURU bisa lihat ── */}
          <Route path="/pelanggaran"           element={<ProtectedRoute roles={GURU_ALLOWED}><PelanggaranPage readOnly={isGuru} /></ProtectedRoute>} />
          <Route path="/pelanggaran/akumulasi" element={<ProtectedRoute roles={GURU_ALLOWED}><PelanggaranAkumulasiPage /></ProtectedRoute>} />

          {/* ── Surat & BK ── */}
          <Route path="/surat" element={<ProtectedRoute roles={NOT_GURU}><SuratPage /></ProtectedRoute>} />
          <Route path="/bk/dashboard" element={
            <ProtectedRoute roles={['BK','KEPALA_SEKOLAH']}>
              <DashboardBKPage />
            </ProtectedRoute>
          } />
          <Route path="/wali-kelas/dashboard" element={
            <ProtectedRoute roles={['WALI_KELAS']}>
              <DashboardWaliKelasPage />
            </ProtectedRoute>
          } />

          {/* ── Laporan — semua role ── */}
          <Route path="/laporan" element={<LaporanPage />} />

          {/* ── QR — GURU tidak bisa ── */}
          <Route path="/qr" element={<ProtectedRoute roles={NOT_GURU}><QRCodePage /></ProtectedRoute>} />

          {/* ── Profile & Pengaturan ── */}
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/pengaturan" element={<ProtectedRoute roles={SUPER_ADMIN_ONLY}><PengaturanPage /></ProtectedRoute>} />

          {/* ── Piket Siswa ── */}
          <Route path="/piket/siswa" element={<PiketSiswaPage />} />

        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
