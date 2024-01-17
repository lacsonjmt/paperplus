<script lang="ts">
    import { onMount } from 'svelte';

    import { toStandardDateTimeString } from '$lib/utils/DateTime';

    import Alert, { AlertType } from '$lib/components/Alert.svelte';
    import Modal from '$lib/components/Modal.svelte';
	import CatalogChartedNote from './CatalogChartedNote.svelte';
	import CatalogDropdown from './CatalogDropdown.svelte';
	import CatalogCalculation from './CatalogCalculation.svelte';
	import InputDateTime from '$lib/components/InputDateTime.svelte';

    export let rootCatalogID: string;
    export let unitID: string;
    export let ptEncounterID: string;

    let searchKeyword = '';

    let formCreateCatalog: HTMLFormElement;
    let formEditChartedCatalog: HTMLFormElement;

    let alertMessages: any[] = [];

    class Catalog {
        parentID?: string = '';
        tblName?: string = '';
        value?: string = '';
    }

    class ChartedCatalog {
        ptEncounterID?: string = '';
        unitID?: string = '';
        catalog?: string = '';
        catalogID?: string = '';
        value?: string = '';
        chartTime?: string = '';
        tblName?: string = '';
		type?: string;
    }

    let primaryCatalogItems: any[] = [];
    let secondaryCatalogItems: any[] = [];
    let chartedCatalogItems: any[] = [];

    let selectedPrimaryCatalog : any;
    let selectedSecondaryCatalogs: any[] = [];
    let secondaryCatalogToCreate: Catalog | null;
    let chartedCatalogToEdit: ChartedCatalog | null;
    let chartedCatalogToDelete: ChartedCatalog | null;

    const loadCatalogItems = async () => {
        searchKeyword = '';
        loadSecondaryCatalogItems();
        loadChartedCatalogItems();

        selectedSecondaryCatalogs = [];
    }

    const loadSecondaryCatalogItems = async () => {
        secondaryCatalogItems = [];
        if (selectedPrimaryCatalog) {
            const promiseSecondary = await fetch(
                `/api/catalog/?parentID=${selectedPrimaryCatalog.catalogID}&unitID=${unitID}`
            );
            secondaryCatalogItems = await promiseSecondary.json();
        }
    };

    const loadChartedCatalogItems = async () => {
        chartedCatalogItems = [];
        if (selectedPrimaryCatalog) {
            const promise = await fetch(
                `/api/charted-catalog/?parentID=${selectedPrimaryCatalog.catalogID}&unitID=${unitID}&ptEncounterID=${ptEncounterID}`
            );
            try {
                chartedCatalogItems = await promise.json();
                chartedCatalogItems.forEach(a => a.originalValue = a.value);
            } catch (error) { console.log(error) }
        }
    };

    const saveSecondaryCatalogToCreate = async () => {
        if(formCreateCatalog.checkValidity() && secondaryCatalogToCreate) {
            secondaryCatalogToCreate.parentID = selectedPrimaryCatalog.catalogID;
            secondaryCatalogToCreate.tblName = selectedPrimaryCatalog.tblName;
            await fetch(`/api/catalog`, {
                method: 'POST',
                body: JSON.stringify(secondaryCatalogToCreate)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Create successful.',
                    message: `Catalog "${secondaryCatalogToCreate?.value}" is successfully created.`
                }];
            }).finally(async () => {
                secondaryCatalogToCreate = null;
                await loadSecondaryCatalogItems();
            });
        }
    };

    const initChartedCatalogToEdit = (chartedCatalogItem: ChartedCatalog) => {
        chartedCatalogToEdit = Object.assign(new ChartedCatalog, chartedCatalogItem,  { original: chartedCatalogItem });
        chartedCatalogToEdit.ptEncounterID = ptEncounterID;
        chartedCatalogToEdit.tblName = selectedPrimaryCatalog.tblName;
        chartedCatalogToEdit.chartTime = toStandardDateTimeString(chartedCatalogToEdit.chartTime);
    }

    const updateChartedCatalogToEdit = async () => {
        if(formEditChartedCatalog.checkValidity() && chartedCatalogToEdit) {
            await fetch(`/api/charted-catalog`, {
                method: 'PATCH',
                body: JSON.stringify(chartedCatalogToEdit)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Update successful.',
                    message: `Charted catalog item is successfully updated.`
                }];
            }).finally(async () => {
                chartedCatalogToEdit = null;
                await loadChartedCatalogItems();
            });
        }
    };

    const deleteChartedCatalogToDelete = async () => {
        if(chartedCatalogToDelete) {
            chartedCatalogToDelete.ptEncounterID = ptEncounterID;
            chartedCatalogToDelete.tblName = selectedPrimaryCatalog.tblName;

            await fetch(`/api/charted-catalog`, {
                method: 'DELETE',
                body: JSON.stringify(chartedCatalogToDelete)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Delete successful.',
                    message: `Charted catalog item is successfully delete.`
                }];
            }).finally(async () => {
                chartedCatalogToDelete = null;
                await loadChartedCatalogItems();
            });
        }
    }

    const toggleSelectedSecondaryCatalogs = (catalogItem: any) => {
        if(selectedSecondaryCatalogs.includes(catalogItem)) {
            selectedSecondaryCatalogs = selectedSecondaryCatalogs.filter(a => a != catalogItem);
        } else {
            selectedSecondaryCatalogs = [...selectedSecondaryCatalogs, catalogItem];
        }
    }

    let showInitChartedCatalogsToSaveModal = false;
    const saveSelectedSecondaryCatalogs = async () => {
        for (const a of selectedSecondaryCatalogs) {
            a.ptEncounterID = ptEncounterID;
            a.unitID = unitID;
            a.tblName = selectedPrimaryCatalog.tblName;
            a.parentCatalog = selectedPrimaryCatalog;
        }
        await fetch(`/api/charted-catalog/create`, {
            method: 'POST',
            body: JSON.stringify(selectedSecondaryCatalogs)
        }).then(() => {
            alertMessages = [...alertMessages, {
                type: AlertType.SUCCESS,
                title: 'Create successful.',
                message: `Charted catalog item is successfully created.`
            }];
        }).finally(async () => {
            showInitChartedCatalogsToSaveModal = false;
            selectedSecondaryCatalogs = [];
            await loadChartedCatalogItems();
        });
    }

    onMount(async () => {
        const promise = await fetch(`/api/catalog/?parentID=${rootCatalogID}&unitID=${unitID}`);
        primaryCatalogItems = await promise.json();
        if(primaryCatalogItems.length) {
            selectedPrimaryCatalog = primaryCatalogItems[0];
        }
        loadCatalogItems();
    });
</script>

<div class="grid grid-cols-12 gap-4 bg-pplus-gray px-2 py-2 items-center">
    <div class="col-span-2 flex justify-center">
        <select
            bind:value={selectedPrimaryCatalog}
            on:change={loadCatalogItems}
            class="w-full text-left border bg-primary-blue items-center">
            {#each primaryCatalogItems as catalogItem}
                <option value={catalogItem}>
                    {catalogItem.value}
                </option>
            {/each}
        </select>
    </div>
    <div class="col-span-10">
        <input bind:value={searchKeyword} placeholder="Search..." class="pplus-textbox h-full" />
    </div>
</div>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="px-2 bg-white text-black h-screen">
    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 p-2">
        <button on:click={() => secondaryCatalogToCreate = new Catalog}>
            <img alt="" class="plus" src="/img/add.png" width="48" />
        </button>
    </div>
    <div class="flex">
        <div class="w-1/3">
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead class="border-y border-white">
                    <tr class="text-sm text-center">
                        <th class="px-2">Catalog</th>
                    </tr>
                </thead>
                <tbody class="striped text-xs font-normal text-black">
                    {#each secondaryCatalogItems as catalogItem}
                        {#if catalogItem.value.toLowerCase().includes(searchKeyword.toLowerCase())}
                            <tr on:click={() => toggleSelectedSecondaryCatalogs(catalogItem)} 
                                class="bg-gray-100 py-2 font-small"
                                class:selected={selectedSecondaryCatalogs.includes(catalogItem)}
                                class:hidden={chartedCatalogItems.find(a => catalogItem.value == a.catalog)}>
                                <td class="px-2">
                                    {catalogItem.value}
                                </td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="w-24">
            <div class="p-2 flex justify-center pt-8">
                {#if selectedSecondaryCatalogs.length}
                    <button on:click={() => showInitChartedCatalogsToSaveModal = true}>
                        <img alt="add" class="arrows" src="/img/arrowright.png" width="48" />
                    </button>
                {/if}
            </div>
        </div>
        <div class="w-full">
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead class="border-y border-white">
                    <tr class="text-sm text-center">
                        <th class="px-2 w-20">ChartTime</th>
                        <th class="px-2 w-32">Catalog</th>
                        <th class="px-2 w-40">Value</th>
                        <th class="px-2 w-14">Edited By</th>
                        <th class="px-2 w-12">Action</th>
                    </tr>
                </thead>
                <tbody class="striped text-xs font-normal text-black">
                    {#each chartedCatalogItems.filter(a => a.catalog != 'Notes') as catalogSubItem}
                        {#if catalogSubItem.catalog.toLowerCase().includes(searchKeyword.toLowerCase())}
                            {@const selected = [chartedCatalogToEdit?.catalogID, chartedCatalogToDelete?.catalogID].includes(catalogSubItem.catalogID) ? 'selected' : ''}
                            <tr class="bg-gray-100 py-2 font-small {selected}">
                                <td class="px-2">{toStandardDateTimeString(catalogSubItem.chartTime)}</td>
                                <td class="px-2">{catalogSubItem.catalog}</td>
                                <td class="px-2">{catalogSubItem.value || ''}</td>
                                <td class="px-2">{catalogSubItem.editedBy}</td>
                                <td class="px-2 text-center">
                                    <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                        <button on:click={() => initChartedCatalogToEdit(catalogSubItem)}
                                            class="items-center editBtn hover">
                                            Edit
                                        </button>
                                        {#if catalogSubItem.Deletable}
                                            <button on:click={() => (chartedCatalogToDelete = catalogSubItem)}
                                                class="items-center deleteBtn hover">
                                                Delete
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
            <!-- {JSON.stringify(selectedPrimaryCatalog)} -->
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

<Modal bind:open={showInitChartedCatalogsToSaveModal}>
    <h2 slot="title" class="uppercase">Add Charted Catalog</h2>
    <form slot="content"
        class="p-4">
        <div class="flex flex-wrap -mx-3">
            <div class="w-full md:w-full px-3 pb-2">
                <label for="txt_create_catalog_value" class="form-label">
                    Catalog
                </label>
                {#each selectedSecondaryCatalogs as catalog}
                    <div class="flex space-x-2">
                        <input bind:value={catalog.value} 
                            id="txt_create_catalog_value"
                            class="pplus-textbox"
                            readonly />
                        {#if selectedSecondaryCatalogs.length > 1}
                            <button class="items-center deleteBtn" on:click={() => toggleSelectedSecondaryCatalogs(catalog)}
                                on:keypress={() => toggleSelectedSecondaryCatalogs(catalog)}>
                                Delete
                            </button>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="w-full md:w-full px-3">
                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                    <button on:click={saveSelectedSecondaryCatalogs}
                        class="save-btn">
                        Save
                    </button>
                    <button on:click={() => showInitChartedCatalogsToSaveModal = false}
                        class="cancel-btn">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={secondaryCatalogToCreate}>
    <h2 slot="title" class="uppercase">Add Catalog</h2>
    <form bind:this={formCreateCatalog}
        slot="content"
        class="p-4">
        {#if secondaryCatalogToCreate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_create_catalog_value" class="form-label">
                        Catalog
                    </label>
                    <input bind:value={secondaryCatalogToCreate.value} 
                        id="txt_create_catalog_value"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveSecondaryCatalogToCreate}
                    class="save-btn">
                    Save
                </button>
                <button on:click={() => (secondaryCatalogToCreate = null)}
                    class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={chartedCatalogToEdit}>
    <h2 slot="title" class="uppercase">Edit Charted Catalog</h2>
    <form bind:this={formEditChartedCatalog}
        slot="content" class="p-4">
        {#if chartedCatalogToEdit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_edit_charted_catalog_date"
                        class="form-label">
                        date
                    </label>
                    <InputDateTime bind:value={chartedCatalogToEdit.chartTime} />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_edit_charted_catalog_name"
                        class="form-label">
                        catalog
                    </label>
                    <input value={chartedCatalogToEdit.catalog}
                        id="txt_edit_charted_catalog_name"
                        class="pplus-textbox"
                        readonly />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_edit_charted_catalog_value"
                        class="form-label">
                        value
                    </label>
                    {#if chartedCatalogToEdit.type == 'Text'}
                        <input bind:value={chartedCatalogToEdit.value}
                            id="txt_edit_charted_catalog_value" 
                            class="pplus-textbox" />
                    {:else if chartedCatalogToEdit.type == 'DateTime'}
                        <InputDateTime bind:value={chartedCatalogToEdit.value} />
                    {:else if chartedCatalogToEdit.type == 'Dropdown'}
                        <CatalogDropdown bind:value={chartedCatalogToEdit.value}
                            catalogID={chartedCatalogToEdit.catalogID || ''}/>
                    {:else if chartedCatalogToEdit.type == 'Calculation'}
                        <CatalogCalculation catalogID={chartedCatalogToEdit.catalogID || ''}
                            bind:value={chartedCatalogToEdit.value}
                            {ptEncounterID}
                            {unitID} />
                    {:else}
                        <input bind:value={chartedCatalogToEdit.value}
                            id="txt_edit_charted_catalog_value" 
                            class="pplus-textbox"
                            readonly />
                    {/if}
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={updateChartedCatalogToEdit}
                    class="save-btn">
                    Save
                </button>
                <button on:click={() => (chartedCatalogToEdit = null)}
                    class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={chartedCatalogToDelete}>
    <h2 slot="title" class="uppercase">Delete Catalog</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to delete this entry?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={deleteChartedCatalogToDelete}
                    class="save-btn">
                    Delete
                </button>
                <button on:click={() => (chartedCatalogToDelete = null)} class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>