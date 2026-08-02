<template>
  <div class="card p-5 flex items-center gap-4 group hover:shadow-card-md transition-shadow duration-200">
    <!-- Icon wrapper -->
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
      :class="color"
    >
      <component :is="icon" class="w-6 h-6" :class="iconColor" />
    </div>

    <!-- Text -->
    <div class="min-w-0 flex-1">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{{ label }}</p>

      <!-- Loading skeleton -->
      <div v-if="loading" class="mt-1.5 space-y-1.5">
        <div class="h-7 w-20 skeleton" />
        <div class="h-3 w-16 skeleton" />
      </div>

      <template v-else>
        <p class="text-[1.75rem] font-bold text-slate-900 leading-tight mt-0.5 tabular-nums">
          {{ value !== null && value !== undefined ? formatNumber(value) : '—' }}
        </p>
        <p v-if="trend" class="text-xs text-slate-400 mt-0.5 truncate">{{ trend }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { formatNumber } from '@/utils/helpers';

defineProps({
  label:     { type: String,           required: true },
  value:     { type: [Number, String], default: null },
  icon:      { type: Object,           required: true },
  color:     { type: String,           default: 'bg-primary-50' },
  iconColor: { type: String,           default: 'text-primary-600' },
  trend:     { type: String,           default: '' },
  loading:   { type: Boolean,          default: false },
});
</script>
