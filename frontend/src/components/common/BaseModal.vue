<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="onOverlayClick">
        <!-- Overlay with glassmorphism -->
        <div class="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

        <!-- Panel -->
        <div class="flex min-h-screen items-center justify-center p-4 sm:p-6">
          <div
            class="relative z-10 bg-white rounded-2xl shadow-card-xl w-full transition-all duration-200 max-h-[90vh] flex flex-col"
            :class="[sizeClass]"
            role="dialog"
            :aria-label="title"
          >
            <!-- Header -->
            <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 flex-shrink-0">
              <slot name="header">
                <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
              </slot>
              <button
                v-if="closable"
                @click="$emit('update:modelValue', false)"
                class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150 active:scale-95"
                aria-label="Tutup"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4 overflow-y-auto flex-1">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100/80 flex items-center justify-end gap-3 flex-shrink-0 bg-slate-50/30 rounded-b-2xl">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: { type: String, default: 'md' }, // sm, md, lg, xl, full
  closable: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);

const sizeClass = computed(() => ({
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-6xl',
}[props.size] || 'max-w-lg'));

const onOverlayClick = () => {
  if (props.closeOnOverlay) emit('update:modelValue', false);
};
</script>

<style scoped>
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-enter-active > div:last-child > div { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-leave-active > div:last-child > div { transition: all 0.15s ease; }
.modal-enter-from       { opacity: 0; }
.modal-enter-from > div:last-child > div { opacity: 0; transform: scale(0.95) translateY(10px); }
.modal-leave-to         { opacity: 0; }
.modal-leave-to > div:last-child > div { opacity: 0; transform: scale(0.95) translateY(10px); }
</style>
