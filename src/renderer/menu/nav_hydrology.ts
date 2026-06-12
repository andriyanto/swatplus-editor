// src/renderer/menu/nav_hydrology.ts

import { useCurrentProject } from '@/store/currentProject';

export function getHydrologyNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Hydrology', 
		routeName: 'Hydrology', 
		show: !currentProject.isLte, // <-- Membaca status proyek
		items: [
			{ name: 'Hydrology', path: '/edit/hydrology/hydrology', show: true, routeName: '', subItems: [] },
			{ name: 'Topography', path: '/edit/hydrology/topography', show: true, routeName: '', subItems: [] },
			{ name: 'Fields', path: '/edit/hydrology/fields', show: true, routeName: '', subItems: [] }
		]
	};
}