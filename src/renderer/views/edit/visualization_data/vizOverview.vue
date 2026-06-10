<template>
  <v-container fluid class="pa-2 h-100 d-flex flex-column" style="height: 90vh;">
    
    <v-row dense class="flex-grow-0">
        <v-col cols="12" md="3" v-for="stat in stats" :key="stat.title">
            <v-card class="pa-4" :class="stat.color">
                <div class="text-caption text-uppercase">{{ stat.title }}</div>
                <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
            </v-card>
        </v-col>
    </v-row>

    <v-row class="flex-grow-1 mt-1" dense>
        <v-col cols="12" md="5" class="d-flex flex-column">
            <v-card class="flex-grow-1 d-flex flex-column">
                <div class="text-subtitle-1 font-weight-bold pa-2 bg-secondary">Station List</div>
                <v-divider></v-divider>
                <div class="flex-grow-1" v-if="table.headers.length > 0">
                    <grid-view 
                        v-if="table.headers && table.headers.length > 0"
                        ref="grid" 
                        :api-url="table.apiUrl" 
                        :headers="table.headers" 
                        :auto-height="false" 
                        :noActionBar="true"
                        :hide-delete="true"
                        :hideSummary="true"
                        @change="onGridDataLoaded"
                        @row-clicked="handleRowClick"
                        :selectable="true"
                        hide-create
                    />
                </div>
            </v-card>
        </v-col>

        <v-col cols="12" md="7" class="d-flex flex-column">
            <v-card class="flex-grow-1 d-flex flex-column">
                <div class="text-subtitle-1 font-weight-bold pa-2 bg-secondary">Spatial Distribution</div>
                <v-divider></v-divider>
                <div class="flex-grow-1 position-relative" style="min-height: 300px;">
                    <vizMapOverview :all-stations="allStations" :highlighted-station="selectedStations[0] || null"/>
                </div>
            </v-card>
        </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useHelpers } from '@/helpers';
import { useRoute } from 'vue-router';
import vizMapOverview from '@/components/vizMapOverview.vue';
import GridView from '@/components/GridView.vue'; // Pastikan import GridView Anda benar


const { api, constants, currentProject, errors, formatters, runProcess, utilities } = useHelpers();
const route = useRoute();
const grid = ref<any>(null);


    const getSelectedData = () => {
    if (grid.value) {
        const itemsYangTampil = grid.value.items; 
        console.log("Data yang sedang tampil di Grid:", itemsYangTampil);
    }
};
const selectedStations = ref<any[]>([]);
const ambilDataTabel = () => {
    if (grid.value && grid.value.items) {
        // Ini data yang sedang tampil di tabel (sudah terfilter & ter-pagination)
        const dataSaatIni = grid.value.items;
        console.log("Data yang diambil langsung:", dataSaatIni);
        
        // Kirim data ini ke peta
        selectedStations.value = dataSaatIni; 
    }
};
// 1. Definisikan state data
const data = reactive({
    total: 0,
    validCount: 0,
    incompleteCount: 0,
    mismatchCount: 0,
    items: [] // Pastikan ini juga ada untuk GridView
});
const allStations = ref<any[]>([]);



watch(() => grid.value, (newGrid) => {
    if (newGrid) {
        // Ambil data setiap kali tabel selesai load
        // Anda bisa memanggil getSelectedData() di sini
    }
}, { immediate: true });
// 2. Definisikan stats untuk kartu (menggunakan computed agar otomatis update)
const stats = computed(() => [
    { title: 'Total Stations', value: data.total, color: 'bg-primary-lighten-5' },
    { title: 'Valid Stations', value: data.validCount, color: 'bg-success-lighten-5' },
    { title: 'Incomplete', value: data.incompleteCount, color: 'bg-warning-lighten-5' },
    { title: 'Mismatch', value: data.mismatchCount, color: 'bg-error-lighten-5' }
]);
const handleRowClick = (item: any) => {
  
    console.log("Stasiun terpilih:", item);
    
    // Kita buat array baru berisi item yang diklik agar Peta merespons
    selectedStations.value = [item];
    // Sekarang Anda punya fallback nilainya di sini!
};
// 3. Konfigurasi Tabel
const table = reactive({
    apiUrl: 'vizdata/stations',
    headers: [
        { key: 'station_name', label: 'Station Name', type:'string'},
        // { key: 'lat', label: 'Wgn', type: 'object', objectRoutePath: '/edit/climate/wgn/edit/' },
        { key: 'lat', label: 'Latitude', type: 'float', class:'text-right' },
        { key: 'long', label: 'Longitude', type: 'float', class: 'text-right' },
        { key: 'elev', label: 'Elevation', type: 'float', class: 'text-right' }
    ] as any
});


const onGridDataLoaded = (payload: any) => {
if (payload.selected) {
        selectedStations.value = payload.selected;
    }
};



const fetchStats = async () => {
    try {
        // Panggil API langsung
        const response = await api.get('vizdata/stations', currentProject.getApiHeader());
        
        // Ambil objek 'stats' yang sudah dihitung Backend (25 data utuh)
        if (response.data && response.data.stats) {
            allStations.value = response.data.items || [];
            const s = response.data.stats;
            data.total = s.total;
            data.validCount = s.valid;
            data.incompleteCount = s.incomplete;
            data.mismatchCount = s.mismatch;
            console.log("Statistik diupdate langsung dari Backend:", s);
        }
    } catch (err) {
        console.error("Gagal mengambil statistik:", err);
    }
};

onMounted(async () => {
    fetchStats();
});



</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
/* Sekarang dia akan mengambil 100% dari v-main */
  overflow: hidden;
}

.h-100 { height: 100% !important; }



</style>