<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-5 ring-1 ring-slate-100">
      <component :is="iconComponent" class="w-9 h-9 text-slate-300" />
    </div>
    <p class="text-slate-500 font-semibold">{{ title }}</p>
    <p v-if="subtitle" class="text-sm text-slate-400 mt-1.5">{{ subtitle }}</p>
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
