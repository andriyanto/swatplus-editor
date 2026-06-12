import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', {
	state: () => ({
		showNavDrawer: true,
	}),
	actions: {
		toggleNavDrawer() {
			this.showNavDrawer = !this.showNavDrawer;
		},
		setNavDrawer(status: boolean) {
			this.showNavDrawer = status;
		}
	}
});