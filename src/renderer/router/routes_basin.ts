// src/renderer/router/routes_basin.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading dengan alias @/
const Basin = (path: string) => () => import(`@/views/edit/basin/${path}.vue`);

export const basinRoutes: RouteRecordRaw[] = [
    { 
        path: 'basin/codes', 
        name: 'BasinCodes', 
        component: Basin('Codes') 
    },
    { 
        path: 'basin/parameters', 
        name: 'BasinParameters', 
        component: Basin('Parameters') 
    }
];