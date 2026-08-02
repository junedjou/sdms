<template>
  <div class="flex flex-col gap-3 text-sm text-slate-500">

    <!-- Baris atas: info data + selector limit -->
    <div class="flex flex-wrap items-center justify-between gap-2">

      <!-- Info: menampilkan X-Y dari Z -->
      <span class="text-slate-500 whitespace-nowrap">
        Menampilkan
        <span class="font-semibold text-slate-700">{{ from }}–{{ to }}</span>
        dari
        <span class="font-semibold text-slate-700">{{ total }}</span>
        data
      </span>

      <!-- Selector per halaman -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-slate-400 text-xs whitespace-nowrap">Tampilkan</span>
        <select
          :value="limit"
          @change="$emit('limit-change', parseInt($event.target.value))"
          class="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 min-w-[64px] bg-white text-slate-700 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors appearance-none"
        >
          <option v-for="opt in limitOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span class="text-slate-400 text-xs whitespace-nowrap">per halaman</span>
      </div>
    </div>

    <!-- Baris bawah: navigasi halaman -->
    <div v-if="totalPages > 1" class="flex items-center gap-1">
      <!-- Prev -->
      <button
        @click="$emit('change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Halaman sebelumnya"
      >
        <ChevronLeftIcon class="w-3.5 h-3.5" />
      </button>

      <!-- Page buttons -->
      <template v-for="pg in visiblePages" :key="pg">
        <span v-if="pg === '...'" class="w-8 h-8 flex items-center justify-center text-slate-400">···</span>
        <button
          v-else
          @click="$emit('change', pg)"
          :class="[
            'w-8 h-8 rounded-lg border text-xs font-medium transition-colors',
            pg === currentPage
              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
              : 'border-slate-200 hover:bg-slate-50 text-slate-600',
          ]"
        >{{ pg }}</button>
      </template>

      <!-- Next -->
      <button
        @click="$emit('change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Halaman berikutnya"
      >
        <ChevronRightIcon class="w-3.5 h-3.5" />
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  currentPage:  { type: Number, required: true },
  totalPages:   { type: Number, required: true },
  total:        { type: Number, required: true },
  limit:        { type: Number, default: 10 },
  limitOptions: { type: Array,  default: () => [10, 25, 50, 100] },
});

defineEmits(['change', 'limit-change']);

const from = computed(() => props.total === 0 ? 0 : ((props.currentPage - 1) * props.limit) + 1);
const to   = computed(() => Math.min(props.currentPage * props.limit, props.total));

const visiblePages = computed(() => {
  const pages = [];
  const tot = props.totalPages;
  const cur = props.currentPage;

  if (tot <= 7) {
    for (let i = 1; i <= tot; i++) pages.push(i);
  } else {
    pages.push(1);
    if (cur > 3) pages.push('...');
    const start = Math.max(2, cur - 1);
    const end   = Math.min(tot - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < tot - 2) pages.push('...');
    pages.push(tot);
  }

  return pages;
});</script>
