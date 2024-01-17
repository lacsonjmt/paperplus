<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import InputDateTime from "../InputDateTime.svelte";
	import Modal from "../Modal.svelte";
    
    export let eventsNotesCellToEdit: any = null;
    export let ptEncounterID: string;
    export let unitID: string;
    export let eventsNotesTypes: any[] = [];

    let formEditEventsNotes: HTMLFormElement;
    let items: any[] = [];
    const saveFlowsheetDataToEdit = async () => {
        if(formEditEventsNotes.checkValidity()) {
            await fetch(`/api/events-notes`, {
                method: 'POST',
                body: JSON.stringify({
                    ptEncounterID,
                    unitID,
                    items,
                })
            }).then(() => {
                // refresh page
                const thisPage = window.location.pathname;
                goto('/').then(
                    () => goto(thisPage)
                );
            }).finally(() => eventsNotesCellToEdit = null)
        }
    }

    const initializeNewEntry = () => {
        items = [{
            isNew: true,
            chartTime: eventsNotesCellToEdit.chartTime,
            value: '',
            noteTypeID: eventsNotesTypes[0].noteTypeID
        }, ...items];   
    }

    onMount(() => {
        items = eventsNotesCellToEdit.items;
    });
</script>

<Modal bind:open={eventsNotesCellToEdit}>
    <h2 slot="title" class="uppercase">Events/Notes</h2>
    <form bind:this={formEditEventsNotes}
        slot="content"
        class="p-4">
        <table class="modalTable w-full table-auto border-b-2 border-top text-white">
            <thead class="border-bottom">
                {#if items.length}
                    <tr class="text-sm font-semibold text-center border-b-2 mb-4 mb-4">
                        <th class="text-center p-2 px-2">Chart Time</th>
                        <th class="text-center p-2 px-2">Note Type</th>
                        <th class="text-center p-2 px-2">Value</th>
                        <th class="text-center p-2 px-2 w-24">Action</th>
                    </tr>
                {/if}
            </thead>
            <tbody class=" text-sm font-normal text-center">
                {#each items as item}
                    <tr class="py-2 bg-pplus-gray font-small"
                        class:forDeletion={item.forDeletion}>
                        <td class="px-2">
                            <div>
                                <InputDateTime bind:value={item.chartTime}
                                    disabled={!item.isNew || item.forDeletion} />
                            </div>
                        </td>
                        <td class="px-2">
                            <div>
                                <select bind:value={item.noteTypeID}
                                    disabled={!item.isNew || item.forDeletion}>
                                    {#each eventsNotesTypes || [] as type}
                                        <option value={type.noteTypeID}>{type.noteType}</option>
                                    {/each}
                                </select>
                            </div>
                        </td>
                        <td>
                            <input bind:value={item.value}
                                id="txt_create_flowsheet_data_value"
                                class="pplus-textbox text-black"
                                required={!item.forDeletion}
                                disabled={item.forDeletion} />
                        </td>
                        <td>
                            {#if item.forDeletion}
                                <div on:click={() => item.forDeletion = false}
                                    on:keypress={() => item.forDeletion = false}
                                    class="items-center deleteBtn hover">
                                    Cancel
                                </div>
                            {:else}
                                <div on:click={() => item.forDeletion = true}
                                    on:keypress={() => item.forDeletion = true}
                                    class="items-center deleteBtn hover">
                                    Delete
                                </div>
                            {/if}
                        </td>
                    </tr>
                {/each}
                <tr class="newEntryBtn">
                    <td colspan="4">
                        <div on:click={initializeNewEntry}
                            on:keypress={initializeNewEntry}
                            class="full-width bg-dark-light-blue hover:bg-gray-700 text-white py-1 px-2 mt-2 border">
                                Add New Entry
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>      
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveFlowsheetDataToEdit}
                    class="save-btn">
                    Save
                </button>
                <span on:click={() => eventsNotesCellToEdit = null} 
                    on:keypress={() => eventsNotesCellToEdit = null} 
                    class="cancel-btn">
                    Cancel
                </span>
            </div>
        </div>
    </form>
</Modal>

<style>
    .forDeletion {
        background-color: black;
    }

    tr.newEntryBtn:hover {
        background-color: initial;
        cursor: pointer;
    }
</style>