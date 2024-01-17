<script lang="ts">	
	import type { PageData } from "../$types";
	import DischargedEncounters from "./DischargedEncounters.svelte";
	import PreAdmissions from "./PreAdmissions.svelte";
    import Modal from '$lib/components/Modal.svelte';
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

    export let data: PageData;

    let availableBeds: any[] = [];
    let dischargeLocations: any[] = [];
    let searchKeyword = '';
    let dashboardItems: any[] = [];
    let patientToTransferOrDischarge: {} | null = null;

    const savePatientToTransferOrDischarge = async () => {
        await fetch(`/api/admissions/transfers`, {
            method: 'POST',
            body: JSON.stringify(patientToTransferOrDischarge)
        }).then(() => {
            // refresh page
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(thisPage)
            );
        }).finally(() => {
            patientToTransferOrDischarge = null;
        });
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
        });
    }

    onMount(async() => {
        const unitID = data.clinicalUnit.unitID;
        availableBeds = await(await fetch(`/api/clinical-units/${unitID}/beds/available`)).json();

        const DISCHARGE_LOCATION_CATALOG_ID = 'B3198FB0-8610-404E-8AF6-BB16729FE647'
        dischargeLocations = await(await fetch(`/api/catalog/${DISCHARGE_LOCATION_CATALOG_ID}/list`)).json();
    });

    $: {
        dashboardItems = data.dashboard.recordset.filter(a => {
            let searchKeywordLower = searchKeyword.toLowerCase();
            return a.patientName.toLowerCase().includes(searchKeywordLower)
                || a.uin.toLowerCase().includes(searchKeywordLower)
        });
    }

    const isUserReadOnly = data.user.roles.split(', ').includes('ReadOnly');
</script>

<svelte:head>
    <title>Paper+</title>
    <meta name="description" content="Paper+" />
</svelte:head>
<div>
    <div class="grid grid-cols-12 gap-2 bg-primary-blue px-2 py-2 items-center">
        <div class="col-span-2">
            <span class="font-bold text-sm inline-block text-white">Search Patient Name / UIN</span>
        </div>
        <div class="col-span-10">
            <input placeholder="Search..." bind:value={searchKeyword} class="pplus-textbox"/>
        </div>
    </div>
    <div class="grid sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 m-4 pl-4">
        {#each dashboardItems as dashboardItem}
            {@const bgClass = dashboardItem.redflag ? 'bg-red-500': 'bg-primary-blue'}
            {@const isEditable = !isUserReadOnly && !dashboardItem.lockedby || (dashboardItem.lockedby == data.user.loginID)}

            <div class="card flex flex-col w-100 border border-gray-200 shadow bg-pplus-light-gray">
                <h5 class="tracking-tight text-white text-lg text-center {bgClass} ">
                    <a href="/{data.clinicalUnit.terse}/{dashboardItem.bed}">
                        {dashboardItem.bed}
                    </a>
                </h5>
                <div class="flex mr-0">
                    <ul class="p-2">
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Patient Name: </span>
                            {dashboardItem.patientName}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">HN: </span>
                            {dashboardItem.uin}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">AN: </span>
                            {dashboardItem.hospNo}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Gender: </span>
                            {dashboardItem.gender || ''}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Age: </span>
                            {dashboardItem.age}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Patient Status: </span>
                            {dashboardItem.patientStatus || ''}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Case Type:</span>
                            {dashboardItem.caseType}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Surgeon:</span>
                            {dashboardItem.surgeon}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Procedure:</span>
                            {dashboardItem.procedure}
                        </li>
                        <li class="text-sm py-px">
                            <span class="font-bold mr-1 text-pplus-blue">Diagnosis:</span>
                            {dashboardItem.diagnosis}
                        </li>
                    </ul>

                </div>
                <div class="flex mt-auto">
                    <ul class="flex justify-center mr-auto px-2 py-2 space-x-4">
                        <li>
                            <img class:grayscale={!dashboardItem.allergy}
                                class="h-auto w-7"
                                src="/img/allergy.jpg"
                                alt="allergy icon"
                                title={dashboardItem.allergy} />
                        </li>
                        <li>
                            <img class:grayscale={!dashboardItem.precaution}
                                class="h-auto w-7"
                                src="/img/precaution.png"
                                alt="precaution icon"
                                title={dashboardItem.precaution} />
                        </li>
                        <li>
                            {#if isEditable}
                                <button on:click={() => patientToTransferOrDischarge = dashboardItem}
                                    class="intro-x flex items-center cursor-pointer">
                                    <img src="/img/transferDischarge.png"
                                        class="h-auto w-7"
                                        alt="transfer discharge icon"
                                        title="Transfer / Discharge" />
                                </button>
                            {:else}
                                <span class="intro-x flex items-center">
                                    <img src="/img/transferDischarge.png"
                                        class="h-auto w-7 grayscale" 
                                        alt="transfer discharge icon" title="Transfer / Discharge" />
                                </span>
                            {/if}
                        </li>
                            
                        <li>
                            {#if isEditable}
                                {#if dashboardItem.lockedby}
                                    <button on:click={() => bedToUnlock = { bedID: dashboardItem.bedID }}
                                        class="intro-x flex items-center cursor-pointer">
                                        <img src="/img/unlock.png"  
                                            class="h-auto w-7"
                                            alt="unlock icon"
                                            title="Locked by: {dashboardItem.lockedby}" />
                                    </button>
                                {:else}
                                    <button on:click={() => bedToLock = { bedID: dashboardItem.bedID }}
                                        class="intro-x flex items-center cursor-pointer">
                                        <img src="/img/lock.png"  
                                            class="h-auto w-7"
                                            alt="lock icon" />
                                    </button>
                                {/if}
                            {:else}
                                <span>
                                    <img src="/img/unlock.png"
                                        class="h-auto w-7 grayscale"
                                        alt="disabled lock icon"
                                        title="Locked by: ${dashboardItem.lockedby}" /> 
                                </span>
                            {/if}
                        </li>
                    </ul>
                </div>
            </div>
        {/each}
    </div>
    <PreAdmissions bind:searchKeyword unitID={data.clinicalUnit.unitID} />
    <DischargedEncounters bind:searchKeyword unitID={data.clinicalUnit.unitID} />
</div>

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