<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between text-sm text-gray-500">
    <span>
      Menampilkan {{ from }}–{{ to }} dari {{ total }} data
    </span>
    <div class="flex items-center gap-1">
      <button
        @click="$emit('change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        &larr;
      </button>

      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
        <button
          v-else
          @click="$emit('change', page)"
          :class="[
            'px-3 py-1.5 rounded-lg border transition-colors',
            page === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-200 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
      </template>

      <button
        @click="$emit('change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        &rarr;
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages:  { type: Number, required: true },
  total:       { type: Number, required: true },
  limit:       { type: Number, default: 10 },
});

defineEmits(['change']);

const from = computed(() => ((props.currentPage - 1) * props.limit) + 1);
const to   = computed(() => Math.min(props.currentPage * props.limit, props.total));

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const cur = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (cur > 3) pages.push('...');
    const start = Math.max(2, cur - 1);
    const end   = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < total - 2) pages.push('...');
    pages.push(total);
  }

  return pages;
});
</script>
