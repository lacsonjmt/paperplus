<script lang="ts">
	import { onMount } from "svelte";

    export let catalogID: string;
    export let ptEncounterID: string;
    export let unitID: string;
    export let value: any;

    let calculation: any[];

    onMount(async() => {
        if(catalogID) {
            const promise = await fetch(`/api/catalog/${catalogID}/calculation?ptEncounterID=${ptEncounterID}&unitID=${unitID}`);
            calculation = await promise.json();
            value = calculation && calculation.length ? Object.values(calculation[0])[0] : '';
        }
    });
</script>
<input bind:value
    class="pplus-textbox"
    readonly />
