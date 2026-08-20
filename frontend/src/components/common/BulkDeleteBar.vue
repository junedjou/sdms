<template>
  <Transition name="bulk-bar">
    <div
      v-if="count > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-card-xl border border-slate-200/80 bg-white/95 backdrop-blur-xl min-w-[320px]"
    >
      <!-- Jumlah terpilih -->
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <CheckIcon class="w-4 h-4 text-primary-600" />
        </div>
        <span class="text-sm font-semibold text-slate-800">
          {{ count }} {{ label }} dipilih
        </span>
      </div>

      <!-- Divider -->
      <div class="w-px h-5 bg-slate-200/80" />

      <!-- Batalkan -->
      <button
        @click="$emit('clear')"
        class="btn-ghost btn-sm text-slate-500 hover:text-slate-700 gap-1.5 px-3"
      >
        <XMarkIcon class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Batalkan</span>
      </button>

      <!-- Hapus -->
      <button
        @click="$emit('delete')"
        :disabled="deleting"
        class="btn-danger btn-sm gap-1.5"
      >
        <span v-if="deleting" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <TrashIcon v-else class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Hapus</span> {{ count }}
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { CheckIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';

defineProps({
  count:   { type: Number,  default: 0 },
  label:   { type: String,  default: 'data' },
  deleting: { type: Boolean, default: false },
});
defineEmits(['delete', 'clear']);
</script>

<style scoped>
.bulk-bar-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bulk-bar-leave-active { transition: all 0.2s ease; }
.bulk-bar-enter-from, .bulk-bar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.95);
}
</style>
