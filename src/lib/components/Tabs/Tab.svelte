<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);
</script>

<style>
	button {
		background: none;
		border: none;
		border-bottom: 2px solid white;
		border-radius: 0;
		margin: 0;
		color: #ccc;
		@apply p-2;
	}
	
	.selected {
		border-bottom: 2px solid #2F5496;
		color: black;
	}
</style>

<button class:selected="{$selectedTab === tab}" on:click="{() => selectTab(tab)}">
	<slot></slot>
</button>