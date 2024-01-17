<script lang="ts">
	import { onMount } from "svelte";

	import { PatientStaff } from "$lib/models/PatientStaff";
	import { toStandardDateTimeString } from "$lib/utils/DateTime";

    import Alert, { AlertType } from '$lib/components/Alert.svelte';
	import Modal from "$lib/components/Modal.svelte";
	import InputDateTime from "$lib/components/InputDateTime.svelte";

    let alertMessages: any[] = [];
    let patientStaffs: any = [];

    let patientStaffToCreate: PatientStaff | null = null;
    let patientStaffToEdit: PatientStaff | null = null;
    let patientStaffToDelete: PatientStaff | null = null;

    let formCreate: HTMLFormElement;
    let formEdit: HTMLFormElement;

    export let ptEncounterID: string;
    export let unitID: string;

    const fetchPatientStaffs = async () => {
        const promise = await fetch(`/api/patient-staffs/?ptEncounterID=${ptEncounterID}&unitID=${unitID}`);
        patientStaffs = await promise.json();
    };

    const createPatientStaff = async (staff: PatientStaff | null) => {
        if(staff) {
            await fetch(`/api/patient-staffs/?ptEncounterID=${ptEncounterID}&unitID=${unitID}`, {
                method: 'POST',
                body: JSON.stringify(staff)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Create successful.',
                    message: 'Staff is successfully created.'
                }];
                
            }).finally(() => {
                patientStaffToCreate = null;
                fetchPatientStaffs();
            });
        }
    };

    const initPatientStaffToEdit = async (staff: any) => {
        patientStaffToEdit = Object.assign(new PatientStaff, staff, { original: staff });
        if(patientStaffToEdit) {
            patientStaffToEdit.inTime = toStandardDateTimeString(patientStaffToEdit?.inTime);
            patientStaffToEdit.outTime = toStandardDateTimeString(patientStaffToEdit?.outTime);
        }
    };

    const updatePatientStaff = async (staff: PatientStaff | null) => {
        if (staff) {
            await fetch(`/api/patient-staffs/?ptEncounterID=${ptEncounterID}&unitID=${unitID}`, {
                method: 'PATCH',
                body: JSON.stringify(staff)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Update successful.',
                    message: 'Staff is successfully created.'
                }];
            }).finally(() => {
                patientStaffToEdit = null;
                fetchPatientStaffs();
            });
        }
    };

    const deletePatientStaff = async (staff: PatientStaff | null) => {
        if(staff) {
            await fetch(`/api/patient-staffs/?ptEncounterID=${ptEncounterID}&unitID=${unitID}`, {
                method: 'DELETE',
                body: JSON.stringify(staff)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Delete successful.',
                    message: `Staff "${staff.name}" is successfully deleted.`
                }];
                patientStaffs = patientStaffs.filter((a: any) => a != staff);
            }).finally(() => {
                patientStaffToDelete = null;
            });
        }   
    };

    onMount(async() => {
        fetchPatientStaffs();
    });
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="px-2 bg-white text-black h-screen">
    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 p-2">
        <button on:click={() => (patientStaffToCreate = new PatientStaff)}>
            <img alt="" class="plus" src="/img/add.png" width="48" />
        </button>
    </div>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
            <table class="tableLight w-full table-auto border-b-2 border-top">
                <thead class="border-y border-white">
                    <tr class="text-sm text-center">
                        <th class="px-2 w-3/12">Name</th>
                        <th class="px-2 w-2/12">Role</th>
                        <th class="px-2 w-2/12">Time IN</th>
                        <th class="px-2 w-2/12">Time OUT</th>
                        <th class="px-2 w-2/12">Edited By</th>
                        <th class="px-2 w-1/12">Action</th>
                    </tr>
                </thead>
                <tbody class="striped text-sm font-normal">
                    {#each patientStaffs as staff}
                        {@const selected = [patientStaffToEdit?.catalogID, patientStaffToDelete?.catalogID]
                            .includes(staff.catalogID) ? 'selected' : ''}
                        <tr class="bg-gray-100 py-2 font-small {selected}">
                            <td class="px-2">{staff.name}</td>
                            <td class="px-2">{staff.role}</td>
                            <td class="px-2 text-center">{toStandardDateTimeString(staff.inTime)}</td>
                            <td class="px-2 text-center">{toStandardDateTimeString(staff.outTime)}</td>
                            <td class="px-2 text-center">{staff.editedBy}</td>
                            <td class="px-2 text-center">
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                    <button on:click={() => initPatientStaffToEdit(staff)}
                                        class="items-center editBtn hover">
                                        Edit
                                    </button>
                                    <button
                                        on:click={() => (patientStaffToDelete = staff)}
                                        class="items-center deleteBtn hover">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <form>
                <div class="mt-2">
                    <label for="" class="form-label text-sm mb-2"> Notes </label>
                    <textarea
                        id="formsNotes"
                        name="Forms Notes"
                        rows="6"
                        class="w-full border border-gray-500 text-black text-xs"
                    />
                </div>
                <div class="flex flex-wrap justify-end items-center mt-2">
                    <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                        <button class="save-btn"> Save </button>
                        <button type="reset" class="cancel-btn">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<Modal bind:open={patientStaffToCreate}>
    <h2 slot="title" class="uppercase">New Entry</h2>
    <form bind:this={formCreate}
        slot="content"
        class="p-4">
        {#if patientStaffToCreate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_create_patient_staff_name" class="form-label"> Name </label>
                    <input bind:value={patientStaffToCreate.name}
                        id="txt_create_patient_staff_name"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_create_patient_staff_role" class="form-label"> Role </label>
                    <input bind:value={patientStaffToCreate.role}
                        id="txt_create_patient_staff_role"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="w-full md:w-full">
                <label for="txt_create_patient_staff_time_in" class="form-label"> Time IN </label>
                <InputDateTime bind:value={patientStaffToCreate.inTime} />
            </div>
            <div class="w-full md:w-full">
                <label for="txt_create_patient_staff_time_out" class="form-label"> Time OUT </label>
                <InputDateTime bind:value={patientStaffToCreate.outTime} />
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={() => {
                        if(formCreate.checkValidity()) {
                            createPatientStaff(patientStaffToCreate)
                        }
                    }}
                    class="save-btn">
                    Save
                </button>
                <button on:click={() => (patientStaffToCreate = null)} class="cancel-btn"> Cancel </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={patientStaffToEdit}>
    <h2 slot="title" class="uppercase">Edit Entry</h2>
    <form bind:this={formEdit}
        slot="content"
        class="p-4">
        {#if patientStaffToEdit}
            
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-full px-3">
                    <label for="txt_create_patient_staff_name" class="form-label"> Name </label>
                    <input bind:value={patientStaffToEdit.name}
                        id="txt_create_patient_staff_name"
                        class="pplus-textbox" />
                </div>
                <div class="w-full md:w-full px-3">
                    <label for="txt_create_patient_staff_role" class="form-label"> Role </label>
                    <input bind:value={patientStaffToEdit.role}
                        id="txt_create_patient_staff_role"
                        class="pplus-textbox" />
                </div>
            </div>
            <div class="w-full md:w-full">
                <label for="txt_create_patient_staff_time_in" class="form-label"> Time IN </label>
                <InputDateTime bind:value={patientStaffToEdit.inTime} />
            </div>
            <div class="w-full md:w-full">
                <label for="txt_create_patient_staff_time_out" class="form-label"> Time OUT </label>
                <InputDateTime bind:value={patientStaffToEdit.outTime} />
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={() => {
                        if(formEdit.checkValidity()) {
                            updatePatientStaff(patientStaffToEdit)
                        }
                    }}
                    class="save-btn">
                    Save
                </button>
                <button on:click={() => (patientStaffToEdit = null)}
                    class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>

<Modal bind:open={patientStaffToDelete}>
    <h2 slot="title" class="uppercase">Delete Staff</h2>
    <form slot="content" class="p-4">
        <h2 class="text-white">Are you sure you want to delete this entry?</h2>
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                <button on:click={() => deletePatientStaff(patientStaffToDelete)} 
                    class="save-btn">
                    Delete
                </button>
                <button on:click={() => (patientStaffToDelete = null)}
                    class="cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    </form>
</Modal>