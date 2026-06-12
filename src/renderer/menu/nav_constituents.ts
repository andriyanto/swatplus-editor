// src/renderer/menu/nav_constituents.ts

import { useCurrentProject } from '@/store/currentProject';

export function getConstituentsNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Constituents', 
		routeName: 'Constituents', 
		show: true,
		items: [
			{ name: 'Soil Plant', path: '/edit/constituents/soil_plant', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Organic Mineral', path: '/edit/constituents/om_water', show: true, routeName: '', subItems: [] },
			{ name: 'Pesticides', path: '/edit/constituents/pest', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'Pathogens', path: '/edit/constituents/path', show: !currentProject.isLte, routeName: '', subItems: [] },
			{
				name: 'Salts', path: '/edit/constituents/salts', show: !currentProject.isLte, routeName: 'Salts',
				subItems: [
					{ name: 'Point Sources', path: '/edit/constituents/salts/recall', show: true, routeName: '', subItems: [] },
					{ name: 'Atmospheric Deposition', path: '/edit/constituents/salts/atmo', show: true, routeName: '', subItems: [] },
					{ name: 'Road Salt', path: '/edit/constituents/salts/road', show: true, routeName: '', subItems: [] },
					{ name: 'Fertilizer & Soil Amendments', path: '/edit/constituents/salts/fert', show: true, routeName: '', subItems: [] },
					{ name: 'Urban Runoff', path: '/edit/constituents/salts/urban', show: true, routeName: '', subItems: [] },
					{ name: 'Plant Influence', path: '/edit/constituents/salts/plants', show: true, routeName: '', subItems: [] },
					{ name: 'Aquifer Initial Conditions', path: '/edit/constituents/salts/aqu', show: true, routeName: '', subItems: [] },
					{ name: 'Channel Initial Conditions', path: '/edit/constituents/salts/cha', show: true, routeName: '', subItems: [] },
					{ name: 'Reservoir Initial Conditions', path: '/edit/constituents/salts/res', show: true, routeName: '', subItems: [] },
					{ name: 'HRU Initial Conditions', path: '/edit/constituents/salts/hru', show: true, routeName: '', subItems: [] },
					{ name: 'Irrigation', path: '/edit/constituents/salts/irr', show: true, routeName: '', subItems: [] }
				]
			}
		]
	};
}