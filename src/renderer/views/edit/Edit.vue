<script setup lang="ts">
	import { reactive, watch, onMounted, computed } from 'vue';
	import { RouteRecordName, useRoute } from 'vue-router';
	import { useHelpers } from '@/helpers';
	import { useLangStore } from '@/store/lang';
	// import { useLayoutStore } from '@/store/layout';
	import { storeToRefs } from 'pinia';
	import { useEditNav, NavGroup, NavItem } from '@/menu/nav_edit'; 

	const langStore = useLangStore();
	const { t } = storeToRefs(langStore);
	// const layoutStore = useLayoutStore();
	// const { showNavDrawer } = storeToRefs(layoutStore);

	const route = useRoute();

	const nav = useEditNav();

	interface Page {
		loading: boolean,
		open: string[],
		subOpen: string[]
	}

	let page: Page = reactive({
		loading: false,
		open: route.name === 'Edit' ? ['Climate'] : [],
		subOpen: []
	});



	function shownNavItems(items: NavItem[]) {
		return items.filter((el: any) => { return el.show; })
	}

	function shownNavGroups(items: NavGroup[]) {
		return items.filter((el: any) => { return el.show; })
	}

	function handleMenuClick(targetPath: string) {
		if (route.path === targetPath && route.meta?.hideNavDrawer) {
			// layoutStore.setNavDrawer(false);
		}
	}


	function processSubOpen(thisRoute: RouteRecordName | null | undefined) {
		const routeStr = thisRoute?.toString() || "";
		page.open = []; 
		page.subOpen = [];

		nav.value.forEach(group => {
			// Cek apakah ada item di dalam grup ini yang cocok dengan rute aktif
			const isGroupActive = group.items.some(item => 
				(item.routeName && routeStr.includes(item.routeName)) ||
				item.subItems.some(sub => sub.routeName && routeStr.includes(sub.routeName))
			);

			if (isGroupActive) {
				page.open.push(group.routeName);
				
				// Cek sub-menu
				group.items.forEach(item => {
					if (item.routeName && routeStr.includes(item.routeName)) {
						if (item.subItems.length > 0) {
							page.subOpen.push(item.routeName);
						}
					}
				});
			}
		});
	}

	watch(() => route.name, (newRoute) => {
		processSubOpen(newRoute);
		// layoutStore.setNavDrawer(!(route.meta?.hideNavDrawer));
	});

	onMounted(() =>{
		processSubOpen(route.name);
		// layoutStore.setNavDrawer(!(route.meta?.hideNavDrawer));
	});
</script>

<template>
	<project-container :loading="page.loading" add-error-frame>
		
		<!-- <v-navigation-drawer v-model="showNavDrawer" id="secondary-nav"> -->
		<v-navigation-drawer  id="secondary-nav" permanent>
			<v-list v-model:opened="page.open" :lines="false" density="compact" nav>
				<v-list-group v-for="navGroup in shownNavGroups(nav)" :key="navGroup.name" :value="navGroup.routeName"
					expand-icon="fas fa-angle-left" collapse-icon="fas fa-angle-down" class="fa-2xs">
					<template #activator="{ props }">
						<v-list-item v-bind="props" :title="navGroup.name" color="primary"
							variant="tonal"></v-list-item>
					</template>
					
					<v-list-item v-for="navItem in shownNavItems(navGroup.items)" :key="navItem.name" :to="navItem.path"
						:title="navItem.name" color="secondary"
						:class="navItem.subItems.length > 0 && page.subOpen.includes(navItem.routeName) ? 'sub-open' : ''"
						@click="handleMenuClick(navItem.path)">
						
						<v-list v-if="navItem.subItems.length > 0 && page.subOpen.includes(navItem.routeName)" :lines="false" density="compact" nav>
							<template v-for="navSubItem in shownNavItems(navItem.subItems)" :key="navSubItem.name">
								
								<v-list-group v-if="navSubItem.subItems.length > 0" :value="navSubItem.routeName">
									<template #activator="{ props }">
										<v-list-item v-bind="props" :title="navSubItem.name" color="secondary"></v-list-item>
									</template>
									
									<v-list-item 
										v-for="child in shownNavItems(navSubItem.subItems)" 
										:key="child.name" 
										:to="child.path" 
										:title="child.name"
										@click="handleMenuClick(child.path)"
									></v-list-item>
								</v-list-group>

								<v-list-item v-else :to="navSubItem.path" :title="navSubItem.name" @click="handleMenuClick(navSubItem.path)"></v-list-item>
								
							</template>
						</v-list>

					</v-list-item>
				</v-list-group>
			</v-list>
		</v-navigation-drawer>
		
		<v-main class="layout-fix position-relative">
			<!-- <div v-if="!showNavDrawer" class="position-absolute" style="z-index: 999; top: 16px; left: 16px;">
				<v-btn
					icon="fas fa-bars"
					color="primary"
					variant="elevated"
					size="small"
					@click="layoutStore.setNavDrawer(true)"
					title="Show Edit Menu"
				></v-btn>
			</div> -->
			<div :class="route.path.includes('visualization_data') ? 'map-canvas' : 'default-content'">

				<div v-if="route.path == '/edit'">
					<h1 class="text-h5 mb-3 font-weight-bold tracking-tight judul">Edit SWAT+ inputs</h1>

					<p>
						{{ t.common.edit_p1 }}
					</p>

					<h2 class="text-h5 mb-3 mt-4 judul">Help</h2>
					<p>
						{{ t.common.edit_help_p1 }}
						<font-awesome-icon :icon="['fas', 'book']" /> yang dapat Anda klik
						{{ t.common.edit_help_p2 }}
							<br><br>
						{{ t.common.edit_help_p3 }} <router-link to="/help" class="text-primary"><font-awesome-icon
								:icon="['fas', 'question-circle']" /></router-link> {{ t.common.edit_help_p4 }}
					</p>

					<v-divider class="my-6"></v-divider>

					<p>
						{{ t.common.edit_footer_p1 }} <router-link to="/run"
							class="text-primary">{{t.common.run_swat_title}}</router-link>.
						{{ t.common.edit_footer_p2 }}
					</p>
				</div>

				<router-view></router-view>
			</div>
		</v-main>
	</project-container>
</template>

<style scoped>

.default-content {
    padding: 12px 24px; 
}

.layout-fix {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.map-canvas {
    flex: 1; /* Mengisi sisa ruang */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Penting! */
    min-height: 0;   /* Penting! */
}
</style>