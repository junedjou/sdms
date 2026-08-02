<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="onOverlayClick">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        <!-- Panel -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative z-10 bg-white rounded-xl shadow-xl w-full transition-all"
            :class="[sizeClass]"
            role="dialog"
            :aria-label="title"
          >
            <!-- Header -->
            <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <slot name="header">
                <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
              </slot>
              <button
                v-if="closable"
                @click="$emit('update:modelValue', false)"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Tutup"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
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
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
