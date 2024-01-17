<script lang="ts">
	import { AlertType } from "../Alert.svelte";
    import Modal from "../Modal.svelte";
	import InputDateTime from "../InputDateTime.svelte";

    export let eventSummaryToEdit: any = null;
    export let alertMessages: any;

    let formEditEventSummary: HTMLFormElement;
    const saveEventSummaryToEdit = async () => {
        if(formEditEventSummary.checkValidity() && eventSummaryToEdit) {
            await fetch(`/api/charted-catalog`, {
                method: 'PATCH',
                body: JSON.stringify(eventSummaryToEdit)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Update successful.',
                    message: `Event summary is successfully updated.`
                }];
            }).finally(() => {
                eventSummaryToEdit = null;
            });
        }
    }
</script>
<Modal bind:open={eventSummaryToEdit}>
    <h2 slot="title" class="uppercase">Edit Event Summary</h2>
    <form bind:this={formEditEventSummary}
        slot="content" class="p-4">
        {#if eventSummaryToEdit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_edit_charted_catalog_chart_time"
                        class="form-label">
                        date
                    </label>
                    <InputDateTime bind:value={eventSummaryToEdit.chartTime}
                        id="txt_edit_charted_catalog_chart_time" />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_edit_charted_catalog_value"
                        class="form-label">
                        value
                    </label>
                    <input bind:value={eventSummaryToEdit.value}
                        id="txt_edit_charted_catalog_value" 
                        class="pplus-textbox" />
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveEventSummaryToEdit}
                    class="save-btn">
                    Save
                </button>
                <span on:click={() => (eventSummaryToEdit = null)}
                    on:keypress={() => (eventSummaryToEdit = null)}
                    class="cancel-btn">
                    Cancel
                </span>
            </div>
        </div>
    </form>
</Modal>