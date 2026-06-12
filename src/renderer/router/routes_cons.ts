import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading dengan alias @/
// Sesuaikan base path: 'connect' karena Anda menggunakan folder tersebut di import lama
const Channels = (path: string) => () => import(`@/views/edit/connect/channels/${path}.vue`);
const Hrus = (path: string) => () => import(`@/views/edit/connect/hrus/${path}.vue`);
const HrusLte = (path: string) => () => import(`@/views/edit/connect/hrus-lte/${path}.vue`);
const RoutingUnits = (path: string) => () => import(`@/views/edit/connect/routing-units/${path}.vue`);
const Aquifers = (path: string) => () => import(`@/views/edit/connect/aquifers/${path}.vue`);
const Gwflow = (path: string) => () => import(`@/views/edit/connect/gwflow/${path}.vue`);
const Reservoirs = (path: string) => () => import(`@/views/edit/connect/reservoirs/${path}.vue`);
const Recall = (path: string) => () => import(`@/views/edit/connect/recall/${path}.vue`);


export const consRoutes: RouteRecordRaw[] = [
    { 
        path: 'cons/channels', name: 'Channels', component: Channels('Channels'),
        children: [
            { path: 'edit/:id', name: 'ChannelsEdit', component: Channels('ChannelsEdit') },
            { path: 'create', name: 'ChannelsCreate', component: Channels('ChannelsCreate') },
            { 
                path: 'initial', name: 'ChannelsInitial', component: Channels('Initial'),
                children: [
                    { path: 'edit/:id', name: 'ChannelsInitialEdit', component: Channels('InitialEdit') },
                    { path: 'create', name: 'ChannelsInitialCreate', component: Channels('InitialCreate') }
                ] 
            },
            { 
                path: 'hydsed', name: 'ChannelsHydSedLte', component: Channels('HydSedLte'),
                children: [
                    { path: 'edit/:id', name: 'ChannelsHydSedLteEdit', component: Channels('HydSedLteEdit') },
                    { path: 'create', name: 'ChannelsHydSedLteCreate', component: Channels('HydSedLteCreate') }
                ] 
            },
            { 
                path: 'nutrients', name: 'ChannelsNutrients', component: Channels('Nutrients'),
                children: [
                    { path: 'edit/:id', name: 'ChannelsNutrientsEdit', component: Channels('NutrientsEdit') },
                    { path: 'create', name: 'ChannelsNutrientsCreate', component: Channels('NutrientsCreate') }
                ] 
            }
        ]
    },
    { 
        path: 'cons/hrus', name: 'Hrus', component: Hrus('Hrus'), 
        children: [
            { path: 'edit/:id', name: 'HrusEdit', component: Hrus('HrusEdit') },
            { path: 'create', name: 'HrusCreate', component: Hrus('HrusCreate') }
        ] 
    },
    { 
        path: 'cons/hrus-lte', name: 'HrusLte', component: HrusLte('HrusLte'), 
        children: [
            { path: 'edit/:id', name: 'HrusLteEdit', component: HrusLte('HrusLteEdit') },
            { path: 'create', name: 'HrusLteCreate', component: HrusLte('HrusLteCreate') }
        ] 
    },
    { 
        path: 'cons/routing-units', name: 'RoutingUnits', component: RoutingUnits('RoutingUnits'),        
        children: [
            { path: 'edit/:id', name: 'RoutingUnitsEdit', component: RoutingUnits('RoutingUnitsEdit') },
            { path: 'create', name: 'RoutingUnitsCreate', component: RoutingUnits('RoutingUnitsCreate') },
            { 
                path: 'elements', name: 'RoutingUnitsElements', component: RoutingUnits('Elements'),
                children: [
                    { path: 'edit/:id', name: 'RoutingUnitsElementsEdit', component: RoutingUnits('ElementsEdit') },
                    { path: 'create', name: 'RoutingUnitsElementsCreate', component: RoutingUnits('ElementsCreate') }
                ]
            }
        ] 
    },
    { 
        path: 'cons/aquifers', name: 'Aquifers', component: Aquifers('Aquifers'), 
        children: [
            { path: 'edit/:id', name: 'AquifersEdit', component: Aquifers('AquifersEdit') },
            { path: 'create', name: 'AquifersCreate', component: Aquifers('AquifersCreate') },
            { 
                path: 'initial', name: 'AquifersInitial', component: Aquifers('Initial'),
                children: [
                    { path: 'edit/:id', name: 'AquifersInitialEdit', component: Aquifers('InitialEdit') },
                    { path: 'create', name: 'AquifersInitialCreate', component: Aquifers('InitialCreate') }
                ] 
            }
        ] 
    },
    { 
        path: 'cons/gwflow', name: 'Gwflow', component: Gwflow('Gwflow'), 
        children: [
            { path: 'grids', name: 'GwflowGrids', component: Gwflow('GwflowGrids') },
            { 
                path: 'zones', name: 'GwflowZone', component: Gwflow('GwflowZone'),
                children: [{ path: 'edit/:id', name: 'GwflowZoneEdit', component: Gwflow('GwflowZoneEdit') }] 
            },
            { 
                path: 'fpcell', name: 'GwflowFpcell', component: Gwflow('Fpcell'),
                children: [
                    { path: 'edit/:id', name: 'GwflowFpcellEdit', component: Gwflow('FpcellEdit') },
                    { path: 'create', name: 'GwflowFpcellCreate', component: Gwflow('FpcellCreate') }
                ] 
            },
            { 
                path: 'rescell', name: 'GwflowRescell', component: Gwflow('Rescell'),
                children: [
                    { path: 'edit/:id', name: 'GwflowRescellEdit', component: Gwflow('RescellEdit') },
                    { path: 'create', name: 'GwflowRescellCreate', component: Gwflow('RescellCreate') }
                ] 
            },
            { 
                path: 'wetlands', name: 'GwflowWetlands', component: Gwflow('Wetlands'),
                children: [
                    { path: 'edit/:id', name: 'GwflowWetlandsEdit', component: Gwflow('WetlandsEdit') },
                    { path: 'create', name: 'GwflowWetlandsCreate', component: Gwflow('WetlandsCreate') }
                ] 
            },
            { 
                path: 'solutes', name: 'GwflowSolutes', component: Gwflow('Solutes'),
                children: [{ path: 'edit/:id', name: 'GwflowSolutesEdit', component: Gwflow('SolutesEdit') }] 
            }
        ] 
    },
    { 
        path: 'cons/reservoirs', name: 'Reservoirs', component: Reservoirs('Reservoirs'), 
        children: [
            { path: 'edit/:id', name: 'ReservoirsEdit', component: Reservoirs('ReservoirsEdit') },
            { path: 'create', name: 'ReservoirsCreate', component: Reservoirs('ReservoirsCreate') },
            { 
                path: 'initial', name: 'ReservoirsInitial', component: Reservoirs('Initial'),
                children: [
                    { path: 'edit/:id', name: 'ReservoirsInitialEdit', component: Reservoirs('InitialEdit') },
                    { path: 'create', name: 'ReservoirsInitialCreate', component: Reservoirs('InitialCreate') }
                ] 
            },
            { 
                path: 'hydrology', name: 'ReservoirsHydrology', component: Reservoirs('Hydrology'),
                children: [
                    { path: 'edit/:id', name: 'ReservoirsHydrologyEdit', component: Reservoirs('HydrologyEdit') },
                    { path: 'create', name: 'ReservoirsHydrologyCreate', component: Reservoirs('HydrologyCreate') }
                ]  
            },
            { 
                path: 'sediment', name: 'ReservoirsSediment', component: Reservoirs('Sediment'),
                children: [
                    { path: 'edit/:id', name: 'ReservoirsSedimentEdit', component: Reservoirs('SedimentEdit') },
                    { path: 'create', name: 'ReservoirsSedimentCreate', component: Reservoirs('SedimentCreate') }
                ] 
            },
            { 
                path: 'nutrients', name: 'ReservoirsNutrients', component: Reservoirs('Nutrients'),
                children: [
                    { path: 'edit/:id', name: 'ReservoirsNutrientsEdit', component: Reservoirs('NutrientsEdit') },
                    { path: 'create', name: 'ReservoirsNutrientsCreate', component: Reservoirs('NutrientsCreate') }
                ] 
            },
            { 
                path: 'wetlands', name: 'ReservoirsWetlands', component: Reservoirs('Wetlands'),
                children: [
                    { path: 'edit/:id', name: 'ReservoirsWetlandsEdit', component: Reservoirs('WetlandsEdit') },
                    { path: 'create', name: 'ReservoirsWetlandsCreate', component: Reservoirs('WetlandsCreate') }
                ] 
            },
            { 
                path: 'wetlands_hydrology', name: 'ReservoirsWetlandsHydrology', component: Reservoirs('WetlandsHydrology'),
                children: [
                    { path: 'edit/:id', name: 'ReservoirsWetlandsHydrologyEdit', component: Reservoirs('WetlandsHydrologyEdit') },
                    { path: 'create', name: 'ReservoirsWetlandsHydrologyCreate', component: Reservoirs('WetlandsHydrologyCreate') }
                ] 
            }
        ]
    },
    { 
        path: 'cons/recall', name: 'Recall', component: Recall('Recall'), 
        children: [
            { 
                path: 'edit/:id', name: 'RecallEdit', component: Recall('RecallEdit'),
                children: [
                    { path: 'edit/:dataId', name: 'RecallDataEdit', component: Recall('DataEdit') },
                    { path: 'create', name: 'RecallDataCreate', component: Recall('DataCreate') }
                ]
            },
            { path: 'create', name: 'RecallCreate', component: Recall('RecallCreate') }
        ] 					
    }
];