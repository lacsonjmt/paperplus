<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '../Modal.svelte';
	import { toStandardDateTimeString } from '$lib/utils/DateTime';
	import InputDateTime from '../InputDateTime.svelte';
	import { goto } from '$app/navigation';

	export let showStopContinuousMedModal: boolean = false;
	export let ptEncounterID: string;
	export let unitID: string;

	let modal: Modal;

	let dateTimeStop = new Date();

	const reset = () => {
		selectedMedications = [];
	};

	let selectedMedications: any[] = [];
	const selectMedication = (medication: any) => {
		if (selectedMedications.includes(medication)) {
			selectedMedications = selectedMedications.filter((a) => a != medication);
		} else {
			selectedMedications = [...selectedMedications, medication];
		}
	};

	const stopMedications = async () => {
		await fetch(`/api/medications/stop`, {
			method: 'POST',
			body: JSON.stringify({
				ptEncounterID,
				unitID,
				selectedMedications,
				dateTimeStop
			})
		}).then(async () => {
			medications = await (
				await fetch(`/api/medications?ptEncounterID=${ptEncounterID}&unitID=${unitID}`)
			).json();
			showStopContinuousMedModal = false;
			refreshPage();
		});
	};

	const deleteMedications = async () => {
		await fetch(`/api/medications/delete`, {
			method: 'POST',
			body: JSON.stringify({
				ptEncounterID,
				unitID,
				selectedMedications
			})
		}).then(async () => {
			medications = await (
				await fetch(`/api/medications?ptEncounterID=${ptEncounterID}&unitID=${unitID}`)
			).json();
			showStopContinuousMedModal = false;
			refreshPage();
		});
	};

	const refreshPage = () => {
		// refresh page
		const thisPage = window.location.pathname;
		goto('/').then(() => goto(thisPage));
	};

	let medications: any[] = [];
	onMount(async () => {
		medications = await (
			await fetch(`/api/medications?ptEncounterID=${ptEncounterID}&unitID=${unitID}`)
		).json();
	});
</script>

<Modal bind:this={modal} bind:open={showStopContinuousMedModal} on:close={reset}>
	<h2 slot="title" class="uppercase">Stop Continuous: Medication/Fluid</h2>
	<form slot="content" class="p-4">
		<div class="flex flex-wrap -mx-3 mb-1">
			<div class="w-full md:w-full px-3">
				<label for="txt_stop_medication_date_time" class="form-label"> Stop Date </label>
				<InputDateTime bind:value={dateTimeStop} id="txt_stop_medication_date_time" />
			</div>
		</div>
		<div class="flex flex-wrap -mx-3">
			<table class="w-full border-b-2 border-top text-white">
				<thead class=" border-bottom">
					<tr class="text-sm font-semibold text-center border-b-2 mb-4">
						<th class="text-center p-2 px-2">Medication</th>
						<th class="text-center p-2 px-2">StartDate</th>
						<th class="text-center p-2 px-2">Value</th>
					</tr>
				</thead>
				<tbody class="dark-striped text-sm font-normal text-center">
					{#each medications as medication}
						<tr
							on:click={() => selectMedication(medication)}
							class:selected={selectedMedications.includes(medication)}
							class="py-2 font-small text-white"
						>
							<td> {medication.medication} </td>
							<td> {toStandardDateTimeString(medication.startTime)} </td>
							<td class="border-left"> {medication.value || ''} </td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="flex items-center mt-2">
			<div class="flex justify-start w-1/2">
				<div>
					<button
						on:click={deleteMedications}
						class="delete-btn"
						disabled={!selectedMedications.length}
					>
						Delete
					</button>
				</div>
			</div>
			<div
				class="flex justify-end w-1/2 lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0"
			>
				<div>
					<button
						on:click={stopMedications}
						class="save-btn"
						disabled={!selectedMedications.length}
					>
						Stop
					</button>
				</div>
				<div>
					<span on:click={() => modal.close()} on:keypress={() => modal.close()} class="cancel-btn">
						Cancel
					</span>
				</div>
			</div>
		</div>
	</form>
</Modal>

<style>
	button[disabled] {
		background-color: #434343;
		border: 1px solid #4b4444;
	}
	table tr td {
		@apply text-white;
	}

	/* tr:nth-child(even) td {
		background-color: #334155;
	} */

	tbody tr:hover {
		background-color: #cacaca !important;
	}
</style>
