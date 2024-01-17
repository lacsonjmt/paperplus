<script lang="ts">
	import { page } from "$app/stores";
	import FlowSheet from "$lib/components/FlowSheet.svelte";
	import StaffManagement from "../StaffManagement.svelte";

    export let data;

    const isUserReadOnly = data.user.roles.split(', ').includes('ReadOnly');
    let isArchivedEpisode = $page.url.pathname.startsWith('/archived-episodes/');
    let isEditable = !isUserReadOnly 
        && !isArchivedEpisode 
        && (!data.patient.lockedby || data.patient.lockedby == data.user.loginID);
</script>
{#if data.tab?.Tab == 'FLOWSHEET'}
    <FlowSheet
        ptEncounterID={data.patient.ptencounterID}
        unitID={data.clinicalUnit.unitID}
        intervalMinutes={parseInt(data.FLOWSHEET_INTERVAL_MINUTES)}
        autochartMinutes={parseInt(data.FLOWSHEET_AUTOCHART_MINUTES)}
        cookieDisplayMode={data.displayMode}
        {isEditable} />
{:else if data.tab?.Tab == 'STAFF MANAGEMENT'}
    <StaffManagement 
        ptEncounterID={data.patient.ptencounterID}
        unitID={data.clinicalUnit.unitID} />
{/if}