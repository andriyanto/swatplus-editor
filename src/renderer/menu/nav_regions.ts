// src/renderer/menu/nav_regions.ts

export const regionsNav = {
	name: 'Regions', 
	routeName: 'Regions', 
	show: true,
	items: [
		{
			name: 'Landscape Units', 
			path: '/edit/regions/ls_units', 
			show: true, 
			routeName: 'LandscapeUnits',
			subItems: [
				{ 
					name: 'Elements', 
					path: '/edit/regions/ls_units/elements', 
					show: true, 
					routeName: '', 
					subItems: [] 
				}
			]
		}
	]
};