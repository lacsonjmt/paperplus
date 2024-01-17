<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";

	import { ClientPC } from "$lib/models/ClientPC";
    import { DataHandler, Datatable, Th } from '@vincjo/datatables';
	import { onMount } from "svelte";
	import type { Readable } from "svelte/store";

    import Alert, { AlertType } from '$lib/components/Alert.svelte';

    let clientPCs: ClientPC[] = [];
    let handler: DataHandler;
    let rows: Readable<any[]>;

    let clinicalUnits: any[] = [];

    let clientPcToCreate: ClientPC | null;
    let clientPcToEdit: ClientPC | null;
    let clientPcToDelete: ClientPC | null;

    let alertMessages: any[] = [];

    let formCreate: HTMLFormElement;
    let formEdit: HTMLFormElement;

    const fetchClientPCs = async () => {
        clientPCs = [];
        const pcObjects = await (await fetch(`/api/client-pcs`)).json();
        pcObjects.forEach((o: any) => {
            clientPCs = [...clientPCs, Object.assign(new ClientPC, o)];
        });

        handler = new DataHandler(clientPCs, { rowsPerPage: 50 });
        rows = handler.getRows();
    };

    const createClientPC = async (pc: ClientPC | null) => {
        if(pc) {
            await fetch(`/api/client-pcs`, {
                method: 'POST',
                body: JSON.stringify(pc)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Create successful.',
                    message: 'Client PC is successfully created.'
                }];
                
            }).finally(() => {
                clientPcToCreate = null;
                fetchClientPCs();
            });
        }
    };

    const updateClientPC = async (pc: ClientPC | null) => {
        if (pc) {
            await fetch(`/api/client-pcs/${pc.clientID}`, {
                method: 'PATCH',
                body: JSON.stringify(pc)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Edit successful.',
                    message: 'PC is successfully edited.'
                }];
            }).finally(() => {
                clientPcToEdit = null;
                fetchClientPCs();
            });
        }
    };

    const deleteClientPC = async (pc: ClientPC | null) => {
        if (pc) {
            await fetch(`/api/client-pcs/${pc.clientID}`, {
                method: 'DELETE'
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Delete successful.',
                    message: 'PC Successfully deleted'
                }];
                handler.setRows($rows.filter((a) => a != pc));
            }).finally(() => {
                clientPcToDelete = null;
            });
        }
    };

    onMount(async () => {
        clinicalUnits = await (await fetch(`/api/clinical-units`)).json();
        fetchClientPCs();
    });
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 mb-2 mt-4">
    <button on:click={() => (clientPcToCreate = new ClientPC())}>
        <img alt="add user" class="createBtn ml-4" src="/img/add.png" width="48" />
    </button>
</div>

<div class="mt-2">
    {#if rows}
        <Datatable {handler}>
            <table class="w-full table-auto tableLight">
                <thead>
                    <tr class="text-sm font-semibold text-center tableLight bg-white  ">
                        <Th {handler} orderBy="hostname">Host Name</Th>
                        <Th {handler} orderBy="location">Location</Th>
                        <Th {handler} orderBy="isOR">OR PC</Th>
                        <th class="text-center p-2 px-2">Action</th>
                    </tr>
                </thead>
                <tbody class="striped text-sm font-normal text-black text-center">
                    {#each $rows as clientPC}
                    {@const selected = clientPcToDelete == clientPC ? 'selected' : ''}
                        <tr class="py-4 bg-gray-100 font-small {selected}">
                            <td>{clientPC.hostname}</td>
                            <td>{clientPC.location}</td>
                            <td>
                                <input checked={clientPC.isOR} type="checkbox" disabled />
                            </td>
                            <td>
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                    <button on:click={() => clientPcToEdit = Object.assign(new ClientPC, clientPC, { original: clientPC })}
                                        class="items-center px-2 py-2 hover:text-sky-700">
                                        Edit
                                    </button>
                                    <button on:click={() => clientPcToDelete = clientPC}
                                        class="items-center px-2 py-2 hover:text-rose-700">
                                        Delete
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

<Modal bind:open={clientPcToCreate}>
    <h2 slot="title">Add New PC</h2>
    <form bind:this={formCreate} slot="content" class="p-4">
        {#if clientPcToCreate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3 md:mb-0">
                    <label for="txt_create_client_pc_hostname" class="form-label">HOST NAME</label>
                    <input bind:value={clientPcToCreate.hostname}
                        id="txt_create_client_pc_hostname"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3 md:mb-0">
                    <label for="txt_create_client_pc_location" class="form-label">LOCATION</label>
                    <input bind:value={clientPcToCreate.location}
                        id="txt_create_client_pc_location"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3 mb-2">
                <div class="w-full md:w-FULL px-3 md:mb-0">
                    <label for="slc_create_client_pc_unit" class="form-label"> CLINICAL UNIT </label>
                    <select bind:value={clientPcToCreate.unitID}
                        id="slc_create_client_pc_unit"
                        required>
                        {#each clinicalUnits as clinicalUnit}
                            <option value={clinicalUnit.unitID}>{clinicalUnit.terse}</option>
                        {/each}
                    </select>
                </div>
            </div>
            <div class="flex flex-wrap justify-end items-center">
                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                    <button on:click={() => {
                            if(formCreate.checkValidity()) {
                                createClientPC(clientPcToCreate);
                            }
                        }}
                        class="bg-red-700 hover:bg-red-600 text-white py-2 px-4">
                        SAVE
                    </button>
                    <button on:click={() => (clientPcToCreate = null)}
                        class="bg-pplus-gray hover:bg-gray-200 text-blue-800 hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent">
                        CANCEL
                    </button>
                </div>
            </div>
        {/if}
    </form>
</Modal>

<Modal bind:open={clientPcToEdit}>
    <h2 slot="title">Edit PC</h2>
    <form bind:this={formEdit} action="#" slot="content" class="p-4">
        {#if !!clientPcToEdit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3 md:mb-0">
                    <label for="txt_edit_client_pc_hostname" class="form-label">Host Name</label>
                    <input bind:value={clientPcToEdit.hostname}
                        id="txt_edit_client_pc_hostname"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3 md:mb-0">
                    <label for="txt_edit_client_pc_location" class="form-label">Location</label>
                    <input bind:value={clientPcToEdit.location}
                        id="txt_edit_client_pc_location"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3 mb-2">
                <div class="w-full md:w-FULL px-3 md:mb-0">
                    <label for="slc_edit_client_pc_unit" class="form-label"> Clinical Unit </label>
                    <select bind:value={clientPcToEdit.unitID}
                        id="slc_edit_client_pc_unit" 
                        required>
                        {#each clinicalUnits as clinicalUnit}
                            <option value={clinicalUnit.unitID}>{clinicalUnit.terse}</option>
                        {/each}
                    </select>
                </div>
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={() => {
                        if(formEdit.checkValidity()) {
                            updateClientPC(clientPcToEdit);
                        }
                    }}
                    class="bg-red-700 hover:bg-red-600 text-white py-2 px-4">
                    SAVE
                </button>
                <button on:click={() => (clientPcToEdit = null)}
                    class="bg-pplus-gray hover:bg-gray-200 text-blue-800 hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent">
                    CANCEL
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={clientPcToDelete}>
    <h2 slot="title">Delete PC</h2>
    <svg class="ml-auto fill-current text-gray-700 w-6 h-6 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18" >
        <path
            d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
        />
    </svg>
    <div class="p-4" slot="content">
        <div class="text-white">
            Are you sure you want to delete this client PC?
        </div>
        <div class="ml-auto mt-4">
            <button on:click={() => deleteClientPC(clientPcToDelete)}
                class="delete-btn">
                Delete
            </button>
            <button on:click={() => (clientPcToDelete = null)}
                class="cancel-btn">
                Cancel
            </button>
        </div>
    </div>
</Modal>

