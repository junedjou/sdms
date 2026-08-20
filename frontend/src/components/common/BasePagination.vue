<template>
  <div class="flex flex-col gap-3 text-sm text-slate-500">

    <!-- Baris atas: info data + selector limit -->
    <div class="flex flex-wrap items-center justify-between gap-2">

      <!-- Info: menampilkan X-Y dari Z -->
      <span class="text-slate-500 whitespace-nowrap text-xs sm:text-sm">
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
          class="text-xs border border-slate-200/80 rounded-lg px-2.5 py-1.5 min-w-[64px] bg-white text-slate-700 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-400 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_6px_center] bg-no-repeat pr-7"
        >
          <option v-for="opt in limitOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span class="text-slate-400 text-xs whitespace-nowrap hidden xs:block">per halaman</span>
      </div>
    </div>

    <!-- Baris bawah: navigasi halaman -->
    <div v-if="totalPages > 1" class="flex items-center gap-1">
      <!-- Prev -->
      <button
        @click="$emit('change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-9 h-9 rounded-xl border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
        title="Halaman sebelumnya"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>

      <!-- Page buttons -->
      <template v-for="pg in visiblePages" :key="pg">
        <span v-if="pg === '...'" class="w-9 h-9 flex items-center justify-center text-slate-400 text-xs">···</span>
        <button
          v-else
          @click="$emit('change', pg)"
          :class="[
            'w-9 h-9 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95',
            pg === currentPage
              ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20'
              : 'border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-600',
          ]"
        >{{ pg }}</button>
      </template>

      <!-- Next -->
      <button
        @click="$emit('change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-9 h-9 rounded-xl border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
        title="Halaman berikutnya"
      >
        <ChevronRightIcon class="w-4 h-4" />
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
});
</script>
