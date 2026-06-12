// src/renderer/menu/nav_calibration.ts

import { useCurrentProject } from '@/store/currentProject';

export function getCalibrationNav() {
	const currentProject = useCurrentProject();

	return {
		name: 'Calibration', 
		routeName: 'Change', 
		show: !currentProject.isLte, // <-- Bergantung pada isLte
		items: [
			{
				name: 'Hard Calibration', path: '/edit/change/hard', show: true, routeName: 'HardCalibration',
				subItems: [
					{ name: 'Parameters', path: '/edit/change/hard/parms', show: true, routeName: '', subItems: [] }
				]
			},
			{
				name: 'Soft Calibration', path: '/edit/change/soft', show: true, routeName: 'SoftCalibration',
				subItems: [
					{ name: 'Water Balance', path: '/edit/change/soft/wb', show: true, routeName: '', subItems: [] },
					{ name: 'Plant Growth', path: '/edit/change/soft/plant', show: true, routeName: '', subItems: [] }
				]
			}
		]
	};
}