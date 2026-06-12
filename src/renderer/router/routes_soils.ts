// src/renderer/router/routes_soils.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
const Soils = (path: string) => () => import(`@/views/edit/soils/${path}.vue`);

export const soilsRoutes: RouteRecordRaw[] = [
    { 
        path: 'soils/soils', 
        name: 'Soils', 
        component: Soils('Soils'),
        children: [
            { path: 'edit/:id', name: 'SoilsEdit', component: Soils('SoilsEdit') },
            { path: 'create', name: 'SoilsCreate', component: Soils('SoilsCreate') }
        ]  
    },
    { 
        path: 'soils/soil-nutrients', 
        name: 'SoilNutrients', 
        component: Soils('Nutrients'),
        children: [
            { path: 'edit/:id', name: 'SoilNutrientsEdit', component: Soils('NutrientsEdit') },
            { path: 'create', name: 'SoilNutrientsCreate', component: Soils('NutrientsCreate') }
        ]   
    },
    { 
        path: 'soils/soils-lte', 
        name: 'SoilsLte', 
        component: Soils('SoilsLte'),
        children: [
            { path: 'edit/:id', name: 'SoilsLteEdit', component: Soils('SoilsLteEdit') },
            { path: 'create', name: 'SoilsLteCreate', component: Soils('SoilsLteCreate') }
        ]   
    }
];