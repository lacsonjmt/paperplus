<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { toSlug } from "$lib/utils/String";
	import { onMount } from "svelte";
	import type { LayoutData } from "./$types";

    export let data: LayoutData;

	onMount(() => {
		const firstTab = toSlug(data.tabs[0].Tab)
		goto(`/${$page.params.unit}/${$page.params.bed}/${firstTab}`);
	});
</script>