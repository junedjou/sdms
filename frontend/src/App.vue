<template>
  <RouterView />
  <!-- Banner install PWA — muncul otomatis di Android saat syarat terpenuhi -->
  <InstallPrompt />
</template>

<script setup>
import { RouterView } from 'vue-router';
import InstallPrompt from '@/components/common/InstallPrompt.vue';
</script>
