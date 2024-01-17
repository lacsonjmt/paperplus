<script lang="ts">
	import Catalog from "./Catalog.svelte";
	import General from "./General.svelte";
	import Notes from "./Notes.svelte";

    export let data;
</script>

{#if data.subtab?.SubTab == 'CATALOG'}
    <Catalog rootCatalogID={data.subtab.catalogID} 
        ptEncounterID={data.patient.ptencounterID}
        unitID={data.clinicalUnit.unitID}/>
{:else if data.subtab?.SubTab == 'NOTES'}
    <Notes rootCatalogID={data.subtab.catalogID} 
        ptEncounterID={data.patient.ptencounterID}
        unitID={data.clinicalUnit.unitID}/>
{:else if data.subtab?.SubTab == 'GENERAL'}
    <General rootCatalogID={data.subtab.catalogID} 
        ptEncounterID={data.patient.ptencounterID}
        unitID={data.clinicalUnit.unitID}/>
{:else if data.tab?.Tab == 'WEB VIEW'}
    <iframe src="http://23.106.122.242/reports/?rs:embed=true" title="{data.subtab.SubTab}" width="100%" height="360px"></iframe>
{/if}