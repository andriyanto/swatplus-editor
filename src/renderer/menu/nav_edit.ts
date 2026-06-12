// src/renderer/menu/nav_edit.ts
import { computed } from 'vue';

// Import fungsi-fungsi menu yang sudah kita buat sebelumnya
import { climateNav } from '@/menu/nav_climate';
import { getVizDataNav } from '@/menu/nav_vizdata';
import { getConsNav } from '@/menu/nav_cons';
import { basinNav } from '@/menu/nav_basin';
import { regionsNav } from '@/menu/nav_regions';
import { getLumNav } from '@/menu/nav_lus_management';
import { getDtlNav } from '@/menu/nav_dec_tables';
import { getCalibrationNav } from '@/menu/nav_calibration';
import { getConstituentsNav } from '@/menu/nav_constituents';
import { getHydrologyNav } from '@/menu/nav_hydrology';
import { getSoilsNav } from '@/menu/nav_soils';
import { getDatabasesNav } from '@/menu/nav_databases';
import { getStructuralNav } from '@/menu/nav_structural';

// Definisi Interface agar Type-checking tetap aman
export interface NavItem {
    name: string, path: string, show: boolean, routeName: string, subItems: NavItem[]
}

export interface NavGroup {
    name: string, routeName: string, show: boolean, items: NavItem[]
}

export function useEditNav() {
    // Kita gunakan computed agar menu otomatis ter-update 
    // jika currentProject.isLte berubah
    const navList = computed<NavGroup[]>(() => [
        climateNav as NavGroup,
        getVizDataNav(),
        getConsNav(),
        basinNav as NavGroup,
        regionsNav as NavGroup,
        getLumNav(),
        getDtlNav(),
        getCalibrationNav(),
        getConstituentsNav(),
        getHydrologyNav(),
        getSoilsNav(),
        getDatabasesNav(),
        getStructuralNav()
    ]);

    return navList;
}