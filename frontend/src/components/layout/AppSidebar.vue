<template>
  <!-- Mobile overlay -->
  <Transition name="overlay">
    <div
      v-if="uiStore.sidebarMobile"
      class="fixed inset-0 z-30 bg-indigo-900/30 backdrop-blur-md lg:hidden"
      @click="uiStore.closeMobileSidebar()"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none',
      uiStore.sidebarOpen ? 'w-64' : 'w-[72px]',
      uiStore.sidebarMobile ? 'translate-x-0 shadow-sidebar' : '-translate-x-full lg:translate-x-0',
    ]"
    :style="{ background: sidebarGradient }"
  >
    <!-- Decorative blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/[0.06] blur-3xl" />
      <div class="absolute top-1/3 -left-10 w-32 h-32 rounded-full bg-white/[0.04] blur-2xl" />
      <div class="absolute bottom-20 right-0 w-24 h-24 rounded-full bg-white/[0.05] blur-2xl" />
    </div>

    <!-- ── Logo / Brand ─────────────────────────────────────── -->
    <div
      :class="[
        'relative flex items-center h-16 border-b border-white/[0.08] flex-shrink-0 transition-all duration-300',
        uiStore.sidebarOpen ? 'px-4 gap-3' : 'px-0 justify-center',
      ]"
    >
      <!-- Logo -->
      <div
        class="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden transition-all duration-300 hover:scale-110 hover:rotate-3"
        :class="uiStore.sidebarOpen ? 'shadow-lg shadow-white/10' : 'shadow-md'"
        :style="{ background: settingsStore.get('sidebar_accent') || 'linear-gradient(135deg, #818cf8, #a78bfa)' }"
      >
        <img
          v-if="settingsStore.get('logo_url')"
          :src="settingsStore.get('logo_url')"
          class="w-full h-full object-contain"
          alt="Logo"
        />
        <AcademicCapIcon v-else class="w-5 h-5 text-white" />
      </div>

      <!-- Brand text -->
      <Transition name="label">
        <div v-if="uiStore.sidebarOpen" class="overflow-hidden min-w-0">
          <p class="text-sm font-bold text-white tracking-tight leading-none">
            {{ settingsStore.get('app_name') || 'SDMS' }}
          </p>
          <p class="text-[10px] text-white/40 leading-none mt-1.5 tracking-wider font-medium">
            {{ settingsStore.get('app_subtitle') || 'School Data Management' }}
          </p>
        </div>
      </Transition>
    </div>

    <!-- ── Navigation ───────────────────────────────────────── -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar relative">
      <template v-for="section in filteredMenu" :key="section.label">

        <!-- Section divider label -->
        <div
          :class="[
            'transition-all duration-200',
            uiStore.sidebarOpen
              ? 'px-4 pt-5 pb-1.5'
              : 'flex justify-center pt-5 pb-1.5',
          ]"
        >
          <span
            v-if="uiStore.sidebarOpen"
            class="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em]"
          >{{ section.label }}</span>
          <div v-else class="w-5 h-px bg-white/15" />
        </div>

        <!-- Menu items -->
        <div class="px-2 space-y-0.5">
          <template v-for="item in section.items" :key="item.name">

            <!-- Collapsible parent -->
            <div v-if="item.children">
              <button
                @click="toggleExpanded(item.name)"
                :class="[
                  'w-full flex items-center rounded-2xl text-sm transition-all duration-200 group',
                  uiStore.sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5',
                  isActiveParent(item)
                    ? 'bg-white/[0.12] text-white shadow-sm shadow-white/[0.05]'
                    : 'text-white/55 hover:text-white hover:bg-white/[0.08]',
                ]"
                :title="!uiStore.sidebarOpen ? item.label : ''"
              >
                <div class="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <component :is="item.icon" class="w-[18px] h-[18px]" />
                  <span
                    v-if="!uiStore.sidebarOpen && isActiveParent(item)"
                    class="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                  />
                </div>
                <Transition name="label">
                  <div v-if="uiStore.sidebarOpen" class="flex flex-1 items-center justify-between min-w-0">
                    <span class="truncate font-medium">{{ item.label }}</span>
                    <ChevronDownIcon
                      class="w-3.5 h-3.5 flex-shrink-0 transition-all duration-300 text-white/25"
                      :class="expandedItems.includes(item.name) ? 'rotate-180 text-white/60' : ''"
                    />
                  </div>
                </Transition>
              </button>

              <!-- Sub-items -->
              <Transition name="collapse">
                <div
                  v-if="expandedItems.includes(item.name) && uiStore.sidebarOpen"
                  class="mt-0.5 mx-1 space-y-0.5 overflow-hidden"
                >
                  <RouterLink
                    v-for="child in item.children"
                    :key="child.to"
                    :to="child.to"
                    @click="uiStore.closeMobileSidebar()"
                    :class="[
                      'flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-sm transition-all duration-200',
                      isActive(child.to)
                        ? 'bg-white/[0.12] text-white font-medium shadow-sm shadow-white/[0.04]'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]',
                    ]"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200"
                      :class="isActive(child.to) ? 'scale-110 shadow-sm shadow-white/20' : 'bg-white/15'"
                      :style="isActive(child.to) ? { background: settingsStore.get('sidebar_accent') || '#a5b4fc' } : {}"
                    />
                    <span class="truncate">{{ child.label }}</span>
                  </RouterLink>
                </div>
              </Transition>
            </div>

            <!-- Simple nav link -->
            <RouterLink
              v-else
              :to="item.to"
              @click="uiStore.closeMobileSidebar()"
              :class="[
                'flex items-center rounded-2xl text-sm transition-all duration-200 group relative',
                uiStore.sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5',
                isActive(item.to)
                  ? 'text-white font-medium shadow-sm shadow-white/[0.05]'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.08]',
              ]"
              :style="isActive(item.to) ? activeMenuStyle : {}"
              :title="!uiStore.sidebarOpen ? item.label : ''"
            >
              <!-- Active indicator bar -->
              <div
                v-if="isActive(item.to)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white/60"
              />
              <component :is="item.icon" class="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <Transition name="label">
                <span v-if="uiStore.sidebarOpen" class="truncate font-medium">{{ item.label }}</span>
              </Transition>
            </RouterLink>

          </template>
        </div>
      </template>
    </nav>

    <!-- ── User Profile Footer ───────────────────────────────── -->
    <div class="relative flex-shrink-0 border-t border-white/[0.08] p-3">
      <div
        :class="[
          'flex items-center rounded-2xl transition-all duration-200 hover:bg-white/[0.08] cursor-default',
          uiStore.sidebarOpen ? 'gap-3 p-2' : 'justify-center p-2',
        ]"
      >
        <!-- Avatar -->
        <div
          class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform duration-200 hover:scale-105"
          :class="avatarColor"
        >
          {{ initials }}
        </div>
        <Transition name="label">
          <div v-if="uiStore.sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white/90 truncate leading-none">{{ authStore.user?.full_name }}</p>
            <p class="text-[11px] text-white/35 truncate mt-1 leading-none">{{ authStore.user?.role_label }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { getInitials, getAvatarColor } from '@/utils/helpers';
import {
  HomeIcon, UserGroupIcon, AcademicCapIcon,
  Squares2X2Icon, UsersIcon,
  ChevronDownIcon, CircleStackIcon,
  RectangleStackIcon, Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

const uiStore       = useUIStore();
const authStore     = useAuthStore();
const settingsStore = useSettingsStore();
const route         = useRoute();

const expandedItems = ref(['master']);

const initials    = computed(() => getInitials(authStore.user?.full_name));
const avatarColor = computed(() => getAvatarColor(authStore.user?.full_name));

const isActive       = (path) => route.path === path;
const isActiveParent = (item) => item.children?.some((c) => route.path.startsWith(c.to));

// Bright happy sidebar gradient
const sidebarGradient = computed(() => {
  const bg = settingsStore.get('sidebar_bg');
  if (bg && !bg.includes('#0f172a') && !bg.includes('#1e293b')) return `linear-gradient(180deg, ${bg} 0%, ${bg}ee 100%)`;
  return 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 70%, #c4b5fd 100%)';
});

const activeMenuStyle = computed(() => {
  const accent = settingsStore.get('sidebar_accent');
  return accent ? { background: accent } : { background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))' };
});

const toggleExpanded = (name) => {
  const idx = expandedItems.value.indexOf(name);
  if (idx > -1) expandedItems.value.splice(idx, 1);
  else expandedItems.value.push(name);
};

const allMenu = [
  {
    label: 'Utama',
    items: [
      { name: 'dashboard', label: 'Dashboard',       to: '/dashboard', icon: HomeIcon,       permission: 'dashboard:view' },
      { name: 'apphub',   label: 'Application Hub',  to: '/app-hub',   icon: Squares2X2Icon, permission: 'dashboard:view' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      {
        name: 'master', label: 'Master Data', icon: CircleStackIcon, permission: 'master:view',
        children: [
          { label: 'Data Guru',         to: '/master/guru',            permission: 'guru:view' },
          { label: 'Data Siswa',        to: '/master/siswa',           permission: 'siswa:view' },
          { label: 'Data Pegawai',      to: '/master/pegawai',         permission: 'pegawai:view' },
          { label: 'Kelas',             to: '/master/kelas',           permission: 'kelas:view' },
          { label: 'Jurusan',           to: '/master/jurusan',         permission: 'jurusan:view' },
          { label: 'Mata Pelajaran',    to: '/master/mapel',           permission: 'mapel:view' },
          { label: 'Tahun Pelajaran',   to: '/master/tahun-pelajaran', permission: 'master:view' },
          { label: 'Kalender Akademik', to: '/master/kalender',        permission: 'master:view' },
        ],
      },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { name: 'users',    label: 'Manajemen User',  to: '/users',           icon: UsersIcon,      permission: 'user:view' },
      { name: 'profile',  label: 'Profil Saya',     to: '/profile',         icon: UserGroupIcon },
      { name: 'backup',   label: 'Backup Database', to: '/system/backup',   icon: CircleStackIcon, role: 'super_admin' },
      { name: 'settings', label: 'Pengaturan',      to: '/system/settings', icon: Cog6ToothIcon,   role: 'super_admin' },
    ],
  },
];

const filteredMenu = computed(() =>
  allMenu
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => {
          if (item.role && authStore.userRole !== item.role && !authStore.isSuperAdmin) return false;
          if (item.permission && !authStore.hasPermission(item.permission)) return false;
          return true;
        })
        .map((item) => ({
          ...item,
          children: item.children?.filter((c) => !c.permission || authStore.hasPermission(c.permission)),
        }))
        .filter((item) => !item.children || item.children.length > 0),
    }))
    .filter((section) => section.items.length > 0)
);
</script>

<style scoped>
/* Label fade — untuk teks yang muncul/hilang saat sidebar expand/collapse */
.label-enter-active { transition: opacity 0.2s ease 0.06s, transform 0.2s ease 0.06s; }
.label-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.label-enter-from   { opacity: 0; transform: translateX(-8px); }
.label-leave-to     { opacity: 0; transform: translateX(-4px); }

/* Collapse sub-menu */
.collapse-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.collapse-leave-active { transition: all 0.15s ease; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; transform: translateY(-8px); }

/* Mobile overlay fade */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.3s ease; }
.overlay-enter-from, .overlay-leave-to       { opacity: 0; }
</style>
