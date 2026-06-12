// src/renderer/router/routes_climate.ts

const Climate = (path: string) => () => import(`@/views/edit/climate/${path}.vue`);

export const climateRoutes = [
    {
        path: 'climate/wgn',
        name: 'Wgn',
        component: Climate('Wgn'),
        children: [
            { path: 'edit/:id', name: 'WgnEdit', component: Climate('WgnEdit') },
            { path: 'create', name: 'WgnCreate', component: Climate('WgnCreate') }
        ]
    },
    {
        path: 'climate/stations',
        name: 'Stations',
        component: Climate('Stations'),
        children: [
            { path: 'edit/:id', name: 'StationsEdit', component: Climate('StationsEdit') },
            { path: 'create', name: 'StationsCreate', component: Climate('StationsCreate') },
            {
                path: 'atmo',
                name: 'StationsAtmo',
                component: Climate('Atmo'),
                children: [
                    { path: 'edit/:id', name: 'StationsAtmoEdit', component: Climate('AtmoEdit') },
                    { path: 'create', name: 'StationsAtmoCreate', component: Climate('AtmoCreate') }
                ]
            }
        ]
    }
];