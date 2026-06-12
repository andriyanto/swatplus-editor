// src/renderer/menu/nav_lus_management.ts

import { useCurrentProject } from '@/store/currentProject';

export function getLumNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Land Use Management', 
		routeName: 'Lum', 
		show: !currentProject.isLte, // <-- Deteksi isLte di sini
		items: [
			{ name: 'Land Use Management', path: '/edit/lum/landuse', show: true, routeName: '', subItems: [] },
			{ name: 'Plant Communities', path: '/edit/lum/plant', show: true, routeName: '', subItems: [] },
			{ name: 'Management Schedules', path: '/edit/lum/mgt', show: true, routeName: '', subItems: [] },
			{
				name: 'Operations Databases', path: '/edit/lum/ops', show: true, routeName: 'Operations',
				subItems: [
					{ name: 'Harvest', path: '/edit/lum/ops/harvest', show: true, routeName: '', subItems: [] },
					{ name: 'Graze', path: '/edit/lum/ops/graze', show: true, routeName: '', subItems: [] },
					{ name: 'Irrigation', path: '/edit/lum/ops/irrigation', show: true, routeName: '', subItems: [] },
					{ name: 'Chemical Applications', path: '/edit/lum/ops/chemapp', show: true, routeName: '', subItems: [] },
					{ name: 'Fire', path: '/edit/lum/ops/fire', show: true, routeName: '', subItems: [] },
					{ name: 'Sweep', path: '/edit/lum/ops/sweep', show: true, routeName: '', subItems: [] }
				]
			},
			{ name: 'Curve Numbers', path: '/edit/lum/cntable', show: true, routeName: '', subItems: [] },
			{ name: 'Conservation Practices', path: '/edit/lum/conspractice', show: true, routeName: '', subItems: [] },
			{ name: `Manning's n`, path: '/edit/lum/ovntable', show: true, routeName: '', subItems: [] }
		]
	};
}