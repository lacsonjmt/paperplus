<script lang="ts">
	import { AlertType } from "../Alert.svelte";
	import InputDateTime from "../InputDateTime.svelte";
    import Modal from "../Modal.svelte";
	
    export let noteSummaryToEdit: any = null;
    export let alertMessages: any;

    let formEditNoteSummary: HTMLFormElement;
    const saveNoteSummaryToEdit = async () => {
        if(formEditNoteSummary.checkValidity() && noteSummaryToEdit) {
            await fetch(`/api/charted-catalog`, {
                method: 'PATCH',
                body: JSON.stringify(noteSummaryToEdit)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Update successful.',
                    message: `Note summary is successfully updated.`
                }];
            }).finally(() => {
                noteSummaryToEdit = null;
            });
        }
    }
</script>
<Modal bind:open={noteSummaryToEdit}>
    <h2 slot="title" class="uppercase">Edit Note Summary</h2>
    <form bind:this={formEditNoteSummary}
        slot="content" class="p-4">
        {#if noteSummaryToEdit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_edit_charted_catalog_chart_time"
                        class="form-label">
                        date
                    </label>
                    <InputDateTime bind:value={noteSummaryToEdit.chartTime}
                        id="txt_edit_charted_catalog_chart_time" />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_edit_charted_catalog_value"
                        class="form-label">
                        value
                    </label>
                    <input bind:value={noteSummaryToEdit.value}
                        id="txt_edit_charted_catalog_value" 
                        class="pplus-textbox" />
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveNoteSummaryToEdit}
                    class="save-btn">
                    Save
                </button>
                <span on:click={() => (noteSummaryToEdit = null)}
                    on:keypress={() => (noteSummaryToEdit = null)}
                    class="cancel-btn">
                    Cancel
                </span>
            </div>
        </div>
    </form>
</Modal>