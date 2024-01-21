<script lang="ts">
    import { page } from '$app/stores'
	import { toSlug, toTitleCase } from '$lib/utils/String';
    import type { PageData } from '../$types';
    import Modal from '$lib/components/Modal.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import InputDropdownStatus from './InputDropdownStatus.svelte';
	import ModalPrint from '$lib/components/FlowSheet/ModalPrint.svelte';
	import ModalArchivedEpisodes from '$lib/components/FlowSheet/ModalArchivedEpisodes.svelte';

    export let data: PageData;

    let showPrintModal = false;
    let showArchivedEpisodesModal = false;

    let patientToTransferOrDischarge: {} | null = null;
    const savePatientToTransferOrDischarge = async () => {
        await fetch(`/api/admissions/transfers`, {
            method: 'POST',
            body: JSON.stringify(patientToTransferOrDischarge)
        }).then(() => {
            // refresh page
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(`/${$page.params.unit}`)
            );
        }).finally(() => {
            patientToTransferOrDischarge = null;
        });
    }

    let shownSubTabs = '';
    const toggleShownTab = (tab: string) => {
        if(shownSubTabs == tab) {
            hideSubTabs();
        } else {
            shownSubTabs = tab;
        }
    }

	function hideSubTabs() {
		shownSubTabs = '';
	}

    let bedToLock: {} | null = null;

    let bedToUnlock: {} | null = null;
    const toggleBedLock = async () => {
        const bedID = bedToLock?.bedID || bedToUnlock?.bedID;
        await fetch(`/api/beds/${bedID}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'toggle-lock'})
        }).then(() => {
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(thisPage)
            );
        }).finally(() => {
            bedToLock = null;
            bedToUnlock = null;
            
            // refresh page
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(`/${$page.params.unit}`)
            );
        });
    }

    let availableBeds: any[] = [];
    let dischargeLocations: any[] = [];
    let isArchivedEpisode: boolean;
    let allergyImg: HTMLImageElement;

    onMount(async () => {

        if (!data.patient.allergy) {
            allergyImg.style.filter = 'brightness(40%)';
        }        
        const unitID = data.clinicalUnit.unitID;
        availableBeds = await(await fetch(`/api/clinical-units/${unitID}/beds/available`)).json();

        const DISCHARGE_LOCATION_CATALOG_ID = 'B3198FB0-8610-404E-8AF6-BB16729FE647'
        dischargeLocations = await(await fetch(`/api/catalog/${DISCHARGE_LOCATION_CATALOG_ID}/list`)).json();
    });

    const isUserReadOnly = data.user.roles.split(', ').includes('ReadOnly');

    $: isArchivedEpisode = $page.url.pathname.startsWith('/archived-episodes/');
    $: isLockedByUser = data.patient.lockedby && data.patient.lockedby == data.user.loginID;
    $: isEditable = !isUserReadOnly &&
        !isArchivedEpisode && (!data.patient.lockedby || isLockedByUser);
</script>

<div class="text-white">
    <div class="z-10">
        <main class="pl-2 p-1 bg-pplus-gray">
            <div class="headerPatientInfo grid grid-cols-12 gap-0 text-xs text-pplus-dark-gray">
                <div class="col-span-2">
                    <div class="col-span-1">
                        <span>HN: {data.patient.uin}</span>
                    </div>
                    <div class="col-span-1">
                        <span>Bed: {data.patient.bed}</span>
                    </div>
                </div>
                <div class="col-span-2">
                    <div class="col-span-1">
                        <span>Gender: {data.patient.gender}</span>
                    </div>
                    <div class="col-span-1">
                        <span>Age: {data.patient.age}</span>
                    </div>
                </div>
                <div class="col-span-1">
                    <div class="col-span-1">
                        <span>Weight(kg:) {data.patient.weight}</span>
                    </div>
                    <div class="col-span-1">
                        <span>BMI: {data.patient.bmi | ''}</span>
                    </div>
                </div>
                <div class="col-span-2">
                    <div class="grid grid-cols-4">
                        <div>
                            <span class="intro-x flex items-center">
                                <img bind:this={allergyImg}
                                    src="/img/allergy.png"
                                    class:grayscale={!data.patient.allergy}
                                    alt="allergy icon"
                                    title={data.patient.allergy}
                                    width="32px" />
                            </span>
                        </div>
                        <div>
                            <span class="intro-x flex items-center">
                                <img src="/img/precaution.png"
                                    class:grayscale={!data.patient.precaution}
                                    alt="precaution icon"
                                    title={data.patient.precaution}
                                    width="32px" />
                            </span>
                        </div>
                        {#if !isArchivedEpisode}
                            <div>
                                {#if !data.patient.lockedby || isLockedByUser}
                                    <button on:click={() => patientToTransferOrDischarge = Object.assign({}, data.patient)}
                                        class="intro-x flex items-center">
                                        <img src="/img/transferDischarge.png"
                                            alt="transfer discharge icon"
                                            title="Transfer / Discharge"
                                            width="32px" />
                                    </button>
                                {:else}
                                    <span class="intro-x flex items-center">
                                        <img src="/img/transferDischarge.png"
                                            class="grayscale"
                                            alt="transfer discharge icon"
                                            title="Transfer / Discharge"
                                            width="32px" />
                                    </span>
                                {/if}
                            </div>
                            <div>
                                {#if data.patient.lockedby}
                                    {#if data.patient.lockedby == data.user.loginID}
                                        <button on:click={() => bedToUnlock = { bedID: data.patient.bedID}}
                                            class="intro-x flex items-center">
                                            <img alt="lock icon" title="Locked by: {data.patient.lockedby}" src="/img/unlock.png" width="32px" />
                                        </button>
                                    {:else}
                                        <span class="intro-x flex items-center">
                                            <img src="/img/unlock.png"
                                                class="grayscale"
                                                alt="unlock icon"
                                                title="Locked by: {data.patient.lockedby}"
                                                width="32px" />
                                        </span>
                                    {/if}
                                {:else}
                                    <button on:click={() => bedToLock = { bedID: data.patient.bedID}}
                                        class="intro-x flex items-center cursor-pointer">
                                        <img alt="lock icon" src="/img/lock.png" width="32px" />
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="col-span-5 flex justify-end pr-4">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-10 text-lg overflow-hidden !max-w-[350px]">
                            <span class="truncate">{data.patient.patientName}</span>
                        </div>
                        <div class="col-span-2">
                            <a href="/{$page.params.unit}">
                                <img alt="xMark icon" title="Exit" src="/img/xMark.png" width="32px" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <div class="grid grid-cols-12 pr-6 bg-white text-black border-b-2">
        <div class="grid content-center col-span-7">
            <div class="tab-list">
                <div class="grid grid-cols-12 gap-0 text-center ">
                    {#each [...new Set(data.tabs.map(a => a.Tab))] as tab, i}
                        {@const subTabs = data.tabs.filter(a => a.Tab == tab)}
                        <div class="col-span-3 tab"
                            class:selected={(!$page.params.page && i == 0 || toSlug($page.params.page) == toSlug(tab) || shownSubTabs == tab)}>
                            {#if subTabs.length > 1}
                                <span on:click={() => {toggleShownTab(tab)}}
                                    on:keypress={() => {toggleShownTab(tab)}}>
                                    {toTitleCase(tab)}
                                </span>
                            {:else}
                                <a on:click={hideSubTabs} href="/{data.unit}/{data.bed}/{toSlug(tab)}">
                                    {toTitleCase(tab)}
                                </a>
                            {/if}
                        </div>
                    {/each}
                </div>
                <div class="grid grid-cols-12 gap-0 text-center">
                    {#each [...new Set(data.tabs.map(a => a.Tab))] as tab}
                        {@const subTabs = data.tabs.filter(a => a.Tab == tab)}
                        {#if subTabs.length > 1}
                            {#if shownSubTabs == tab}
                                {#each subTabs as subTab}
                                    {@const selected = toSlug($page.params.subpage) == toSlug(subTab.SubTab) ? 'selected' : ''}
                                    <div class="col-span-3 tab {selected}">
                                        <span>
                                            {#if tab == 'WEB VIEW'}
                                                <a href={subTab.url} target="_blank">
                                                    {toTitleCase(subTab.SubTab)}
                                                </a>
                                            {:else}
                                                <a href="/{data.unit}/{data.bed}/{toSlug(tab)}/{toSlug(subTab.SubTab)}">
                                                    {toTitleCase(subTab.SubTab)}
                                                </a>
                                            {/if}
                                        </span>
                                    </div>
                                {/each}
                            {/if}
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
        <div class="col-span-3 flex justify-center items-center">
            {#key data}
                <InputDropdownStatus statuses={data.statuses}
                    patient={data.patient}
                    {isEditable} />
            {/key}
        </div>

        <div class="col-span-2 flex justify-end absolute right-[20px] mt-[5px]">
            <div class="flex content-center space-x-2">
                <div>
                    <img on:click={() => showPrintModal = true}
                        on:keypress={() => showPrintModal = true}
                        src="/img/printer.png"
                        class="cursor-pointer"
                        alt="Print"
                        title="Print"
                        width="32px" />
                </div>
                <div>
                    <img on:click={() => showArchivedEpisodesModal = true}
                        on:keypress={() => showArchivedEpisodesModal = true}
                        src="/img/Document.png"
                        class="cursor-pointer"
                        alt="Archived Episodes"
                        title="Archived Episodes"
                        width="32px" />
                </div>
            </div>
        </div>
    </div>

    <slot />
</div>

<Modal bind:open={bedToUnlock}>
    <h2 slot="title" class="uppercase">Unlock Bed</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to unlock this bed?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={toggleBedLock} class="save-btn"> Unlock </button>
                <button on:click={() => bedToUnlock = null} class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={bedToLock}>
    <h2 slot="title" class="uppercase">Lock Bed</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to lock this bed?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={toggleBedLock} class="save-btn"> Lock </button>
                <button on:click={() => bedToLock = null} class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={patientToTransferOrDischarge}>
    <h2 slot="title" class="uppercase">Transfer / Discharge</h2>
    <form slot="content" class="p-4">
        {#if patientToTransferOrDischarge}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="" class="form-label">Option</label>
                    <select class="w-full text-left" bind:value={patientToTransferOrDischarge.action}>
                        <option class="text-lg" value="Bed Transfer" selected>
                            Bed Transfer
                        </option>
                        <option class="text-lg" value="Discharge Location">
                            Discharge Location
                        </option>
                    </select>
                </div>
            </div>
            {#if patientToTransferOrDischarge.action == 'Bed Transfer'}
                <div class="flex flex-wrap -mx-3">
                    <div class="w-full md:w-full px-3">
                        <select bind:value={patientToTransferOrDischarge.transferToBedId}
                            class="w-full text-left">
                            {#each availableBeds as availableBed}
                                <option class="text-lg" value="{availableBed.bedID}">
                                    {availableBed.terse}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
            {:else if patientToTransferOrDischarge.action == 'Discharge Location'}
                <div class="flex flex-wrap -mx-3">
                    <div class="w-full md:w-full px-3">
                        <select bind:value={patientToTransferOrDischarge.dischargeToLocationId}
                            class="w-full text-left">
                            {#each dischargeLocations as dischargeLocation}
                                <option class="text-lg" value="{dischargeLocation.catalogID}">
                                    {dischargeLocation.value}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
            {/if}
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={savePatientToTransferOrDischarge}
                    class="save-btn">
                    Save
                </button>
                <button on:click={() => patientToTransferOrDischarge = null}
                    class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

{#if showPrintModal}
    <ModalPrint bind:showPrintModal
        ptEncounterID={data.patient.ptencounterID}
        unitID={data.patient.unitID} />
{/if}

{#if showArchivedEpisodesModal}
    <ModalArchivedEpisodes bind:showArchivedEpisodesModal
        ptEncounterID={data.patient.ptencounterID} />
{/if}

<style>
    .semiSelected {
        border-bottom: 2px solid #232D45;
    }
</style>