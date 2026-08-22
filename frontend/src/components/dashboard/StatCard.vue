<template>
  <div class="card p-5 flex items-center gap-4 group hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 cursor-default relative overflow-hidden">
    <!-- Subtle decorative shimmer on hover -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style="background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%); background-size: 200% 200%; animation: shimmer 2s ease-in-out infinite;" />

    <!-- Icon wrapper — warm gradient -->
    <div
      class="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
      :class="color"
    >
      <component :is="icon" class="w-6 h-6 transition-colors duration-200" :class="iconColor" />
    </div>

    <!-- Text -->
    <div class="min-w-0 flex-1 relative">
      <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">{{ label }}</p>

      <!-- Loading skeleton -->
      <div v-if="loading" class="mt-2 space-y-1.5">
        <div class="h-7 w-20 skeleton" />
        <div class="h-3 w-16 skeleton" />
      </div>

      <template v-else>
        <p class="text-[1.75rem] font-bold text-slate-800 leading-tight mt-0.5 tabular-nums">
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
  iconColor: { type: String,           default: 'text-primary-500' },
  trend:     { type: String,           default: '' },
  loading:   { type: Boolean,          default: false },
});
</script>
