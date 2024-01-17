<script lang="ts">
	import InputDateTime from "../InputDateTime.svelte";
	import Modal from "../Modal.svelte";
    import Alert, { AlertType } from '$lib/components/Alert.svelte';
	import { onMount } from "svelte";
	import { toStandardDateTimeString } from "$lib/utils/DateTime";
	import { goto } from "$app/navigation";

    export let showTrendModal: boolean = false;
    export let ptEncounterID: string;
    export let unitID: string;

    let start = new Date;
    let end = new Date;

    let alertMessages: any[] = [];

    const reset = () => {
        const now = new Date;
        start = new Date(now.setMinutes(now.getMinutes() - 5));
        alertMessages = [];
    }

    const saveTrendUpload = async () => {
        await fetch(`/api/trend-upload`, {
            method: 'POST',
            body: JSON.stringify({
                ptEncounterID,
                unitID,
                start: toStandardDateTimeString(start),
                end: toStandardDateTimeString(end)
            })
        }).then(() => {
            alertMessages = [...alertMessages, {
                type: AlertType.SUCCESS,
                title: 'Trend Upload saved.',
                message: `Successfully saved Trend Upload.`
            }];
        }).finally(() => {
            setTimeout(() => {
                showTrendModal = false;
                reset();

                // refresh page
                const thisPage = window.location.pathname;
                goto('/').then(
                    () => goto(thisPage)
                );
            }, 3000);
        });
    }
    
    onMount(() => {
        reset();
    })
</script>

<Modal bind:open={showTrendModal}>
    <h2 slot="title" class="uppercase">Trend Upload</h2>
    <form slot="content" class="p-4">
        {#each alertMessages as alertMessage}
            <Alert type={alertMessage.type}>
                <h2 slot="header">{alertMessage.title}</h2>
                <div slot="content">{alertMessage.message}</div>
            </Alert>
        {/each}
        <div class="w-full md:w-full px-3  md:mb-0">
            <label for="txt_trend_upload_start" class="form-label"> Start Date </label>
            <InputDateTime bind:value="{start}"
                id="txt_trend_upload_start"/>
        </div>
        <div class="w-full md:w-full px-3  md:mb-0">
            <label for="txt_trend_upload_end" class="form-label"> End Date </label>
            <InputDateTime bind:value="{end}"
                id="txt_trend_upload_end"/>
        </div>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveTrendUpload} class="save-btn"> Save </button>
                <span on:click={() => showTrendModal = false}
                    on:keypress={() => showTrendModal = false}
                    class="cancel-btn">
                    Cancel
                </span>
            </div>
        </div>
    </form>
</Modal>