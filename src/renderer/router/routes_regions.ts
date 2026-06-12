// src/renderer/router/routes_regions.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
const RegionsLsUnits = (path: string) => () => import(`@/views/edit/regions/ls_units/${path}.vue`);

export const regionsRoutes: RouteRecordRaw[] = [
    { 
        path: 'regions/ls_units', 
        name: 'LandscapeUnits', 
        component: RegionsLsUnits('LandscapeUnits'),
        children: [
            { path: 'edit/:id', name: 'LandscapeUnitsEdit', component: RegionsLsUnits('LandscapeUnitsEdit') },
            { path: 'create', name: 'LandscapeUnitsCreate', component: RegionsLsUnits('LandscapeUnitsCreate') },
            { 
                path: 'elements', 
                name: 'LandscapeUnitsElements', 
                component: RegionsLsUnits('Elements'),
                children: [
                    { path: 'edit/:id', name: 'LandscapeUnitsElementsEdit', component: RegionsLsUnits('ElementsEdit') },
                    { path: 'create', name: 'LandscapeUnitsElementsCreate', component: RegionsLsUnits('ElementsCreate') }
                ]  
            }
        ] 
    }
];