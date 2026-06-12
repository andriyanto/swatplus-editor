// src/renderer/menu/nav_vizdata.ts
export function getVizDataNav() {
    return {
        name: 'Visualization Data',
        routeName: 'viz', 
        show: true,
        items: [
            {
                name: 'Overview & Validation',
                path: '/edit/visualization_data/overview',
                show: true,
                routeName: 'vizOverview',
                subItems: [
                    { name: 'Health Check', path: '/edit/visualization_data/overview/health', show: true, routeName: '', subItems: [] },
                    { name: 'Summary Statistics', path: '/edit/visualization_data/overview/sum_statistics', show: true, routeName: '', subItems: [] }
                ]
            },
            {
                name: 'Spatial Analysis',
                path: '/edit/visualization_data/spatial',
                show: true,
                routeName: 'vizSpatial',
                subItems: [
                    { name: 'Thiesen Mapping', path: '/edit/visualization_data/spatial/thiesen', show: true, routeName: '', subItems: [] },
                    { name: 'Isohyet Mapping', path: '/edit/visualization_data/spatial/isohyet', show: true, routeName: '', subItems: [] }
                ]
            },
            {
                name: 'Frequency & Probability',
                path: '/edit/visualization_data/stats',
                show: true,
                routeName: 'vizStats',
                subItems: [
                    { name: 'Extreme Events', path: '/edit/visualization_data/stats/extreme_events', show: true, routeName: '', subItems: [] },
                    { 
                        name: 'Frequency Analysis', 
                        path: '/edit/visualization_data/stats/freqanal', 
                        show: true, 
                        routeName: 'vizStatsfreq', 
                        subItems: [
                            { name: 'Normal', path: '/edit/visualization_data/stats/freqanal/normal', show: true, routeName: '', subItems: [] },
                            { name: 'Log Normal', path: '/edit/visualization_data/stats/freqanal/lognormal', show: true, routeName: '', subItems: [] },
                            { name: 'Gumbel', path: '/edit/visualization_data/stats/freqanal/gumbel', show: true, routeName: '', subItems: [] },
                            { name: 'Log-Person III', path: '/edit/visualization_data/stats/freqanal/logperson3', show: true, routeName: '', subItems: [] }
                        ] 
                    },
                    { name: 'Return Period Calculator', path: '/edit/visualization_data/stats/calc_period', show: true, routeName: '', subItems: [] }
                ]
            },
            {
                name: 'Visualization',
                path: '/edit/visualization_data/visualization',
                show: true,
                routeName: 'vizVis',
                subItems: []
            },
            {
                name: 'Unit Hydrograph',
                path: '/edit/visualization_data/hydrograph',
                show: true,
                routeName: 'vizHyd',
                subItems: []
            }
        ]
    };
}