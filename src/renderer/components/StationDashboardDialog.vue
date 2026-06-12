<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" fullscreen transition="dialog-bottom-transition">
        <v-card :theme="isDarkMode ? 'dark' : 'light'" elevation="0">
            
            <v-toolbar color="primary" density="compact" class="flex-shrink-0 position-relative">
                <v-btn icon="fas fa-times" @click="$emit('update:modelValue', false)"></v-btn>
                <v-toolbar-title>{{ displayTitle }}</v-toolbar-title>
                <v-progress-linear v-if="loadingChart" indeterminate absolute bottom color="white"></v-progress-linear>
            </v-toolbar>

            <v-card-text class="pa-2 d-flex flex-grow-1" style="min-height: 0;">        
                <v-col cols="12" md="5" class="d-flex flex-column h-100 pa-0 pr-1" style="min-height: 0;">
                    
                    <v-card class="pa-0 mb-2 flex-shrink-0" variant="flat">
                        <v-row dense class="flex-shrink-0 mb-2">
                            <v-col cols="6" sm="4" md="4" lg="2" v-for="item in displayStats" :key="item.label">
                                <v-card class="pa-2 d-flex flex-column align-center" variant="outlined" elevation="0">
                                    
                                    <v-icon :icon="item.icon" :color="item.color" size="large" class="mb-1"></v-icon>
                                    <div class="text-caption font-weight-bold mb-2">{{ item.label }}</div>
                                    
                                    <div class="w-100 text-caption" style="line-height: 1.2;">
                                        <div class="d-flex justify-space-between mb-1">
                                            <span class="text-grey-darken-1">Avg:</span> 
                                            <strong>{{ item.avg }} <small>{{ item.unit }}</small></strong>
                                        </div>
                                        <div class="d-flex justify-space-between mb-1">
                                            <span class="text-grey-darken-1">Max:</span> 
                                            <strong>{{ item.max }} <small>{{ item.unit }}</small></strong>
                                        </div>
                                        <div class="d-flex justify-space-between">
                                            <span class="text-grey-darken-1">Min:</span> 
                                            <strong>{{ item.min }} <small>{{ item.unit }}</small></strong>
                                        </div>
                                        <div class="d-flex justify-space-between">
                                            <span class="text-grey-darken-1">std:</span> 
                                            <strong>{{ item.std }} </strong>
                                        </div>
                                        <div class="d-flex justify-space-between">
                                            <span class="text-grey-darken-1">cv:</span> 
                                            <strong>{{ item.cv }} </strong>
                                        </div>
                                        <div class="d-flex justify-space-between">
                                            <span class="text-grey-darken-1">skew:</span> 
                                            <strong>{{ item.skew }} </strong>
                                        </div>
                                    </div>

                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="flex-grow-1 d-flex flex-column" variant="flat">
                        <div class="text-subtitle-1 font-weight-bold pa-2 flex-shrink-0 bg-primary">Daily Data</div>
                        <v-divider class="my-2"></v-divider>
                        <div class="flex-grow-1" style="position: relative; min-height: 0;">
                            <grid-view v-if="modelValue && stationId" ref="gridRef" :key="stationId" :api-url="apiUrl" :headers="table.headers" :enableDateFilter="true" :hideFilter="false" :inCard="true" :hideEdit="true" :hideDelete="true" :hideCreate="true" :itemsPerPage="15" @change="handleSync" />
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" md="7" class="d-flex flex-column h-100 pa-0 pl-1" style="min-height: 0;">
                    <v-card class="d-flex flex-column h-100" variant="flat">
                        <div class="text-subtitle-1 font-weight-bold pa-2 flex-shrink-0 bg-primary text-white">
                            Trends
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <div class="flex-grow-1 overflow-y-auto pa-2">
                            <v-card class="mb-3 pa-2" variant="outlined">
                                <div class="d-flex align-center mb-1">
                                    <v-icon icon="fas fa-cloud-rain" size="small" color="#4CAF50" class="mr-2"></v-icon>
                                    <span class="text-subtitle-2 font-weight-bold">Curah Hujan Harian</span>
                                </div>
                                <WeatherChart :data="syncChartData" :loading="loadingChart" field="pcp" label="PCP" chartTitle="" color="#4CAF50" unit="mm/hari" />
                            </v-card>

                            <v-card class="mb-3 pa-2" variant="outlined">
                                <div class="d-flex align-center mb-1">
                                    <v-icon icon="fas fa-temperature-low" size="small" color="#4CAF50" class="mr-2"></v-icon>
                                    <span class="text-subtitle-2 font-weight-bold">Temperature Maksimum dan Minimum</span>
                                </div>
                                <WeatherChart :data="syncChartData" :loading="loadingChart" :field="['tmp_max', 'tmp_min']" :label="['Max', 'Min']" :color="['#FF5252', '#2196F3']" chartTitle="Suhu Harian" unit="Temperature °C" />
                            </v-card>

                            <v-card class="mb-3 pa-2" variant="outlined">
                                <div class="d-flex align-center mb-1">
                                    <v-icon icon="fas fa-sun" size="small" color="#FFC107" class="mr-2"></v-icon>
                                    <span class="text-subtitle-2 font-weight-bold">Solar Radiation</span>
                                </div>
                                <WeatherChart :data="syncChartData" :loading="loadingChart" field="slr" label="SLR" chartTitle="Solar Radiation" color="#FFC107" unit="Mj/m²/hari" />
                            </v-card>
                            <v-card class="mb-3 pa-2" variant="outlined">
                                <div class="d-flex align-center mb-1">
                                    <v-icon icon="fas fa-tint" size="small" color="#03A9F4" class="mr-2"></v-icon>
                                    <span class="text-subtitle-2 font-weight-bold">Relative Humidity</span>
                                </div>
                                <WeatherChart :data="syncChartData"  :loading="loadingChart" field="hmd" label="HMD" chartTitle="Relative Humidity" color="#FFC107" unit="" />
                            </v-card>
                            <v-card class="mb-3 pa-2" variant="outlined">
                                <div class="d-flex align-center mb-1">
                                    <v-icon icon="fas fa-wind" size="small" color="#03A9F4" class="mr-2"></v-icon>
                                    <span class="text-subtitle-2 font-weight-bold">Wind Speed</span>
                                </div>
                                <WeatherChart :data="syncChartData" :loading="loadingChart" field="wnd" label="WND" chartTitle="Wind Speed" color="#FFC107" unit="m/s" />
                            </v-card>
                        </div>
                    </v-card>
                </v-col>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>


<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue';
import GridView from '@/components/GridView.vue';
import WeatherChart from '@/components/WeatherChart.vue';
import { useTheme } from 'vuetify';
import { useHelpers } from '@/helpers';




const { api, currentProject } = useHelpers();

const theme = useTheme();
const isDarkMode = computed(() => theme.global.current.value.dark);
const loadingChart = ref(false);

const gridRef = ref<any>(null);

const props = defineProps<{
    modelValue: boolean,
    stationId: any,
    stationName: string,
    stationStats: any,
    weatherData: any[]
}>();

// computed URL agar otomatis terupdate saat stationId berubah
const apiUrl = computed(() => `vizdata/weather-data/station/${props.stationId}`);

const localStats = ref<any>(props.stationStats);
const syncChartData = ref<any[]>([]);

const handleSync = async (payload: any) => {
    if (payload.aggregates) {
        localStats.value = { aggregates: payload.aggregates };
    }
    
    // AKTIFKAN LOADING DI SINI

        await fetchFilteredChartData();

};

const fetchFilteredChartData = async () => {
    if (!props.stationId) return;
    loadingChart.value = true;

    syncChartData.value = [];

    try {
        // Ambil filter dari state gridView (lewat ref gridRef)
        const filter = gridRef.value?.table.filter || '';
        const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
        
        const response = await api.get(`/vizdata/weather-data/station/${props.stationId}/filtered-chart${query}`, {
            ...currentProject.getApiHeader()
        });
        
        // Data grafik sekarang sinkron dengan filter tabel
        syncChartData.value = response.data;
    } catch (e) {
        console.error("Gagal sinkron grafik:", e);
    } finally {
setTimeout(() => {
            loadingChart.value = false;
        }, 500);
    }
};


// Struktur headers dikembalikan ke gaya GridView (pakai label & class)
const displayStats = computed(() => {
    const agg = localStats.value?.aggregates;
    console.log("Data Agregat yang diterima:", agg);
    return [
        { 
            label: 'PCP', 
            avg: agg?.pcp?.avg?.toFixed(1) || '0', 
            max: agg?.pcp?.max?.toFixed(1) || '0',
            min: agg?.pcp?.min?.toFixed(1) || '0',
            std: agg?.pcp?.std?.toFixed(3) || '0',
            cv: agg?.pcp?.cv?.toFixed(3) || '0',
            skew: agg?.pcp?.skew?.toFixed(3) || '0',
            unit: 'mm', 
            icon: 'fas fa-cloud-rain', 
            color: '#4CAF50' 
        },
        { 
            label: 'T-Max', 
            avg: agg?.tmp_max?.avg?.toFixed(1) || '0', 
            max: agg?.tmp_max?.max?.toFixed(1) || '0',
            min: agg?.tmp_max?.min?.toFixed(1) || '0',
            std: agg?.tmp_max?.std?.toFixed(3) || '0',
            cv: agg?.tmp_max?.cv?.toFixed(3) || '0',
            skew: agg?.tmp_max?.skew?.toFixed(3) || '0',
            unit: '°C', 
            icon: 'fas fa-temperature-high', 
            color: '#FF5252' 
        },
        { 
            label: 'T-Min', 
            avg: agg?.tmp_min?.avg?.toFixed(1) || '0', 
            max: agg?.tmp_min?.max?.toFixed(1) || '0',
            min: agg?.tmp_min?.min?.toFixed(1) || '0',
            std: agg?.tmp_min?.std?.toFixed(3) || '0',
            cv: agg?.tmp_min?.cv?.toFixed(3) || '0',
            skew: agg?.tmp_min?.skew?.toFixed(3) || '0',
            unit: '°C', 
            icon: 'fas fa-temperature-low', 
            color: '#2196F3' 
        },
        { 
            label: 'HMD', 
            avg: agg?.hmd?.avg?.toFixed(1) || '0', 
            max: agg?.hmd?.max?.toFixed(1) || '0',
            min: agg?.hmd?.min?.toFixed(1) || '0',
            std: agg?.hmd?.std?.toFixed(3) || '0',
            cv: agg?.hmd?.cv?.toFixed(3) || '0',
            skew: agg?.hmd?.skew?.toFixed(3) || '0',
            unit: '%', 
            icon: 'fas fa-tint', 
            color: '#03A9F4' 
        },
        { 
            label: 'SLR', 
            avg: agg?.slr?.avg?.toFixed(1) || '0', 
            max: agg?.slr?.max?.toFixed(1) || '0',
            min: agg?.slr?.min?.toFixed(1) || '0',
            std: agg?.slr?.std?.toFixed(3) || '0',
            cv: agg?.slr?.cv?.toFixed(3) || '0',
            skew: agg?.slr?.skew?.toFixed(3) || '0',
            unit: 'Mj', 
            icon: 'fas fa-sun', 
            color: '#FFC107' 
        },
        { 
            label: 'WND', 
            avg: agg?.wnd?.avg?.toFixed(1) || '0', 
            max: agg?.wnd?.max?.toFixed(1) || '0',
            min: agg?.wnd?.min?.toFixed(1) || '0',
            std: agg?.wnd?.std?.toFixed(3) || '0',
            cv: agg?.wnd?.cv?.toFixed(3) || '0',
            skew: agg?.wnd?.skew?.toFixed(3) || '0',
            unit: 'm/s', 
            icon: 'fas fa-wind', 
            color: '#9E9E9E' 
        },
    ];
});
const table = reactive({
    headers: [
        { 
            key: 'date', 
            label: 'Date', 
            type: 'string', 
            class: 'text-left multi-line-date',
            formatter: (val: any) => {
                if (!val) return '-';
                const d = new Date(val);
                
                // Cek jika parsing tanggal gagal (Invalid Date)
                if (isNaN(d.getTime())) return val; 

                const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                
                const namaHari = hari[d.getDay()];
                const tanggal = String(d.getDate()).padStart(2, '0');
                const namaBulan = bulan[d.getMonth()];
                const tahun = d.getFullYear();
                
                return `${namaHari}\n${tanggal} ${namaBulan} ${tahun}`;
            }
        },
        { key: 'pcp', label: 'PCP', type: 'number', class:'text-right'},
        { key: 'tmp_max', label: 'T-Max', type: 'number', class:'text-right'},
        { key: 'tmp_min', label: 'T-Min', type: 'number', class:'text-right'},
        { key: 'slr', label: 'Solar', type: 'number', class:'text-right'},
        { key: 'wnd', label: 'Wind', type: 'number', class:'text-right'},
        { key: 'hmd', label: 'HMD', type: 'number', class:'text-right'}
    ] as any
});

defineEmits(['update:modelValue']);

const displayTitle = computed(() => {
    // Mengakses filter dari GridView melalui ref
    const filter = gridRef.value?.table.filter || '';
    
    // Jika ada filter, tambahkan format " (Tahun-Bulan)" ke judul
    const suffix = filter ? ` Periode ${filter}` : '';
    
    return `Dashboard Cuaca Stasiun : ${props.stationName}${suffix}`;
});

watch(() => props.weatherData, (newData) => {
    console.log("Isi weatherData sekarang:", newData);
    if (newData && newData.length > 0) {
        console.log("Contoh struktur data baris pertama:", newData[0]);
        console.log("Jumlah record yang diterima:", newData.length);
    } else {
        console.log("weatherData kosong atau belum dimuat.");
    }
}, { immediate: true });
</script>

<style scoped>
/* Penting agar scrollbar grafik terlihat rapi */
.overflow-y-auto {
    overflow-y: auto;
    max-height: 100%;
}

/* Memastikan GridView mengisi tinggi kontainer */
:deep(.v-table) {
    flex: 1 1 auto;
}

.v-card {
    border-radius: 8px !important;
}

/* Mempercantik Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #bdbdbd;
    border-radius: 4px;
}

/* Judul section agar lebih menonjol */
.text-subtitle-1 {
    border-bottom: 1px solid #e0e0e0;
}

:deep(.v-menu__content) {
    z-index: 9999 !important;
    position: absolute !important;
}

:deep(.multi-line-date) {
    /* Memaksa text membaca karakter \n sebagai enter */
    white-space: pre-line !important; 
    
    /* Mengatur jarak antar baris agar rapat dan rapi */
    line-height: 1.3; 
    
    /* Memberi sedikit ruang agar tidak menabrak garis tabel */
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    
    /* Sedikit memperkecil font agar lebih proporsional */
    font-size: 0.85rem; 
}

.stat-card {
  display: flex;
  flex-direction: column; /* Mengatur elemen di dalam card agar menurun */
  align-items: center;
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
}

.stat-data {
  width: 100%;
  margin-top: 10px;
}

.data-row {
  display: flex;
  justify-content: space-between; /* Membuat tulisan 'Avg:' dan nilainya rata kiri-kanan */
  font-size: 0.9em;
  margin-bottom: 4px;
}
    /* * { outline: 1px solid red !important; } */
</style>