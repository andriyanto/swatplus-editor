// src/renderer/menu/nav_dec_tables.ts

import { useCurrentProject } from '@/store/currentProject';

export function getDtlNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Decision Tables', 
		routeName: 'Dtl', 
		show: true,
		items: [
			{ name: 'Land Use Management', path: '/edit/decision-table/lum', show: true, routeName: '', subItems: [] },
			{ name: 'Reservoir Release', path: '/edit/decision-table/res_rel', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Scenario Land Use', path: '/edit/decision-table/scen_lu', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Flow Conditions', path: '/edit/decision-table/flo_con', show: !currentProject.isLte, routeName: '', subItems: [] }
		]
	};
}