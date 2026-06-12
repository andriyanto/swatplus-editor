// src/renderer/router/routes_calibration.ts
import { RouteRecordRaw } from 'vue-router';

// Fungsi helper untuk lazy loading
// Mengikuti struktur folder Anda: hard/ dan soft/
const CalibHard = (path: string) => () => import(`@/views/edit/change/hard/${path}.vue`);
const CalibSoft = (path: string) => () => import(`@/views/edit/change/soft/${path}.vue`);

export const calibrationRoutes: RouteRecordRaw[] = [
    { 
        path: 'change/hard', 
        name: 'HardCalibration', 
        component: CalibHard('Calibration'),
        children: [
            { path: 'edit/:id', name: 'HardCalibrationEdit', component: CalibHard('CalibrationEdit') },
            { path: 'create', name: 'HardCalibrationCreate', component: CalibHard('CalibrationCreate') },
            { 
                path: 'parms', 
                name: 'HardCalibrationParms', 
                component: CalibHard('CalParms'),
                children: [
                    { path: 'edit/:id', name: 'HardCalibrationParmsEdit', component: CalibHard('CalParmsEdit') }
                ]  
            },
        ]  
    },
    {
        path: 'change/soft', 
        name: 'SoftCalibration', 
        component: CalibSoft('Calibration'),
        children: [
            { path: 'wb', name: 'SoftCalibrationWaterBalance', component: CalibSoft('WaterBalance') },
            { path: 'plant', name: 'SoftCalibrationPlantGrowth', component: CalibSoft('PlantGrowth') }
        ]
    }
];