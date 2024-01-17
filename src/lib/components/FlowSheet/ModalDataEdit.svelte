<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { goto } from "$app/navigation";
	import InputDateTime from "../InputDateTime.svelte";
	import Modal from "../Modal.svelte";

    let dispatch = createEventDispatcher();
    
    export let flowsheetCellToEdit: any = null;
    export let ptEncounterID: string;
    export let unitID: string;

    let formEditFlowsheetData: HTMLFormElement;
    let items: any[] = [];
    let shortLabel: string = '';

    const saveFlowsheetCellToEdit = async () => {
        if(formEditFlowsheetData.checkValidity()) {
            await fetch(`/api/flowsheet`, {
                method: 'POST',
                body: JSON.stringify({
                    ptEncounterID,
                    unitID,
                    items,
                })
            }).then(() => {
                dispatch("save");
            });
            flowsheetCellToEdit = null;
        }
    }

    const initializeNewEntry = () => {
        let value: any = '';

        if(flowsheetCellToEdit.catalog.type == 'Group') {
            value = {};
            flowsheetCellToEdit.catalog.childCatalogs.forEach((childCatalog: any) => {
                value[childCatalog.shortLabel] = {
                    catalogID: childCatalog.catalogID,
                    attributeID: childCatalog.attributeID,
                    tblName: childCatalog.tblName,
                    value: '',
                };
            });
        }

        items = [{
            isNew: true,
            type: flowsheetCellToEdit.catalog.type,
            catalogID: flowsheetCellToEdit.catalog.catalogID,
            attributeID: flowsheetCellToEdit.catalog.attributeID,
            tblName: flowsheetCellToEdit.catalog.tblName,
            chartTime: flowsheetCellToEdit.chartTime,
            shortLabel: flowsheetCellToEdit.catalog.shortLabel,
            value
        }, ...items];   
    }

    const getValueLabels = () => {
        if(flowsheetCellToEdit.catalog.type == 'Group') {
            return flowsheetCellToEdit.catalog.childCatalogs.map((a: any) => a.shortLabel);
        }
        return [];
    }
    
    onMount(() => {
        shortLabel = flowsheetCellToEdit.catalog.shortLabel;
        items = flowsheetCellToEdit.items.sort((a: any, b: any) => a.chartTime < b.chartTime ? -1: 1);
        items = items.filter((a: any) => {
            if(a.value != null) {
                if(a.type == 'Group') {
                    return !!Object.values(a.value).map((b: any) => b.value).filter(Boolean).length;
                }
                return true;
            }
            return false;
        });

        if(!items.length) {
            initializeNewEntry();
        }
    });
</script>

<Modal bind:open={flowsheetCellToEdit}>
    <h2 slot="title" class="uppercase">Update {shortLabel} Data</h2>
    <form bind:this={formEditFlowsheetData}
        slot="content"
        class="p-4">
        <table class="modalTable w-full table-auto border-b-2 border-top text-white">
            <thead class="border-bottom">
                {#if items.length}
                    <tr class="text-sm font-semibold text-center border-b-2 mb-4 mb-4">
                        <th class="text-center p-2 px-2">Chart Time</th>
                        <th class="text-center p-2 px-2">Value</th>
                        <th class="text-center p-2 px-2">Action</th>
                    </tr>
                    {#if flowsheetCellToEdit.catalog.type == 'Group'}
                        <tr>
                            <th>&nbsp;</th>
                            <th>
                                <div class="flex items-center justify-center space-x-4">
                                    {#each getValueLabels() as label}
                                        <div class="flex flex-col">
                                            <span class="w-14 text-white px-2 text-xxs">
                                                {label}
                                            </span>
                                        </div>
                                    {/each}
                                </div>
                            </th>
                            <th>&nbsp;</th>
                        </tr>
                    {/if}
                {/if}
            </thead>
            <tbody class=" text-sm font-normal text-center">
                {#each items as item}
                    <tr class="py-2 bg-pplus-gray font-small"
                        class:forDeletion={item.forDeletion}>
                        <td class="px-2">
                            <div>
                                <InputDateTime bind:value={item.chartTime}
                                    disabled={item.forDeletion || !item.isNew} />
                            </div>
                        </td>
                        <td>
                            {#if item.type == 'Group'}
                                {@const innerKeys = Object.keys(item.value)}
                                <div class="flex items-center justify-center space-x-4">
                                    {#each innerKeys as innerKey}
                                        <div class="flex flex-col">
                                            <input bind:value={item.value[innerKey].value}
                                                type="number"
                                                step="any"
                                                class="w-14 text-black px-2"
                                                required={!item.forDeletion}
                                                disabled={item.forDeletion} />
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <input bind:value={item.value}
                                    type="number"
                                    step="any"
                                    class="pplus-textbox text-black"
                                    required={!item.forDeletion}
                                    disabled={item.forDeletion} />
                            {/if}
                        </td>
                        <td>
                            {#if item.forDeletion}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div on:click={() => item.forDeletion = false}
                                    class="items-center deleteBtn hover">
                                    Cancel
                                </div>
                            {:else}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div on:click={() => item.forDeletion = true}
                                    class="items-center deleteBtn hover">
                                    Delete
                                </div>
                            {/if}
                        </td>
                    </tr>
                {/each}
                <tr class="newEntryBtn">
                    <td colspan="3">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div on:click={initializeNewEntry}
                            class="full-width bg-dark-light-blue hover:bg-gray-700 text-white py-1 px-2 mt-2 border">
                                Add New Entry
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>      
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveFlowsheetCellToEdit}
                    class="save-btn">
                    Save
                </button>
                <span on:click={() => flowsheetCellToEdit = null}
                    on:keypress={() => flowsheetCellToEdit = null}
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