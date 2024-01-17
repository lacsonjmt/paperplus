<script lang="ts">
	import { goto } from "$app/navigation";
	import Modal from "$lib/components/Modal.svelte";
	import ModalAdmission from "$lib/components/ModalAdmission.svelte";
    import { DataHandler, Datatable} from "@vincjo/datatables";
	import { onMount } from "svelte";
	import type { Readable } from "svelte/store";

    export let searchKeyword = '';
    export let unitID: string;

    let preAdmissionsHandler: DataHandler;
    let preAdmissionsRows: Readable<any[]>;
    let preAdmissions: any[] = [];
    const fetchPreAdmissions = async () => {
        preAdmissions = await (await fetch(`/api/pre-admissions`)).json();
        preAdmissionsHandler = new DataHandler(preAdmissions, { rowsPerPage: 5 });
        preAdmissionsRows = preAdmissionsHandler.getRows();
    }

    let preAdmissionToCreate: {} | null = null;
    let preAdmissionToAdmit: {} | null = null;
    let preAdmissionToDelete: {} | null = null;

    let availableBeds: any[] = [];
    const fetchAvailableBeds = async () => {
        availableBeds = await(await fetch(`/api/clinical-units/${unitID}/beds/available`)).json();
    }

    const savePreAdmissionToAdmit = async () => {
        if(preAdmissionToAdmit) {
            preAdmissionToAdmit.action = 'Bed Transfer';
            preAdmissionToAdmit.unitID = unitID;
        }
        await fetch(`/api/admissions/transfers`, {
            method: 'POST',
            body: JSON.stringify(preAdmissionToAdmit)
        }).then(() => {
            // refresh page
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(thisPage)
            );
        }).finally(() => {
            preAdmissionToAdmit = null;
        });
    }

    const savePreAdmissionToDelete = async () => {
        await fetch(`/api/pre-admissions/delete`, {
            method: 'POST',
            body: JSON.stringify(preAdmissionToDelete)
        }).then(() => {
            // refresh page
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(thisPage)
            );
        }).finally(() => {
            preAdmissionToDelete = null;
        });
    }

    onMount(async() => {
        await fetchPreAdmissions();
        await fetchAvailableBeds();
    });

    $: {
        if(preAdmissionsHandler) {
            preAdmissionsHandler.search(searchKeyword);
        }
    } 
</script>
<div class="preAdmission px-4">
    
    <div class="grid grid-cols-2 gap-4 sm:flex-row space-y-2 sm:space-y-0 mb-2 mt-4">
        <div class="flex items-center font-bold">
            Pre-Admission
        </div>
    </div>
    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 mx-4">
        <button on:click={() => (preAdmissionToCreate = { unitID, bedID: null })}>
            <img alt="add user" class="createBtn mr-8" src="/img/add.png" width="48" />
        </button>
    </div>
    
    {#if preAdmissionsRows}
        <Datatable handler={preAdmissionsHandler} search={false}>
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead>
                    <tr class="text-sm font-semibold text-center">
                        <th class="text-center p-2 px-2">HN</th>
                        <th class="text-center p-2 px-2">AN</th>
                        <th class="text-center p-2 px-2">Patient Name</th>
                        <th class="text-center p-2 px-2">Case Type</th>
                        <th class="text-center p-2 px-2">Anaesthetist</th>
                        <th class="text-center p-2 px-2">Surgeon</th>
                        <th class="text-center p-2 px-2">Action</th>
                    </tr>
                </thead>
                <tbody class="striped text-sm font-normal text-black text-center">
                    {#each $preAdmissionsRows as preAdmission}
                        {@const selected = preAdmissionToDelete == preAdmission ? 'selected' : ''}
                        <tr on:click={() => preAdmissionToAdmit = preAdmission}
                            class="py-2 bg-gray-100 font-small"
                            class:selected={preAdmissionToAdmit == preAdmission || preAdmissionToDelete == preAdmission}>
                            <td class="py-2"> {preAdmission.HN}</td>
                            <td>{preAdmission.AN}</td>
                            <td>{preAdmission.patientName}</td>
                            <td>{preAdmission.caseType}</td>
                            <td>{preAdmission.anaesthetist}</td>
                            <td>{preAdmission.surgeon}</td>
                            <td>
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0 z-50">
                                    <button on:click|stopPropagation={() => preAdmissionToDelete = preAdmission}
                                        class="items-center deleteBtn hover:text-rose-700">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </Datatable>
    {/if}
</div>

{#if unitID}
    <ModalAdmission bind:patientToAdmit={preAdmissionToCreate}
        {unitID} />
{/if}

<Modal bind:open={preAdmissionToAdmit}>
    <h2 slot="title" class="uppercase">Admit to Bed</h2>
    <form slot="content" class="p-4">
        {#if preAdmissionToAdmit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="slc_admission_bed" class="form-label">Bed</label>
                    <select bind:value={preAdmissionToAdmit.transferToBedId}
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
                <button on:click={savePreAdmissionToAdmit} class="save-btn">
                    Save
                </button>
                <button on:click={() => preAdmissionToAdmit = null} class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={preAdmissionToDelete}>
    <h2 slot="title" class="uppercase">Delete Patient</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to delete this patient?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={savePreAdmissionToDelete} class="save-btn"> Delete </button>
                <button on:click={() => (preAdmissionToDelete = null)} class="cancel-btn"> Cancel </button>
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
