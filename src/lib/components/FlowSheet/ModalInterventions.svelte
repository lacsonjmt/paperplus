<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import Modal from "../Modal.svelte";

    export let showInterventionsModal: boolean = false;
    export let hierarchicalCatalogs: any[] = [];
    export let ptEncounterID: string;
    export let unitID: string;

    let modal: Modal;

    let interventionCategories:any = [];
    let interventions:any = {};

    let selectedMainCategory: any = null;
    let customIntervention: string = '';
    let selectedInterventions: any[] = [];
    let interventionsToAdd: any[] = [];

    let usedInterventions: any[] = [];
    let unusedInterventions: any[] = [];

    const reset = () => {
        selectedInterventions = [];
        interventionsToAdd = [];
        selectedMainCategory = interventionCategories ? interventionCategories[0] : null;
    }

    const getCatalogList = async (catalogID: string) => {
        return await(await fetch(`/api/catalog/${catalogID}/list`)).json();
    }

    const selectIntervention = (intervention: any) => {
        customIntervention = '';

        if(selectedInterventions.length) {
            const isSelectedOnToAdd = interventionsToAdd.includes(intervention);
            if(interventionsToAdd.includes(selectedInterventions[0])) {
                if(!isSelectedOnToAdd) {
                    selectedInterventions = [];
                }
            } else if(isSelectedOnToAdd) {
                selectedInterventions = [];
            }
        }

        if(selectedInterventions.includes(intervention)) {
            selectedInterventions = selectedInterventions.filter(a => a != intervention);
        } else {
            selectedInterventions = [...selectedInterventions, intervention];
        }
    }

    const moveInterventionsToAdd = () => {
        if(customIntervention) {
            console.log(usedInterventions)
            const customInterventionLowerCase = customIntervention.toLowerCase();
            if(unusedInterventions.map(a => a.value.toLowerCase()).includes(customInterventionLowerCase)) {
                const autoSelectIntervention = unusedInterventions.find(a => a.value.toLowerCase() == customInterventionLowerCase);
                selectIntervention(autoSelectIntervention);
            }

            if(!usedInterventions.map(a => a.shortLabel.toLowerCase()).includes(customInterventionLowerCase)
                && !interventionsToAdd.map(a => a.value.toLowerCase()).includes(customInterventionLowerCase)) {
                interventionsToAdd = [...interventionsToAdd, { value: customIntervention }];
            }

            customIntervention = '';
        }
        interventionsToAdd = [...interventionsToAdd, ...selectedInterventions];
    }

    const saveInterventionsToAdd = async () => {
        interventionsToAdd = interventionsToAdd.filter(a => a.value != '');
        await fetch(`/api/interventions/add`, {
            method: 'POST',
            body: JSON.stringify({
                ptEncounterID,
                unitID,
                selectedMainCategory,
                interventionsToAdd
            })
        }).then(() => {
            const thisPage = window.location.pathname;
            goto('/').then(
                () => goto(thisPage)
            );
        }).finally(() => {
            reset();
        });
    }

    const onSelectedMainCategoryChange = () => {
        selectedInterventions = [];
        interventionsToAdd = [];
    }

    onMount(async () => {
        const INTERVENTION_CATALOG = '615D7E1A-0504-40B6-86A3-A3BA71FAAF42';
        interventionCategories = await getCatalogList(INTERVENTION_CATALOG);
        interventionCategories.forEach(async (a: any) => {
            interventions[a.catalogID] = await getCatalogList(a.catalogID);
        });
        reset();
    });

    $: {
        if(selectedMainCategory) {
            const catalogInHierarchy = hierarchicalCatalogs.find(a => a.catalogID == selectedMainCategory.catalogID);
            if(catalogInHierarchy) {
                usedInterventions = catalogInHierarchy.childCatalogs;
            }
            unusedInterventions = interventions[selectedMainCategory.catalogID] || [];
            unusedInterventions = unusedInterventions.filter(a => !usedInterventions.map(a => a.catalogID).includes(a.catalogID));
            unusedInterventions = unusedInterventions.filter(a => !interventionsToAdd.includes(a));
        }
    }

</script>

<Modal bind:this={modal}
    bind:open={showInterventionsModal}
    on:close={reset}>
    <h2 slot="title" class="uppercase">NEW INTERVENTION</h2>
    <form slot="content" class="p-4">
        <div class="flex flex-wrap -mx-3 mb-1">
            <div class="w-full md:w-full px-3">
                <select bind:value={selectedMainCategory}
                    on:change={onSelectedMainCategoryChange}
                    class="w-full text-left">
                    {#each interventionCategories as category}
                        <option class="text-lg" value={category}>
                            {category.value}
                        </option>
                    {/each}
                </select>
            </div>
        </div>
        <div class="flex flex-wrap mb-2 w-full">
            <div class="w-5/12 md:w-5/12">
                <div class="bg-white border-2 h-48 overflow-y-auto w-full">
                    <table class="modalTable w-full table-auto">
                        <tbody>
                            <tr>
                                <td>
                                    <input bind:value={customIntervention} 
                                        on:focus={() => selectedInterventions = []}
                                        id="txt_custom_intervention"
                                        class="pplus-textbox w-full selected"
                                        placeholder="New Intervention" />
                                </td>
                            </tr>
                            {#each unusedInterventions as intervention}
                                <tr on:click={() => selectIntervention(intervention)}
                                    class:selected={selectedInterventions.includes(intervention)}>
                                    <td>{intervention.value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="w-2/12 md:w-2/12 px-2">
                <div class="flex items-center justify-center h-48 overflow-y-auto">
                    <ul class="space-y-2">
                        <li>
                            {#if customIntervention || (selectedInterventions.length && !interventionsToAdd.includes(selectedInterventions[0]))}
                                <button on:click={moveInterventionsToAdd}>
                                    <img alt="Add" class="arrows" src="/img/arrowright.png" width="48" />
                                </button>
                            {:else}
                                <button disabled>
                                    <img alt="Add" class="arrows" src="/img/arrowright.png" width="48" />
                                </button>
                            {/if}
                        </li>
                        <li>
                            {#if selectedInterventions.length && interventionsToAdd.includes(selectedInterventions[0])}
                                <button on:click={() => interventionsToAdd = interventionsToAdd.filter(a => !selectedInterventions.includes(a))}>
                                    <img alt="Remove" class="arrows" src="/img/arrowleft.png" width="48" />
                                </button>
                            {:else}
                                <button disabled>
                                    <img alt="Remove" class="arrows" src="/img/arrowleft.png" width="48" />
                                </button>
                            {/if}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="w-5/12 md:w-5/12">
                <div class="bg-white border-2 h-48 overflow-y-auto w-full">
                    <table class="modalTable table-auto">
                        <tbody>
                            {#each interventionsToAdd as intervention}
                                <tr on:click={() => selectIntervention(intervention)}
                                    class:selected={selectedInterventions.includes(intervention)}>
                                    <td>{intervention.value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>     
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={saveInterventionsToAdd}
                    class:grayscale={interventionsToAdd.length == 0}
                    class="save-btn"
                    disabled={interventionsToAdd.length == 0}>
                    Save
                </button>
                <button on:click={() => modal.close()} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<style>
    #txt_custom_intervention:focus {
        @apply text-white;
        background-color: #232D45 !important;
    }
    button:disabled img {
        @apply grayscale;
    }

    tr.selected td {
        @apply text-white;
    }
</style>