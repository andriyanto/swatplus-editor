<script setup lang="ts">
	import { computed } from 'vue';
	import { useHelpers } from '@/helpers';
	import { useLangStore } from '@/store/lang';

	const { formatters, currentProject } = useHelpers();
	const langStore = useLangStore();


	const errorMessage = computed(() => langStore.t.common.errContainer);
	interface Props {
		loading?: boolean,
		loadError?: string | null,
		addErrorFrame?: boolean,
		loadingMessage?: string,
	}

	const props = withDefaults(defineProps<Props>(), {
		loading: false,
		loadError: null,
		addErrorFrame: false,
		loadingMessage: '',
	});

	
</script>

<template>
	<div>
		<page-loading :loading="props.loading" :message="props.loadingMessage"></page-loading>
		<div v-if="!props.loading">
			<div v-if="currentProject.hasCurrentProject && currentProject.isSupported && formatters.isNullOrEmpty(props.loadError)">
				<slot></slot>
			</div>
			<div v-else-if="props.addErrorFrame">
				<v-main>
					<div class="py-3 px-6">
						<error-alert :text="!formatters.isNullOrEmpty(props.loadError) ? props.loadError : errorMessage"></error-alert>
					</div>
				</v-main>
			</div>
			<div v-else>
				<error-alert :text="!formatters.isNullOrEmpty(props.loadError) ? props.loadError : errorMessage"></error-alert>
			</div>
		</div>
	</div>
</template>