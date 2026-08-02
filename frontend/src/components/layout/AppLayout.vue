<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Navbar -->
    <AppNavbar />

    <!-- Main content -->
    <main
      :class="[
        'transition-all duration-300 pt-16 min-h-screen',
        uiStore.sidebarOpen ? 'lg:pl-64' : 'lg:pl-[70px]',
      ]"
    >
      <!-- Page loading bar -->
      <div v-if="uiStore.pageLoading" class="fixed top-16 left-0 right-0 z-30 h-0.5 bg-gray-100">
        <div class="h-full bg-primary-600 animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>

      <div class="p-6">
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
.page-enter-active, .page-leave-active { transition: all 0.18s ease; }
.page-enter-from  { opacity: 0; transform: translateY(6px); }
.page-leave-to    { opacity: 0; transform: translateY(-6px); }

@keyframes loading {
  0%   { width: 0%; margin-left: 0; }
  50%  { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
</style>
