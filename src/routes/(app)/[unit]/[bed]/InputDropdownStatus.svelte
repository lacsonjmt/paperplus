<script lang="ts">
	import InputDateTime from "$lib/components/InputDateTime.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import { toNormalDateTimeString, toStandardDateTimeString } from "$lib/utils/DateTime";
	import moment from "moment";
	import { onMount } from "svelte";

    export let patient: any = {};

    export let statuses: any[] = [];
    export let isEditable: boolean = false;

    let originalStatus: any = {};
    let selectedStatus: any = {};
    let isUpdateStatusModalShown: boolean = false;
    let chartTime: Date = new Date;

    const showUpdateStatusModal = () => {
        isUpdateStatusModalShown = true;
        chartTime = new Date;
    }

    const resetSelectedStatus = () => {
        isUpdateStatusModalShown = false;

        originalStatus = statuses.find(a => a.value == patient.patientStatus);
        selectedStatus = statuses.find(a => a.value == patient.patientStatus);
    }

    const updatePatientStatus = async () => {
        await fetch(`/api/patient-statuses`, {
            method: 'PATCH',
            body: JSON.stringify({
                ptencounterID: patient.ptencounterID,
                unitID: patient.unitID,
                catalogID: selectedStatus.catalogID,
                chartTime: toStandardDateTimeString(chartTime),
            })
        }).then(() => {
            patient.patientStatus = statuses.find(a => a.catalogID == selectedStatus.catalogID).value;
        }).finally(resetSelectedStatus);
    }

    onMount(resetSelectedStatus);
</script>

<select bind:value={selectedStatus}
    on:change={showUpdateStatusModal}
    class="w-2/3 h-8 border font-bold text-center"
    disabled={!isEditable}>
    {#each statuses as status}
        <option class="text-sm" value={status}>
            {status.value}
        </option>
    {/each}
</select>

<Modal bind:open={isUpdateStatusModalShown}
    on:close={resetSelectedStatus}>
    <h2 slot="title" class="uppercase">Update Patient Status</h2>
    <form slot="content" class="p-4">
        <div class="flex flex-wrap -mx-3">
            <div class="w-full md:w-1/2 px-3">
                <label for="txt_status_chart_time" class="form-label"> Date</label>
                <InputDateTime id="txt_status_chart_time" bind:value={chartTime} readonly={true}/>
            </div>
            <div class="w-full md:w-full px-3">
                <input value={selectedStatus.value}
                    type="text" class="pplus-textbox" readonly />
            </div>
        </div>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={updatePatientStatus} class="save-btn"> Save </button>
                <button on:click={resetSelectedStatus} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>