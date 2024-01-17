<script lang="ts">
	import { goto } from "$app/navigation";
    import Modal from "$lib/components/Modal.svelte";
	import { toStandardDateTimeString } from "$lib/utils/DateTime";
    import { DataHandler, Datatable} from "@vincjo/datatables";
	import { onMount } from "svelte";
	import type { Readable } from "svelte/store";

    export let searchKeyword = '';
    export let unitID = '';

    let dischargedEncounterToReadmit: {} | null = null;

    let dischargedEncountersHandler: DataHandler;
    let dischargedEncountersRows: Readable<any[]>;
    let dischargedEncounters: any[] = [];
    const fetchDischargedEncounters = async () => {
        dischargedEncounters = await (await fetch(`/api/clinical-units/${unitID}/discharged-patient-encounters`)).json();
        dischargedEncountersHandler = new DataHandler(dischargedEncounters, { rowsPerPage: 5 });
        dischargedEncountersRows = dischargedEncountersHandler.getRows();
    }

    let availableBeds: any[] = [];
    const fetchAvailableBeds = async () => {
        availableBeds = await(await fetch(`/api/clinical-units/${unitID}/beds/available`)).json();
    }

    const saveDischargedEncounterToReadmit = async () => {
        if(dischargedEncounterToReadmit) {
            dischargedEncounterToReadmit.action = 'Bed Transfer';
            dischargedEncounterToReadmit.unitID = unitID;
        }
        await fetch(`/api/admissions/transfers`, {
            method: 'POST',
            body: JSON.stringify(dischargedEncounterToReadmit)
        }).then(() => {
            // refresh page
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(thisPage)
            );
        }).finally(() => {
            dischargedEncounterToReadmit = null;
        });
    }

    onMount(async() => {
        await fetchDischargedEncounters();
        await fetchAvailableBeds();
    });

    $: {
        if(dischargedEncountersHandler) {
            dischargedEncountersHandler.search(searchKeyword);
        }
    } 
</script>
<div class="dischargedPatientEncounters mt-4 px-4">
    <div class="font-bold mb-4">
        Discharged Patient Encounters
    </div>
    {#if dischargedEncountersRows}
        <Datatable handler={dischargedEncountersHandler} search={false}>
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead>
                    <tr class="text-sm font-semibold text-center  ">
                        <th class="text-center p-2 px-2">Clinical Unit</th>
                        <th class="text-center p-2 px-2">HN</th>
                        <th class="text-center p-2 px-2">AN</th>
                        <th class="text-center p-2 px-2">Patient Name</th>
                        <th class="text-center p-2 px-2">Gender</th>
                        <th class="text-center p-2 px-2">Admit Date</th>
                        <th class="text-center p-2 px-2">Discharge Date</th>
                        <th class="text-center p-2 px-2">Duration</th>
                    </tr>
                </thead>
                <tbody class="striped text-sm font-normal text-black text-center">
                    {#each $dischargedEncountersRows as dischargedEncounter}
                        {@const selected = dischargedEncounter == dischargedEncounterToReadmit ? 'selected' : ''}
                        <tr on:click={() => dischargedEncounterToReadmit = dischargedEncounter}
                            class="py-2 bg-gray-100 font-small {selected}">
                            <td class="py-2">{dischargedEncounter.clinicalUnit}</td>
                            <td>{dischargedEncounter.HN}</td>
                            <td>{dischargedEncounter.AN}</td>
                            <td>{dischargedEncounter.patientName}</td>
                            <td>{dischargedEncounter.gender}</td>
                            <td>{toStandardDateTimeString(dischargedEncounter.admitDate)}</td>
                            <td>{toStandardDateTimeString(dischargedEncounter.dischargeDate)}</td>
                            <td>{dischargedEncounter.duration}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </Datatable>
    {/if}
</div>

<Modal bind:open={dischargedEncounterToReadmit}>
    <h2 slot="title" class="uppercase">Re-Admit Patient</h2>
    <form slot="content" class="p-4">
        {#if dischargedEncounterToReadmit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="slc_admission_bed" class="form-label">Bed</label>
                    <select bind:value={dischargedEncounterToReadmit.transferToBedId}
                        id="slc_admission_bed"
                        class="w-full text-left">
                        {#each availableBeds as availableBed}
                            <option class="text-lg" value="{availableBed.bedID}">
                                {availableBed.terse}
                            </option>
                        {/each}
                    </select>
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveDischargedEncounterToReadmit} class="save-btn"> Save </button>
                <button on:click={() => dischargedEncounterToReadmit = null} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<style>
    tr.selected {
        background-color: #232D45;
        @apply text-white;
    }
</style>