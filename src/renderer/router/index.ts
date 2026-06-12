// src/renderer/router/index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

// Komponen Utama (tetap static karena pasti selalu dipakai)
import NotFound from '@/views/NotFound.vue';
import Setup from '@/views/Setup.vue';
import Help from '@/views/Help.vue';
import Edit from '@/views/edit/Edit.vue';
import Run from '@/views/Run.vue';
import CheckToolbox from '@/views/CheckToolbox.vue';
import Update from '@/views/Update.vue';
import TableBrowser from '@/views/TableBrowser.vue';
import Mapview from '@/views/MapView.vue';

// Import route modular yang sudah kita optimalkan
import { consRoutes } from './routes_cons';
import { basinRoutes } from './routes_basin';
import { calibrationRoutes } from './routes_calibration';
import { climateRoutes } from './routes_climate';
import { constituentsRoutes } from './routes_constituents';
import { decTablesRoutes } from './routes_decTables';
import { databasesRoutes } from './routes_databases';
import { hydrologyRoutes } from './routes_hydrology';
import { lumRoutes } from './routes_lum';
import { regionsRoutes } from './routes_regions';
import { soilsRoutes } from './routes_soils';
import { structuralRoutes } from './routes_structural';
import { waterRightsRoutes } from './routes_waterRights';
import { vizdataRoutes } from './routes_vizdata';

// Gabungkan semua rute edit ke dalam satu array
const editRoutes: RouteRecordRaw[] = [
    ...consRoutes,
    ...basinRoutes,
    ...calibrationRoutes,
    ...climateRoutes,
    ...constituentsRoutes,
    ...decTablesRoutes,
    ...databasesRoutes,
    ...hydrologyRoutes,
    ...lumRoutes,
    ...regionsRoutes,
    ...soilsRoutes,
    ...structuralRoutes,
    ...waterRightsRoutes,
    ...vizdataRoutes
];

export default createRouter({
    history: createWebHashHistory(),
    linkActiveClass: 'parent-active',
    linkExactActiveClass: 'active',
    routes: [
        { 
            path: '/', name: 'Setup', component: Setup,
            children: [
                { path: 'help', name: 'Help', component: Help },
                { path: 'run', name: 'Run', component: Run },
                { path: 'check', name: 'Check', component: CheckToolbox },
                { path: 'map', name: 'Map', component: Mapview },
                { 
                    path: 'edit', name: 'Edit', component: Edit,
                    children: editRoutes
                },
                { path: 'update', name: 'Update', component: Update }
            ]
        },
        { path: '/table-browser', name: 'TableBrowser', component: TableBrowser },
        { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
    ],
});