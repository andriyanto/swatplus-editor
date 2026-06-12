// src/renderer/menu/nav_climate.ts

export const climateNav = {
	name: 'Climate', 
	routeName: 'Climate', 
	show: true,
	items: [
		{ 
			name: 'Weather Generator', 
			path: '/edit/climate/wgn', 
			show: true, 
			routeName: '', 
			subItems: [] 
		},
		{
			name: 'Weather Stations', 
			path: '/edit/climate/stations', 
			show: true, 
			routeName: 'Stations',
			subItems: [
				{ 
					name: 'Atmospheric Deposition', 
					path: '/edit/climate/stations/atmo', 
					show: true, 
					routeName: '', 
					subItems: [] 
				}
			]
		}
	]
};