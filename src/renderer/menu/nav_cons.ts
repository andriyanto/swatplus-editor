// src/renderer/menu/nav_cons.ts

import { useCurrentProject } from '@/store/currentProject';

export function getConsNav() {
	// Panggil store di dalam fungsi agar terhubung dengan ekosistem Vue
	const currentProject = useCurrentProject();

	return {
		name: 'Connections', 
		routeName: 'Cons', 
		show: true,
		items: [
			{
				name: 'Channels', path: '/edit/cons/channels', show: true, routeName: 'Channels',
				subItems: [
					{ name: 'Initial', path: '/edit/cons/channels/initial', show: true, routeName: '', subItems: [] },
					{ name: 'Hydrology & Sediment', path: '/edit/cons/channels/hydsed', show: true, routeName: '', subItems: [] },
					{ name: 'Nutrients', path: '/edit/cons/channels/nutrients', show: true, routeName: '', subItems: [] }
				]
			},
			{ name: 'HRUs', path: '/edit/cons/hrus', show: !currentProject.isLte, routeName: '', subItems: [] },
			{ name: 'HRUs', path: '/edit/cons/hrus-lte', show: currentProject.isLte, routeName: '', subItems: [] },
			{
				name: 'Routing Units', path: '/edit/cons/routing-units', show: !currentProject.isLte, routeName: 'RoutingUnits',
				subItems: [
					{ name: 'Elements', path: '/edit/cons/routing-units/elements', show: true, routeName: '', subItems: [] }
				]
			},
			{
				name: 'Aquifers', path: '/edit/cons/aquifers', show: !currentProject.isLte, routeName: 'Aquifers',
				subItems: [
					{ name: 'Initial', path: '/edit/cons/aquifers/initial', show: true, routeName: '', subItems: [] }
				]
			},
			{
				name: 'Reservoirs', path: '/edit/cons/reservoirs', show: !currentProject.isLte, routeName: 'Reservoirs',
				subItems: [
					{ name: 'Reservoir Hydrology', path: '/edit/cons/reservoirs/hydrology', show: true, routeName: '', subItems: [] },
					{ name: 'Initial', path: '/edit/cons/reservoirs/initial', show: true, routeName: '', subItems: [] },
					{ name: 'Sediment', path: '/edit/cons/reservoirs/sediment', show: true, routeName: '', subItems: [] },
					{ name: 'Nutrients', path: '/edit/cons/reservoirs/nutrients', show: true, routeName: '', subItems: [] },
					{ name: 'Wetlands', path: '/edit/cons/reservoirs/wetlands', show: true, routeName: '', subItems: [] },
					{ name: 'Wetland Hydrology', path: '/edit/cons/reservoirs/wetlands_hydrology', show: true, routeName: '', subItems: [] }
				]
			},
			{ name: 'Point Sources / Inlets', path: '/edit/cons/recall', show: !currentProject.isLte, routeName: '', subItems: [] },
			{
				name: 'Groundwater Flow', path: '/edit/cons/gwflow', show: !currentProject.isLte, routeName: 'Gwflow',
				subItems: [
					{ name: 'Zones', path: '/edit/cons/gwflow/zones', show: true, routeName: '', subItems: [] },
					{ name: 'Grid Data', path: '/edit/cons/gwflow/grids', show: true, routeName: '', subItems: [] },
					{ name: 'Reservoirs', path: '/edit/cons/gwflow/rescell', show: true, routeName: '', subItems: [] },
					{ name: 'Floodplain', path: '/edit/cons/gwflow/fpcell', show: true, routeName: '', subItems: [] },
					{ name: 'Wetlands', path: '/edit/cons/gwflow/wetlands', show: true, routeName: '', subItems: [] },
					{ name: 'Solutes', path: '/edit/cons/gwflow/solutes', show: true, routeName: '', subItems: [] },
				]
			},
		]
	};
}