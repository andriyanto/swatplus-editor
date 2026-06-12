// src/renderer/menu/nav_structural.ts

import { useCurrentProject } from '@/store/currentProject';

export function getStructuralNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Structural', 
		routeName: 'Structural', 
		show: !currentProject.isLte, // <-- Bergantung pada isLte
		items: [
			{ name: 'Tile Drains', path: '/edit/structural/tiledrain', show: true, routeName: '', subItems: [] },
			{ name: 'Septic Systems', path: '/edit/structural/septic', show: true, routeName: '', subItems: [] },
			{ name: 'Filter Strips', path: '/edit/structural/filterstrip', show: true, routeName: '', subItems: [] },
			{ name: 'Grassed Waterways', path: '/edit/structural/grassedww', show: true, routeName: '', subItems: [] },
			{ name: 'User BMPs', path: '/edit/structural/bmpuser', show: true, routeName: '', subItems: [] }
		]
	};
}