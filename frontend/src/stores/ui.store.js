import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen     = ref(true);
  const sidebarMobile   = ref(false);
  const pageLoading     = ref(false);
  const breadcrumbs     = ref([]);

  const toggleSidebar     = () => { sidebarOpen.value = !sidebarOpen.value; };
  const toggleMobileSidebar = () => { sidebarMobile.value = !sidebarMobile.value; };
  const closeMobileSidebar  = () => { sidebarMobile.value = false; };

  const setPageLoading = (val) => { pageLoading.value = val; };
  const setBreadcrumbs = (items) => { breadcrumbs.value = items; };

  return {
    sidebarOpen, sidebarMobile, pageLoading, breadcrumbs,
    toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
    setPageLoading, setBreadcrumbs,
  };
});
