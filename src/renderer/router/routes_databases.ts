// src/renderer/router/routes_databases.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading dengan alias @/
const Databases = (path: string) => () => import(`@/views/edit/db/${path}.vue`);

export const databasesRoutes: RouteRecordRaw[] = [
    { 
        path: 'db/plants', name: 'Plants', component: Databases('Plants'),
        children: [
            { path: 'edit/:id', name: 'PlantsEdit', component: Databases('PlantsEdit') },
            { path: 'create', name: 'PlantsCreate', component: Databases('PlantsCreate') }
        ]
    },
    { 
        path: 'db/fertilizer', name: 'Fertilizer', component: Databases('Fertilizer'),
        children: [
            { path: 'edit/:id', name: 'FertilizerEdit', component: Databases('FertilizerEdit') },
            { path: 'create', name: 'FertilizerCreate', component: Databases('FertilizerCreate') }
        ] 
    },
    { 
        path: 'db/pesticides', name: 'Pesticides', component: Databases('Pesticides'),
        children: [
            { path: 'edit/:id', name: 'PesticidesEdit', component: Databases('PesticidesEdit') },
            { path: 'create', name: 'PesticidesCreate', component: Databases('PesticidesCreate') }
        ] 
    },
    { 
        path: 'db/pathogens', name: 'Pathogens', component: Databases('Pathogens'),
        children: [
            { path: 'edit/:id', name: 'PathogensEdit', component: Databases('PathogensEdit') },
            { path: 'create', name: 'PathogensCreate', component: Databases('PathogensCreate') }
        ] 
    },
    { 
        path: 'db/septic', name: 'Septic', component: Databases('Septic'),
        children: [
            { path: 'edit/:id', name: 'SepticEdit', component: Databases('SepticEdit') },
            { path: 'create', name: 'SepticCreate', component: Databases('SepticCreate') }
        ] 
    },
    { 
        path: 'db/snow', name: 'Snow', component: Databases('Snow'),
        children: [
            { path: 'edit/:id', name: 'SnowEdit', component: Databases('SnowEdit') },
            { path: 'create', name: 'SnowCreate', component: Databases('SnowCreate') }
        ]  
    },
    { 
        path: 'db/tillage', name: 'Tillage', component: Databases('Tillage'),
        children: [
            { path: 'edit/:id', name: 'TillageEdit', component: Databases('TillageEdit') },
            { path: 'create', name: 'TillageCreate', component: Databases('TillageCreate') }
        ]  
    },
    { 
        path: 'db/urban', name: 'Urban', component: Databases('Urban'),
        children: [
            { path: 'edit/:id', name: 'UrbanEdit', component: Databases('UrbanEdit') },
            { path: 'create', name: 'UrbanCreate', component: Databases('UrbanCreate') }
        ]  
    }
];