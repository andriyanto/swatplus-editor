
<script setup lang="ts">
// NOTE: This file includes localization implementation using a reactive store.
// Structures may be adjusted to align with upcoming major model updates.


	import { reactive, onMounted, onUnmounted, watch, ref, computed } from 'vue';
	import { useRoute } from 'vue-router';
	import { useTheme, useDisplay } from 'vuetify';
	import { useHeaderStore } from '@/store/header';
	import { useHelpers } from '@/helpers';
	import {useTaskStore} from '@/store/task';
	import SwatPlusToolboxButton from '../components/SwatPlusToolboxButton.vue';
	import SwatPlusIahrisButton from '../components/SwatPlusIahrisButton.vue';
	import { ProjectSettings } from '@/typings';
	import { useLayerStore } from '@/store/layers';
	import { useLangStore } from '@/store/lang';
	import { storeToRefs } from 'pinia';


	const route = useRoute();
	const theme = useTheme();
	const { mobile } = useDisplay();
	const { api, constants, errors, formatters, currentProject, runProcess, utilities, appUpdate } = useHelpers();
	// const headerStore = useHeaderStore();
	const taskStore = useTaskStore();
	const { task } = storeToRefs(taskStore);

	const langStore = useLangStore();
	const { t } = storeToRefs(langStore);

	const localRules = computed(() => ({
		required: (value: string) => !formatters.isNullOrEmpty(value) || t.value.common.required
	}));


	const showSnackbar = ref(false);

	let page: any = reactive({
		error: null,
		loading: false,
		colorTheme: 'light',
		secondaryNav: !mobile.value,
		open: {
			loading: false,
			error: null,
			show: false,
			projectDb: null
		},
		edit: {
			saving: false,
			error: null,
			show: false,
			name: null,
			description: null
		},
		create: {
			loading: false,
			error: null,
			show: false,
			name: null,
			description: null,
			projectFolder: null,
			datasetsDb: utilities.getDatabaseInstallPath(),
			isLte: false
		},
		close: {
			show: false,
			removeFromRecent: false
		},
		import: {
			show: false,
			error: null,
			project: {
				projectDb: null,
				datasetsDb: null,
				name: null,
				description: null,
				version: null,
				isLte: false
			}
		},
		openConfirm: {
			show: false,
			error: null,
			project: {},
			reimportMessage: false
		},
		loadScenario: {
			show: false,
			error: null,
			running: false,
			scenario: {}
		},
		noProject: {
			show: false
		},
		update: {
			show: false,
			error: null,
			running: false
		},
		existingIsLte: false

	})


	const recentProjects = ref<any[]>([]);
	let versionSupport: any = reactive({})
	let loadTries = 0;

	let info: any = reactive({
		name: '',
		description: '',
		file_path: '',
		swat_exe_filename: '',
		last_modified: Date.now(),
		is_lte: false,
		status: {
			imported_weather: false,
			wrote_inputs: false,
			ran_swat: false,
			imported_output: false,
			using_gis: false
		},
		simulation: {},
		total_area: 0,
		totals: {},
		editor_version: '',
		gis_version: '',
		charts: {
			landuse: []
		},
		scenarios: []
	})

	let charts: any = reactive({
		landuse: {}
	})

	async function init() {
		if (task.value.running) return;
		getColorTheme();
		if (route.path === '/') {
			recentProjects.value = utilities.getRecentProjects();

			let commandLineDb = currentProject.hasLoadedCommandLine ? '' : constants.globals.project_db;
			if (!formatters.isNullOrEmpty(commandLineDb)) {
				page.loading = true;
				page.open.projectDb = commandLineDb;
				await openProject();
				page.loading = false;

			} else {
				let hasProject = currentProject.hasCurrentProject && utilities.pathExists(currentProject.projectDb || '');
				if (!hasProject) {
					let project = utilities.getMostRecentProject();
					if (project !== undefined && utilities.pathExists(project.projectDb)) {
						currentProject.setCurrentProject(project);
						hasProject = true;
					}
				}
				utilities.setWindowTitle();

				if (hasProject) {
					await getInfo();
				}
			}
		}
	}

	async function getInfo() {
		page.loading = true;
		page.error = null;

		try {
			const response = await api.get(`setup/info`, currentProject.getApiHeader());
			errors.log(response.data);
			info = response.data;
			charts.landuse = getPieChart(t.value.common.landuse_distribution, info.charts.landuse);
			versionSupport = utilities.getVersionSupport(currentProject.version || '');
		} catch (error) {
			errors.log(error);
		}

		page.loading = false;
	}

	async function getSwatVersionTitle(config_swat_exe_filename: string | null) {
		let v = `rev. ${constants.appSettings.swatplus}`;
		if (!formatters.isNullOrEmpty(config_swat_exe_filename)) {
			try {
				let exeOptions = await runProcess.getSwatExeOptions();
				if (exeOptions !== null && exeOptions.length > 0) {
					let exeOption = exeOptions.find((x: any) => x.fileName === config_swat_exe_filename);
					if (exeOption) v = exeOption.description.split('(')[0].trim();
				}
			} catch (error) {
				errors.log(error);
			}
		}
		return v;
	}

	async function openProject() {
		page.open.loading = true;
		page.open.error = null;

		try {
			const response = await api.get(`setup/config`, currentProject.getTempApiHeader(page.open.projectDb));
			let data = response.data; 


			let swatVersionTitle = await getSwatVersionTitle(data.swat_exe_filename);

			let project: ProjectSettings = {
				projectDb: page.open.projectDb,
				datasetsDb: data.reference_db,
				name: data.project_name,
				description:data.project_description,
				version: data.editor_version,
				isLte: data.is_lte,
				swatVersion: swatVersionTitle
			}

			if (formatters.isNullOrEmpty(data.gis_version)) {
				await loadProject(project);
			} else if (data.imported_gis) {
				page.openConfirm.project = project;
				page.openConfirm.show = true;
				page.existingIsLte = page.openConfirm.project.isLte;
			} else {
				project.version = constants.appSettings.version;
				page.import.project = project;
				page.import.show = true;
			}

			page.open.show = false;
			loadTries = 0;
		} catch (error) {
			if (loadTries < 10) {
				loadTries++;
				await sleep(2000);
				await openProject();
			} else {
				page.open.error = errors.logError(error, 'Unable to get project information from database.');
				loadTries = 0;
			}
		}

		page.open.loading = false;
	}

	async function confirmOpen() {
		page.openConfirm.show = false;
		await loadProject(page.openConfirm.project);
	}

	async function loadProject(project: ProjectSettings) {
		if (utilities.pathExists(project.projectDb || '')) {
			currentProject.setCurrentProject(project);
			utilities.pushRecentProject(project);
			recentProjects.value = utilities.getRecentProjects();
			utilities.setWindowTitle();
			versionSupport = utilities.getVersionSupport(project.version || '');
			await getInfo();
			currentProject.setHasLoadedCommandLine(true);
		} else {
			page.noProject.show = true;
		}
	}


	function getPieChart(title: string, data: any, seriesLabel = 'Area') {
		return {
			chart: { styledMode: true },
			plotOptions: { pie: { dataLabels: { enabled: false }, showInLegend: true } },
			title: { text: title },
			tooltip: { pointFormat: '{series.name}: <b>{point.percentage:,.1f}% ({point.y:,.1f} ha)</b>' },
			series: [{ data: data, name: seriesLabel, type: 'pie' }]
		};
	}

	function removeProject(project: ProjectSettings) {
		const layerStore = useLayerStore()

		layerStore.clearAll();
		const mapLayers = document.querySelectorAll('.leaflet-pane');

		if (currentProject.projectDb === project.projectDb) {

			page.close.removeFromRecent = true;
			page.close.show = true;
		} else {
		
			utilities.deleteRecentProject(project);
			recentProjects.value = utilities.getRecentProjects();

		}
	}

	function closeCurrentProject() {
		if (page.close.removeFromRecent) {
			utilities.deleteRecentProject(currentProject.getObject());
			recentProjects.value = utilities.getRecentProjects();
		}

		currentProject.setCurrentProject({
			projectDb: null,
			datasetsDb: null,
			name: null,
			version: null,
			isLte: false
		});
		versionSupport = {};
		page.close.show = false;
	}

	function openEditProject() {
		page.edit.name = currentProject.name;
		page.edit.description = currentProject.description;
		page.edit.show = true;
	}

	async function editProject() {
		page.edit.saving = true;
		page.edit.error = null;

		if (formatters.isNullOrEmpty(page.edit.name)) {
			page.edit.error = 'Please enter a name for your project.';
		} else {
			try {
				let data = {
					'name': formatters.toValidName(page.edit.name),
					'description': formatters.toValidName(page.edit.description)
				};

				const response = await api.put(`setup/config`, data, currentProject.getApiHeader());
				errors.log(response.data);
				currentProject.name = data.name;
				currentProject.description = data.description;
				page.edit.show = false;
				await loadProject(currentProject.getObject());
			} catch (error) {
				page.edit.error = errors.logError(error, 'Unable to save changes.');
			}
		}

		page.edit.saving = false;
	}

	function createProject() {
		page.create.error = null;

		if (formatters.isNullOrEmpty(page.create.name))
			page.create.error = 'Please enter a name for your project.';
		else if (formatters.isNullOrEmpty(page.create.projectFolder))
			page.create.error = 'Please select a project folder.';
		else if (formatters.isNullOrEmpty(page.create.datasetsDb))
			page.create.error = 'Please select a datasets SQLite file.';
		else {

			taskStore.task.running = true; 
			taskStore.task.progress = { percent: 0, message: 'Menyiapkan database proyek baru...' };

			let fileName = formatters.toValidFileName(page.create.name).toLowerCase();
			let project = {
				projectDb: utilities.joinPaths([page.create.projectFolder, fileName + '.sqlite']),
				datasetsDb: page.create.datasetsDb,
				name: formatters.toValidName(page.create.name),
				description: formatters.toValidName(page.create.description),
				version: constants.appSettings.version,
				isLte: page.create.isLte,
				swatVersion: `rev. ${constants.appSettings.swatplus}`
			};
			let lte = project.isLte ? 'y' : 'n';

			let args = [
				'setup_project',
				'--project_db_file=' + project.projectDb,
				'--datasets_db_file=' + project.datasetsDb,
				'--project_name=' + project.name,
				'--editor_version=' + constants.appSettings.version,
				'--is_lte=' + lte,
				'--project_description=' + project.description,
				'--copy_datasets_db=y'
			];

			taskStore.runTask(args, {
				proc_name: 'setup', 
				script_name: 'swatplus_api',
				project: project,
				isGridTask: false,
				routePath: route.path
			}, () => {

				taskStore.task.running = false; 
				page.create.show = false;      
				
				loadProject(project); 
			});
		}
	}

	function importProject() {
		page.import.error = null;

		if (formatters.isNullOrEmpty(page.import.project.name)) {
			page.import.error = 'Please give your project a name in the text box below.';
		} else {
			let project = page.import.project;
			let lte = project.isLte ? 'y' : 'n';

			let args = [
				'setup_project',
				'--project_db_file=' + project.projectDb,
				'--project_name=' + formatters.toValidName(project.name),
				'--editor_version=' + constants.appSettings.version,
				'--is_lte=' + lte,
				'--project_description=' + formatters.toValidName(project.description)
			];

			taskStore.runTask(args, {
				proc_name: 'setup',           
				script_name: 'swatplus_api',  
				project: project,
				isGridTask: false,            
				routePath: route.path
			});
		}
	}

	async function reimportGis() {
		page.open.projectDb = currentProject.projectDb;
		page.openConfirm.reimportMessage = true;
		await openProject();
	}

	function reImportProject() {
		let project = page.openConfirm.project;
		let lte = project.isLte ? 'y' : 'n';
		page.update.running = true;

		let args = [
			'reimport_gis',
			'--project_db_file=' + project.projectDb,
			'--project_name=' + project.name,
			'--editor_version=' + constants.appSettings.version,
			'--is_lte=' + lte
		];

		taskStore.runTask(args, {
				proc_name: 'setup',           
				script_name: 'swatplus_api',  
				project: project,
				isGridTask: false,            
				routePath: route.path
			}, async () => {
				console.log("Task re-import selesai, menutup modal...");
				closeTaskModals();
				console.log("Task selesai, memuat:", project.name);

				await confirmOpen();
				task.value.running = false;
				page.update.running = false;

			});

	}

	function updateProject() {
		page.update.error = null;
		page.update.show = true;
		page.update.running = true;

		let args = [
			'update_project',
			'--project_db_file=' + currentProject.projectDb,
			'--editor_version=' + constants.appSettings.version,
			'--update_project_values=n',
			'--reimport_gis=n'
		];

		taskStore.runTask(args, {
			proc_name: 'update',         
			script_name: 'swatplus_api',  
			project: currentProject.getObject(),
			isGridTask: false, 
			routePath: route.path
		});
	}

	function askLoadScenario(scenario: any) {
		page.loadScenario.scenario = scenario;
		page.loadScenario.show = true;
	}

	function loadScenario() {
		page.loadScenario.error = null;
		page.loadScenario.running = true;

		let args = [
			'load_scenario',
			'--project_db_file=' + currentProject.projectDb,
			'--project_name=' + page.loadScenario.scenario.name
		];

		taskStore.runTask(args, {
			proc_name: 'update',         
			script_name: 'swatplus_api', 
			project: currentProject.getObject(),
			isGridTask: false, 
			routePath: route.path
		});
	}

	let listeners: any = {
		appUpdateStatus: undefined,
	}

	function initRunProcessHandlers() {
		errors.log('Adding run process handlers');

		listeners.appUpdateStatus = runProcess.appUpdateStatus((stdData: any) => {
			console.log(`Update status received: ${stdData}`);
			let status: any = runProcess.getApiOutput(stdData);
			appUpdate.setStatus(status.message, status.isAvailable);
		});
	}

	function removeRunProcessHandlers() {
		errors.log('Removing run process handlers');
		if (listeners.appUpdateStatus) listeners.appUpdateStatus();
	}

	function cancelTask() {
		taskStore.cancelTask();
		closeTaskModals();
	}

	function closeTaskModals() {
		page.import.show = false;
		page.loadScenario.show = false;
		page.loadScenario.running = false;
		page.create.show = false;
		page.openConfirm.show = false;
		page.update.show = false;
	}

	//Color theme

	function getColorTheme(): void {
		let colorTheme = localStorage.getItem('colorTheme');
		if (colorTheme === null) colorTheme = utilities.getColorTheme();
		setColorTheme(colorTheme);
	}

	function setColorTheme(colorTheme: string | null): void {
		if (colorTheme === null || colorTheme === 'system') colorTheme = 'light';
		page.colorTheme = colorTheme;
		theme.change(colorTheme);
		utilities.setColorTheme(colorTheme);
		localStorage.setItem('colorTheme', colorTheme);
	}

	function toggleColorTheme(): void {
		if (page.colorTheme === 'light') setColorTheme('dark');
		else setColorTheme('light');
	}

	function runConverterTask(args: string[], project: any): Promise<void> {
		
		taskStore.cleanupListeners();
		
		return new Promise((resolve, reject) => {
			taskStore.runTask(args, {
				proc_name: 'setup',
				script_name: 'actions/shpgeojson',
				project: project,
				routePath: route.path
			}, () => {
			
				if (taskStore.task.error) {
					reject(taskStore.task.error);
				} else {
					resolve(); 
				}
			});
		});
	}

	async function convertShapesToGeoJson() {

		task.value.running = true;
		task.value.error = null;
		task.value.progress = { percent: 0, message: 'Converting Shp to GeoJson...' };
		
		try {
			const outputFolder = (window.electronApi as any).joinPaths([currentProject.projectPath, 'geojson_data']);
			const inputFolders = [
				(window.electronApi as any).joinPaths([currentProject.projectPath, 'Watershed', 'Shapes']),
				(window.electronApi as any).joinPaths([currentProject.projectPath, 'Scenarios', 'Default', 'Results'])
			];

			for (const shapesFolder of inputFolders) {
				const args = [
					'bulk_sync_geojson', 
					'shapes_dir=' + shapesFolder,
					'output_dir=' + outputFolder
				];
				
				await runConverterTask(args, currentProject.getObject());
			}
			
		} catch (error) {
			console.error("Error konversi:", error);
			alert("Terjadi kesalahan: " + error);
		} finally {
			task.value.running = false;
			showSnackbar.value = true;
		}
	}


	//Lifecycle hooks

	onMounted(async () => {


		initRunProcessHandlers();
		await init();

	});
	onUnmounted(() => removeRunProcessHandlers());

	watch(
		() => route.name,
		async () => await init()
	)
	
	watch(() => t.value.common.landuse_distribution, () => {
		charts.landuse = getPieChart(t.value.common.landuse_distribution, info.charts.landuse);
	});

	async function sleep(ms: number | undefined) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
</script>


<template>
	<div>
		<v-navigation-drawer rail permanent>
			<div class="px-2">
				<v-tooltip location="end" text="Expand menu">
					<template v-slot:activator="{ props }">
						<v-app-bar-nav-icon v-bind="props"
							v-if="mobile && route.path === '/' && formatters.isNullOrEmpty(page.error) && currentProject.hasCurrentProject"
							rounded="0" variant="text"
							@click.stop="page.secondaryNav = !page.secondaryNav"></v-app-bar-nav-icon>
					</template>
				</v-tooltip>
			</div>
			<v-list density="compact" nav>
				<v-list-item prepend-icon="fas fa-folder-open" to="/" :active="route.path === '/'">
					<v-tooltip activator="parent" location="end">{{t.common.project_setup_information}}</v-tooltip>
				</v-list-item>
				<v-list-item prepend-icon="fas fa-pencil-alt" to="/edit">
					<v-tooltip activator="parent" location="end">{{t.common.edit_swat_input}}</v-tooltip>
				</v-list-item>
				<v-list-item prepend-icon="fas fa-play" to="/run">
					<v-tooltip activator="parent" location="end">{{t.common.run_swat_title}}</v-tooltip>
				</v-list-item>
				<v-list-item prepend-icon="fas fa-check" to="/check">
					<v-tooltip activator="parent" location="end">{{t.common.swat_output_check}}</v-tooltip>
				</v-list-item>
				<v-list-item prepend-icon="fas fa-map" to="/map" :active="route.path === '/map'">
        			<v-tooltip activator="parent" location="end">Peta Lokasi</v-tooltip>
    			</v-list-item>
			</v-list>

			<template #append>
				<v-list density="compact" nav>
					<v-list-item class="pointer">
						<template v-slot:prepend>
							<v-icon>fas fa-globe</v-icon>
						</template>
						<v-menu activator="parent" location="end">
							<v-list density="compact">
								<v-list-item @click="langStore.setLanguage('en')">English</v-list-item>
								<v-list-item @click="langStore.setLanguage('id')">Bahasa Indonesia</v-list-item>
								<v-list-item @click="langStore.setLanguage('nl')">Deutsch</v-list-item>
								<v-list-item @click="langStore.setLanguage('ru')">Русский язык</v-list-item>
							</v-list>
						</v-menu>
						<v-tooltip activator="parent" location="end">{{t.common.change_language}}</v-tooltip>
					</v-list-item>
					<v-list-item prepend-icon="fas fa-circle-info" v-if="currentProject.hasCurrentProject"
						class="pointer">
						<v-menu activator="parent" location="end" open-on-hover>
							<v-list density="compact">
								<v-list-subheader>SWAT+ Editor {{ constants.appSettings.version }}</v-list-subheader>
								<v-list-item>{{ currentProject.name }}</v-list-item>
								<v-list-item><open-file :file-path="info.file_path"
										class="text-primary text-decoration-none">{{t.common.open_project_dir_label}}</open-file></v-list-item>
							</v-list>
						</v-menu>
					</v-list-item>
					<v-list-item prepend-icon="fas fa-circle-question" to="/help">
						<v-tooltip activator="parent" location="end">{{t.help.help}}</v-tooltip>
					</v-list-item>
					<v-list-item v-if="appUpdate.isAvailable" to="/update">
						<template v-slot:prepend>
							<v-badge :content="1" color="error"><v-icon>fas fa-bell</v-icon></v-badge>
						</template>
						<v-tooltip activator="parent" location="end">{{t.setup.info_setup10}}</v-tooltip>
					</v-list-item>
					<v-list-item :prepend-icon="page.colorTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon'"
						@click="toggleColorTheme">
						<v-tooltip activator="parent" location="end">{{t.common.changeTheme}}</v-tooltip>
					</v-list-item>
				</v-list>
			</template>
		</v-navigation-drawer>

		<div v-if="route.path === '/'">
			<v-main v-if="page.loading" class="layout-fix">
				<page-loading :loading="page.loading"></page-loading>
			</v-main>
			<v-main v-else-if="!formatters.isNullOrEmpty(page.error)" class="layout-fix">
				<div class="py-3 px-6">
					<h1>SWAT+ Editor {{ constants.appSettings.version }}</h1>
					<v-alert color="info" icon="$info">
						<template #text>
							<p>{{t.common.encountered_err}} {{ page.error }}</p>
							<p>
								{{t.setup.checkSWAT}}
							</p>
							<v-btn @click="getInfo" :loading="page.loading">{{t.common.reload_swat_editor}}</v-btn>
						</template>
					</v-alert>
				</div>
			</v-main>
			<div v-else-if="!currentProject.hasCurrentProject">
				<v-main class="layout-fix">
					<div class="py-3 px-6">
						<v-sheet elevation="2" max-width="800" rounded="pill" width="100%"
							class="my-4 pa-4 text-center mx-auto">
							<h2 class="text-h5 mb-6">{{ langStore.t.common.welcome }} SWAT+ Editor {{ constants.appSettings.version }}
							</h2>

							<p class="mb-4 text-medium-emphasis">
								<open-in-browser
									url="https://github.com/swat-model/swatplus-editor/blob/main/changelog.md"
									:text="langStore.t.common.read_notes" />
									{{ langStore.t.common.to_learn }}
							</p>

							<div v-if="recentProjects.length > 0" class="my-5">
								<h2 class="text-h6 text-center">{{ langStore.t.common.currentProject }}</h2>
								<ul class="plain-border">
									<li v-for="(project, i) in recentProjects" :key="i" class="d-flex">
										<a href="#" :title="project.projectDb"
											:class="project.projectDb === currentProject.projectDb ? 'font-italic text-primary' : 'text-primary'"
											@click.prevent="loadProject(project)">{{ project.name }}</a>
										<a class="ml-auto text-medium icon" href="#"
											@click.prevent="removeProject(project)"
											:title="t.common.remove_recent_project_title.replace('{name}', project.name)">
											<font-awesome-icon :icon="['fas', 'times']" /></a>
									</li>
								</ul>
							</div>

							<div>
								<v-btn class="text-none mr-2" color="primary" rounded variant="flat"
									@click="page.open.show = true">{{t.common.btn_open_project}}</v-btn>
								<v-btn class="text-none" color="secondary" rounded variant="tonal"
									@click="page.create.show = true">{{t.common.btn_create_new_project}}</v-btn>
							</div>
						</v-sheet>
					</div>
				</v-main>
			</div>
			<div v-else class="layout-fix">
				<v-navigation-drawer v-model="page.secondaryNav" id="secondary-nav">
					<div class="pa-3">
						<h1 class="mb-2 text-h6">SWAT+ Editor {{ constants.appSettings.version }}</h1>
						<p class="mb-5">
							<open-in-browser class="text-primary" url="https://swatplus.gitbook.io/docs/release-notes"
								:text="langStore.t.common.read_notes" />
							{{ langStore.t.common.to_learn }}
						</p>

						<div class="mb-7">
							<v-btn variant="flat" color="primary" block @click="page.open.show = true" class="mb-2">{{t.common.btn_open_another_project}}</v-btn>
							<v-btn variant="tonal" color="primary" block @click="page.create.show = true">{{t.common.btn_create_new_project}}</v-btn>
						</div>

						<div v-if="recentProjects.length > 0" class="mt-4">
							<h2 class="mb-2 text-h6">{{ langStore.t.common.currentProject}}</h2>
							<ul class="plain-border text-body-2">
								<li v-for="(project, i) in recentProjects" :key="i" class="d-flex">
									<a href="#" :title="project.projectDb"
										:class="project.projectDb === currentProject.projectDb ? 'font-italic text-primary' : 'text-primary'"
										@click.prevent="loadProject(project)">{{ project.name }}</a>
									<a class="ml-auto text-medium icon" href="#" @click.prevent="removeProject(project)"
										:title="t.common.remove_project_title.replace('{name}', project.name)">
										<font-awesome-icon :icon="['fas', 'times']" /></a>
								</li>
							</ul>
						</div>
					</div>
				</v-navigation-drawer>

				<v-main class="layout-fix">
					<div class="py-3 px-6">
						<v-card class="mb-6">
							<v-card-title>{{ currentProject.name }}</v-card-title>
							<v-card-subtitle v-if="!formatters.isNullOrEmpty(currentProject.description)">{{
								formatters.toReadable(currentProject.description || '') }}</v-card-subtitle>
							<v-card-actions>
								<open-file button :file-path="info.file_path" variant="text" size="small"
									icon="fas fa-folder-open"></open-file>
								<v-btn v-if="versionSupport.supported" @click="openEditProject" variant="text"
									size="small" icon="fas fa-pen-to-square" :title="t.common.change_name_description"></v-btn>
								<v-spacer></v-spacer>
								<open-file button :file-path="info.file_path" variant="text" size="small"
									color="surface-variant"><code style="text-transform: none !important;">{{ info.file_path
									}}</code></open-file>
							</v-card-actions>
						</v-card>

						<v-alert type="error" v-if="!formatters.isNullOrEmpty(versionSupport.error)" class="mb-6">
							{{ versionSupport.error }}
						</v-alert>

						<div v-if="versionSupport.supported">
							<v-row v-if="info.status.imported_weather || info.status.wrote_inputs">
								<v-col :md="info.scenarios.length > 0 ? 6 : 12" cols="12">
									<v-card>
										<v-list density="compact">
											<v-list-subheader class="text-uppercase">{{t.common.project_status_title}}</v-list-subheader>
											<v-list-item to="/edit/climate/stations">
												<template #prepend>
													<v-icon
														:color="info.status.imported_weather ? 'success' : 'plain'">{{
															info.status.imported_weather ? 'fas fa-check' : 'fas fa-minus'
														}}</v-icon>
												</template>
												{{t.setup.info_setup1}}
											</v-list-item>
											<v-list-item to="/run" value="inputs-run">
												<template #prepend>
													<v-icon :color="info.status.wrote_inputs ? 'success' : 'plain'">{{
														info.status.wrote_inputs ? 'fas fa-check' : 'fas fa-minus'
													}}</v-icon>
												</template>
												{{t.setup.info_setup2}}
											</v-list-item>
											<v-list-item to="/run" value="model-run">
												<template #prepend>
													<v-icon :color="info.status.ran_swat ? 'success' : 'plain'">{{
														info.status.ran_swat ? 'fas fa-check' : 'fas fa-minus'
													}}</v-icon>
												</template>
												{{t.common.run_swat_title}}
											</v-list-item>
											<v-list-item to="/run" value="output-run">
												<template #prepend>
													<v-icon
														:color="info.status.imported_output ? 'success' : 'plain'">{{
															info.status.imported_output ? 'fas fa-check' : 'fas fa-minus'
														}}</v-icon>
												</template>
												{{t.setup.info_setup3}}
											</v-list-item>
										</v-list>
									</v-card>
								</v-col>
								<v-col v-if="info.scenarios.length > 0" md="6">
									<v-card>
										<v-list density="compact">
											<v-list-subheader class="text-uppercase">{{t.common.saved_scenario_label}}</v-list-subheader>
											<v-list-item v-for="(s, i) in info.scenarios" :key="i"
												@click="askLoadScenario(s)">{{ s.name }}</v-list-item>
										</v-list>
									</v-card>
								</v-col>
							</v-row>

							<h2 class="mt-6 mb-4 font-weight-bold tracking-tight">{{t.setup.info_setup4}}</h2>

							<v-row>
								<v-col cols="12" md="6">
									<v-card>
										<v-table>
											<tbody>
												<tr>
													<th>{{ t.setup.info_setup5 }}</th>
													<td>{{ formatters.toNumberFormat(info.total_area, 2) }} ha</td>
												</tr>
												<tr>
													<th>{{t.setup.info_setup6}}</th>
													<td>
														{{ info.simulation.yrc_start }}
														{{ info.simulation.day_start > 0 ? 'day ' + info.simulation.day_start : '' }}
														-
														{{ info.simulation.yrc_end }}
														{{ info.simulation.day_end > 0 ? 'day ' + info.simulation.day_end : '' }}
													</td>
												</tr>
											</tbody>
										</v-table>
									</v-card>
								</v-col>
								<v-col cols="12" md="6">
									<v-card>
										<v-table>
											<tbody>
												<tr>
													<th>{{t.setup.info_setup8}}</th>
													<td>SWAT+ Editor {{ info.editor_version }}<span
															v-if="info.status.using_gis">,
															{{ info.gis_version }}</span></td>
												</tr>
												<tr>
													<th>{{t.setup.info_setup9}}</th>
													<td>{{ formatters.toDate(info.last_modified) }}</td>
												</tr>
											</tbody>
										</v-table>
									</v-card>
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12" md="6">
									<v-card>
										<v-card-subtitle class="text-uppercase mt-3">{{ t.setup.info_setup7 }}</v-card-subtitle>
										<v-table density="comfortable" class="mt-1 mb-11">
											<tbody>
												<tr v-if="info.status.using_gis">
													<td class="text-right min">{{ info.totals.subs }}</td>
													<td>Subbasins</td>
												</tr>
												<tr v-if="info.totals.lhru > 0">
													<td class="text-right min">{{ info.totals.lhru }}</td>
													<td><router-link class="text-primary"
															to="/edit/cons/hrus-lte">HRUs</router-link></td>
												</tr>
												<tr v-else>
													<td class="text-right min">{{ info.totals.hru }}</td>
													<td><router-link class="text-primary"
															to="/edit/cons/hrus">HRUs</router-link></td>
												</tr>
												<tr>
													<td class="text-right min">{{ info.totals.cha > 0 ? info.totals.cha: info.totals.lcha }}</td>
													<td><router-link class="text-primary"
															to="/edit/cons/channels">Channels</router-link></td>
												</tr>
												<tr v-if="!info.is_lte">
													<td class="text-right min">{{ info.totals.aqu }}</td>
													<td><router-link class="text-primary"
															to="/edit/cons/aquifers">Aquifers</router-link></td>
												</tr>
												<tr v-if="!info.is_lte">
													<td class="text-right min">{{ info.totals.res }}</td>
													<td><router-link class="text-primary"
															to="/edit/cons/reservoirs">Reservoirs</router-link></td>
												</tr>
												<tr v-if="!info.is_lte">
													<td class="text-right min">{{ info.totals.rtu }}</td>
													<td><router-link class="text-primary"
															to="/edit/cons/routing-units">Routing
															Units</router-link></td>
												</tr>
												<tr>
													<td class="text-right min">{{ info.totals.lsus }}</td>
													<td><router-link class="text-primary"
															to="/edit/regions/ls_units">Landscape
															Units</router-link></td>
												</tr>
												<tr v-if="!info.is_lte">
													<td class="text-right min">{{ info.totals.rec }}</td>
													<td><router-link class="text-primary" to="/edit/cons/recall">Point
															Sources /
															Inlets</router-link></td>
												</tr>
											</tbody>
										</v-table>
									</v-card>
								</v-col>
								<v-col cols="12" md="6">
									<v-card>
										<v-card-text class="py-4 highcharts-dashboards-dark">
											<highcharts :options="charts.landuse"></highcharts>
										</v-card-text>
									</v-card>
								</v-col>
							</v-row>
						</div>
						<v-card v-else-if="versionSupport.updatable">
							<v-card-item>
								<p class="mt-3">
									{{ t.setup.updateIntro1}}
									<open-in-browser url="https://swatplus.gitbook.io/docs/installation"
										text="install a compatible earlier version" class="text-primary" />.
								</p>
								<p>
									{{t.setup.updateIntro2}} <open-in-browser
										url="https://swatplus.gitbook.io/docs/release-notes"
										text="read our full release notes" class="text-primary" />
									{{t.setup.updateIntro3}} <strong>{{t.setup.updateIntro4}}</strong> {{t.setup.updateIntro5}}
								</p>
								<p>
									<v-btn @click="updateProject" variant="flat" color="primary" size="large">
										{{t.common.btn_update_project}}
									</v-btn>
								</p>
							</v-card-item>
						</v-card>
					</div>

					<v-dialog v-model="task.running" :max-width="400" persistent>
						<v-card class="pa-5 text-center">
							<v-card-title class="mb-2">{{t.common.onProcess}}</v-card-title>
							<v-card-text>
								<v-progress-circular
									indeterminate
									color="primary"
									size="64"
									class="mb-4"
								></v-progress-circular>

								<p class="font-weight-bold">{{ task.progress.message }}</p>
								<v-progress-linear 
									:model-value="task.progress.percent" 
									color="primary" 
									height="10" 
									rounded
									striped
									class="mt-3"
								></v-progress-linear>
							</v-card-text>
						</v-card>
					</v-dialog>

					<v-bottom-navigation id="action-bar" elevation="0" border="t" grow>

						<v-btn v-if="versionSupport.supported && info.status.imported_weather && !mobile" :loading="task.running" :disabled="task.running" @click="convertShapesToGeoJson"
							:active="false">
							<v-icon>fas fa-sync</v-icon> {{ t.common.btn_export_geojson }}
						</v-btn>


						<v-btn v-if="versionSupport.supported && info.status.imported_weather && !mobile" to="/run"
							:active="false">
							<v-icon>fas fa-play</v-icon> {{ t.common.btn_run_model }}
						</v-btn>
						<v-btn v-else-if="versionSupport.supported && !mobile" to="/edit" :active="false">
							<v-icon>fas fa-pencil-alt</v-icon> {{t.common.get_started}}
						</v-btn>
						<v-btn v-else-if="versionSupport.updatable" @click="updateProject" :active="false">
							<v-icon>fas fa-circle-up</v-icon> {{t.common.btn_update_project}}
						</v-btn>


						<swat-plus-toolbox-button v-if="versionSupport.supported && !info.is_lte" text="SWAT+ Toolbox"
							:ran-swat="info.status.wrote_inputs"></swat-plus-toolbox-button>
						<swat-plus-iahris-button v-if="versionSupport.supported && !info.is_lte" text="SWAT+ IAHRIS"
							:ran-swat="info.status.ran_swat"></swat-plus-iahris-button>

						<v-btn v-if="versionSupport.supported" @click="openEditProject" :active="false">
							<v-icon>fas fa-pen-to-square</v-icon> {{t.common.btn_change_name}}
						</v-btn>
						<v-btn v-if="versionSupport.supported && info.status.using_gis" @click="reimportGis"
							:active="false">
							<v-icon>fas fa-globe</v-icon> {{t.common.btn_reimportGIS}}
						</v-btn>
						<v-btn @click="page.close.removeFromRecent = false; page.close.show = true" :active="false">
							<v-icon>fas fa-circle-xmark</v-icon> {{ t.common.btn_close_project }}
						</v-btn>
						<v-btn v-if="!mobile" @click="utilities.exit" :active="false">
							<v-icon>fas fa-arrow-right-from-bracket</v-icon> {{ t.common.btn_quit }}
						</v-btn>
					</v-bottom-navigation>
				</v-main>
			</div>

			<v-dialog v-model="page.open.show" :max-width="constants.dialogSizes.md">
				<v-card :title="t.common.open_project_title">
					<v-card-text>
						<select-file-input v-model="page.open.projectDb" :value="page.open.projectDb"
							:label="t.common.select_gis_sql_database" file-type="sqlite" required
							:invalid-feedback="t.common.warn_select_sql_database"></select-file-input>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn :loading="page.open.loading" @click="openProject" color="primary"
							variant="text">{{t.common.btn_open}}</v-btn>
						<v-btn @click="page.open.show = false">{{t.common.btn_cancel}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.close.show" :max-width="constants.dialogSizes.md">
				<v-card :title="t.common.current_project_close_title">
					<v-card-text>
						<p>
							{{t.common.current_project_close_ask}} <strong>{{ currentProject.name }}</strong>. {{t.common.sure_confirm}}
						</p>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn @click="closeCurrentProject" color="primary" variant="text">{{t.common.btn_yes}}</v-btn>
						<v-btn @click="page.close.show = false">{{t.common.btn_no}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.edit.show" :max-width="constants.dialogSizes.md">
				<v-card :title="t.setup.info_setup11">
					<v-card-text>
						<error-alert :text="page.edit.error"></error-alert>

						<v-text-field v-model="page.edit.name" :rules="[localRules.required]"
							:label="t.common.project_display_name_label"></v-text-field>

						<v-text-field v-model="page.edit.description"
							:rules="[constants.formRules.max(25, page.edit.description)]"
							:label="t.setup.BrieflyLabel"
							:hint="t.common.char_info_limit"></v-text-field>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn @click="editProject" :loading="page.edit.saving" color="primary"
							variant="text">Save</v-btn>
						<v-btn @click="page.edit.show = false">{{t.common.btn_cancel}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.import.show" :max-width="constants.dialogSizes.md" persistent>
				<v-card title="Start SWAT+ Editor Project from QSWAT+">
					<v-card-text>
						<error-alert :text="page.open.error"></error-alert>
						<error-alert :text="page.import.error"></error-alert>
						<stack-trace-error v-if="!formatters.isNullOrEmpty(task.error)"
							:error-title="t.common.err_import_gis"
							:stack-trace="task.error ? task.error.toString() : ''" />

						<div v-if="task.running">
							<v-progress-linear :model-value="task.progress.percent" color="primary" height="15"
								striped></v-progress-linear>
							<p>
								{{ task.progress.message }}
							</p>
						</div>
						<div v-else-if="formatters.isNullOrEmpty(task.error)">
							<p>
								{{t.setup.starProjIntro1}}
							</p>

							<v-form>
								<v-text-field v-model="page.import.project.name" :rules="[localRules.required]"
									:label="t.common.project_display_name_label"></v-text-field>

								<v-text-field v-model="page.import.project.description"
									:rules="[constants.formRules.max(25, page.edit.description)]"
									:label="t.setup.BrieflyLabel"
									:hint="t.common.char_info_limit"></v-text-field>

								<v-checkbox v-if="false" v-model="page.import.project.isLte" class="mt-4">
									<template #label>
										{{t.setup.starProjIntro2}}
									</template>
								</v-checkbox>
							</v-form>
						</div>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn v-if="formatters.isNullOrEmpty(task.error)" :loading="task.running"
							@click="importProject" color="primary" variant="text">{{t.common.btn_start}}</v-btn>
						<v-btn @click="cancelTask">{{ t.common.btn_cancel }}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.loadScenario.show" :max-width="constants.dialogSizes.md" persistent>
				<v-card :title="t.common.load_scenario_label">
					<v-card-text>
						<error-alert :text="page.loadScenario.error"></error-alert>
						<stack-trace-error v-if="!formatters.isNullOrEmpty(task.error)"
							:error-title="t.common.err_loading_scenario"
							:stack-trace="task.error ? task.error.toString() : ''" />

						<div v-if="task.running">
							<v-progress-linear :model-value="task.progress.percent" color="primary" height="15"
								striped></v-progress-linear>
							<p>
								{{ task.progress.message }}
							</p>
						</div>
						<div v-else-if="formatters.isNullOrEmpty(task.error)">
							<p>
								{{ t.setup.loadScenIntro1 }},
								<strong>{{ page.loadScenario.scenario.name }}</strong>?
								{{t.setup.loadScenIntro2}} <strong class="text-error">{{t.setup.loadScenIntro3}}</strong>{{ t.setup.loadScenIntro4 }} <router-link to="/run"
									class="text-primary">run
									model screen</router-link>.
							</p>
							<p>
								<strong class="text-error">{{t.common.warn_label}}</strong> {{t.setup.loadScenIntro5}}
							</p>
						</div>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn v-if="formatters.isNullOrEmpty(task.error)" :loading="task.running" @click="loadScenario"
							color="primary" variant="text">{{t.common.load_scenario_label}}</v-btn>
						<v-btn @click="cancelTask">{{t.common.btn_cancel}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.create.show" :max-width="constants.dialogSizes.lg" persistent>
				<v-card title="Create a New SWAT+ Editor Project">
					<v-card-text>
						<stack-trace-error v-if="!formatters.isNullOrEmpty(task.error)"
							:error-title="t.common.err_creating_project"
							:stack-trace="task.error ? task.error.toString() : ''" />

						<div v-if="task.running">
							<v-progress-linear :model-value="task.progress.percent" color="primary" height="15"
								striped></v-progress-linear>
							<p>
								{{ task.progress.message }}
							</p>
						</div>
						<div v-else-if="formatters.isNullOrEmpty(task.error)">
							<p>
								{{t.setup.createProjintro1}} <open-in-browser url="https://swat.tamu.edu/software/plus/"
									text="visit our website" />.
							</p>
							<p>
								{{t.setup.createProjintro2}}
							</p>

							<error-alert :text="page.create.error"></error-alert>

							<v-form>
								<v-text-field v-model="page.create.name" :rules="[localRules.required]"
									class="mb-3" :label="t.common.project_display_name_label"></v-text-field>

								<v-text-field v-model="page.create.description"
									:rules="[constants.formRules.max(25, page.edit.description)]" class="mb-3"
									:label="t.setup.BrieflyLabel"
									:hint="t.common.char_info_limit"></v-text-field>

								<select-folder-input v-model="page.create.projectFolder"
									:value="page.create.projectFolder" class="mb-3" :label="t.common.select_project_folder"
									:hint="t.common.char_info_limit"
									persistent-hint required
									:invalidFeedback="t.common.please_select_folder"></select-folder-input>

								<select-file-input v-model="page.create.datasetsDb" :value="page.create.datasetsDb"
									class="mb-3" :label="t.common.select_swat_dataset"
									:hint="t.common.copy_project_folder_above" persistent-hint
									fileType="sqlite" required
									:invalidFeedback="t.common.warn_select_sql_database"></select-file-input>

								<v-checkbox v-if="false" v-model="page.create.isLte" class="mt-4">
									<template #label>
										{{t.setup.askSWATlte}}
									</template>
								</v-checkbox>
							</v-form>
						</div>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn v-if="formatters.isNullOrEmpty(task.error)"
							:loading="page.create.loading || task.running" @click="createProject" color="primary"
							variant="text">{{t.common.btn_create}}</v-btn>
						<v-btn @click="cancelTask">{{t.common.btn_cancel}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.openConfirm.show" :max-width="constants.dialogSizes.md" persistent>
				<v-card :title="t.common.ask_watershed_change">
					<v-card-text>
						<stack-trace-error v-if="!formatters.isNullOrEmpty(task.error)"
							:error-title="t.common.err_reimport_gis_data"
							:stack-trace="task.error ? task.error.toString() : ''" />

						<div v-if="task.running">
							<v-progress-linear :model-value="task.progress.percent" color="primary" height="15"
								striped></v-progress-linear>
							<p>
								{{ task.progress.message }}
							</p>
						</div>
						<div v-else-if="formatters.isNullOrEmpty(task.error)">
							<p v-if="!page.openConfirm.reimportMessage">
								{{t.setup.askStep1}}
							</p>
							<p v-else>
								{{t.setup.askStep2}}
							</p>

							<v-checkbox v-if="page.existingIsLte" v-model="page.openConfirm.project.isLte" class="mt-4">
								<template #label>
									{{t.setup.askSWATlte}}
								</template>
							</v-checkbox>
						</div>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn @click="confirmOpen" color="primary" variant="text">{{t.common.continue_editor_no}}</v-btn>
						<v-btn v-if="formatters.isNullOrEmpty(task.error)" :loading="task.running"
							@click="reImportProject" color="primary" variant="text">{{t.common.imported_new_watershed_yes}}</v-btn>
						<v-btn v-if="task.running || !formatters.isNullOrEmpty(task.error)"
							@click="cancelTask">{{t.common.btn_cancel}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.update.show" :max-width="constants.dialogSizes.md" persistent>
				<v-card :title="t.common.updating_project_label">
					<v-card-text>
						<error-alert :text="page.update.error"></error-alert>
						<stack-trace-error v-if="!formatters.isNullOrEmpty(task.error)"
							:error-title="t.common.warn_updating_project_err"
							:stack-trace="task.error ? task.error.toString() : ''" />

						<div v-if="task.running">
							<v-progress-linear :model-value="task.progress.percent" color="primary" height="15"
								striped></v-progress-linear>
							<p>
								{{ task.progress.message }}
							</p>
						</div>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn @click="cancelTask">{{t.common.btn_cancel}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<v-dialog v-model="page.noProject.show" :max-width="constants.dialogSizes.md">
				<v-card :title="t.common.warn_project_nofound">
					<v-card-text>
						<p>
							{{t.setup.lossProject}}
						</p>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn @click="page.noProject.show = false">OK</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		
		</div>
		<div>
			<v-snackbar v-model="showSnackbar" timeout="2000" :color="theme.current.value.dark ? 'green-darken-3' : 'green-lighten-1'" location="bottom left"  border="rounded">
			{{t.common.finishProcess}}
				<template v-slot:actions>
					<v-btn variant="text" @click="showSnackbar = false">{{t.common.btn_close}}</v-btn>
				</template>
			</v-snackbar>
		</div>	
		<router-view></router-view>
	</div>

</template>
