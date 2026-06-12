<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref, shallowRef, nextTick,watch } from 'vue';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import 'leaflet-draw';
    import 'leaflet-draw/dist/leaflet.draw.css';


    const mapContainer = ref<HTMLElement | null>(null);
    const map = shallowRef<L.Map | null>(null);

    const emit = defineEmits(['map-ready']);

    onMounted(async () => {
        await nextTick();
        if (mapContainer.value) {
            const mapInstance = L.map(mapContainer.value).setView([-0.95, 100.35], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapInstance);

        map.value = mapInstance;
        emit('map-ready', mapInstance);
        }
    });


    onUnmounted(() => {
        map.value?.remove();
        map.value = null;
    });

</script>


<style scoped>
    .map-container {
    width: 100%;
    height: 100%; 
    }
</style>