// src/renderer/router/routes_constituents.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
// Mengikuti struktur folder: constituents/ dan constituents/salts/
const Constituents = (path: string) => () => import(`@/views/edit/constituents/${path}.vue`);
const Salts = (path: string) => () => import(`@/views/edit/constituents/salts/${path}.vue`);

export const constituentsRoutes: RouteRecordRaw[] = [
    { 
        path: 'constituents/soil_plant', name: 'ConstituentsSoilPlant', component: Constituents('SoilPlant'), 
        children: [
            { path: 'edit/:id', name: 'ConstituentsSoilPlantEdit', component: Constituents('SoilPlantEdit') },
            { path: 'create', name: 'ConstituentsSoilPlantCreate', component: Constituents('SoilPlantCreate') }
        ]
    },
    { 
        path: 'constituents/om_water', name: 'ConstituentsOMWater', component: Constituents('OMWater'), 
        children: [
            { path: 'edit/:id', name: 'ConstituentsOMWaterEdit', component: Constituents('OMWaterEdit') },
            { path: 'create', name: 'ConstituentsOMWaterCreate', component: Constituents('OMWaterCreate') }
        ] 
    },
    { path: 'constituents/pest', name: 'ConstituentsPesticides', component: Constituents('Pesticides') },
    { path: 'constituents/path', name: 'ConstituentsPathogens', component: Constituents('Pathogens') },
    { 
        path: 'constituents/salts', name: 'ConstituentsSalts', component: Salts('Salts'),
        children: [
            { 
                path: 'recall', name: 'ConstituentsSaltsRecall', component: Salts('SaltsRecall'),
                children: [
                    { 
                        path: 'edit/:id', name: 'ConstituentsSaltsRecallEdit', component: Salts('SaltsRecallEdit'),
                        children: [
                            { path: 'edit/:dataId', name: 'ConstituentsSaltsRecallDataEdit', component: Salts('SaltsRecallDataEdit') },
                            { path: 'create', name: 'ConstituentsSaltsRecallDataCreate', component: Salts('SaltsRecallDataCreate') }
                        ]
                    },
                    { path: 'create', name: 'ConstituentsSaltsRecallCreate', component: Salts('SaltsRecallCreate') }
                ] 
            },
            { path: 'atmo', name: 'ConstituentsSaltsAtmo', component: Salts('SaltsAtmo'),
                children: [{ path: 'edit/:id', name: 'ConstituentsSaltsAtmoEdit', component: Salts('SaltsAtmoEdit') }] 
            },
            { path: 'road', name: 'ConstituentsSaltsRoad', component: Salts('SaltsRoad'),
                children: [{ path: 'edit/:id', name: 'ConstituentsSaltsRoadEdit', component: Salts('SaltsRoadEdit') }] 
            },
            { path: 'fert', name: 'ConstituentsSaltsFert', component: Salts('SaltsFert'),
                children: [{ path: 'edit/:id', name: 'ConstituentsSaltsFertEdit', component: Salts('SaltsFertEdit') }] 
            },
            { path: 'urban', name: 'ConstituentsSaltsUrban', component: Salts('SaltsUrban'),
                children: [{ path: 'edit/:id', name: 'ConstituentsSaltsUrbanEdit', component: Salts('SaltsUrbanEdit') }] 
            },
            { path: 'plants', name: 'ConstituentsSaltsPlants', component: Salts('SaltsPlants'),
                children: [{ path: 'edit/:id', name: 'ConstituentsSaltsPlantsEdit', component: Salts('SaltsPlantsEdit') }] 
            },
            { path: 'aqu', name: 'ConstituentsSaltsAquIni', component: Salts('SaltsAquIni'),
                children: [
                    { path: 'edit/:id', name: 'ConstituentsSaltsAquIniEdit', component: Salts('SaltsAquIniEdit') },
                    { path: 'create', name: 'ConstituentsSaltsAquIniCreate', component: Salts('SaltsAquIniCreate') }
                ] 
            },
            { path: 'cha', name: 'ConstituentsSaltsChannelIni', component: Salts('SaltsChannelIni'),
                children: [
                    { path: 'edit/:id', name: 'ConstituentsSaltsChannelIniEdit', component: Salts('SaltsChannelIniEdit') },
                    { path: 'create', name: 'ConstituentsSaltsChannelIniCreate', component: Salts('SaltsChannelIniCreate') }
                ] 
            },
            { path: 'res', name: 'ConstituentsSaltsResIni', component: Salts('SaltsResIni'),
                children: [
                    { path: 'edit/:id', name: 'ConstituentsSaltsResIniEdit', component: Salts('SaltsResIniEdit') },
                    { path: 'create', name: 'ConstituentsSaltsResIniCreate', component: Salts('SaltsResIniCreate') }
                ] 
            },
            { path: 'hru', name: 'ConstituentsSaltsHruIni', component: Salts('SaltsHruIni'),
                children: [
                    { path: 'edit/:id', name: 'ConstituentsSaltsHruIniEdit', component: Salts('SaltsHruIniEdit') },
                    { path: 'create', name: 'ConstituentsSaltsHruIniCreate', component: Salts('SaltsHruIniCreate') }
                ] 
            },
            { path: 'irr', name: 'ConstituentsSaltsIrrigation', component: Salts('SaltsIrrigation'),
                children: [{ path: 'edit/:id', name: 'ConstituentsSaltsIrrigationEdit', component: Salts('SaltsIrrigationEdit') }] 
            }
        ]
    }
];