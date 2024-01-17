<script lang="ts">
	import Alert, { AlertType } from "$lib/components/Alert.svelte";
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<svelte:head>
    <title>Paper+ Login</title>
    <meta name="description" content="Paper+" />
</svelte:head>

<body class="antialiased bg-dark-blue text-gray-900">
    <div class="flex flex-col align-middle h-screen items-center justify-center">
        <div>
            <div class="w-full bg-white m-auto shadow-lg p-6 m-4 md:max-w-lg md:mx-auto w-screen">
                <div class="flex flex-col justify-center items-center m-4"> 
                    <img alt="paperplus logo" class="nav_logo" src="/img/logo_dark.png" width="256px" />
                </div>
                <form method="post" class="mb-4">
                    <div class="mb-4 md:w-full">
                        <label for="username" class="block text-xs mb-1">Username</label>
                        <input id="username"
                            name="username"
                            class="w-full border p-2 outline-none focus:shadow-outline"
                            placeholder="Username"
                            required />
                    </div>
                    <div class="mb-6 md:w-full">
                        <label for="password" class="block text-xs mb-1">Password</label>
                        <input id="password"
                            name="password"
                            type="password" 
                            class="w-full border p-2 outline-none focus:shadow-outline"
                            placeholder="Password"
                            required />
                    </div>
                    {#if form?.errorMessage}
                        <div class="mb-2">
                            <Alert type={AlertType.ERROR}>
                                <h2 slot="header">Error</h2>
                                <div slot="content">{form.errorMessage}</div>
                            </Alert>
                        </div>
                    {/if}
                    <div class="flex flex-col justify-center items-center">
                        <button class="bg-primary-blue hover:bg-red-700 text-white   text-sm font-semibold px-4 py-2">Login</button>
                    </div>
                </form>
                
            </div>
        </div>
        <div class="mt-4 !max-w-[50%]">
            <small class="block mt-1 text-white">By logging in, I confirm that I am the authorized user of Paper+. I understand and agree to the terms and conditions stated: that Paper+ is for recording and documentation purposes only, strictly not for clinical decision support and diagnosis.</small>
        </div>
    </div>
</body>