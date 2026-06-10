// src/renderer/router/VizdataRoute.ts
import { RouteRecordRaw } from 'vue-router';
import ClimatePlaceholder from '../views/edit/visualization_data/ClimatePlaceholder.vue'; 
import vizOverview from '../views/edit/visualization_data/vizOverview.vue'; 

const VizdataRoute: RouteRecordRaw[] = [
    { 
        path: 'visualization_data/overview', name: 'vizOverview', component: vizOverview,
        children: [
            { path: 'health', name: 'vizOverviewHealth', component: ClimatePlaceholder },
            { path: 'sum_statistics', name: 'vizOverviewStats', component: ClimatePlaceholder }
        ]
    },
    { 
        path: 'visualization_data/spatial', name: 'vizSpatial', component: ClimatePlaceholder,
        children: [
            { path: 'thiesen', name: 'vizSpatialThiesen', component: ClimatePlaceholder },
            { path: 'isohyet', name: 'vizSpatialIsohyet', component: ClimatePlaceholder }
        ]
    },
    { 
        path: 'visualization_data/stats', name: 'vizStats', component: ClimatePlaceholder,
        children: [
            { path: 'extreme_events', name: 'vizStatsExtreme', component: ClimatePlaceholder },

            { path: 'freqanal', name: 'vizStatsfreq', component: ClimatePlaceholder ,
            children: [

                { path: 'normal', name: 'vizStatsfreqNormal', component: ClimatePlaceholder },
                { path: 'lognormal', name: 'vizStatsfreqLogNormal', component: ClimatePlaceholder },
                { path: 'gumbel', name: 'vizStatsfreqGumbel', component: ClimatePlaceholder },
                { path: 'logperson3', name: 'vizStatsfreqLP3', component: ClimatePlaceholder },
            ]
        },
            { path: 'calc_period', name: 'vizStatsCalcPeriod', component: ClimatePlaceholder }
        ]
    },
    { path: 'visualization_data/viz', name: 'vizViz', component: ClimatePlaceholder },
    { path: 'visualization_data/hydrograph', name: 'vizHyd', component: ClimatePlaceholder }
];

export default VizdataRoute;