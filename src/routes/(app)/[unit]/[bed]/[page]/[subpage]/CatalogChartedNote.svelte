<script lang="ts">
    import { createEventDispatcher } from "svelte";
    
    export let catalog : any;
    let dispatch = createEventDispatcher();

    const saveChartedNote = async () => {
        if(catalog.catalogID) {
            updateChartedNote();
        } else {
            createChartedNote();
        }
    }

    const createChartedNote = async () => {
        await fetch(`/api/notes-charted`, {
            method: 'POST',
            body: JSON.stringify(catalog)
        }).then(() => {
            dispatch('success-create');
        }).finally(() => {
            dispatch('finish');
        });
    }

    const updateChartedNote = async () => {
        await fetch(`/api/notes-charted`, {
            method: 'PATCH',
            body: JSON.stringify(catalog)
        }).then(() => {
            dispatch('success-update');
        }).finally(() => {
            dispatch('finish');
        });
    }
</script>

<div class="mt-2">
    <label for="formsNotes" class="form-label text-sm mb-2 text-black"> Notes </label>
    <textarea bind:value={catalog.value}
        id="formsNotes"
        name="Forms Notes"
        rows="6"
        class="w-full border border-gray-500 text-black text-xs" />
</div>
<!-- {JSON.stringify(catalog)} -->
{#if catalog.value != catalog.originalValue}
    <div class="flex flex-wrap justify-end items-center mt-2">
        <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
            <button on:click={saveChartedNote} class="save-btn">Save</button>
            <button on:click={() => catalog.value = catalog.originalValue || ''}
                type="reset"
                class="cancel-btn">
                Cancel
            </button>
        </div>
    </div>
{/if}