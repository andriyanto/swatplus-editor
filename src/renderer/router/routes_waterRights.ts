// src/renderer/router/routes_waterRights.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
const WaterRights = (path: string) => () => import(`@/views/edit/water_rights/${path}.vue`);

export const waterRightsRoutes: RouteRecordRaw[] = [
    { 
        path: 'water-rights/allocation', 
        name: 'WaterAllocation', 
        component: WaterRights('WaterAllocation'),
        children: [
            { path: 'edit/:id', name: 'WaterAllocationEdit', component: WaterRights('WaterAllocationEdit') },
            { path: 'create', name: 'WaterAllocationCreate', component: WaterRights('WaterAllocationCreate') }
        ]  
    }
];