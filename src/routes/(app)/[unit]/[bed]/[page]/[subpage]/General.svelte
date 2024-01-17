<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { toStandardDateTimeString } from '$lib/utils/DateTime';
    import { onMount } from 'svelte';
    
	import Alert, { AlertType } from '$lib/components/Alert.svelte';
	import CatalogChartedNote from './CatalogChartedNote.svelte';
	import InputDateTime from '$lib/components/InputDateTime.svelte';

    export let rootCatalogID: string;
    export let unitID: string;
    export let ptEncounterID: string;
    
    let currentDateTime = new Date;

    let alertMessages: any[] = [];

    let primaryCatalogItems: any[] = [];
    let secondaryCatalogItems: any[] = [];
    let chartedCatalogItems: any[] = [];

    let selectedPrimaryCatalog: any;
    let selectedSecondaryCatalogs: any[] = [];

    let searchKeyword = '';

    let generalEntryToCreate: {} | null = null;
    let terseToDelete: {} | null = null;

    const loadCatalogItems = async () => {
        searchKeyword = '';
        loadSecondaryCatalogItems();
        selectedSecondaryCatalogs = [];
    }

    const loadSecondaryCatalogItems = async () => {
        if (selectedPrimaryCatalog) {
            const promiseSecondary = await fetch(
                `/api/catalog/?parentID=${selectedPrimaryCatalog.catalogID}&unitID=${unitID}`
            );
            secondaryCatalogItems = await promiseSecondary.json();

            const promiseCharted = await fetch(
                `/api/charted-catalog/?parentID=${selectedPrimaryCatalog.catalogID}}&unitID=${unitID}&ptEncounterID=${ptEncounterID}`
            );
            chartedCatalogItems = await promiseCharted.json();
        } else {
            secondaryCatalogItems = [];
            chartedCatalogItems = [];
        }
    };

    const toggleSelectedSecondaryCatalogs = (catalogItem: any) => {
        if(selectedSecondaryCatalogs.includes(catalogItem)) {
            selectedSecondaryCatalogs = selectedSecondaryCatalogs.filter(a => a != catalogItem);
        } else {
            selectedSecondaryCatalogs = [...selectedSecondaryCatalogs, catalogItem];
        }
    }

    let showAddCodedTerseModal: boolean = false;
    const saveSelectedSecondaryCatalogs = async () => {
        for (const a of selectedSecondaryCatalogs) {
            a.ptEncounterID = ptEncounterID;
            a.unitID = unitID;
            a.tblName = selectedPrimaryCatalog.tblName;
        }

        await fetch(`/api/charted-catalog/create`, {
            method: 'POST',
            body: JSON.stringify(selectedSecondaryCatalogs)
        }).then(() => {
            alertMessages = [...alertMessages, {
                type: AlertType.SUCCESS,
                title: 'Create successful.',
                message: `Catalog item is successfully created.`
            }];
        }).finally(async () => {
            showAddCodedTerseModal = false;
            selectedSecondaryCatalogs = [];
            await loadSecondaryCatalogItems();
        });
    }

    const deleteTerseToDelete = async () => {
        if(terseToDelete) {
            terseToDelete.ptEncounterID = ptEncounterID;
            terseToDelete.tblName = selectedPrimaryCatalog.tblName;

            await fetch(`/api/charted-catalog`, {
                method: 'DELETE',
                body: JSON.stringify(terseToDelete)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Delete successful.',
                    message: `Charted catalog item is successfully delete.`
                }];
            }).finally(async () => {
                terseToDelete = null;
                await loadSecondaryCatalogItems();
            });
        }
    }

    onMount(async () => {
        const promise = await fetch(`/api/catalog/?parentID=${rootCatalogID}&unitID=${unitID}`);
        primaryCatalogItems = await promise.json();

        selectedPrimaryCatalog = primaryCatalogItems[0];
        await loadSecondaryCatalogItems();
    });
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="grid grid-cols-12 gap-4 bg-pplus-gray px-2 py-2 items-center">
    <div class="col-span-2 flex justify-center">
        <select bind:value={selectedPrimaryCatalog}
            on:change={loadSecondaryCatalogItems}
            class="w-full text-left border bg-primary-blue items-center">
            {#each primaryCatalogItems as catalogItem}
                <option value={catalogItem}>
                    {catalogItem.value}
                </option>
            {/each}
        </select>
    </div>
    <div class="col-span-10">
        <input placeholder="Search..." class="pplus-textbox h-full" />
    </div>
</div>
<div class="px-2 bg-white text-black h-screen">
    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 p-2">
        <button on:click={() => (generalEntryToCreate = {})}>
            <img alt="" class="plus" src="/img/add.png" width="48" />
        </button>
    </div>
    <div class="flex">
        <div class="w-1/3">
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead class="border-y border-white">
                    <tr class="text-sm text-center">
                        <th class="px-2">Coded Terse</th>
                    </tr>
                </thead>
                <tbody class="striped text-xs font-normal">
                    {#each secondaryCatalogItems as catalogItem}
                        <tr on:click={() => { toggleSelectedSecondaryCatalogs(catalogItem) }} 
                            class:selected={selectedSecondaryCatalogs.includes(catalogItem)}
                            class:hidden={chartedCatalogItems.find(a => catalogItem.value == a.catalog)}
                            class="bg-gray-100 py-2 font-small">
                            <td class="px-2">
                                {catalogItem.value}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="w-24">
            <div class="p-2 flex justify-center pt-8">
                <button on:click={() => showAddCodedTerseModal = true}>
                    <img alt="" class="arrows" src="/img/arrowright.png" width="48px" />
                </button>
            </div>
        </div>
        <div class="w-full">
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead class="border-y border-white">
                    <tr class="bg-gray-100 text-sm text-center">
                        <th class="px-2 w-2/12">ChartTime</th>
                        <th class="px-2 w-6/12">Coded Terse</th>
                        <th class="px-2 w-2/12">Edited By</th>
                        <th class="px-2 w-2/12">Actions</th>
                    </tr>
                </thead>
                <tbody class="striped text-xs font-normal">
                    {#each chartedCatalogItems.filter(a => a.catalog != 'Notes') as catalogSubItem}
                        <tr class="bg-gray-100 py-2 font-small">
                            <td class="px-2">{toStandardDateTimeString(catalogSubItem.chartTime)}</td>
                            <td class="px-2">{catalogSubItem.catalog}</td>
                            <td class="px-2">{catalogSubItem.editedBy}</td>
                            <td class="px-2 text-center">
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                    <button on:click={() => terseToDelete = catalogSubItem} class="items-center deleteBtn hover">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            <div class="mt-2">
                <CatalogChartedNote catalog={ chartedCatalogItems.find(a => a.catalog == 'Notes') 
                    || {
                        parentID: selectedPrimaryCatalog?.catalogID,
                        ptEncounterID,
                        unitID,
                    }}
                    on:success-create={() => {
                        alertMessages = [...alertMessages, {
                            type: AlertType.SUCCESS,
                            title: 'Note successfully created.',
                            message: `Charted catalog note is successfully created.`
                        }];
                    }}
                    on:success-update={() => {
                        alertMessages = [...alertMessages, {
                            type: AlertType.SUCCESS,
                            title: 'Update successful.',
                            message: `Charted catalog note is successfully updated.`
                        }];
                    }}
                    on:finish={loadCatalogItems} />
            </div>
        </div>
    </div>
</div>

<Modal bind:open={generalEntryToCreate}>
    <h2 slot="title" class="uppercase">Add Coded Terse</h2>
    <form slot="content" class="p-4">
        {#if generalEntryToCreate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="" class="form-label"> Coded Terse </label>
                    <input id="" class="pplus-textbox" />
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button class="save-btn"> Save </button>
                <button on:click={() => (generalEntryToCreate = null)} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={showAddCodedTerseModal}>
    <h2 slot="title" class="uppercase">Add Coded Terse</h2>
    <form slot="content" class="p-4">
        <div class="flex flex-wrap -mx-3">
            <div class="w-full md:w-1/2 px-3">
                <label for="" class="form-label">ChartTime</label>
                <InputDateTime bind:value={currentDateTime} />
            </div>
        </div>
        <div class="flex flex-wrap -mx-3">
            <div class="w-full md:w-full px-3">
                <label for="" class="form-label"> coded terse </label>
                {#each selectedSecondaryCatalogs as catalog}
                    <input bind:value={catalog.value}  type="text" id="" class="pplus-textbox" readonly/>
                {/each}
            </div>
        </div>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button class="save-btn" on:click={saveSelectedSecondaryCatalogs}> Save </button> <!--on:click={saveSelectedSecondaryCatalogs} not sure if correct-->
                <button on:click={() => showAddCodedTerseModal = false} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={terseToDelete}>
    <h2 slot="title" class="uppercase">Delete Terse</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to delete this entry?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={deleteTerseToDelete} class="save-btn"> Delete </button>
                <button on:click={() => (terseToDelete = null)} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>