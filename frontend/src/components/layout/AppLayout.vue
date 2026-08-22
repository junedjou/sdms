<template>
  <div class="min-h-screen bg-gradient-warm">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Navbar -->
    <AppNavbar />

    <!-- Main content -->
    <main
      :class="[
        'transition-all duration-300 pt-16 min-h-screen',
        uiStore.sidebarOpen ? 'lg:pl-64' : 'lg:pl-[72px]',
      ]"
    >
      <!-- Page loading bar -->
      <div v-if="uiStore.pageLoading" class="fixed top-16 left-0 right-0 z-30 h-0.5 bg-primary-100 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 animate-[loading_1.5s_ease-in-out_infinite] rounded-full" />
      </div>

      <div class="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import AppSidebar from './AppSidebar.vue';
import AppNavbar from './AppNavbar.vue';
import { useUIStore } from '@/stores/ui.store';
import { useMasterStore } from '@/stores/master.store';

const uiStore     = useUIStore();
const masterStore = useMasterStore();

onMounted(() => {
  // Non-blocking: load lookup data di background, tidak menunda render halaman
  masterStore.initLookups();
});
</script>

<style scoped>
.page-enter-active { transition: all 0.25s ease-out; }
.page-leave-active { transition: all 0.15s ease-in; }
.page-enter-from  { opacity: 0; transform: translateY(10px); }
.page-leave-to    { opacity: 0; transform: translateY(-4px); }

@keyframes loading {
  0%   { width: 0%; margin-left: 0; }
  50%  { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
</style>
