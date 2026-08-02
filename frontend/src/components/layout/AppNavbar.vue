<template>
  <header
    :class="[
      'fixed top-0 right-0 h-16 z-20 flex items-center justify-between px-4 transition-all duration-300',
      'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.04)]',
      uiStore.sidebarOpen ? 'left-64' : 'left-[70px]',
    ]"
  >
    <!-- ── Kiri: toggle + breadcrumb ─────────────────────── -->
    <div class="flex items-center gap-2 min-w-0">
      <!-- Mobile hamburger -->
      <button
        @click="uiStore.toggleMobileSidebar()"
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <Bars3Icon class="w-5 h-5" />
      </button>

      <!-- Desktop collapse toggle -->
      <button
        @click="uiStore.toggleSidebar()"
        class="hidden lg:flex p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        :aria-label="uiStore.sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'"
      >
        <Bars3Icon class="w-4 h-4" />
      </button>

      <!-- Divider -->
      <div class="hidden lg:block w-px h-5 bg-slate-200 mx-1" />

      <!-- Breadcrumb -->
      <nav class="hidden sm:flex items-center gap-1 text-sm min-w-0" aria-label="breadcrumb">
        <RouterLink
          to="/dashboard"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <HomeIcon class="w-4 h-4" />
        </RouterLink>
        <template v-for="(crumb, idx) in uiStore.breadcrumbs" :key="idx">
          <ChevronRightIcon class="w-3 h-3 text-slate-300 flex-shrink-0" />
          <RouterLink
            v-if="crumb.to && idx < uiStore.breadcrumbs.length - 1"
            :to="crumb.to"
            class="px-1.5 py-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors truncate max-w-[140px]"
          >{{ crumb.label }}</RouterLink>
          <span
            v-else
            class="px-1.5 py-1 text-slate-800 font-semibold truncate max-w-[180px]"
          >{{ crumb.label }}</span>
        </template>
      </nav>
    </div>

    <!-- ── Kanan: info + user menu ────────────────────────── -->
    <div class="flex items-center gap-2 flex-shrink-0">

      <!-- Tahun Pelajaran Aktif pill -->
      <Transition name="fade-up">
        <div
          v-if="masterStore.tahunAktif"
          class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-700"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft flex-shrink-0" />
          <span class="text-xs font-semibold whitespace-nowrap">TP {{ masterStore.tahunAktif.nama }}</span>
        </div>
      </Transition>

      <!-- Divider -->
      <div class="w-px h-5 bg-slate-200 hidden md:block" />

      <!-- User dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          @click="dropdownOpen = !dropdownOpen"
          :class="[
            'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-150',
            dropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-50',
          ]"
        >
          <!-- Avatar -->
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
            :class="avatarColor"
          >
            {{ initials }}
          </div>
          <!-- Name + role (hidden on small screens) -->
          <div class="text-left hidden sm:block">
            <p class="text-sm font-semibold text-slate-800 leading-none">{{ authStore.user?.full_name }}</p>
            <p class="text-[11px] text-slate-400 leading-none mt-0.5">{{ authStore.user?.role_label }}</p>
          </div>
          <ChevronDownIcon
            class="w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200"
            :class="dropdownOpen ? 'rotate-180' : ''"
          />
        </button>

        <!-- Dropdown panel -->
        <Transition name="dropdown">
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card-lg border border-slate-100 py-1.5 z-50 overflow-hidden"
          >
            <!-- User info header -->
            <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  :class="avatarColor"
                >
                  {{ initials }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-800 truncate">{{ authStore.user?.full_name }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
                  <span class="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                    {{ authStore.user?.role_label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Menu items -->
            <div class="py-1">
              <RouterLink
                to="/profile"
                @click="dropdownOpen = false"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="font-medium leading-none">Profil Saya</p>
                  <p class="text-xs text-slate-400 mt-0.5">Kelola akun & password</p>
                </div>
              </RouterLink>
            </div>

            <!-- Logout -->
            <div class="border-t border-slate-100 pt-1 pb-1">
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <ArrowRightOnRectangleIcon class="w-4 h-4 text-red-500" />
                </div>
                <span class="font-medium">Keluar</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useMasterStore } from '@/stores/master.store';
import { getInitials, getAvatarColor } from '@/utils/helpers';
import {
  Bars3Icon, ChevronRightIcon, HomeIcon,
  ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline';

const uiStore     = useUIStore();
const authStore   = useAuthStore();
const masterStore = useMasterStore();
const router      = useRouter();

const dropdownOpen = ref(false);
const dropdownRef  = ref(null);

onClickOutside(dropdownRef, () => { dropdownOpen.value = false; });

const initials    = computed(() => getInitials(authStore.user?.full_name));
const avatarColor = computed(() => getAvatarColor(authStore.user?.full_name));

const handleLogout = async () => {
  dropdownOpen.value = false;
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-leave-active { transition: all 0.12s ease; }
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.fade-up-enter-active { transition: all 0.3s ease; }
.fade-up-leave-active { transition: all 0.2s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
