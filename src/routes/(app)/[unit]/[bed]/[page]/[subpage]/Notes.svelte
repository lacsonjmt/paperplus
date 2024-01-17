<script lang="ts">
    import { onMount } from "svelte";

    import { toStandardDateTimeString } from '$lib/utils/DateTime';
    
    import Modal from "$lib/components/Modal.svelte";
	import InputDateTime from "$lib/components/InputDateTime.svelte";
	import Alert, { AlertType } from "$lib/components/Alert.svelte";
	import CatalogChartedNote from "./CatalogChartedNote.svelte";

    export let rootCatalogID: string;
    export let unitID: string;
    export let ptEncounterID: string;

    let primaryCatalogItems: any[] = [];
    let secondaryCatalogItems: any[] = [];
    let tertiaryCatalogItems: any[] = [];

    let alertMessages: any[] = [];

    let selectedPrimaryCatalog: any = null;
    let selectedSecondaryCatalog: any = null;

    let noteToCreate: {} | null = null;
    let noteToDelete: {} | null = null;

    let chartedNoteToUpdate: {} | null = null;

    const initializeNoteToCreate = () => {
        noteToCreate = {
            ptEncounterID,
            unitID,
            chartTime: new Date,
            parentID: selectedPrimaryCatalog.catalogID
        };
    }

    const loadSecondaryCatalogItems = async () => {
        secondaryCatalogItems = [];
        tertiaryCatalogItems = [];
        if (selectedPrimaryCatalog) {
            const promiseNotes = await fetch(
                `/api/notes?ptEncounterID=${ptEncounterID}&unitID=${unitID}&parentID=${selectedPrimaryCatalog.catalogID}`
            );
            secondaryCatalogItems = await promiseNotes.json();

            selectedSecondaryCatalog = secondaryCatalogItems.length ? secondaryCatalogItems[0] : '';
            loadTertiaryCatalogItems();
        }
    };

    const loadTertiaryCatalogItems = async () => {
        tertiaryCatalogItems = [];
        if(selectedSecondaryCatalog) {
            fetch(`/api/notes-charted?ptEncounterID=${ptEncounterID}`
                + `&unitID=${unitID}`
                + `&parentID=${selectedSecondaryCatalog.catalogID}`)
            .then(async response => {
                tertiaryCatalogItems = await response.json();
            });
        }
    }

    const updateSelectedSecondaryCatalog = async (catalog: any) => {
        selectedSecondaryCatalog = catalog;
        loadTertiaryCatalogItems();
    }

    const saveNoteToCreate = async () => {
        await fetch(`/api/notes-charted`, {
            method: 'POST',
            body: JSON.stringify(noteToCreate)
        }).then(() => {
            alertMessages = [...alertMessages, {
                type: AlertType.SUCCESS,
                title: 'Create successful.',
                message: `Catalog item is successfully created.`
            }];
        }).finally(async () => {
            noteToCreate = null;
            loadSecondaryCatalogItems();
            loadTertiaryCatalogItems();
        });
    }

    const saveChartedNoteToUpdate = async () => {
        await fetch(`/api/notes-charted`, {
            method: 'PATCH',
            body: JSON.stringify(chartedNoteToUpdate)
        }).then(() => {
            alertMessages = [...alertMessages, {
                type: AlertType.SUCCESS,
                title: 'Update successful.',
                message: `Note is successfully updated.`
            }];
        }).finally(async () => {
            chartedNoteToUpdate = null;
            loadSecondaryCatalogItems();
            loadTertiaryCatalogItems();
        });
    };

    const saveNoteToDelete = async () => {
    await fetch(`/api/notes-charted`, {
            method: 'DELETE',
            body: JSON.stringify(noteToDelete)
        }).then(() => {
            alertMessages = [...alertMessages, {
                type: AlertType.SUCCESS,
                title: 'Delete successful.',
                message: `Note is successfully deleted.`
            }];
        }).finally(async () => {
            noteToDelete = null;
            loadSecondaryCatalogItems();
            loadTertiaryCatalogItems();
        });
    }

    onMount(async () => {
        fetch(`/api/catalog/?parentID=${rootCatalogID}`
            + `&unitID=${unitID}`)
        .then(async response => {
            primaryCatalogItems = await response.json();
            selectedPrimaryCatalog = primaryCatalogItems[0] ?? null;
            loadSecondaryCatalogItems();
        });
    });
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="grid grid-cols-12 gap-4 bg-pplus-gray px-2 py-2 items-center ">
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
        <button on:click={initializeNoteToCreate}>
            <img alt="" class="plus" src="/img/add.png" width="48" />
        </button>
    </div>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-2">
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <tbody class="striped text-xs font-normal">
                    {#each secondaryCatalogItems as catalogItem}
                        {@const selected = catalogItem == selectedSecondaryCatalog ? 'selected' : ''}
                        <tr on:click={() => updateSelectedSecondaryCatalog(catalogItem)} 
                            class="bg-gray-100 py-2 font-small {selected}">
                            <td class="px-2">
                                {catalogItem.value}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="col-span-10">
            <table class="tableLight w-full table-auto border-b-2 border-top">
				<thead class="border-y border-white">
					<tr class="text-sm text-center">
						<th class="px-2 w-2/12">ChartTime</th>
						<th class="px-2 w-6/12">Summary</th>
						<th class="px-2 w-2/12">Edited By</th>
                        <th class="px-2 w-2/12">Actions</th>
					</tr>
				</thead>
				<tbody class="striped text-xs font-normal">
                    {#each tertiaryCatalogItems as catalogItem}
                        {#if catalogItem.terse != 'Notes'}
                            {@const selected = [chartedNoteToUpdate?.catalogID, noteToDelete?.catalogID].includes(catalogItem.catalogID) ? 'selected' : ''}
                            <tr class="bg-gray-100 py-2 font-small {selected}">
                                <td class="px-2">{toStandardDateTimeString(catalogItem.chartTime)}</td>
                                <td class="px-2">{catalogItem.value}</td>
                                <td class="px-2">{catalogItem.editedBy}</td>
                                <td class="px-2 text-center">
                                    <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                        <button on:click={() => (chartedNoteToUpdate = catalogItem)} class="items-center editBtn hover">
                                            Edit
                                        </button>
                                        <button on:click={() => (noteToDelete = catalogItem)} class="items-center deleteBtn hover">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/if}
                    {/each}
				</tbody>
			</table>
            <div class="mt-2">
                {#if tertiaryCatalogItems.find(a => a.terse == 'Notes')}
                    <CatalogChartedNote catalog={tertiaryCatalogItems.find(a => a.terse == 'Notes')}
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
                        on:finish={loadSecondaryCatalogItems} />
                {/if}
            </div>
        </div>
    </div>
</div>

<Modal bind:open={noteToCreate}>
    <h2 slot="title" class="uppercase">Add Notes</h2>
    <form slot="content" class="p-4">
        {#if noteToCreate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_create_note_chart_time" class="form-label">ChartTime</label>
                    <InputDateTime bind:value={noteToCreate.chartTime}
                        id="txt_create_note_chart_time" />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_create_note_value" class="form-label"> Summary</label>
                    <input bind:value={noteToCreate.value} id="txt_create_note_value" type="text" class="pplus-textbox" />
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveNoteToCreate} class="save-btn"> Save </button>
                <button on:click={() => noteToCreate = null}  class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={chartedNoteToUpdate}>
    <h2 slot="title" class="uppercase">Edit Notes</h2>
    <form slot="content" class="p-4">
        {#if chartedNoteToUpdate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_edit_note_chart_time" class="form-label">ChartTime</label>
                    <InputDateTime bind:value={chartedNoteToUpdate.chartTime}
                        id="txt_edit_note_chart_time" />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_edit_note_value" class="form-label"> Summary</label>
                    <input bind:value={chartedNoteToUpdate.value}
                        id="txt_edit_note_value"
                        type="text"class="pplus-textbox" />
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveChartedNoteToUpdate} class="save-btn"> Save </button>
                <button on:click={() => (chartedNoteToUpdate = null)} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={noteToDelete}>
    <h2 slot="title" class="uppercase">Delete Notes</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to delete this entry?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveNoteToDelete} class="save-btn"> Delete </button>
                <button on:click={() => (noteToDelete = null)} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>