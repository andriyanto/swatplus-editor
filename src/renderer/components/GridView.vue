<script setup lang="ts">
	import { reactive, onMounted, onUnmounted, computed, watch, nextTick, ref } from 'vue';
	import { useRoute } from 'vue-router';
	import { useDisplay } from 'vuetify';
	import { storeToRefs } from 'pinia';
	import {useTaskStore} from '@/store/task';
	// @ts-ignore
	import _ from 'underscore';
	import { useHelpers } from '@/helpers';
	import { GridViewHeader } from '@/typings';
	import GrafikIklim from './GrafikIklim.vue';

	import { useLangStore } from '@/store/lang';
	// import { useLayoutStore } from '@/store/layout';



	const route = useRoute();
	const { height } = useDisplay();
	const { api, constants, currentProject, errors, formatters, runProcess, utilities } = useHelpers();
	const taskStore = useTaskStore();
	const { task } = storeToRefs(taskStore);

	const langStore = useLangStore();
	const { t } = storeToRefs(langStore);

	// const layoutStore = useLayoutStore();


	const tableHeight = computed(() => {
		if (props.customHeight) return props.customHeight;
		const h = Math.floor(height.value / 50) * 50;

		if (h < 700) return '60vh';
		if (h < 850) return '70vh';
		if (h < 1050) return '75vh';
		return '78vh';
	})

	const emit = defineEmits(['change', 'update:selected', 'row-clicked'])

	const chart = reactive({ show: false, filePath: '', fileName: '', fileType: '' });


	interface Props {
		apiUrl: string,
		deleteApiUrl?: string | null
		headers?: GridViewHeader[],
		useDynamicHeaders?: boolean,
		noActionBar?: boolean,
		inCard?: boolean, 
		fullWidthActionBar?: boolean,
		fullestWidthActionBar?: boolean,
		hideSummary?: boolean,
		hideFilter?: boolean,
		hideCreate?: boolean,
		hideEdit?: boolean,
		hideDelete?: boolean,
		itemsPerPage?: number,
		defaultSort?: [string | null,string], 
		hideFields?: string[],
		showImportExport?: boolean,
		defaultCsvFile?: string,
		tableName?: string,
		importExportRelatedId?: number|null,
		importExportDescription?: string,
		importExportNotes?: string,
		importExportDeleteExisting?: boolean,
		importPrimaryKey?: string,
		autoHeight?: boolean,
		editPathPrefix?: string,
		hideBackButton?: boolean,
		showDeleteAll?: boolean,

		customHeight?: string,
		selectable? : boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		apiUrl: '',
		deleteApiUrl: null,
		headers: () => <GridViewHeader[]>[],
		useDynamicHeaders: false,
		noActionBar: false,
		inCard: false,
		fullWidthActionBar: false,
		fullestWidthActionBar: false,
		hideSummary: false,
		hideFilter: false,
		hideCreate: false,
		hideEdit: false,
		hideDelete: false,
		itemsPerPage: 50,
		defaultSort: () => [null, 'asc'],
		hideFields: () => ['id'],
		showImportExport: false,
		defaultCsvFile: '',
		tableName: '',
		importExportRelatedId: null,
		importExportDescription: 'CSV',
		importExportNotes: '',
		importExportDeleteExisting: false,
		importPrimaryKey: '',
		autoHeight: false,
		editPathPrefix: '',
		hideBackButton: false,
		showDeleteAll: false,

		customHeight: '',
		selectable : false
	});

	const loaderArray = computed(() => {
		let arr:number[] = [];
		for(let i = 0; i < props.itemsPerPage; i++) {
			arr.push(i);
		}
		return arr;
	});

	const showFirst = computed(() => {
		if (data.total < 1) return 0;
		return (table.page-1) * table.itemsPerPage + 1
	});

	const showLast = computed(() => {
		var max = (table.page-1) * table.itemsPerPage + table.itemsPerPage
		return max > data.matches ? data.matches : max;
	});

	const headerCount = computed(() => {
		let c = table.headers.length;
		if (!props.hideEdit) c++;
		if (!props.hideDelete) c++;
		return c;
	})

	let page:any = reactive({
		loading: false,
		error: null,
		delete: {
			show: false,
			id: null,
			name: '',
			error: null,
			saving: false
		},
		deleteAll: {
			show: false,
			error: null,
			saving: false
		},
		import: {
			form: {
				fileName: null,
				type: 'export_csv'
			},
			options: {
				types: [
					{ text: 'Import', value: 'import_csv' },
					{ text: 'Export', value: 'export_csv' }
				]
			},
			show: false,
			saving: false,
			error: null
		},
		exported: {
			show: false
		}
	});
	const initialSort = computed(() => {
		if (props.defaultSort[0] === null && props.headers.length > 0) {
			return [props.headers[0].key, props.defaultSort[1]];
		}
		return props.defaultSort;
	});
	let table:any = reactive({
		loading: false,
		error: null,
		itemsPerPage: props.itemsPerPage,
		page: 1,
		sortBy: initialSort,
		headers: props.headers,
		filter: null
	});

	let data:any = reactive({
		total: 0,
		matches: 0,
		items: []
	});

const activeRowId = ref<any>(null);

function onRowClick(item: any) {
	activeRowId.value = item[itemPk.value]; // Memperbarui ID agar :class bekerja
	emit('row-clicked', item); 
}


async function get(init = false) {
	table.loading = true;
	table.error = null;

	try {
		let qPage = table.page;
		let qSort = '';
		let qRev = 'n';
		let qPerPage = table.itemsPerPage;

		if (table.sortBy && table.sortBy.length >= 2) {
            qSort = table.sortBy[0];
            qRev = table.sortBy[1] === 'desc' ? 'y' : 'n';
        } else if (props.headers.length > 0) {
            // Fallback: Jika sortBy kosong, paksa pakai header pertama
            qSort = props.headers[0].key;
        }

		let filter = !props.hideFilter && table.filter !== null ? `&filter=${encodeURIComponent(table.filter)}` : '';

		let query = `?sort=${qSort}&reverse=${qRev}&page=${qPage}&per_page=${qPerPage}${filter}`;
		
		const response = await api.get(`${props.apiUrl}${query}`, currentProject.getApiHeader());
		errors.log(response.data);
		data.total = response.data.total;
		data.matches = response.data.matches;
		data.items = response.data.items;
		// emit('change', data.total);
		emit('change', { total: data.total, items: data.items });

		await nextTick();

		if (init) {
			getDynamicHeaders();
		}
	} catch (error) {
		errors.log(error);
	}
	setTimeout(() => {
	table.loading = false;
	}, 50);

	}


	function selectRow(id: any) {
    activeRowId.value = id;
}


	defineExpose({
		get,
    selectRow
	});


	function getDynamicHeaders() {
		if (props.useDynamicHeaders && data.items.length > 0) {
			let item = data.items[0];
			let keys = Object.keys(item);

			for (let key of keys) {
				if (!props.hideFields.includes(key) && !Array.isArray(item[key])) {
					let header:GridViewHeader = <GridViewHeader>{
						key: key,
						type: item[key] == null ? 'string' : typeof(item[key]),
						decimals: typeof(item[key]) == 'number' ? 2 : 0,
						class: typeof(item[key]) == 'number' ? 'text-right' : ''
					};
					
					if (key == 'name') table.headers.unshift(header);
					else table.headers.push(header);
				}
			}
		}
	}

	async function doSort(newSortByKey:string) {
		let dir = table.sortBy[1] === 'asc' ? 'desc' : 'asc';
		table.sortBy = [newSortByKey, dir];
		await get(false);
	}

	function openFile(item: any, header: any) {
		const fileValue = item[header.key];


		let fileName = (fileValue && typeof fileValue === 'object' && 'name' in fileValue) 
			? fileValue.name 
			: fileValue;


		if (typeof fileName !== 'string') {
			console.warn('Data bukan string, tidak bisa dibuka:', fileValue);
			return;
		}


		const parts = fileName.split('.');
		const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : 'unknown';

		console.log('File diklik:', fileName, '| Detected Type:', extension);

		chart.filePath = `${header.filePath}\\${fileName}`;
		chart.fileName = fileName;
		chart.fileType = extension || 'unknown'; 
		chart.show = true;
	}

	function getNumPages() {
		return Math.ceil(data.total / table.itemsPerPage);
	}

	async function filterChange() {
		table.page = 1;
		_.debounce(await get(false), 500);
	}

	function askDelete(id:any, name:any) {
		page.delete.id = id;
		page.delete.name = name;
		page.delete.show = true;
	}

	async function confirmDelete() {
		page.delete.errors = [];
		page.delete.saving = true;

		try {
			let url = formatters.isNullOrEmpty(props.deleteApiUrl) ? props.apiUrl : props.deleteApiUrl;
			const response = await api.delete(`${url}/${page.delete.id}`, currentProject.getApiHeader());
			errors.log(response);
			page.delete.show = false;
			table.currentPage = 1;
			await get(false);
		} catch (error) {
			page.delete.error = errors.logError(error, 'Unable to delete from database.');
		}

		page.delete.saving = false;
	}

	async function confirmDeleteAll() {
		page.deleteAll.errors = [];
		page.deleteAll.saving = true;

		try {
			let url = formatters.isNullOrEmpty(props.deleteApiUrl) ? props.apiUrl : props.deleteApiUrl;
			const response = await api.delete(`${url}`, currentProject.getApiHeader());
			errors.log(response);
			page.deleteAll.show = false;
			table.currentPage = 1;
			await get(false);
		} catch (error) {
			page.deleteAll.error = errors.logError(error, 'Unable to delete from database.');
		}

		page.deleteAll.saving = false;
	}

	function importData() {
		page.import.error = null;
		page.import.saving = true; 

		if (formatters.isNullOrEmpty(page.import.form.fileName)) {
			page.import.error = 'Please select a file below.';
			page.import.saving = false; 
		} else {
			let args = [
				page.import.form.type, 
				'--db_file=' + currentProject.projectDb,
				'--file_name=' + page.import.form.fileName,
				'--table_name=' + props.tableName
			];

			if (!formatters.isNullOrEmpty(props.importExportRelatedId)) args.push('--related_id=' + props.importExportRelatedId);
			if (props.importExportDeleteExisting) args.push('--delete_existing=y');
			if (!formatters.isNullOrEmpty(props.importPrimaryKey)) args.push('--column_name=' + props.importPrimaryKey);

	
			taskStore.runTask(args, {
				proc_name: 'gridview',
				script_name: 'swatplus_api',
				isGridTask: true,
				type: null,
				routePath: route.path
			}, async () => {

				if (page.import.form.type === 'export_csv') {
					closeTaskModals();
					page.exported.show = true;
				} else {
					await get(false); 
					closeTaskModals();
				}
				

				page.import.saving = false;
			});
		}
	}

		
	function cancelTask() {
		taskStore.cancelTask();
		closeTaskModals();
	}

	function closeTaskModals() {
		page.import.show = false;
	}

	function getEditRoute(item:any) {
		let pk = item.id;
		if (!formatters.isNullOrEmpty(props.importPrimaryKey)) pk = item[props.importPrimaryKey];
		return formatters.isNullOrEmpty(props.editPathPrefix) ? utilities.appendRoute(`edit/${pk}`) : `${props.editPathPrefix}edit/${pk}`
	}

	const itemPk = computed(() => {
		return formatters.isNullOrEmpty(props.importPrimaryKey) ? 'id' : props.importPrimaryKey;
	})

	onMounted(async () => {
		if (table.sortBy[0] === null && props.headers.length > 0) {
        table.sortBy = [props.headers[0].key, props.defaultSort[1] || 'asc'];
    }
		page.loading = true;
		await get(true);
		page.loading = false;
	});
	

	watch(() => route.path, async () => await get(true))

	watch(() => props.itemsPerPage, (newVal) => {
		table.itemsPerPage = newVal;
		table.page = 1; 
		get(false); 
	});



</script>

<template>
<project-container :loading="page.loading">
	
	<div 
        :class="props.inCard ? 'd-flex flex-column' : ''" 
        :style="props.inCard ? 'position: absolute; top: 0; bottom: 0; left: 0; right: 0; padding: 8px;' : ''"
    >
		
		<div class="d-flex align-end mb-4 flex-shrink-0">
			<div>
				<v-text-field density="compact" variant="solo" append-inner-icon="fas fa-magnifying-glass" single-line hide-details
					class="mb-0" style="width:300px"
					label="Search..." v-model="table.filter" @input="filterChange"></v-text-field>
			</div>
			<slot name="header"></slot>
			<div v-if="!props.hideSummary" class="ml-auto text-right text-body-2">
				Showing {{showFirst}} - {{showLast}} of {{data.matches}} {{formatters.isNullOrEmpty(table.filter) ? 'rows' : 'matches'}}
			</div>
		</div>
		
		<v-card 
			flat
			class="position-relative" 
			:class="props.inCard ? 'flex-grow-1 d-flex flex-column' : ''"
			:style="props.inCard ? 'min-height: 0; border: 1px solid rgba(0,0,0,0.1);' : ''"
		>
			<v-overlay :model-value="table.loading" contained class="align-center justify-center" persistent>
				<v-progress-circular indeterminate color="primary"></v-progress-circular>
			</v-overlay>

			<v-table 
				class="data-table" 
				:class="props.inCard ? 'flex-grow-1 d-flex flex-column table-scroll' : ''" 
				fixed-header 
				:height="props.inCard ? undefined : (autoHeight ? 'auto' : tableHeight)" 
				density="compact"
			>
				<thead>
					<tr class="bg-surface">
						<th v-if="!props.hideEdit" class="bg-secondary-tonal min"></th>
						<th v-for="header in table.headers" :key="header.key" :class="`${header.class} pointer bg-secondary-tonal`" @click="doSort(header.key)">
							{{ formatters.isNullOrEmpty(header.label) ? header.key : header.label }}
							<v-icon v-if="!header.noSort && table.sortBy[0] === header.key && table.sortBy[1] === 'asc'" class="fa-xs ms-2">fas fa-arrow-up</v-icon>
							<v-icon v-if="!header.noSort && table.sortBy[0] === header.key && table.sortBy[1] === 'desc'" class="fa-xs ms-2">fas fa-arrow-down</v-icon>
						</th>
						<th v-if="!props.hideDelete" class="bg-secondary-tonal min"></th>
					</tr>
				</thead>
				
				<tbody>
					<tr v-if="!table.loading && (!data.items || data.items.length < 1)">
						<td :colspan="headerCount" class="text-center text-medium-emphasis py-6" >
							<em>Belum ada data yang tersedia {{ !props.hideCreate && formatters.isNullOrEmpty(table.filter) ? 'Gunakan tombol di bagian bawah halaman ini untuk membuat catatan baru.' : '' }}</em>
						</td>
					</tr>
					
					<tr v-for="item in data.items" :key="item[itemPk]" 
						@click="props.selectable ? onRowClick(item) : null" 
						:style="props.selectable ? 'cursor: pointer;' : ''"
						:class="{ 'row-active': activeRowId === item[itemPk] }">
						<td v-if="!props.hideEdit" class="min">
							<router-link :to="getEditRoute(item)" class="text-decoration-none text-primary" 
								:title="`Edit/View (${getEditRoute(item)})`">
								<font-awesome-icon :icon="['fas', 'edit']"></font-awesome-icon>
							</router-link>
						</td>
						<td v-for="header in table.headers" :key="header.key" :class="header.class">
							<div v-if="header.type === 'number'">
								{{ formatters.toNumberFormat(item[header.key], header.decimals||2, '', '-', ['yr','year'].includes(header.key)) }}
							</div>
							<div v-else-if="header.type === 'boolean'">
								{{ item[header.key] ? 'Y' : 'N' }}
							</div>
							<div v-else-if="header.type === 'object'">
								<span v-if="formatters.isNullOrEmpty(item[header.key])">-</span>
								<router-link v-else-if="!formatters.isNullOrEmpty(header.objectRoutePath)" class="text-primary text-decoration-none" 
									:to="`${header.objectRoutePath}${header.ignoreObjectRouteId ? '' : item[header.key][header.objectValueField||'id']}`">
									{{ item[header.key][header.objectTextField||'name'] }}
								</router-link>
								<span v-else>
									{{ item[header.key][header.objectTextField||'name'] }}
								</span>
							</div>
							<div v-else-if="header.type === 'file'">
								<span v-if="formatters.isNullOrEmpty(item[header.key])">{{ header.defaultIfNull }}</span>
								<span v-else>
									<v-btn variant="text" color="primary" class="text-decoration-underline" @click="openFile(item, header)">
										{{ item[header.key] }}
									</v-btn>
								</span>
							</div>
							<div v-else-if="header.type === 'variable-object'">
								<span v-if="formatters.isNullOrEmpty(item[header.key])">-</span>
								<router-link v-else-if="utilities.getObjTypeRoute(item) !== '#'" class="text-primary text-decoration-none" 
									:to="utilities.getObjTypeRoute(item)">
									{{ item[header.key] }}
								</router-link>
								<span v-else>
									{{ item[header.key] }}
								</span>
							</div>
							<div v-else-if="header.formatter !== undefined">
								{{ header.formatter(item[header.key]) }}
							</div>
							<div v-else>
								{{ formatters.isNullOrEmpty(item[header.key]) ? '-' : item[header.key] }}
							</div>	
						</td>
						<td v-if="!props.hideDelete" class="min">
							<font-awesome-icon :icon="['fas', 'times']" class="text-error pointer" title="Delete" @click="askDelete(item[itemPk], item.name)"></font-awesome-icon>
						</td>
					</tr>
				</tbody>
			</v-table>
		</v-card>

		<action-bar class="flex-shrink-0 mt-2" v-if="!props.noActionBar" :full-width="props.fullWidthActionBar" :fullest-width="props.fullestWidthActionBar" :in-card="props.inCard">
			<v-btn v-if="!props.hideCreate" variant="flat" color="primary" class="mr-2" :to="utilities.appendRoute('create')">Create Record</v-btn>
			<v-btn v-if="props.showImportExport" variant="flat" color="info" class="mr-2" @click="page.import.show = true">Import/Export</v-btn>
			<v-btn v-if="data.items && data.items.length > 0 && props.showDeleteAll" variant="flat" color="error" class="mr-2" @click="page.deleteAll.show = true">Delete All</v-btn>
			<slot name="actions"></slot>
			<back-button v-if="!hideBackButton" class="mr-2"></back-button>
			<div class="ml-auto d-flex align-center" style="height: 36px;">
				<v-pagination v-model="table.page" @update:modelValue="get(false)" :total-visible="6" :length="getNumPages()" size="small" density="compact" class="ma-0"></v-pagination>
			</div>
		</action-bar>
		
		<div v-else class="flex-shrink-0 d-flex align-center mt-2">
			<v-btn v-if="!props.hideCreate" variant="flat" color="primary" class="mr-2" :to="utilities.appendRoute('create')">Create Record</v-btn>
			<v-btn v-if="props.showImportExport" variant="flat" color="info" class="mr-2" @click="page.import.show = true">Import/Export</v-btn>
			<v-btn v-if="data.items && data.items.length > 0 && props.showDeleteAll" variant="flat" color="error" class="mr-2" @click="page.deleteAll.show = true">Delete All</v-btn>
			<slot name="actions"></slot>
			<div class="d-flex align-center ml-auto" style="height: 50px;">
				<span class="text-subtitle-2 font-weight-bold mr-0 d-flex align-center" style="height: 50px;">Page</span>
				<v-pagination v-model="table.page" @update:modelValue="get(false)" :total-visible="6" :length="getNumPages()" size="small"></v-pagination>
			</div>
		</div>

	</div> <v-dialog v-model="page.delete.show" :max-width="constants.dialogSizes.md">
		<v-card title="Confirm delete">
			<v-card-text>
				<error-alert :text="page.delete.error"></error-alert>
				<p><strong>{{page.delete.name}}</strong>? {{ t.common.delete_permanent }}</p>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn @click="confirmDelete" :loading="page.delete.saving" color="error" variant="text">Delete</v-btn>
				<v-btn @click="page.delete.show = false">Cancel</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-dialog v-model="page.deleteAll.show" :max-width="constants.dialogSizes.md">
		<v-card title="Confirm delete">
			<v-card-text>
				<error-alert :text="page.deleteAll.error"></error-alert>
				<p>{{t.common.delete_confirm}} <strong>ALL</strong> records? {{ t.common.delete_permanent }}</p>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn @click="confirmDeleteAll" :loading="page.deleteAll.saving" color="error" variant="text">Delete All</v-btn>
				<v-btn @click="page.deleteAll.show = false">Cancel</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-dialog v-model="page.import.show" :max-width="constants.dialogSizes.lg" persistent>
		<v-card title="Import/Export Data">
			<v-card-text>
				<error-alert :text="page.import.error"></error-alert>
				<stack-trace-error v-if="!formatters.isNullOrEmpty(task.error)" error-title="There was an error importing or exporting your data." :stack-trace="task.error ? task.error.toString() : ''" />
				<div v-if="task.running">
					<v-progress-linear :model-value="task.progress.percent" color="primary" height="15" striped indeterminate></v-progress-linear>
					<p>{{task.progress.message}}</p>
				</div>
				<div v-else-if="formatters.isNullOrEmpty(task.error)">
					<p>Export your existing data to {{importExportDescription}} or import a {{importExportDescription}} file of new values. Semua nilai yang sudah ada dalam tabel dengan nama yang sama akan diperbarui agar sesuai dengan nilai Anda. {{importExportDescription}} data. Ekspor data terlebih dahulu untuk mendapatkan templat dengan kolom yang benar.</p>
					<v-alert v-if="!formatters.isNullOrEmpty(importExportNotes)" type="info" icon="$info" variant="tonal" border="start" class="mb-4">
						{{importExportNotes}}
					</v-alert>
					<v-btn-toggle v-model="page.import.form.type" color="primary" variant="outlined" mandatory class="mb-4">
						<v-btn value="import_csv">Import</v-btn>
						<v-btn value="export_csv">Export</v-btn>
					</v-btn-toggle>
					<select-file-input v-model="page.import.form.fileName" :value="page.import.form.fileName" class="mb-3" :label="page.import.form.type == 'import_csv' ? `Select a ${importExportDescription} file to import` : `Select where to save your ${importExportDescription} file`" :fileType="importExportDescription.toLowerCase()" required :default-file-name="defaultCsvFile" :save-dialog="page.import.form.type == 'export_csv'" invalidFeedback="Please select a file."></select-file-input>
				</div>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn v-if="formatters.isNullOrEmpty(task.error)" :loading="task.running" @click="importData" color="primary" variant="text">
					{{ page.import.form.type === 'export_csv' ? 'Export Data' : 'Import Data' }}
				</v-btn>
				<v-btn @click="cancelTask">Cancel</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-dialog v-model="page.exported.show" :max-width="constants.dialogSizes.md">
		<v-card title="Data Exported">
			<v-card-text>
				<p>Your data has been exported to a {{importExportDescription}} file.</p>
				<p><open-file :file-path="page.import.form.fileName" text="Open file" button color="primary"></open-file></p>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn @click="page.exported.show = false">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<GrafikIklim v-model:show="chart.show" :file-path="chart.filePath" :file-name="chart.fileName" :file-type="chart.fileType" />

</project-container>
</template>

<style scoped>
	/* Pastikan scoped style memiliki selector yang tepat */
	.row-active {
		background-color: #e3f2fd !important; /* Warna biru muda */
	}

	.row-active td {
		color: #d21919 !important; /* Warna teks biru agar kontras */
	}

	.pointer {
		cursor: pointer;
	}

	:deep(.table-scroll.v-table) {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	:deep(.table-scroll .v-table__wrapper) {
		flex: 1 1 auto;
		overflow-y: auto;
	}

</style>