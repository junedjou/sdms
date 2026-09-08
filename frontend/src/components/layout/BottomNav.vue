<template>
  <!-- Bottom Navigation — hanya tampil di mobile (< lg) -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
    :style="navBgStyle">

    <!-- Border top -->
    <div class="h-px w-full" :style="borderStyle" />

    <div class="flex items-end justify-around px-2 pb-safe"
      style="padding-bottom: max(env(safe-area-inset-bottom), 8px); padding-top: 6px;">

      <!-- Item kiri: menu dinamis sesuai role -->
      <template v-for="item in leftItems" :key="item.to">
        <RouterLink :to="item.to" custom v-slot="{ isActive, navigate }">
          <button @click="navigate"
            :class="['flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]',
              isActive
                ? 'opacity-100'
                : 'opacity-50 hover:opacity-75'
            ]"
          >
            <component :is="item.icon"
              class="w-6 h-6 transition-transform duration-200"
              :class="isActive ? 'scale-110' : ''"
              :style="isActive ? { color: accentColor } : { color: textColor }"
            />
            <span class="text-[10px] font-medium leading-none"
              :style="isActive ? { color: accentColor } : { color: textColor }">
              {{ item.label }}
            </span>
          </button>
        </RouterLink>
      </template>

      <!-- Tombol HOME — tengah, lebih besar & menonjol -->
      <RouterLink to="/dashboard" custom v-slot="{ isActive, navigate }">
        <button @click="navigate"
          class="flex flex-col items-center gap-1 -mt-5 relative"
        >
          <!-- Lingkaran besar -->
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
            :style="{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }"
          >
            <HomeIcon class="w-7 h-7 text-white" />
          </div>
          <span class="text-[10px] font-medium leading-none"
            :style="isActive ? { color: accentColor } : { color: textColor }">
            Beranda
          </span>
        </button>
      </RouterLink>

      <!-- Item kanan: menu dinamis sesuai role -->
      <template v-for="item in rightItems" :key="item.to">
        <RouterLink :to="item.to" custom v-slot="{ isActive, navigate }">
          <button @click="navigate"
            :class="['flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]',
              isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            ]"
          >
            <component :is="item.icon"
              class="w-6 h-6 transition-transform duration-200"
              :class="isActive ? 'scale-110' : ''"
              :style="isActive ? { color: accentColor } : { color: textColor }"
            />
            <span class="text-[10px] font-medium leading-none"
              :style="isActive ? { color: accentColor } : { color: textColor }">
              {{ item.label }}
            </span>
          </button>
        </RouterLink>
      </template>

    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import {
  HomeIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

const authStore     = useAuthStore();
const settingsStore = useSettingsStore();

// ── Warna mengikuti tema sidebar ──────────────────────────────
const sidebarTheme = computed(() => settingsStore.get('sidebar_theme') || 'light');
const accentColor  = computed(() => settingsStore.get('sidebar_accent') || '#6366f1');

const navBgStyle = computed(() => {
  if (sidebarTheme.value === 'dark') {
    return { background: '#0f172a', boxShadow: '0 -1px 20px rgba(0,0,0,0.3)' };
  }
  if (sidebarTheme.value === 'gradient') {
    return { background: 'white', boxShadow: '0 -1px 12px rgba(0,0,0,0.08)' };
  }
  return { background: 'white', boxShadow: '0 -1px 12px rgba(0,0,0,0.08)' };
});

const borderStyle = computed(() => ({
  background: sidebarTheme.value === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.06)',
}));

const textColor = computed(() =>
  sidebarTheme.value === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b'
);

// ── Menu item sesuai role ─────────────────────────────────────
// 2 item kiri + home tengah + 2 item kanan = 5 total
const allMenus = computed(() => {
  const role = authStore.userRole;

  if (role === 'siswa') {
    return [
      { to: '/app-hub',      icon: Squares2X2Icon,  label: 'App Hub' },
      { to: '/profile',      icon: UserCircleIcon,  label: 'Profil' },
      // Home ditengah
      { to: '/app-hub',      icon: Squares2X2Icon,  label: 'App Hub' }, // placeholder simetri
      { to: '/profile',      icon: UserCircleIcon,  label: 'Profil' },
    ];
  }

  if (role === 'guru' || role === 'wali_kelas') {
    return [
      { to: '/app-hub',        icon: Squares2X2Icon, label: 'App Hub' },
      { to: '/master/siswa',   icon: AcademicCapIcon, label: 'Siswa' },
      // Home
      { to: '/master/kelas',   icon: UserGroupIcon,  label: 'Kelas' },
      { to: '/profile',        icon: UserCircleIcon, label: 'Profil' },
    ];
  }

  // Admin / super_admin / kepala_sekolah / pegawai
  return [
    { to: '/app-hub',       icon: Squares2X2Icon, label: 'App Hub' },
    { to: '/master/guru',   icon: UserGroupIcon,  label: 'Guru' },
    // Home
    { to: '/master/siswa',  icon: AcademicCapIcon, label: 'Siswa' },
    { to: '/profile',       icon: UserCircleIcon,  label: 'Profil' },
  ];
});

const leftItems  = computed(() => allMenus.value.slice(0, 2));
const rightItems = computed(() => allMenus.value.slice(2, 4));
</script>
