<script lang="ts">
	import { onMount } from "svelte";
	import Modal from "../Modal.svelte";
    export let showArchivedEpisodesModal: boolean = false;
    export let ptEncounterID: string;
    
    let archivedEpisodes: any[] = [];

    onMount(async () => {
        archivedEpisodes = await (await fetch(`/api/archived-episodes?ptEncounterID=${ptEncounterID}`)).json();
    });
</script>

<Modal bind:open={showArchivedEpisodesModal}>
    <h2 slot="title" class="uppercase">Archived Episodes</h2>
    <form slot="content" class="p-4">
        <table class=" w-full table-auto border-b-2 border-top text-white">
            <thead class=" border-bottom">
                <tr class="text-sm font-semibold text-center border-b-2 mb-4">
                    <th class="text-center p-2 px-2">AN</th>
                    <th class="text-center p-2 px-2">Case Type</th>
                    <th class="text-center p-2 px-2">Admission</th>
                    <th class="text-center p-2 px-2">Discharge</th>
                    <th class="text-center p-2 px-2">Action</th>
                </tr>
            </thead>
            <tbody class="dark-striped text-sm font-normal text-center">
                {#each archivedEpisodes as ep}
                    <tr class="py-2 bg-gray-100 font-small">
                        <td>{ep.hospNo}</td>
                        <td>{ep.caseType}</td>
                        <td>{ep.Admission}</td>
                        <td>{ep.Discharge}</td>
                        <td class="py-2">
                            <a href="/archived-episodes/{ep.ptencounterID}/{ep.unitID}/flowsheet"
                            class="save-btn">
                            Open
                            </a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={() => showArchivedEpisodesModal = false} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<style>
    tr td {
        @apply text-white;
    }
</style>