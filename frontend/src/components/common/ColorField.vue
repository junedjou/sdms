<template>
  <div class="space-y-1.5">
    <label class="form-label">{{ label }}</label>
    <div class="flex items-center gap-2.5">
      <!-- Color picker native -->
      <label class="relative cursor-pointer flex-shrink-0">
        <input
          type="color"
          :value="hexValue"
          @input="onColorPick"
          class="sr-only"
        />
        <div
          class="w-9 h-9 rounded-xl border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
          :style="{ background: modelValue || '#000000', borderColor: 'rgba(0,0,0,0.1)' }"
          :title="'Klik untuk pilih warna'"
        />
      </label>

      <!-- Input teks hex/rgba -->
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        type="text"
        class="form-input text-xs font-mono flex-1"
        :placeholder="isRgba ? 'rgba(255,255,255,0.7)' : '#000000'"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '#000000' },
  label:      { type: String, default: 'Warna' },
  isRgba:     { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

// Konversi value ke hex untuk color picker native (hanya support hex)
const hexValue = computed(() => {
  const v = props.modelValue || '#000000';
  // Kalau sudah hex, langsung return
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  // Kalau rgba, ambil r,g,b dan konversi ke hex
  const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return '#' + [m[1], m[2], m[3]]
      .map(n => parseInt(n).toString(16).padStart(2, '0'))
      .join('');
  }
  return '#000000';
});

const onColorPick = (e) => {
  emit('update:modelValue', e.target.value);
};
</script>
