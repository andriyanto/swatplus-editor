<!-- src/renderer/views/visualization_data/ClimatePlaceholder.vue -->

<template>
  <div class="pa-4">
    <h2>{{ pageTitle }}</h2>
    <p>Halaman ini sedang dalam tahap pengembangan ({{ route.path }}).</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Mengambil nama route dan mengubahnya menjadi lebih enak dibaca
const pageTitle = computed(() => {
  const name = route.name as string;
  // Contoh: ClimateOverview -> Climate Overview
  return name.replace(/([A-Z])/g, ' $1').trim();
});
</script>