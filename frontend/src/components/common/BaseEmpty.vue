<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <component :is="iconComponent" class="w-8 h-8 text-gray-400" />
    </div>
    <p class="text-gray-500 font-medium">{{ title }}</p>
    <p v-if="subtitle" class="text-sm text-gray-400 mt-1">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { InboxIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  title:    { type: String, default: 'Tidak ada data' },
  subtitle: String,
  icon:     { type: String, default: 'inbox' },
});

const iconComponent = computed(() => ({
  inbox:  InboxIcon,
  search: MagnifyingGlassIcon,
}[props.icon] || InboxIcon));
</script>
