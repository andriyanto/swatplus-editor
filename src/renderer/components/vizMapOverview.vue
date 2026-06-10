<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, nextTick,watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';


interface Station {
    id: number;
    station_name: string;
    lat: number;
    long: number;
    elev: number;
}

const mapContainer = ref<HTMLElement | null>(null);
const map = shallowRef<L.Map | null>(null);
const props = defineProps<{
    allStations: Station[],
    highlightedStation: Station | null
}>();

watch(() => props.highlightedStation, (newHighlight) => {
    if (newHighlight) {
        // Logika untuk menyorot stasiun yang diklik
        console.log("Peta sekarang menyorot lokasi:", newHighlight.lat, newHighlight.long);
        
        // Contoh: map.flyTo([newHighlight.lat, newHighlight.long]);
        // Contoh: drawMarker(newHighlight, 'highlight');
    }
}, { deep: true });

// Opsional: Tambahkan watch untuk allStations jika perlu menggambar semua marker
watch(() => props.allStations, (newAll) => {
    if (newAll && newAll.length > 0) {
        console.log("Peta menggambar total stasiun:", newAll.length);
        // Contoh: newAll.forEach(s => drawMarker(s, 'default'));
    }
}, { deep: true });


onMounted(async () => {
  await nextTick();
  if (mapContainer.value) {
    const mapInstance = L.map(mapContainer.value).setView([-0.95, 100.35], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    map.value = mapInstance;
  }
});




onUnmounted(() => {
  map.value?.remove();
  map.value = null;
});




watch(
    () => [props.allStations, props.highlightedStation] as const, 
    ([newAll, newHighlight]) => {
        const mapInstance = map.value;
        if (!mapInstance) return; 

        // 1. Bersihkan marker lama
        mapInstance.eachLayer((layer: any) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                mapInstance.removeLayer(layer);
            }
        });

        // 2. Gambar semua marker (Pastikan newAll adalah array)
        if (Array.isArray(newAll)) {
            newAll.forEach((station: Station) => {
                L.marker([station.lat, station.long])
                    .addTo(mapInstance)
                    .bindPopup(station.station_name);
            });
        }

        // 3. Sorot marker yang di-highlight
        if (newHighlight && 'lat' in newHighlight) {
            L.circleMarker([newHighlight.lat, newHighlight.long], {
                color: 'red',
                radius: 8
            }).addTo(mapInstance).bindPopup(`<b>${newHighlight.station_name}</b>`).openPopup();
            
            mapInstance.flyTo([newHighlight.lat, newHighlight.long], 12);
        }
    }, 
    { deep: true }
);

</script>




<style scoped>
.map-container {
  width: 100%;
  height: 100%; /* Harus 100% agar mengikuti .map-wrapper */
}
</style>