<script lang="ts">
    import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import Modal from '$lib/components/Modal.svelte';
    import moment from 'moment';
	import ModalAdmission from './ModalAdmission.svelte';

    export let user;
    const sessionuserID = user.userID;

    let clinicalUnits: any[] = [];
    let selectedClinicalUnit: any;

    let patientToAdmit: {} | null = null;

    let beds: any[] = [];
    let availableBeds: any[] = [];
    const fetchBeds = async (clinicalUnit: any) => {
        beds = await(await fetch(`/api/clinical-units/${clinicalUnit.unitID}/beds`)).json();
        availableBeds = await(await fetch(`/api/clinical-units/${clinicalUnit.unitID}/beds/available`)).json();
    }
    
    let date = moment();
    onMount(async () => {
        clinicalUnits = await (await fetch(`/api/users/${sessionuserID}/clinical-units`)).json();
        selectedClinicalUnit = clinicalUnits[0];
        if(!$page.params.unit) {
            goto(`/${selectedClinicalUnit.terse}`);
        }

        await fetchBeds(selectedClinicalUnit);

        setInterval(async () => {
            date = moment();
        }, 1000);

        setInterval(async () => {
            await fetchBeds(selectedClinicalUnit);
        }, 5000);
    });

    $: currentDate = date.format('MMMM D, Y');
    $: currentTime = date.format('HH:mm:ss');
    $: availableBedIds = availableBeds.map(a => a.bedID);
</script>

<aside class="p-2 text-center text-pplus-blue h-full flex flex-col">
    <ul class="z-30">
        <li class="pt-2 text-left text-xs">Clinical Unit</li>
        <li class="py-2 mb-4">
            <select bind:value={selectedClinicalUnit}
                on:change={() => {
                    fetchBeds(selectedClinicalUnit);
                    goto(`/${selectedClinicalUnit.terse}`);
                }}
                class="w-full bg-white text-black font-bold text-lg text-center">
                {#each clinicalUnits as unit}
                    <option class="text-lg" value={unit}>
                        {unit.terse}
                    </option>
                {/each}
            </select>
        </li>
    </ul>
    <ul class="sidebar grow-1 overflow-y-auto mb-4">
        {#each beds as bed}
            {#if !availableBedIds.includes(bed.bedID)}
                {@const url = `/${selectedClinicalUnit.terse}/${bed.terse}/`} 
                <a href="{url}" class:active={$page.url.pathname.startsWith(url)}>
                    <li class="border-t p-2 hover:text-white text-pplus-orange">
                        {bed.terse}
                    </li>
                </a>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <li on:click={() => patientToAdmit = {
                        unitID: selectedClinicalUnit.unitID,
                        bedID: bed.bedID
                    }}
                    class="border-t p-2 hover:text-white cursor-pointer">
                    {bed.terse}
                </li>
            {/if}
        {/each}
    </ul>
    <div class="grow-0 text-lg" id="date">
        {currentDate}<br>
        {currentTime}
    </div>
</aside>

{#if selectedClinicalUnit}
    <ModalAdmission bind:patientToAdmit
        unitID={selectedClinicalUnit.unitID} />
{/if}