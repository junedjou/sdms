import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

// ── Lazy load semua halaman ──────────────────────────────────
const LoginView          = () => import('@/views/auth/LoginView.vue');
const DashboardView      = () => import('@/views/dashboard/DashboardView.vue');
const AppHubView         = () => import('@/views/dashboard/AppHubView.vue');

// Master Data
const GuruListView       = () => import('@/views/master/GuruListView.vue');
const SiswaListView      = () => import('@/views/master/SiswaListView.vue');
const PegawaiListView    = () => import('@/views/master/PegawaiListView.vue');
const KelasListView      = () => import('@/views/master/KelasListView.vue');
const JurusanListView    = () => import('@/views/master/JurusanListView.vue');
const MapelListView      = () => import('@/views/master/MapelListView.vue');
const TahunPelajaranView = () => import('@/views/master/TahunPelajaranView.vue');
const KalenderView       = () => import('@/views/master/KalenderView.vue');

// Users
const UserListView    = () => import('@/views/users/UserListView.vue');
const ProfileView     = () => import('@/views/users/ProfileView.vue');

// System
const BackupView      = () => import('@/views/system/BackupView.vue');

// Layouts
const AppLayout = () => import('@/components/layout/AppLayout.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true, title: 'Login — SDMS' },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard', permission: 'dashboard:view' },
      },
      {
        path: 'app-hub',
        name: 'AppHub',
        component: AppHubView,
        meta: { title: 'Application Hub', permission: 'dashboard:view' },
      },

      // ── Master Data ────────────────────────────────────────
      {
        path: 'master/guru',
        name: 'GuruList',
        component: GuruListView,
        meta: { title: 'Data Guru', permission: 'guru:view' },
      },
      {
        path: 'master/siswa',
        name: 'SiswaList',
        component: SiswaListView,
        meta: { title: 'Data Siswa', permission: 'siswa:view' },
      },
      {
        path: 'master/pegawai',
        name: 'PegawaiList',
        component: PegawaiListView,
        meta: { title: 'Data Pegawai', permission: 'pegawai:view' },
      },
      {
        path: 'master/kelas',
        name: 'KelasList',
        component: KelasListView,
        meta: { title: 'Data Kelas', permission: 'kelas:view' },
      },
      {
        path: 'master/jurusan',
        name: 'JurusanList',
        component: JurusanListView,
        meta: { title: 'Data Jurusan', permission: 'jurusan:view' },
      },
      {
        path: 'master/mapel',
        name: 'MapelList',
        component: MapelListView,
        meta: { title: 'Data Mata Pelajaran', permission: 'mapel:view' },
      },
      {
        path: 'master/tahun-pelajaran',
        name: 'TahunPelajaran',
        component: TahunPelajaranView,
        meta: { title: 'Tahun Pelajaran & Semester', permission: 'master:view' },
      },
      {
        path: 'master/kalender',
        name: 'Kalender',
        component: KalenderView,
        meta: { title: 'Kalender Akademik', permission: 'master:view' },
      },

      // ── User Management ────────────────────────────────────
      {
        path: 'users',
        name: 'UserList',
        component: UserListView,
        meta: { title: 'Manajemen User', permission: 'user:view' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
        meta: { title: 'Profil Saya' },
      },

      // ── System ────────────────────────────────────────────
      {
        path: 'system/backup',
        name: 'Backup',
        component: BackupView,
        meta: { title: 'Backup Database', role: 'super_admin' },
      },
    ],
  },

  // Catch-all 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// ── Navigation guards ─────────────────────────────────────────
// Flag untuk mencegah fetchMe dipanggil lebih dari sekali per session
let _hydrated = false;

router.beforeEach(async (to, from, next) => {
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} — SDMS`;
  }

  const authStore = useAuthStore();

  // Hydrate user dari token HANYA sekali per session (saat hard refresh).
  // Setelah login() store sudah terisi, jadi tidak perlu fetchMe lagi.
  if (authStore.token && !authStore.user && !_hydrated) {
    _hydrated = true;
    await authStore.fetchMe();
  }

  // Tandai sudah dihydrate jika user sudah ada (hasil login baru)
  if (authStore.user) _hydrated = true;

  // Route yang butuh guest (login page)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/dashboard');
  }

  // Route yang butuh autentikasi
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    _hydrated = false; // reset agar bisa hydrate ulang setelah login
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // Cek permission
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    return next('/dashboard');
  }

  next();
});

export default router;
