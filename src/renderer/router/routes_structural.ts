// src/renderer/router/routes_structural.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
const Structural = (path: string) => () => import(`@/views/edit/structural/${path}.vue`);

export const structuralRoutes: RouteRecordRaw[] = [
    { 
        path: 'structural/tiledrain', name: 'TiledrainStr', component: Structural('Tiledrain'),
        children: [
            { path: 'edit/:id', name: 'TiledrainStrEdit', component: Structural('TiledrainStrEdit') },
            { path: 'create', name: 'TiledrainStrCreate', component: Structural('TiledrainStrCreate') }
        ]
    },
    { 
        path: 'structural/septic', name: 'SepticStr', component: Structural('Septic'),
        children: [
            { path: 'edit/:id', name: 'SepticStrEdit', component: Structural('SepticStrEdit') },
            { path: 'create', name: 'SepticStrCreate', component: Structural('SepticStrCreate') }
        ]
    },
    { 
        path: 'structural/filterstrip', name: 'FilterstripStr', component: Structural('Filterstrip'),
        children: [
            { path: 'edit/:id', name: 'FilterstripStrEdit', component: Structural('FilterstripStrEdit') },
            { path: 'create', name: 'FilterstripStrCreate', component: Structural('FilterstripStrCreate') }
        ]
    },
    { 
        path: 'structural/grassedww', name: 'GrassedwwStr', component: Structural('Grassedww'),
        children: [
            { path: 'edit/:id', name: 'GrassedwwStrEdit', component: Structural('GrassedwwStrEdit') },
            { path: 'create', name: 'GrassedwwStrCreate', component: Structural('GrassedwwStrCreate') }
        ]
    },
    { 
        path: 'structural/bmpuser', name: 'BmpuserStr', component: Structural('Bmpuser'),
        children: [
            { path: 'edit/:id', name: 'BmpuserStrEdit', component: Structural('BmpuserStrEdit') },
            { path: 'create', name: 'BmpuserStrCreate', component: Structural('BmpuserStrCreate') }
        ]
    },
];