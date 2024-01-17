<script lang="ts">
	import { onMount } from "svelte";
	import Modal from "./Modal.svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";

    export let patientToAdmit: any = null;
    export let unitID: string;

    let formPatientToAdmit: HTMLFormElement;
    let availableBeds: any[] = [];
    let caseTypes: any[] = [];

    const savePatientToAdmit = async () => {
        if(formPatientToAdmit.checkValidity()) {
            await fetch(`/api/admissions`, {
                method: 'POST',
                body: JSON.stringify(patientToAdmit)
            }).then(() => {
                if(patientToAdmit.bedID) {
                    const selectedBed = availableBeds.find(a => a.bedID == patientToAdmit.bedID);
                    goto(`/${$page.params.unit}/${selectedBed.terse}`);
                } else {
                    // refresh page
                    const thisPage = window.location.pathname;
                    goto('/').then(
                        () => goto(thisPage)
                    );
                }
            }).finally(() => {
                patientToAdmit = null;
            });
        }
    }

    onMount(async () => {
        const CASE_TYPE_PARENT_CATALOG = '4CA7B844-F15D-4966-BC40-2833457D932F';

        availableBeds = await(await fetch(`/api/clinical-units/${unitID}/beds/available`)).json();
        caseTypes = await(await fetch(`/api/catalog/${CASE_TYPE_PARENT_CATALOG}/list`)).json();
    });
</script>
<Modal bind:open={patientToAdmit}>
    <h2 slot="title" class="uppercase">Admit Patient</h2>
    <form bind:this={formPatientToAdmit}
        slot="content" class="p-4" id="element">
        {#if patientToAdmit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3  md:mb-0">
                    <label for="slc_admission_bed" class="form-label"> Send to Bed </label>
                    <select bind:value={patientToAdmit.bedID}
                        id="slc_admission_bed"
                        class="w-full text-left"
                        >
                        {#each availableBeds as availableBed}
                            <option class="text-lg" value={availableBed.bedID}>
                                {availableBed.terse}
                            </option>
                        {/each}
                    </select>
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_admission_uin" class="form-label"> HN </label>
                    <input bind:value={patientToAdmit.uin}
                        id="txt_admission_uin"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_admission_hospno" class="form-label"> AN </label>
                    <input bind:value={patientToAdmit.hospNo}
                        id="txt_admission_hospno"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_admission_lastname" class="form-label"> Last Name </label>
                    <input bind:value={patientToAdmit.lastName}
                        id="txt_admission_lastname"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="slc_admission_casetype" class="form-label"> Case Type </label>
                    <select bind:value={patientToAdmit.bundleID}
                        id="slc_admission_casetype"
                        class="w-full text-left"
                        required >
                        {#each caseTypes as caseType}
                            <option class="text-lg" value={caseType.catalogID}>
                                {caseType.value}
                            </option>
                        {/each}
                    </select>
                </div>
                
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={savePatientToAdmit}
                    class="save-btn">
                    Save
                </button>
                <button on:click={() => patientToAdmit = null}
                    class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>