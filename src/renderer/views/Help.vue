<script setup lang="ts">
	import { reactive, onMounted } from 'vue';
	import { useHelpers } from '@/helpers';
	import { useLangStore } from '@/store/lang';
	import { storeToRefs } from 'pinia';

	const { api, constants, errors, utilities } = useHelpers();
	const langStore = useLangStore();
	const { t } = storeToRefs(langStore);

	let page:any = reactive({
		loading: false,
		error: null
	});

	let apiCheck:any = reactive({
		editor: '',
		pythonVersion: 'N/A'
	});

	async function getHelp() {
		page.loading = true;
		page.error = null;

		try {
			const response = await api.get('/');
			apiCheck.editor = response.data.editor;
			apiCheck.pythonVersion = response.data.pythonVersion;
		} catch (error) {
			page.error = errors.logError(error, 'Unable to connect to SWAT+ API.');
			apiCheck.editor = 'API call unsuccessful';
		}
		
		page.loading = false;
	}

	onMounted(async () => await getHelp());
</script>

<template>
	<v-main class="layout-fix">
		<div class="py-3 px-6">
			<v-row>
				<v-col cols="12" md="6">
					<v-card class="mb-6">
						<v-card-title>{{ t.help.help_title }}</v-card-title>
						<v-card-text>
							<p class="text-medium-emphasis">
							{{ t.help.help_desc }}
							</p>
						</v-card-text>
					</v-card>

					<v-card class="mb-6">
						<v-card-title>{{ t.common.troubleshoot_title }}</v-card-title>
						<v-card-text>
							<p class="text-medium-emphasis mb-0">
								{{ t.common.troubleshoot_desc_part1 }}
								<open-in-browser url="https://groups.google.com/d/forum/swatplus-editor" text="user group" class="text-primary"></open-in-browser>
								{{ t.common.troubleshoot_desc_part2 }}
							</p>
						</v-card-text>
						<v-table density="compact">
							<tbody>
								<tr><th class="min">SWAT+ Editor Version</th><td>{{ constants.appSettings.version }}</td></tr>
								<tr><th class="min">Platform</th><td>{{ constants.globals.platform }}</td></tr>
								<tr><th class="min">Python Mode</th><td>{{ constants.appSettings.python || constants.globals.dev_mode ? 'Yes' : 'Compiled' }}</td></tr>
								<tr><th class="min">Python Version</th><td>{{ apiCheck.pythonVersion }}</td></tr>
								<tr><th class="min">API Check</th><td>{{ apiCheck.editor }}</td></tr>
								<tr><th class="min">API Port</th><td>{{ constants.globals.api_port }}</td></tr>
								<tr><th class="min">Development Mode</th><td>{{ constants.globals.dev_mode ? 'Yes' : 'No' }}</td></tr>
								<tr><th class="min">Locale</th><td>{{ constants.globals.locale }}</td></tr>
							</tbody>
						</v-table>
					</v-card>

					<v-card class="mb-6">
						<v-card-title>{{ t.common.compat_title.replace('{version}', constants.appSettings.version) }}</v-card-title>
						<v-card-text>
							<p class="text-medium-emphasis mb-0">
								{{ t.common.compat_desc }}
							</p>
						</v-card-text>
						<v-table density="compact">
							<tbody>
								<tr><th class="min">SWAT+ Model</th><td>{{ constants.appSettings.swatplus }} (*see note below)</td></tr>
								<tr><th class="min">QSWAT+</th><td>&gt;= 2.5.3</td></tr>
								<tr><th class="min">SWAT+ Toolbox</th><td>&gt;= 2.0</td></tr>
							</tbody>
						</v-table>
						<v-card-text>
							<p class="text-medium-emphasis mb-0">
								{{ t.help.help_note_part1 }} <router-link to="/run">Run</router-link> 
								{{ t.help.help_note_part2 }}
							</p>
						</v-card-text>
					</v-card>

					<v-card class="mb-6">
						<v-card-title>{{ t.help.about_title }}</v-card-title>
						<v-card-text>
							<p class="text-medium-emphasis mb-0">
								{{ t.help.about_desc }}
							</p>
						</v-card-text>
					</v-card>

					<v-card class="mb-6">
						<v-card-title>{{ t.help.disclaimer_title }}</v-card-title>
						<v-card-text>
							<p class="text-medium-emphasis mb-0">
								{{ t.help.disclaimer_text }}
							</p>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="12" md="6">
					<v-card class="mb-6">
						<v-list>
							<v-list-subheader class="text-uppercase">Docs</v-list-subheader>
							<v-list-item @click="utilities.openUrl('https://swatplus.gitbook.io/docs/')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-book</v-icon></template>
								SWAT+ Editor Documentation
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://swatplus.gitbook.io/io-docs/')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-book</v-icon></template>
								SWAT+ Input/Output Documentation
							</v-list-item>
						</v-list>
					</v-card>

					<v-card class="mb-6">
						<v-list>
							<v-list-subheader class="text-uppercase">Sample Data</v-list-subheader>
							<v-list-item @click="utilities.openUrl('https://swatplus.gitbook.io/docs/user/editor/inputs/sample-data')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-database</v-icon></template>
								Example Data Formats for SWAT+ Editor
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://swatplus.gitbook.io/docs/getting-started')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-database</v-icon></template>
								Demo Project for SWAT+ Editor
							</v-list-item>
						</v-list>
					</v-card>

					<v-card class="mb-6">
						<v-list>
							<v-list-subheader class="text-uppercase">User Groups</v-list-subheader>
							<v-list-item @click="utilities.openUrl('https://groups.google.com/d/forum/swatplus')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-users</v-icon></template>
								SWAT+ Model User Group (the model itself)
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://groups.google.com/d/forum/swatplus-editor')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-users</v-icon></template>
								SWAT+ Editor User Group (this interface)
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://groups.google.com/d/forum/qswatplus')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-users</v-icon></template>
								QSWAT+ User Group (GIS interface)
							</v-list-item>
						</v-list>
					</v-card>

					<v-card class="mb-6">
						<v-list>
							<v-list-subheader class="text-uppercase">Additional Resources</v-list-subheader>
							<v-list-item @click="utilities.openUrl('https://swat.tamu.edu/software/plus')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-globe</v-icon></template>
								SWAT+ Website
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://github.com/swat-model/swatplus')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fab fa-github</v-icon></template>
								SWAT+ Github
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://github.com/swat-model/swatplus-editor')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fab fa-github</v-icon></template>
								SWAT+ Editor Github
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://github.com/swat-model/QSWATPlus')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fab fa-github</v-icon></template>
								QSWAT+ Github
							</v-list-item>
							<v-list-item @click="utilities.openUrl('https://plus.swat.tamu.edu')" border="t" class="text-primary">
								<template #prepend><v-icon class="text-medium-emphasis">fas fa-box-archive</v-icon></template>
								SWAT+ Version Archive
							</v-list-item>
						</v-list>
					</v-card>
					
				</v-col>
			</v-row>
		</div>
	</v-main>
</template>

