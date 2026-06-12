// src/renderer/router/routes_hydrology.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
const Hydrology = (path: string) => () => import(`@/views/edit/hydrology/${path}.vue`);

export const hydrologyRoutes: RouteRecordRaw[] = [
    { 
        path: 'hydrology/hydrology', 
        name: 'Hydrology', 
        component: Hydrology('Hydrology'), 
        children: [
            { path: 'edit/:id', name: 'HydrologyEdit', component: Hydrology('HydrologyEdit') },
            { path: 'create', name: 'HydrologyCreate', component: Hydrology('HydrologyCreate') }
        ]  
    },
    { 
        path: 'hydrology/topography', 
        name: 'Topography', 
        component: Hydrology('Topography'), 
        children: [
            { path: 'edit/:id', name: 'TopographyEdit', component: Hydrology('TopographyEdit') },
            { path: 'create', name: 'TopographyCreate', component: Hydrology('TopographyCreate') }
        ]  
    },
    { 
        path: 'hydrology/fields', 
        name: 'Fields', 
        component: Hydrology('Fields'), 
        children: [
            { path: 'edit/:id', name: 'FieldsEdit', component: Hydrology('FieldsEdit') },
            { path: 'create', name: 'FieldsCreate', component: Hydrology('FieldsCreate') }
        ]   
    }
];