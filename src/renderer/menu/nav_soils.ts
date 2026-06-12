// src/renderer/menu/nav_soils.ts

import { useCurrentProject } from '@/store/currentProject';

export function getSoilsNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Soils', 
		routeName: 'Soils', 
		show: true,
		items: [
			{ name: 'Soils', path: '/edit/soils/soils', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Nutrients', path: '/edit/soils/soil-nutrients', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Soil Textures', path: '/edit/soils/soils-lte', show: currentProject.isLte, routeName: '', subItems: [] }
		]
	};
}