<script lang="ts">
	import { Action, PatientAccess } from "$lib/models/PatientAccess";
    import { DataHandler, Datatable, Th } from '@vincjo/datatables';
	import { onMount } from "svelte";
	import type { Readable } from "svelte/store";
    import Alert, { AlertType } from '$lib/components/Alert.svelte';
	import Modal from "$lib/components/Modal.svelte";
	import { toStandardDateTimeString } from "$lib/utils/DateTime";

    let patientAccesses: PatientAccess[] = [];
    let handler: DataHandler;
    let rows: Readable<any[]>;

    let patientAccessToUnlock: PatientAccess | null;

    let alertMessages: any[] = [];

    const fetchData = async () => {
        patientAccesses = [];
        const pcObjects = await (await fetch(`/api/patient-accesses`)).json();
        pcObjects.forEach((o: any) => {
            patientAccesses = [...patientAccesses, Object.assign(new PatientAccess, o)];
        });
        handler = new DataHandler(patientAccesses, { rowsPerPage: 50 });
        rows = handler.getRows();
    };

    const unlockPatientAccess = async (patientAccess: PatientAccess | null) => {
        if (patientAccess) {
            await fetch(`/api/patient-accesses/${patientAccess.bedID}`, {
                method: 'PATCH',
                body: JSON.stringify(Object.assign(patientAccess, { action: Action.UNLOCK }))
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Unlock successful.',
                    message: 'Patient access is successfully unlocked.'
                }];
                handler.setRows($rows.filter((a) => a != patientAccess));
            }).finally(() => {
                patientAccessToUnlock = null;
            });
        }
    };

    onMount(async () => {
        fetchData();
    });
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="mt-2 ">
    {#if rows}
        <Datatable {handler}>
            <table class="w-full table-auto tableLight">
                <thead>
                    <tr class="text-sm font-semibold text-center  tableLight bg-white  ">
                        <Th {handler} orderBy="ptName">Patient Name</Th>
                        <Th {handler} orderBy="lockedinPC">Locked in PC</Th>
                        <Th {handler} orderBy="bed">Bed</Th>
                        <Th {handler} orderBy="loginID">Login ID</Th>
                        <Th {handler} orderBy="unit">Unit</Th>
                        <Th {handler} orderBy="lockedTime">Locked Time</Th>
                        <th class="text-center p-2 px-2">Action</th>
                    </tr>
                </thead>
                <tbody class="striped text-sm font-normal text-black text-center">
                    {#each $rows as patientAccess}
                        <tr class="py-4 bg-gray-100 font-small ">
                            <td>{patientAccess.ptName}</td>
                            <td>{patientAccess.lockedinPC}</td>
                            <td>{patientAccess.bed}</td>
                            <td>{patientAccess.loginID}</td>
                            <td>{patientAccess.unit}</td>
                            <td>{toStandardDateTimeString(patientAccess.lockedTime)}</td>
                            <td>
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                    <button on:click={() => patientAccessToUnlock = patientAccess}
                                        class="items-center px-2 py-2 hover:text-sky-700">
                                        <img alt="lock button" title="Unlock Patient" src="/img/lock.png" width="24px" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </Datatable>
    {:else}
        Loading...
    {/if}
</div>

<Modal bind:open={patientAccessToUnlock}>
    <h2 slot="title">Unlock Patient Access</h2>
    <svg class="ml-auto fill-current text-gray-700 w-6 h-6 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18" >
        <path
            d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
        />
    </svg>
    <div class="p-4" slot="content">
        <div class="text-white">
            Are you sure you want to unlock this patient access?
        </div>
        <div class="ml-auto mt-4">
            <button on:click={() => unlockPatientAccess(patientAccessToUnlock)}
                class="delete-btn">
                Unlock
            </button>
            <button on:click={() => (patientAccessToUnlock = null)}
                class="cancel-btn">
                Cancel
            </button>
        </div>
    </div>
</Modal>

