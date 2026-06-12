<template>
    <div style="height:67px" v-if="!inCard"></div>
    
    <div 
        v-bind="$attrs" 
        :class="[
            fullestWidth ? 'page-action-bar fullest' : (fullWidth ? 'page-action-bar full' : 'page-action-bar'),
            { 'in-card': inCard }
        ]"
    >
		<div class="d-flex align-center px-6 py-2">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps({
		fullWidth: Boolean,
		fullestWidth: Boolean,
        inCard: Boolean // Tambahkan ini
	})
</script>