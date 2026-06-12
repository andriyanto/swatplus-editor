// src/renderer/menu/nav_databases.ts

import { useCurrentProject } from '@/store/currentProject';

export function getDatabasesNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Databases', 
		routeName: 'Db', 
		show: true,
		items: [
			{ name: 'Plants', path: '/edit/db/plants', show: true, routeName: '', subItems: [] },
			{ name: 'Fertilizer', path: '/edit/db/fertilizer', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Tillage', path: '/edit/db/tillage', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Pesticides', path: '/edit/db/pesticides', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Pathogens', path: '/edit/db/pathogens', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Urban', path: '/edit/db/urban', show: true, routeName: '', subItems: [] },
			{ name: 'Septic', path: '/edit/db/septic', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Snow', path: '/edit/db/snow', show: !currentProject.isLte, routeName: '', subItems: [] }
		]
	};
}