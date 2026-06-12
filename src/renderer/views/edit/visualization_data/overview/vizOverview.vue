<template>
    <v-container fluid class="pa-2 h-100 d-flex flex-column" style="height: 90vh;">

        <v-row dense class="flex-grow-0">
            <v-col cols="12" md="3" v-for="stat in dashboardCards" :key="stat.title">
                <v-card class="pa-4" :class="stat.color">
                    <div class="text-caption text-uppercase">{{ stat.title }}</div>
                    <div class="text-h4 font-weight-bold text-no-wrap">{{ stat.value }}</div>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="flex-grow-1 mt-1" dense style="min-height: 0; height: 100%;">
            <v-col cols="12" md="5" class="d-flex flex-column" style="min-height: 0; height: 100%;">
                <v-card class="d-flex flex-column h-100" style="min-height: 0;">
                    <div class="text-subtitle-1 font-weight-bold pa-2 bg-secondary flex-shrink-0">Station List</div>
                    <v-divider class="flex-shrink-0"></v-divider>

                    <div class="flex-grow-1" style="position: relative; min-height: 0;">
                        <grid-view 
                            v-if="table.headers && table.headers.length > 0"
                            ref="grid" 
                            :api-url="table.apiUrl" 
                            :headers="table.headers" 
                            :itemsPerPage="30"
                            :inCard="true"
                            :hide-delete="true"
                            :hideEdit = "true"
                            :hideSummary="true"
                            @change="onGridDataLoaded"
                            @row-clicked="handleRowClick"
                            :selectable="true"
                            hide-create
                            >
                            <template #actions>
                                <v-btn 
                                    v-if="selectedStations.length > 0" 
                                    variant="flat" 
                                    color="primary" 
                                    class="mr-2" 
                                    @click="showWeatherDetail"
                                >
                                    Tampilkan Data
                                </v-btn>
                            </template>
                        
                        </grid-view>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="7" class="d-flex flex-column" style="min-height: 0; height: 100%;">
                <v-card class="flex-grow-1 d-flex flex-column h-100" >
                    <div class="text-subtitle-1 font-weight-bold pa-2 bg-secondary flex-shrink-0">Spatial Distribution</div>
                    <v-divider class="flex-shrink-0"></v-divider>
                    
                    <div class="flex-grow-1" style="position: relative; overflow: hidden;">
                        <vizMapOverview 
                            style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;"
                            :all-stations="allStations" 
                            :highlighted-station="selectedStations[0] || null"
                            @station-clicked="handleMapClick"
                        />
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-dialog v-model="showDetailDialog" max-width="800px">
    <v-table density="compact" fixed-header hover>
    <thead>
        <tr>
            <th class="text-left">Date</th>
            <th class="text-right">PCP</th>
            <th class="text-right">Temp Max</th>
            <th class="text-right">Temp Min</th>
            <th class="text-right">Wind</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="item in weatherData.slice(0, 50)" :key="item.id">
            <td>{{ new Date(item.date).toLocaleDateString() }}</td>
            <td class="text-right">{{ formatters.toNumberFormat(item.pcp, 2) }}</td>
            <td class="text-right">{{ formatters.toNumberFormat(item.tmp_max, 2) }}</td>
            <td class="text-right">{{ formatters.toNumberFormat(item.tmp_min, 2) }}</td>
            <td class="text-right">{{ formatters.toNumberFormat(item.wnd, 2) }}</td>
        </tr>
    </tbody>
    </v-table>
    </v-dialog>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
    import { useHelpers } from '@/helpers';
    import { useRoute } from 'vue-router';
    import vizMapOverview from '@/components/vizMapOverview.vue';
    import GridView from '@/components/GridView.vue'; 
import Stations from '@/views/edit/climate/Stations.vue';


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

    const { api, constants, currentProject, errors, formatters, runProcess, utilities } = useHelpers();
    const route = useRoute();
    const grid = ref<any>(null);


    const getSelectedData = () => {
        if (grid.value) {
            const itemsYangTampil = grid.value.items; 
            console.log("Data yang sedang tampil di Grid:", itemsYangTampil);
        }
    };

    const weatherData = ref<WeatherRecord[]>([]);
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
    const stationStats = reactive({
        stasiun_name:'',
        count: 0,
        minDate: '-',
        maxDate: '-'
    });

    // 1. Definisikan state data
    const data = reactive({
        total: 0,
        validCount: 0,
        incompleteCount: 0,
        mismatchCount: 0,
        items: [] // Pastikan ini juga ada untuk GridView
    });
    const allStations = ref<any[]>([]);

    const showDetailDialog = ref(false);

    watch(() => grid.value, (newGrid) => {
        if (newGrid) {
            // Ambil data setiap kali tabel selesai load
            // Anda bisa memanggil getSelectedData() di sini
        }
        }, { immediate: true });
        // 2. Definisikan stats untuk kartu (menggunakan computed agar otomatis update)
        const dashboardCards = computed(() => {
            const station = selectedStations.value[0];
            const stationName = station ? station.station_name : null;
            const count = stationStats.count;
            const minD = stationStats.minDate;
            const maxD = stationStats.maxDate;

            if (stationName) {
                return [
                    { title: 'Nama Station', value: stationName, color: 'bg-info-lighten-5' },
                    { title: 'Total Data Record', value: count, color: 'bg-info-lighten-5' },
                    { title: 'Periode Mulai', value: minD, color: 'bg-primary-lighten-5' },
                    { title: 'Periode Selesai', value: maxD, color: 'bg-primary-lighten-5' }
                ];
            }

            // Jika tidak ada, tampilkan statistik global (yang lama)
            return [
                { title: 'Total Stations', value: data.total, color: 'bg-primary-lighten-5' },
                { title: 'Valid Stations', value: data.validCount, color: 'bg-success-lighten-5' },
                { title: 'Incomplete', value: data.incompleteCount, color: 'bg-warning-lighten-5' },
                { title: 'Mismatch', value: data.mismatchCount, color: 'bg-error-lighten-5' }
            ];
        });

    const showWeatherDetail = () => {
        if (weatherData.value.length > 0) {
            showDetailDialog.value = true;
        } else {
            alert("Data cuaca belum tersedia atau kosong.");
        }
    };

    const handleRowClick = async (item: any) => {

    // console.log("Stasiun terpilih:", item);
    selectedStations.value = [...[item]];
    try {
            const response = await api.get(`/vizdata/weather-data`, {
                params: { station_id: item.id },
                ...currentProject.getApiHeader()
            });

            const items = response.data.items;
            weatherData.value = items;

            // Update Statistik Stasiun
            if (items.length > 0) {
                const dates = items.map((i: any) => new Date(i.date)).sort((a: any, b: any) => a - b);
                stationStats.count = items.length;
                stationStats.minDate = dates[0].toLocaleDateString();
                stationStats.maxDate = dates[dates.length - 1].toLocaleDateString();
            } else {
                stationStats.count = 0;
                stationStats.minDate = '-';
                stationStats.maxDate = '-';
            }
            
        } catch (error) {
            errors.logError(error, 'Gagal mengambil data cuaca.');
        }
    };


    const handleMapClick = (station: any) => {
        handleRowClick(station);
        nextTick(() => {
            if (grid.value && typeof grid.value.selectRow === 'function') {
                grid.value.selectRow(station.id); // Mengubah activeRowId di GridView
            }
        });
    };
    // 3. Konfigurasi Tabel
    const table = reactive({
        apiUrl: 'vizdata/stations',
        headers: [
            { key: 'id', label: 'ID', type: 'number', class: 'text-center' },
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

    watch(() => selectedStations.value, (newSelected) => {
        if (newSelected.length > 0 && grid.value) {
            const stationId = newSelected[0].id;
            if (typeof grid.value.selectRow === 'function') {
                grid.value.selectRow(stationId);
            }
            grid.value.activeRowId = stationId; 
        }
    }, { deep: true });

    onMounted(async () => {
        fetchStats();
    });

</script>

<style scoped>
    /* * { outline: 1px solid red !important; } */
    :deep(.v-table) {
        display: flex;
        flex-direction: column;
    }

    :deep(.v-table__wrapper) {
        flex: 1 1 auto;
        overflow-y: auto;
    }

</style>