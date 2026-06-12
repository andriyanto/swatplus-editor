// src/renderer/router/routes_vizdata.ts
import { RouteRecordRaw } from 'vue-router';

// Kita gunakan fungsi helper untuk mempermudah penulisan import dinamis
const load = (path: string) => () => import(`@/views/edit/visualization_data/${path}.vue`);
const Overview = (path: string) => () => import(`@/views/edit/visualization_data/overview/${path}.vue`);

export const vizdataRoutes: RouteRecordRaw[] = [
    { 
        path: 'visualization_data/overview', 
        name: 'vizOverview', 
        component: Overview('vizOverview'),
        meta: { hideNavDrawer: true },
        children: [
            { path: 'health', name: 'vizOverviewHealth', component: load('ClimatePlaceholder')},
            { path: 'sum_statistics', name: 'vizOverviewStats', component: load('ClimatePlaceholder') }
        ]
    },
    { 
        path: 'visualization_data/spatial', 
        name: 'vizSpatial', 
        component: load('ClimatePlaceholder'),
        children: [
            { path: 'thiesen', name: 'vizSpatialThiesen', component: load('ClimatePlaceholder') },
            { path: 'isohyet', name: 'vizSpatialIsohyet', component: load('ClimatePlaceholder') }
        ]
    },
    { 
        path: 'visualization_data/stats', 
        name: 'vizStats', 
        component: load('ClimatePlaceholder'),
        children: [
            { path: 'extreme_events', name: 'vizStatsExtreme', component: load('ClimatePlaceholder') },
            { 
                path: 'freqanal', 
                name: 'vizStatsfreq', 
                component: load('ClimatePlaceholder'),
                children: [
                    { path: 'normal', name: 'vizStatsfreqNormal', component: load('ClimatePlaceholder') },
                    { path: 'lognormal', name: 'vizStatsfreqLogNormal', component: load('ClimatePlaceholder') },
                    { path: 'gumbel', name: 'vizStatsfreqGumbel', component: load('ClimatePlaceholder') },
                    { path: 'logperson3', name: 'vizStatsfreqLP3', component: load('ClimatePlaceholder') },
                ]
            },
            { path: 'calc_period', name: 'vizStatsCalcPeriod', component: load('ClimatePlaceholder') }
        ]
    },
    { path: 'visualization_data/visualization', name: 'vizVis', component: load('ClimatePlaceholder') },
    { path: 'visualization_data/hydrograph', name: 'vizHyd', component: load('ClimatePlaceholder') }
];