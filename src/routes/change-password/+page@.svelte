<script lang="ts">
	import Alert, { AlertType } from "$lib/components/Alert.svelte";
    import type { ActionData } from "./$types";

    export let form: ActionData;

    let newPassword = '';
    let confirmPassword = '';
</script>

<svelte:head>
    <title>Paper+ Change Password
    </title>
    <meta name="description" content="Paper+" />
</svelte:head>

<body class="antialiased bg-dark-blue text-gray-900">
    <div class="flex flex-col align-middle h-screen items-center justify-center">
        <div>
            <div class="w-full bg-white m-auto shadow-lg p-6 m-4 md:max-w-lg md:mx-auto w-screen">
                <div class="flex flex-col justify-center items-center m-4"> 
                    <img alt="paperplus logo" class="nav_logo" src="/img/logo_dark.png" width="256px" />
                </div>
                <div class="flex flex-col justify-center items-center m-4"> 
                    <h2 class="font-bold text-center"> Change Password </h2>
                </div>
                {#if form?.errorMessage}
                    <div class="mb-2">
                        <Alert type={AlertType.ERROR}>
                            <h2 slot="header">Error</h2>
                            <div slot="content">{form.errorMessage}</div>
                        </Alert>
                    </div>
                {/if}

                <form method="post" class="mb-4">
                    <div class="mb-6 md:w-full">
                        <label for="password" class="block text-xs mb-1">Old Password</label>
                        <input id="oldPassword"
                            name="oldPassword"
                            type="password" 
                            class="w-full border p-2 outline-none focus:shadow-outline"
                            placeholder="Old Password"
                            required />
                    </div>
                    <div class="mb-6 md:w-full">
                        <label for="password" class="block text-xs mb-1">New Password</label>
                        <input bind:value={newPassword}
                            id="newPassword"
                            name="newPassword"
                            type="password" 
                            class="w-full border p-2 outline-none focus:shadow-outline"
                            placeholder="New Password"
                            required />
                    </div>
                    <div class="mb-6 md:w-full">
                        <label for="password" class="block text-xs mb-1">Confirm New Password</label>
                        <input bind:value={confirmPassword}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password" 
                            class="w-full border p-2 outline-none focus:shadow-outline"
                            placeholder="Confirm New Password"
                            required />
                    </div>
                    {#if newPassword && confirmPassword}
                        {#if newPassword != confirmPassword}
                            <div class="mb-2">
                                <Alert type={AlertType.ERROR}>
                                    <h2 slot="header">Error</h2>
                                    <div slot="content">Passwords do not match</div>
                                </Alert>
                            </div>
                        {:else}
                            <div class="flex flex-col justify-center items-center">
                                <button class="bg-primary-blue hover:bg-red-700 text-white   text-sm font-semibold px-4 py-2">Update</button>
                            </div>
                        {/if}
                    {/if}
                    
                </form>
            </div>
        </div>
    </div>
</body>