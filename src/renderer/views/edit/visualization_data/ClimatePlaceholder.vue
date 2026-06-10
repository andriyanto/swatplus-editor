<template>
  <div class="d-flex flex-column h-100">
<div class="table-container pt-2 px-2 pb-0">
        <grid-view 
            ref="grid" 
            :api-url="table.apiUrl" 
            :headers="table.headers" 
            :auto-height="false" 
            custom-height="25vh"
            :noActionBar = true
            :itemsPerPage = 10
            hide-create
        />
    </div>

    <div class="flex-grow-1 px-2 pt-0 pb-0" style="position: relative">     
        <v-card elevation="2" class="h-100 d-flex flex-column">
            <!-- <v-card-title class="bg-primary text-white">Map View</v-card-title> -->
            
            <v-card-text class="pa-0 flex-grow-1 position-relative">
                <vizMapOverview />
            </v-card-text>
        </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import vizMapOverview from '@/components/vizMapOverview.vue';

// Contoh data untuk tabel
	interface GridComponent {
		get: () => Promise<void>;
	}
	const grid = ref<GridComponent | null>(null);


    	let table:any = {
		apiUrl: 'climate/stations',
		headers: [
			{ key: 'name', label: 'Name' },
			{ key: 'wgn', label: 'Wgn', type: 'object', objectRoutePath: '/edit/climate/wgn/edit/' },
			{ key: 'pcp', label: 'Precipitation', type: 'file', defaultIfNull: 'sim' },
			{ key: 'lat', label: 'Lat', type: 'number', class: 'text-right' },
			{ key: 'lon', label: 'Lon', type: 'number', class: 'text-right' }
		],
		total: 0
	};

</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
/* Sekarang dia akan mengambil 100% dari v-main */
  overflow: hidden;
}



</style>