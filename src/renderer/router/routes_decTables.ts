// src/renderer/router/routes_decTables.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
const DecTables = (path: string) => () => import(`@/views/edit/decision_table/${path}.vue`);

export const decTablesRoutes: RouteRecordRaw[] = [
    { 
        path: 'decision-table/type/:dbtype/edit/:id', 
        name: 'DecisionsEdit', 
        component: DecTables('DecisionsEdit') 
    },
    { 
        path: 'decision-table/lum', 
        name: 'DecisionsLum', 
        component: DecTables('Lum') 
    },
    { 
        path: 'decision-table/res_rel', 
        name: 'DecisionsResRel', 
        component: DecTables('ResRel') 
    },
    { 
        path: 'decision-table/flo_con', 
        name: 'DecisionsFloCon', 
        component: DecTables('FloCon') 
    },
    { 
        path: 'decision-table/scen_lu', 
        name: 'DecisionsScenLu', 
        component: DecTables('ScenLu') 
    }
];