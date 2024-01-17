<script lang="ts">
    import { DataHandler, Datatable, Th} from '@vincjo/datatables';

    import Modal from '$lib/components/Modal.svelte';
    import MultiSelect from '$lib/components/MultiSelect.svelte';
    import InputDropzone from '$lib/components/InputDropzone.svelte';

    import { User } from '$lib/models/User';
    import { onMount } from 'svelte';
    import type { Readable } from 'svelte/store';

    import Alert, { AlertType } from '$lib/components/Alert.svelte';

    const DEFAULT_AVATAR_URL = '/img/avatar.png';

    import type { PageData } from './$types';

    export let data: PageData;

    let users: User[] = [];
    let handler: DataHandler;
    let rows: Readable<any[]>;

    let roles: any[] = [];
    let clinicalUnits: any[] = [];

    let userToCreate: User | null;
    let userToEdit: User | null;
    let userToDelete: User | null;

    let alertMessages: any[] = [];

    let formCreate: HTMLFormElement;
    let formEdit: HTMLFormElement;
    
    const fetchUsers = async () => {
        users = [];
        const usersObjects = await (await fetch(`/api/users`)).json();
        usersObjects.forEach((o: any) => {
            o.roles = o.roles?.split(', ');
            if(o.roles) {
                o.roleIds = o.roles.map((roleName: string) => roles.find(r => r.value == roleName)?.roleID);
            }

            o.units = o.units?.split(', ');
            if(o.units) {
                o.unitIds = o.units.map((unitName: string) => clinicalUnits.find(cu => cu.terse == unitName)?.unitID);
            }

            users = [...users, Object.assign(new User, o)];
        });

        handler = new DataHandler(users, { rowsPerPage: 50 });
        rows = handler.getRows();
    };

    const createUser = async (user: User | null) => {
        if (user) {
            await fetch(`/api/users`, {
                method: 'POST',
                body: JSON.stringify(user)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Create successful.',
                    message: `User "${user?.loginID}" is successfully created.`
                }];
            }).finally(() => {
                userToCreate = null;
                fetchUsers();
            });
        }
    };

    const updateUser = async (user: User | null) => {
        if (user) {
            await fetch(`/api/users/${user.userID}`, {
                method: 'PATCH',
                body: JSON.stringify(user)
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Edit successful.',
                    message: `User "${user.loginID}" is successfully edited.`
                }];
            }).finally(() => {
                userToEdit = null;
                fetchUsers();
            });
        }
    };

    const deleteUser = async (user: User | null) => {
        if (user) {
            await fetch(`/api/users/${user.userID}`, {
                method: 'DELETE'
            }).then(() => {
                alertMessages = [...alertMessages, {
                    type: AlertType.SUCCESS,
                    title: 'Delete successful.',
                    message: `User "${user.loginID}" is successfully deleted.`
                }];
                handler.setRows($rows.filter((a) => a != user));
            }).finally(() => {
                userToDelete = null;
            });
        }
    };
    
    onMount(async () => {
        await fetch('/api/roles')
            .then(async (rolesResponse) => {
                roles = await rolesResponse.json();
                await fetch(`/api/clinical-units`)
                    .then(async (clinicalUnitsResponse) => {
                        clinicalUnits = await clinicalUnitsResponse.json();
                        fetchUsers();
                    });
            });
    });
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 mb-2 mt-4">
    <button on:click={() => (userToCreate = new User())}>
        <img alt="add user" class="createBtn ml-4" src="/img/add.png" width="48" />
    </button>
</div>

<div class="mt-2">
    {#if rows}
        <Datatable {handler}>
            <table class="tableLight w-full bg-white">
                <thead>
                    <tr class="text-sm font-semibold text-center bg-white">
                        <th class="text-center p-2 px-2">Photo</th>
                        <Th {handler} orderBy="loginID" class="border-b-2">Username</Th>
                        <Th {handler} orderBy="lastName">Last Name</Th>
                        <Th {handler} orderBy="firstName">First Name</Th>
                        <th class="text-center p-2 px-2">Contact</th>
                        <th class="text-center p-2 px-2">Roles</th>
                        <th class="text-center p-2 px-2">Clinical Units</th>
                        <th class="text-center p-2 px-2">Action</th>
                    </tr>
                </thead>
                <tbody class="striped text-sm font-normal text-black text-center">
                    {#each $rows as user}
                    {@const selected = userToDelete == user ? 'selected' : ''}
                        <tr class="py-2 bg-gray-100 font-small {selected}">
                            <td>
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                    <button class="items-center px-1 py-1">
                                        <img src="{user.profilePhoto ? (data.avatarBaseUrl + user.profilePhoto) : DEFAULT_AVATAR_URL}"
                                            alt="{user.loginID}"
                                            class="shadow rounded-full max-w-full h-auto align-middle border-none !w-[32px] !h-[32px]"  />
                                    </button>
                                </div>
                            </td>
                            <td>{user.loginID}</td>
                            <td>{user.lastName}</td>
                            <td>{user.firstName}</td>
                            <td>{user.contact}</td>
                            <td>{user.roles ? user.roles.join(', ') : ''}</td>
                            <td>{user.units ? user.units.join(', ') : ''}</td>
                            <td>
                                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                                    <button on:click={() => (userToEdit = Object.assign(new User, user, { original: user }))}
                                        class="items-center px-2 py-2 hover:text-sky-700">
                                        Edit
                                    </button>
                                    <button on:click={() => (userToDelete = user)}
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

<Modal bind:open={userToCreate}>
    <h2 slot="title">Create New User</h2>
    <form bind:this={formCreate} action="#" slot="content" class="p-4">
        {#if !!userToCreate}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="txt_new_contact" class="form-label">Contact</label>
                    <input bind:value={userToCreate.contact}
                        id="txt_new_contact"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label for="upl_new_photo" class="form-label"> Upload Image </label>
                    <div class="flex mt-1">
                        <div class="inline-flex overflow-hidden rounded-lg border-4 border-white relative">
                            <img src={userToCreate.imageData || DEFAULT_AVATAR_URL}
                               
                                alt="User" />
                            <div class="flex justify-center items-center w-full absolute">
                                <InputDropzone bind:value={userToCreate.imageData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="txt_new_username" class="form-label">Username </label>
                    <input bind:value={userToCreate.loginID}
                        id="txt_new_username"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_new_password" class="form-label"> Password </label>
                    <input bind:value={userToCreate.password}
                        id="txt_new_password"
                        type="password"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3 ">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="txt_new_first_name" class="form-label"> First Name </label>
                    <input bind:value={userToCreate.firstName}
                        id="txt_new_first_name"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_new_last_name" class="form-label"> Last Name</label>
                    <input bind:value={userToCreate.lastName}
                        id="txt_new_last_name"
                        class="pplus-textbox" />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3 ">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="chk_new_is_admin" class="form-label"> Is Admin? </label>
                    <input bind:checked={userToCreate.isAdmin}
                        id="chk_new_is_admin"
                        type="checkbox"
                        value={true} />
                </div>
            </div>
            {#if !userToCreate.isAdmin}
                <div class="flex flex-wrap -mx-3 mb-2">
                    <div class="w-full md:w-1/2 px-3  md:mb-0">
                        <label for="slc_new_roles" class="form-label"> Role </label>
                        <MultiSelect bind:value={userToCreate.roleIds}
                            id="slc_new_roles">
                            {#each roles as role}
                                <option value={role.roleID}>{role.value}</option>
                            {/each}
                        </MultiSelect>
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <label for="slc_new_clinical_units" class="form-label"> Clinical Units </label>
                        <MultiSelect bind:value={userToCreate.unitIds}
                            id="slc_new_clinical_units">
                            {#each clinicalUnits as clinicalUnit}
                                <option value={clinicalUnit.unitID}>{clinicalUnit.terse}</option>
                            {/each}
                        </MultiSelect>
                    </div>
                </div>
            {/if}
            <div class="flex flex-wrap justify-end items-center">
                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                    <button on:click={() => {
                            // if(formCreate.checkValidity()) {
                                createUser(userToCreate)
                            // }
                        }}
                        class="save-btn">
                        Save
                    </button>
                    <button on:click={() => (userToCreate = null)}
                        class="cancel-btn">
                        Cancel
                    </button>
                </div>
            </div>
        {/if}
    </form>
</Modal>

<Modal bind:open={userToEdit}>
    <h2 slot="title">Edit User</h2>
    <form bind:this={formEdit} action="#" slot="content" class="p-4">
        {#if !!userToEdit}
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="txt_edit_contact" class="form-label">Contact</label>
                    <input bind:value={userToEdit.contact}
                        id="txt_edit_contact"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label for="upl_edit_photo" class="form-label"> Upload Image </label>
                    <div class="flex mt-1">
                        <div class="inline-flex overflow-hidden rounded-lg border-4 border-white relative">
                            <img src={userToEdit.imageData || (userToEdit.profilePhoto ? data.avatarBaseUrl + userToEdit.profilePhoto : DEFAULT_AVATAR_URL)}
                               
                                alt="User" />
                            <div class="flex justify-center items-center w-full absolute">
                                <InputDropzone bind:value={userToEdit.imageData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="txt_edit_username" class="form-label">Username </label>
                    <input bind:value={userToEdit.loginID}
                        id="txt_edit_username"
                        class="pplus-textbox disabled"
                        readonly />
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_edit_password" class="form-label"> Password </label>
                    <input bind:value={userToEdit.password}
                        id="txt_edit_password"
                        type="password"
                        class="pplus-textbox"
                        required />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3 ">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="txt_edit_first_name" class="form-label"> First Name </label>
                    <input bind:value={userToEdit.firstName}
                        id="txt_edit_first_name"
                        class="pplus-textbox"
                        required />
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label for="txt_edit_last_name" class="form-label"> Last Name </label>
                    <input bind:value={userToEdit.lastName}
                        id="txt_edit_last_name"
                        class="pplus-textbox" />
                </div>
            </div>
            <div class="flex flex-wrap -mx-3 ">
                <div class="w-full md:w-1/2 px-3  md:mb-0">
                    <label for="chk_edit_is_admin" class="form-label"> Is Admin? </label>
                    <input bind:checked={userToEdit.isAdmin} id="chk_edit_is_admin" type="checkbox" />
                </div>
            </div>
            {#if !userToEdit.isAdmin}
                <div class="flex flex-wrap -mx-3 mb-2">
                    <div class="w-full md:w-1/2 px-3  md:mb-0">
                        <label for="slc_edit_roles" class="form-label"> Role </label>
                        <MultiSelect bind:value={userToEdit.roleIds}
                            id="slc_edit_roles">
                            {#each roles as role}
                                <option value={role.roleID}>{role.value}</option>
                            {/each}
                        </MultiSelect>
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <label for="slc_edit_clinical_units" class="form-label"> Clinical Units </label>
                        <MultiSelect bind:value={userToEdit.unitIds}
                            id="slc_edit_clinical_units">
                            {#each clinicalUnits as clinicalUnit}
                                <option value={clinicalUnit.unitID}>{clinicalUnit.terse}</option>
                            {/each}
                        </MultiSelect>
                    </div>
                </div>
            {/if}
            <div class="flex flex-wrap justify-end items-center">
                <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                    <button on:click={() => {
                            if(formEdit.checkValidity()) {
                                updateUser(userToEdit);
                            }
                        }}
                        class="save-btn">
                        Save
                    </button>
                    <button on:click={() => (userToEdit = null)}
                        class="cancel-btn">
                        Cancel
                    </button>
                </div>
            </div>
        {/if}
    </form>
</Modal>

<Modal bind:open={userToDelete}>
    <h2 slot="title">Delete User</h2>
    <svg class="ml-auto fill-current text-gray-700 w-6 h-6 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18">
        <path
            d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
        />
    </svg>
    <div class="p-4" slot="content">
        <div class="text-white">
            Are you sure you want to delete user, {userToDelete?.loginID}?
        </div>
        <div class="ml-auto mt-4">
            <button on:click={() => deleteUser(userToDelete)}
                class="delete-btn">
                Delete
            </button>
            <button on:click={() => (userToDelete = null)}
                class="cancel-btn">
                Cancel
            </button>
        </div>
    </div>
</Modal>

<style>
    tr.selected {
        background-color: #232D45;
        @apply text-white;
    }
</style>