// src/renderer/menu/nav_basin.ts

export const basinNav = {
	name: 'Basin', 
    routeName: 'Basin', 
    show: true,
	items: [
		{ 
            name: 'Codes', 
            path: '/edit/basin/codes', 
            show: true, 
            routeName: '', 
            subItems: [] 
        },
		{ 
            name: 'Parameters', 
            path: '/edit/basin/parameters', 
            show: true, 
            routeName: '', 
            subItems: [] 
        }
	]
};