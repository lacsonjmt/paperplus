<script lang="ts">
	import { onMount } from "svelte";

    export let catalogID: string;
    export let value: string = '';
    let options: any[] = [];

    onMount(async() => {
        if(catalogID) {
            options = await (await fetch(`/api/catalog/${catalogID}/list`)).json();
        }
    });
</script>
<select bind:value>
    {#each options as option}
        <option value={option.value}>{option.value}</option>
    {/each}
</select>