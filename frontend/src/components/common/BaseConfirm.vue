<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :title="title" size="sm">
    <p class="text-sm text-gray-600">{{ message }}</p>
    <template #footer>
      <button class="btn-secondary btn-sm" @click="$emit('update:modelValue', false)">Batal</button>
      <button :class="['btn btn-sm', dangerMode ? 'btn-danger' : 'btn-primary']" :disabled="loading" @click="$emit('confirm')">
        <span v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        {{ confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
defineProps({
  modelValue:   Boolean,
  title:        { type: String, default: 'Konfirmasi' },
  message:      { type: String, default: 'Apakah Anda yakin?' },
  confirmLabel: { type: String, default: 'Ya, Lanjutkan' },
  dangerMode:   { type: Boolean, default: false },
  loading:      { type: Boolean, default: false },
});
defineEmits(['update:modelValue', 'confirm']);
</script>
