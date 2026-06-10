<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue';
import { RouteRecordName, useRoute } from 'vue-router';
import { useHelpers } from '@/helpers';

import { useLangStore } from '@/store/lang';
import { storeToRefs } from 'pinia';

import { climateHydrologyNav } from '@/router/nav_vizdata'; //import new route for visualization data

const langStore = useLangStore();
const { t } = storeToRefs(langStore);

const route = useRoute();
const { currentProject } = useHelpers();

interface Page {
	loading: boolean,
	open: string[],
	subOpen: string[]
}

let page: Page = reactive({
	loading: false,
	open: route.name === 'Edit' ? ['Climate'] : [], // add route visualization data
	subOpen: []
});

interface NavGroup {
	name: string,
	routeName: string,
	show: boolean,
	items: NavItem[]
}

interface NavItem {
	name: string,
	path: string,
	show: boolean,
	routeName: string,
	subItems: NavItem[],
}

let nav: NavGroup[] = reactive([
	{
		name: 'Climate', routeName: 'Climate', show: true,
		items: [
			{ name: 'Weather Generator', path: '/edit/climate/wgn', show: true, routeName: '', subItems: [] },
			{
				name: 'Weather Stations', path: '/edit/climate/stations', show: true, routeName: 'Stations',
				subItems: [
					{ name: 'Atmospheric Deposition', path: '/edit/climate/stations/atmo', show: true, routeName: '', subItems: [] }
				]
			}
		]
	},
	climateHydrologyNav, //new menu visualization data
	{
		name: 'Connections', routeName: 'Cons', show: true,
		items: [
			{
				name: 'Channels', path: '/edit/cons/channels', show: true, routeName: 'Channels',
				subItems: [
					{ name: 'Initial', path: '/edit/cons/channels/initial', show: true, routeName: '', subItems: [] },
					{ name: 'Hydrology & Sediment', path: '/edit/cons/channels/hydsed', show: true, routeName: '', subItems: [] },
					{ name: 'Nutrients', path: '/edit/cons/channels/nutrients', show: true, routeName: '', subItems: [] }
				]
			},
			{ name: 'HRUs', path: '/edit/cons/hrus', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'HRUs', path: '/edit/cons/hrus-lte', show: currentProject.isLte, routeName: '', subItems: [] },
			{
				name: 'Routing Units', path: '/edit/cons/routing-units', show: !currentProject.isLte, routeName: 'RoutingUnits',
				subItems: [
					{ name: 'Elements', path: '/edit/cons/routing-units/elements', show: true, routeName: '', subItems: [] }
				]
			},
			{
				name: 'Aquifers', path: '/edit/cons/aquifers', show: !currentProject.isLte, routeName: 'Aquifers',
				subItems: [
					{ name: 'Initial', path: '/edit/cons/aquifers/initial', show: true, routeName: '', subItems: [] }
				]
			},
			{
				name: 'Reservoirs', path: '/edit/cons/reservoirs', show: !currentProject.isLte, routeName: 'Reservoirs',
				subItems: [
					{ name: 'Reservoir Hydrology', path: '/edit/cons/reservoirs/hydrology', show: true, routeName: '', subItems: [] },
					{ name: 'Initial', path: '/edit/cons/reservoirs/initial', show: true, routeName: '', subItems: [] },
					{ name: 'Sediment', path: '/edit/cons/reservoirs/sediment', show: true, routeName: '', subItems: [] },
					{ name: 'Nutrients', path: '/edit/cons/reservoirs/nutrients', show: true, routeName: '', subItems: [] },
					{ name: 'Wetlands', path: '/edit/cons/reservoirs/wetlands', show: true, routeName: '', subItems: [] },
					{ name: 'Wetland Hydrology', path: '/edit/cons/reservoirs/wetlands_hydrology', show: true, routeName: '', subItems: [] }
				]
			},
			{ name: 'Point Sources / Inlets', path: '/edit/cons/recall', show: !currentProject.isLte, routeName: '', subItems: [] },
			{
				name: 'Groundwater Flow', path: '/edit/cons/gwflow', show: !currentProject.isLte, routeName: 'Gwflow',
				subItems: [
					{ name: 'Zones', path: '/edit/cons/gwflow/zones', show: true, routeName: '', subItems: [] },
					{ name: 'Grid Data', path: '/edit/cons/gwflow/grids', show: true, routeName: '', subItems: [] },
					{ name: 'Reservoirs', path: '/edit/cons/gwflow/rescell', show: true, routeName: '', subItems: [] },
					{ name: 'Floodplain', path: '/edit/cons/gwflow/fpcell', show: true, routeName: '', subItems: [] },
					{ name: 'Wetlands', path: '/edit/cons/gwflow/wetlands', show: true, routeName: '', subItems: [] },
					{ name: 'Solutes', path: '/edit/cons/gwflow/solutes', show: true, routeName: '', subItems: [] },
				]
			},
		]
	},
	{
		name: 'Basin', routeName: 'Basin', show: true,
		items: [
			{ name: 'Codes', path: '/edit/basin/codes', show: true, routeName: '', subItems: [] },
			{ name: 'Parameters', path: '/edit/basin/parameters', show: true, routeName: '', subItems: [] }
		]
	},
	{
		name: 'Regions', routeName: 'Regions', show: true,
		items: [
			{
				name: 'Landscape Units', path: '/edit/regions/ls_units', show: true, routeName: 'LandscapeUnits',
				subItems: [
					{ name: 'Elements', path: '/edit/regions/ls_units/elements', show: true, routeName: '', subItems: [] }
				]
			}
		]
	},
	{
		name: 'Land Use Management', routeName: 'Lum', show: !currentProject.isLte,
		items: [
			{ name: 'Land Use Management', path: '/edit/lum/landuse', show: true, routeName: '', subItems: [] },
			{ name: 'Plant Communities', path: '/edit/lum/plant', show: true, routeName: '', subItems: [] },
			{ name: 'Management Schedules', path: '/edit/lum/mgt', show: true, routeName: '', subItems: [] },
			{
				name: 'Operations Databases', path: '/edit/lum/ops', show: true, routeName: 'Operations',
				subItems: [
					{ name: 'Harvest', path: '/edit/lum/ops/harvest', show: true, routeName: '', subItems: [] },
					{ name: 'Graze', path: '/edit/lum/ops/graze', show: true, routeName: '', subItems: [] },
					{ name: 'Irrigation', path: '/edit/lum/ops/irrigation', show: true, routeName: '', subItems: [] },
					{ name: 'Chemical Applications', path: '/edit/lum/ops/chemapp', show: true, routeName: '', subItems: [] },
					{ name: 'Fire', path: '/edit/lum/ops/fire', show: true, routeName: '', subItems: [] },
					{ name: 'Sweep', path: '/edit/lum/ops/sweep', show: true, routeName: '', subItems: [] }
				]
			},
			{ name: 'Curve Numbers', path: '/edit/lum/cntable', show: true, routeName: '', subItems: [] },
			{ name: 'Conservation Practices', path: '/edit/lum/conspractice', show: true, routeName: '', subItems: [] },
			{ name: `Manning's n`, path: '/edit/lum/ovntable', show: true, routeName: '', subItems: [] }
		]
	},
	{
		name: 'Decision Tables', routeName: 'Dtl', show: true,
		items: [
			{ name: 'Land Use Management', path: '/edit/decision-table/lum', show: true, routeName: '', subItems: [] },
			{ name: 'Reservoir Release', path: '/edit/decision-table/res_rel', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Scenario Land Use', path: '/edit/decision-table/scen_lu', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Flow Conditions', path: '/edit/decision-table/flo_con', show: !currentProject.isLte, routeName: '', subItems: [] }
		]
	},
	{
		name: 'Calibration', routeName: 'Change', show: !currentProject.isLte,
		items: [
			{
				name: 'Hard Calibration', path: '/edit/change/hard', show: true, routeName: 'HardCalibration',
				subItems: [
					{ name: 'Parameters', path: '/edit/change/hard/parms', show: true, routeName: '', subItems: [] }
				]
			},
			{
				name: 'Soft Calibration', path: '/edit/change/soft', show: true, routeName: 'SoftCalibration',
				subItems: [
					{ name: 'Water Balance', path: '/edit/change/soft/wb', show: true, routeName: '', subItems: [] },
					{ name: 'Plant Growth', path: '/edit/change/soft/plant', show: true, routeName: '', subItems: [] }
				]
			}
		]
	},
	{
		name: 'Constituents', routeName: 'Constituents', show: true,
		items: [
			{ name: 'Soil Plant', path: '/edit/constituents/soil_plant', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Organic Mineral', path: '/edit/constituents/om_water', show: true, routeName: '', subItems: [] },
			{ name: 'Pesticides', path: '/edit/constituents/pest', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Pathogens', path: '/edit/constituents/path', show: !currentProject.isLte, routeName: '', subItems: [] },
			{
				name: 'Salts', path: '/edit/constituents/salts', show: !currentProject.isLte, routeName: 'Salts',
				subItems: [
					{ name: 'Point Sources', path: '/edit/constituents/salts/recall', show: true, routeName: '', subItems: [] },
					{ name: 'Atmospheric Deposition', path: '/edit/constituents/salts/atmo', show: true, routeName: '', subItems: [] },
					{ name: 'Road Salt', path: '/edit/constituents/salts/road', show: true, routeName: '', subItems: [] },
					{ name: 'Fertilizer & Soil Amendments', path: '/edit/constituents/salts/fert', show: true, routeName: '', subItems: [] },
					{ name: 'Urban Runoff', path: '/edit/constituents/salts/urban', show: true, routeName: '', subItems: [] },
					{ name: 'Plant Influence', path: '/edit/constituents/salts/plants', show: true, routeName: '', subItems: [] },
					{ name: 'Aquifer Initial Conditions', path: '/edit/constituents/salts/aqu', show: true, routeName: '', subItems: [] },
					{ name: 'Channel Initial Conditions', path: '/edit/constituents/salts/cha', show: true, routeName: '', subItems: [] },
					{ name: 'Reservoir Initial Conditions', path: '/edit/constituents/salts/res', show: true, routeName: '', subItems: [] },
					{ name: 'HRU Initial Conditions', path: '/edit/constituents/salts/hru', show: true, routeName: '', subItems: [] },
					{ name: 'Irrigation', path: '/edit/constituents/salts/irr', show: true, routeName: '', subItems: [] }
				]
			}
		]
	},
	{
		name: 'Hydrology', routeName: 'Hydrology', show: !currentProject.isLte,
		items: [
			{ name: 'Hydrology', path: '/edit/hydrology/hydrology', show: true, routeName: '', subItems: [] },
			{ name: 'Topography', path: '/edit/hydrology/topography', show: true, routeName: '', subItems: [] },
			{ name: 'Fields', path: '/edit/hydrology/fields', show: true, routeName: '', subItems: [] }
		]
	},
	{
		name: 'Soils', routeName: 'Soils', show: true,
		items: [
			{ name: 'Soils', path: '/edit/soils/soils', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Nutrients', path: '/edit/soils/soil-nutrients', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Soil Textures', path: '/edit/soils/soils-lte', show: currentProject.isLte, routeName: '', subItems: [] }
		]
	},
	{
		name: 'Databases', routeName: 'Db', show: true,
		items: [
			{ name: 'Plants', path: '/edit/db/plants', show: true, routeName: '', subItems: [] },
			{ name: 'Fertilizer', path: '/edit/db/fertilizer', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Tillage', path: '/edit/db/tillage', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Pesticides', path: '/edit/db/pesticides', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Pathogens', path: '/edit/db/pathogens', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Urban', path: '/edit/db/urban', show: true, routeName: '', subItems: [] },
			{ name: 'Septic', path: '/edit/db/septic', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Snow', path: '/edit/db/snow', show: !currentProject.isLte, routeName: '', subItems: [] }
		]
	},
	{
		name: 'Structural', routeName: 'Structural', show: !currentProject.isLte,
		items: [
			{ name: 'Tile Drains', path: '/edit/structural/tiledrain', show: true, routeName: '', subItems: [] },
			{ name: 'Septic Systems', path: '/edit/structural/septic', show: true, routeName: '', subItems: [] },
			{ name: 'Filter Strips', path: '/edit/structural/filterstrip', show: true, routeName: '', subItems: [] },
			{ name: 'Grassed Waterways', path: '/edit/structural/grassedww', show: true, routeName: '', subItems: [] },
			{ name: 'User BMPs', path: '/edit/structural/bmpuser', show: true, routeName: '', subItems: [] }
		]
	},
	/*{
		name: 'Water Rights', routeName: 'WaterRights', show: !currentProject.isLte,
		items: [
			{ name: 'Water Allocation', path: '/edit/water-rights/allocation', show: true, routeName: '', subItems: [] }
		]
	}*/
])

function shownNavItems(items: NavItem[]) {
	return items.filter((el: any) => { return el.show; })
}

function shownNavGroups(items: NavGroup[]) {
	return items.filter((el: any) => { return el.show; })
}



function processSubOpenItem(thisRoute: RouteRecordName | null | undefined, name: string) {

	if (thisRoute?.toString().includes(name)) page.subOpen.push(name);
	else {
		let idx = page.subOpen.indexOf(name);
		if (idx > -1) {
			page.subOpen.splice(idx, 1);
		}
	}
}

/**
 * Updates the drawer state (active groups and sub-menus) based on the current route.
 * * Design Notes:
 * 1. Auto-discovery: Dynamically iterates through the 'nav' configuration to find matches, 
 * removing the need for manual maintenance of a 'subOpenItems' list.
 * 2. Accordion Behavior: Clears 'page.open' and 'page.subOpen' before processing to 
 * ensure that only the currently active group remains expanded, providing a 
 * clean, single-group-at-a-time accordion experience.
 */
function processSubOpen(thisRoute: RouteRecordName | null | undefined) {

	console.log("DEBUG: Rute yang diproses:", thisRoute);

	const routeStr = thisRoute?.toString() || "";

	// Reset state to ensure only the currently active route’s group is expanded
	page.open = []; 
	page.subOpen = [];

	nav.forEach(group => {
		group.items.forEach(item => {
			// Dynamically match the current route against the navigation configuration
			if (item.routeName && routeStr.includes(item.routeName)) {
				
				// Mark the parent group as open
				if (!page.open.includes(group.routeName)) {
					page.open.push(group.routeName);
				}

				// Mark the sub-menu as active if it has children
				if (item.subItems.length > 0 && !page.subOpen.includes(item.routeName)) {
					page.subOpen.push(item.routeName);
				}
			}
		});
	});
	
}

watch(() => route.name, (newRoute) => processSubOpen(newRoute))

onMounted(() => processSubOpen(route.name));

</script>

<template>
	<project-container :loading="page.loading" add-error-frame>
		<v-navigation-drawer permanent id="secondary-nav">
			<v-list v-model:opened="page.open" :lines="false" density="compact" nav>
				<v-list-group v-for="navGroup in shownNavGroups(nav)" :key="navGroup.name" :value="navGroup.routeName"
					expand-icon="fas fa-angle-left" collapse-icon="fas fa-angle-down" class="fa-2xs">
					<template #activator="{ props }">
						<v-list-item v-bind="props" :title="navGroup.name" color="primary"
							variant="tonal"></v-list-item>
					</template>
					<v-list-item v-for="navItem in shownNavItems(navGroup.items)" :key="navItem.name" :to="navItem.path"
						:title="navItem.name" color="secondary"
						:class="navItem.subItems.length > 0 && page.subOpen.includes(navItem.routeName) ? 'sub-open' : ''">
						<v-list v-if="navItem.subItems.length > 0 && page.subOpen.includes(navItem.routeName)" :lines="false" density="compact" nav>
							<template v-for="navSubItem in shownNavItems(navItem.subItems)" :key="navSubItem.name">
								
								<v-list-group v-if="navSubItem.subItems.length > 0" :value="navSubItem.routeName">
									<template #activator="{ props }">
										<v-list-item v-bind="props" :title="navSubItem.name" color="secondary"></v-list-item>
									</template>
									<v-list-item 
										v-for="child in shownNavItems(navSubItem.subItems)" 
										:key="child.name" 
										:to="child.path" 
										:title="child.name"
									></v-list-item>
								</v-list-group>

								<v-list-item v-else :to="navSubItem.path" :title="navSubItem.name"></v-list-item>
								
							</template>
						</v-list>

					</v-list-item>
				</v-list-group>
			</v-list>
		</v-navigation-drawer>
		
		<v-main class="layout-fix">
			<div :class="route.path.includes('visualization_data') ? 'map-canvas' : 'default-content'">
				<div v-if="route.path == '/edit'">
					<h1 class="text-h5 mb-3 font-weight-bold tracking-tight judul">Edit SWAT+ inputs</h1>

					<p>
						{{ t.common.edit_p1 }}
					</p>

					<h2 class="text-h5 mb-3 mt-4 judul">Help</h2>
					<p>
						{{ t.common.edit_help_p1 }}
						<font-awesome-icon :icon="['fas', 'book']" /> yang dapat Anda klik
						{{ t.common.edit_help_p2 }}
       					 <br><br>
        				{{ t.common.edit_help_p3 }} <router-link to="/help" class="text-primary"><font-awesome-icon
								:icon="['fas', 'question-circle']" /></router-link> {{ t.common.edit_help_p4 }}
					</p>

					<v-divider class="my-6"></v-divider>

					<p>
						{{ t.common.edit_footer_p1 }} <router-link to="/run"
							class="text-primary">{{t.common.run_swat_title}}</router-link>.
						{{ t.common.edit_footer_p2 }}
					</p>
				</div>
				<router-view></router-view>
			</div>
		</v-main>
	</project-container>
</template>

<style scoped>
/* Konten normal tetap punya padding agar rapi */
/* .default-content, .map-canvas {
    box-sizing: border-box; 
    width: 100%;
} */
.default-content {
    padding: 12px 24px; /* Setara dengan py-3 px-6 */
}

/* Kanvas peta: tanpa padding, memenuhi ruang, dan fleksibel */
.map-canvas {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    /* padding: 12px 24px; */
    margin: 0;
	/* box-sizing: border-box; */
}

/* Memastikan v-main tidak membatasi tinggi */
.layout-fix {
    height: 100vh;
}
</style>