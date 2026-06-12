<template>
    <v-container fluid class="pa-2 h-100 d-flex flex-column" style="height: 90vh;">
        <v-row dense class="flex-grow-0">
            <v-col cols="12" md="3" v-for="stat in dashboardCards" :key="stat.title">
                <v-card class="pa-4" :class="stat.color">
                    <div class="d-flex justify-space-between align-center">
                        <div>
                            <div class="text-caption text-uppercase font-weight-bold">{{ stat.title }}</div>
                            <div class="text-h4 font-weight-bold text-no-wrap mt-1">{{ stat.value }}</div>
                        </div>
                        <v-icon size="48" style="opacity: 0.3;">
                            {{ stat.icon }}
                        </v-icon>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="flex-grow-1 mt-1" dense style="min-height: 0; height: 100%;">
            
            <v-col cols="12" md="5" class="d-flex flex-column" style="min-height: 0; height: 100%;">
                <v-card class="d-flex flex-column h-100" style="min-height: 0;">
                    <div class="text-subtitle-1 font-weight-bold pa-2 flex-shrink-0">
                        <font-awesome-icon :icon="['fas', 'list-check']" class="mr-2" />Station List
                    </div>
                    <v-divider class="flex-shrink-0"></v-divider>

                    <div class="flex-grow-1" style="position: relative; min-height: 0;">
                        <grid-view 
                            v-if="table.headers && table.headers.length > 0"
                            ref="grid" 
                            :api-url="table.apiUrl" 
                            :headers="table.headers" 
                            :itemsPerPage="20"
                            :inCard="true"
                            :hide-delete="true"
                            :hideEdit="true"
                            :hideSummary="true"
                            :selectable="true"
                            :inline-editing="true"
                            hide-create
                            @change="onGridDataLoaded"
                            @row-clicked="handleRowClick"
                            @cell-edited="handleStationEdit"
                        >
                            <template #actions>
                                <v-btn 
                                    v-if="hasUnsavedChanges" 
                                    variant="flat" 
                                    color="success" 
                                    class="mr-2" 
                                    :loading="isSaving"
                                    @click="saveAllChanges"
                                >
                                    Save
                                </v-btn>
                                <v-btn 
                                    v-if="selectedStations.length > 0" 
                                    variant="flat" 
                                    color="primary" 
                                    class="mr-2" 
                                    @click="showWeatherDetail"
                                >
                                    Show Data
                                </v-btn>
                            </template>
                        </grid-view>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" md="7" class="d-flex flex-column" style="min-height: 0; height: 100%;">
                <v-card class="flex-grow-1 d-flex flex-column h-100" >
                    <div class="text-subtitle-1 font-weight-bold pa-2 flex-shrink-0">
                        <font-awesome-icon :icon="['fas', 'map-location']" class="mr-2" />Spatial Distribution
                    </div>
                    <v-divider class="flex-shrink-0"></v-divider>
                    
                    <div class="flex-grow-1" style="position: relative; overflow: hidden;">
                        <vizMapOverview 
                            style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;"
                            :all-stations="allStations" 
                            :highlighted-station="selectedStations[0] || null"
                            @map-ready="onMapReady"
                            @station-clicked="handleMapClick"
                        />
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
   
    <StationDashboardDialog 
        v-if="selectedStations.length > 0"
        v-model="showDetailDialog"
        :station-id="selectedStations[0].id"
        :station-name="selectedStations[0].station_name"
        :weather-data="weatherData"
        :station-stats="stationStats"
    />
</template>

<script setup lang="ts">
// =====================================================================
// 1. IMPORTS & INTERFACES
// =====================================================================
import { ref, reactive, computed, onMounted, watch, nextTick, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';

import { useHelpers } from '@/helpers';
import vizMapOverview from '@/components/vizMapOverview.vue';
import GridView from '@/components/GridView.vue'; 
import StationDashboardDialog from '@/components/StationDashboardDialog.vue';

interface WeatherRecord {
    id: number;
    station_name: string;
    date: string;
    pcp: number;
    tmp_max: number;
    tmp_min: number;
    slr: number;   
    wnd: number;   
    hmd: number;   
    pet: number | null;
}

// =====================================================================
// 2. COMPOSABLES & PLUGINS
// =====================================================================
const { api, currentProject, errors } = useHelpers(); // Hanya memanggil yang dipakai di file ini
const route = useRoute();

// =====================================================================
// 3. REACTIVE STATE (REFS & REACTIVES)
// =====================================================================

// --- UI & Komponen Refs ---
const grid = ref<any>(null);
const showDetailDialog = ref(false);

// --- Data Aplikasi ---
const allStations = ref<any[]>([]);
const selectedStations = ref<any[]>([]);
const weatherData = ref<WeatherRecord[]>([]);

// Data Global Statistik Stasiun (Dari Backend)
const data = reactive({
    total: 0,
    validCount: 0,
    incompleteCount: 0,
    mismatchCount: 0,
    items: [] 
});

// Statistik Stasiun Terpilih
const stationStats = reactive({
    station_name: '', // Diperbaiki dari typo stasiun_name
    count: 0,
    minDate: '-',
    maxDate: '-'
});

// Konfigurasi Tabel GridView
const table = reactive({
    apiUrl: 'vizdata/stations',
    headers: [
        { key: 'id', label: 'ID', type: 'number', class: 'text-center' },
        { key: 'station_name', label: 'Station Name', type:'string'},
        { key: 'lat', label: 'Latitude', type: 'number', class:'text-right' },
        { key: 'long', label: 'Longitude', type: 'number', class: 'text-right' },
        { key: 'elev', label: 'Elevation', type: 'number', class: 'text-right' }
    ] as any
});

// --- State Editing & Saving ---
const unsavedChanges = ref<Record<number, any>>({});
const isSaving = ref(false);

// --- State Peta (Leaflet) ---
const leafletMap = shallowRef<L.Map | null>(null);
const markerLayer = shallowRef<L.LayerGroup | null>(null);

// =====================================================================
// 4. COMPUTED PROPERTIES
// =====================================================================

/**
 * Mengecek apakah ada perubahan data yang belum disimpan.
 */
const hasUnsavedChanges = computed(() => Object.keys(unsavedChanges.value).length > 0);

/**
 * Menampilkan data kartu statistik. 
 * Jika ada stasiun terpilih, tampilkan stat spesifik stasiun.
 * Jika tidak ada stasiun terpilih, tampilkan stat global.
 */
const isProjectReady = computed(() => {
    // Pantau langsung state reaktif 'projectDb' dari currentProject
    // Jika ada isinya, berarti project sudah SIAP di-load
    if (currentProject && currentProject.projectDb) {
        return true;
    }
    return false;
});

const dashboardCards = computed(() => {
    const station = selectedStations.value[0];
    const stationName = station?.station_name;
    const count = stationStats.count;
    const minD = stationStats.minDate;
    const maxD = stationStats.maxDate;

    // Mode Spesifik: Jika ada stasiun yang diklik
    if (stationName) {
        return [
            { title: 'Nama Station', value: stationName, color: 'bg-info-lighten-5', icon: 'fas fa-map-marker-alt' },
            { title: 'Total Data Record', value: count, color: 'bg-info-lighten-5', icon: 'fas fa-database' },
            { title: 'Periode Mulai', value: minD, color: 'bg-primary-lighten-5', icon: 'fas fa-calendar-alt' },
            { title: 'Periode Selesai', value: maxD, color: 'bg-primary-lighten-5', icon: 'fas fa-calendar-check' }
        ];
    }

    // Mode Global: Default statistik awal
    return [
        { title: 'Total Stations', value: data.total, color: 'bg-primary-lighten-5', icon: 'fas fa-tower-broadcast' },
        { title: 'Valid Stations', value: data.validCount, color: 'bg-success-lighten-5', icon: 'fas fa-check-circle' },
        { title: 'Incomplete', value: data.incompleteCount, color: 'bg-warning-lighten-5', icon: 'fas fa-exclamation-triangle' },
        { title: 'Mismatch', value: data.mismatchCount, color: 'bg-error-lighten-5', icon: 'fas fa-times-circle' }
    ];
});

// =====================================================================
// 5. METHODS / FUNCTIONS
// =====================================================================

// ---------------------------
// A. Fungsi Peta (Leaflet)
// ---------------------------

/**
 * Inisialisasi instance peta leaflet dan membuat layer group untuk marker.
 */
const onMapReady = (mapInstance: L.Map) => {
    leafletMap.value = mapInstance;
    markerLayer.value = L.layerGroup().addTo(mapInstance);
    drawStationsOnMap();
};

/**
 * Menggambar ulang seluruh marker stasiun di peta dan memberikan highlight pada stasiun aktif.
 */
const drawStationsOnMap = () => {
    if (!leafletMap.value || !markerLayer.value) return;

    const map = leafletMap.value;
    const layer = markerLayer.value;

    layer.clearLayers();

    // 1. Gambar semua stasiun sebagai marker standar
    allStations.value.forEach((station: any) => {
        const marker = L.marker([station.lat, station.long])
            .bindPopup(station.station_name);

        marker.on('click', () => {
            handleMapClick(station);
        });

        layer.addLayer(marker);
    });

    // 2. Berikan highlight (lingkaran merah) pada stasiun yang sedang dipilih
    const highlight = selectedStations.value[0];
    if (highlight && highlight.lat) {
        const circle = L.circleMarker([highlight.lat, highlight.long], {
            color: 'red',
            radius: 8
        }).bindPopup(`<b>${highlight.station_name}</b>`).openPopup();
        
        layer.addLayer(circle);
        map.flyTo([highlight.lat, highlight.long], 12);
    }
};

/**
 * Menangani logika saat marker di peta diklik. 
 * Memicu seleksi baris di tabel dan sinkronisasi pagination.
 */
const handleMapClick = async (station: any) => {
    handleRowClick(station);
    await nextTick();

    if (grid.value) {
        // Set baris aktif di GridView
        if (typeof grid.value.selectRow === 'function') {
            grid.value.selectRow(station.id); 
        }

        // --- Logika Sinkronisasi Pagination Tabel ---
        const currentPageItems = grid.value.data?.items || [];
        const isItemOnCurrentPage = currentPageItems.some((item: any) => item.id === station.id);

        if (!isItemOnCurrentPage && allStations.value.length > 0) {
            const itemsPerPage = grid.value.table?.itemsPerPage || 10; 
            const stationIndex = allStations.value.findIndex((s: any) => s.id === station.id);
            
            if (stationIndex !== -1) {
                const targetPage = Math.floor(stationIndex / itemsPerPage) + 1;
                
                if (grid.value.table && grid.value.table.page !== targetPage) {
                    grid.value.table.page = targetPage;
                    if (typeof grid.value.get === 'function') {
                        await grid.value.get(false); 
                    }
                }
            }
        }

        // Scroll otomatis ke baris tabel dan berikan efek animasi
        setTimeout(() => {
            const activeRow = document.querySelector('.row-active');
            if (activeRow) {
                activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                activeRow.animate([
                    { backgroundColor: 'rgba(var(--v-theme-primary), 0.3)' },
                    { backgroundColor: 'transparent' }
                ], { duration: 1000 });
            }
        }, 500);
    }
};

// ---------------------------
// B. Fungsi Tabel (Grid)
// ---------------------------

/**
 * Menerima pembaruan seleksi stasiun dari komponen GridView
 */
const onGridDataLoaded = (payload: any) => {
    if (payload.selected) {
        selectedStations.value = payload.selected;
    }
};

/**
 * Menangani logika saat baris tabel stasiun diklik.
 * Akan menarik data iklim/cuaca spesifik untuk stasiun tersebut.
 */
const handleRowClick = async (item: any) => {
    selectedStations.value = [...[item]];
    
    try {
        const response = await api.get(`/vizdata/weather-data/station/${item.id}`, {
            ...currentProject.getApiHeader()
        });

        const items = response.data.items;
        const stats = response.data.aggregates;
        weatherData.value = items;

        // Update Statistik Kartu Stasiun Terpilih
        if (items.length > 0) {
            const dates = items.map((i: any) => new Date(i.date)).sort((a: any, b: any) => a.getTime() - b.getTime());
            stationStats.count = items.length;
            stationStats.minDate = dates[0].toLocaleDateString();
            stationStats.maxDate = dates[dates.length - 1].toLocaleDateString();
        } else {
            stationStats.count = 0;
            stationStats.minDate = '-';
            stationStats.maxDate = '-';
        }

        (stationStats as any).aggregates = stats;
        
    } catch (error) {
        errors.logError(error, 'Gagal mengambil data cuaca.');
    }
};

/**
 * Mencatat sementara perubahan nilai sel di dalam tabel (inline-editing)
 */
const handleStationEdit = (payload: { id: any, key: string, value: any, item: any }) => {
    if (!unsavedChanges.value[payload.id]) {
        unsavedChanges.value[payload.id] = {};
    }
    unsavedChanges.value[payload.id][payload.key] = payload.value;
};

/**
 * Menyimpan seluruh perubahan yang belum tersimpan di tabel ke Database.
 */
const saveAllChanges = async () => {
    isSaving.value = true;
    try {
        const updatePromises = Object.entries(unsavedChanges.value).map(([stationId, changes]) => {
            return api.put(`/vizdata/stations/${stationId}`, changes, currentProject.getApiHeader());
        });

        await Promise.all(updatePromises);
        
        unsavedChanges.value = {}; // Kosongkan state unsaved
        await fetchStats();        // Refresh statistik global & peta
        
    } catch (error) {
        errors.logError(error, 'Gagal menyimpan beberapa perubahan ke database.');
    } finally {
        isSaving.value = false;
    }
};

// ---------------------------
// C. Fungsi Data Global & UI
// ---------------------------

/**
 * Membuka dialog detail cuaca jika stasiun telah terpilih.
 */
const showWeatherDetail = () => {
    if (selectedStations.value.length > 0) {
        showDetailDialog.value = true;
    } else {
        alert("Silakan klik salah satu stasiun terlebih dahulu.");
    }
};

/**
 * Memuat data statistik stasiun dari backend (untuk mode Global)
 */
const fetchStats = async () => {
    try {
        const response = await api.get('vizdata/stations', currentProject.getApiHeader());
        
        if (response.data && response.data.stats) {
            allStations.value = response.data.items || [];
            const s = response.data.stats;
            
            data.total = s.total;
            data.validCount = s.valid;
            data.incompleteCount = s.incomplete;
            data.mismatchCount = s.mismatch;
        }
    } catch (err) {
        console.error("Gagal mengambil statistik:", err);
    }
};

// =====================================================================
// 6. WATCHERS
// =====================================================================

// Memperbarui peta saat data stasiun atau pilihan stasiun berubah
watch(() => [allStations.value, selectedStations.value], () => {
    drawStationsOnMap();
}, { deep: true });

// Memperbarui highlight pada GridView jika stasiun dipilih via eksternal (Peta)
watch(() => selectedStations.value, (newSelected) => {
    if (newSelected.length > 0 && grid.value) {
        const stationId = newSelected[0].id;
        if (typeof grid.value.selectRow === 'function') {
            grid.value.selectRow(stationId);
        }
        grid.value.activeRowId = stationId; 
    }
}, { deep: true });

// Lifecycle untuk grid load awal
watch(() => grid.value, (newGrid) => {
    if (newGrid) {
        // Trigger aksi awal ketika Grid telah dirender di DOM (jika perlu)
    }
}, { immediate: true });

// =====================================================================
// 7. LIFECYCLE HOOKS
// =====================================================================
watch(() => isProjectReady.value, (ready) => {
    if (ready) {
        fetchStats();
    }
}, { immediate: true });

</script>

<style scoped>
:deep(.v-table) {
    display: flex;
    flex-direction: column;
}

:deep(.v-table__wrapper) {
    flex: 1 1 auto;
    overflow-y: auto;
}
</style>