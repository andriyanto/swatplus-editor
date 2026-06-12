// src/renderer/router/routes_lum.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
// Karena struktur Anda ada di 'lum/' dan 'lum/ops/', 
// kita bisa gunakan path relatif untuk mempermudah.
const Lum = (path: string) => () => import(`@/views/edit/lum/${path}.vue`);
const LumOps = (path: string) => () => import(`@/views/edit/lum/ops/${path}.vue`);

export const lumRoutes: RouteRecordRaw[] = [
    { path: 'lum/landuse', name: 'Landuse', component: Lum('Landuse'),
        children: [
            { path: 'edit/:id', name: 'LanduseEdit', component: Lum('LanduseEdit') },
            { path: 'create', name: 'LanduseCreate', component: Lum('LanduseCreate') }
        ]  
    },
    { path: 'lum/plant', name: 'PlantComm', component: Lum('PlantComm'),
        children: [
            { path: 'edit/:id', name: 'PlantCommEdit', component: Lum('PlantCommEdit') },
            { path: 'create', name: 'PlantCommCreate', component: Lum('PlantCommCreate') }
        ]
    },
    { path: 'lum/mgt', name: 'Management', component: Lum('Management'),
        children: [
            { path: 'edit/:id', name: 'ManagementEdit', component: Lum('ManagementEdit') },
            { path: 'create', name: 'ManagementCreate', component: Lum('ManagementCreate') }
        ]
    },
    { path: 'lum/ops', name: 'Operations', component: LumOps('Operations'),
        children: [
            { path: 'chemapp', name: 'OperationsChemApp', component: LumOps('ChemApp'),
                children: [
                    { path: 'edit/:id', name: 'OperationsChemAppEdit', component: LumOps('ChemAppEdit') },
                    { path: 'create', name: 'OperationsChemAppCreate', component: LumOps('ChemAppCreate') }
                ] 
            },
            { path: 'fire', name: 'OperationsFire', component: LumOps('Fire'),
                children: [
                    { path: 'edit/:id', name: 'OperationsFireEdit', component: LumOps('FireEdit') },
                    { path: 'create', name: 'OperationsFireCreate', component: LumOps('FireCreate') }
                ] 
            },
            { path: 'graze', name: 'OperationsGraze', component: LumOps('Graze'),
                children: [
                    { path: 'edit/:id', name: 'OperationsGrazeEdit', component: LumOps('GrazeEdit') },
                    { path: 'create', name: 'OperationsGrazeCreate', component: LumOps('GrazeCreate') }
                ] 
            },
            { path: 'harvest', name: 'OperationsHarvest', component: LumOps('Harvest'),
                children: [
                    { path: 'edit/:id', name: 'OperationsHarvestEdit', component: LumOps('HarvestEdit') },
                    { path: 'create', name: 'OperationsHarvestCreate', component: LumOps('HarvestCreate') }
                ] 
            },
            { path: 'irrigation', name: 'OperationsIrrigation', component: LumOps('Irrigation'),
                children: [
                    { path: 'edit/:id', name: 'OperationsIrrigationEdit', component: LumOps('IrrigationEdit') },
                    { path: 'create', name: 'OperationsIrrigationCreate', component: LumOps('IrrigationCreate') }
                ] 
            },
            { path: 'sweep', name: 'OperationsSweep', component: LumOps('Sweep'),
                children: [
                    { path: 'edit/:id', name: 'OperationsSweepEdit', component: LumOps('SweepEdit') },
                    { path: 'create', name: 'OperationsSweepCreate', component: LumOps('SweepCreate') }
                ] 
            }
        ]
    },
    { path: 'lum/cntable', name: 'Cntable', component: Lum('Cntable'),
        children: [
            { path: 'edit/:id', name: 'CntableEdit', component: Lum('CntableEdit') },
            { path: 'create', name: 'CntableCreate', component: Lum('CntableCreate') }
        ]   
    },
    { path: 'lum/ovntable', name: 'Ovntable', component: Lum('Ovntable'),
        children: [
            { path: 'edit/:id', name: 'OvntableEdit', component: Lum('OvntableEdit') },
            { path: 'create', name: 'OvntableCreate', component: Lum('OvntableCreate') }
        ] 
    },
    { path: 'lum/conspractice', name: 'ConsPractice', component: Lum('ConsPractice'),
        children: [
            { path: 'edit/:id', name: 'ConsPracticeEdit', component: Lum('ConsPracticeEdit') },
            { path: 'create', name: 'ConsPracticeCreate', component: Lum('ConsPracticeCreate') }
        ] 
    }
];