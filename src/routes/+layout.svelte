<script lang="ts">
    import { onMount } from "svelte";
	import { page } from '$app/stores';
    import type { LayoutData } from './$types';

    import "../app.css";
    import "@fontsource/roboto";
    import "@fontsource/mandali";
    import "@fontsource/outfit";
	
    import Fa from 'svelte-fa';
    import { faBars } from '@fortawesome/free-solid-svg-icons';

    export let data: LayoutData;

    let isOpen = false;
    let isPrint = false;

    let logs: any[] = [];
    onMount(() => {
        isPrint = $page.route.id == '/print';
        if(data.appMode == 'development') {
            setInterval(async () => {
                logs = await (await fetch(`/api/logs`)).json();
            }, 5000);
        }
    });
</script>
<main>
    <slot />
    {#if data.appMode == 'development'}
        <div class="sticky bottom-0 z-40">
            <div class="flex border p-1 items-center bg-white">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={() => (isOpen = !isOpen)}
                    class="pl-2 pr-4 cursor-pointer faBars">
                    <Fa icon={faBars} />
                </div>
                <div class="text-md">Logs</div>
            </div>
            <table class="tableLight w-full table-auto border-b-2 border-top { isOpen ? '' : 'hidden' }">
                <thead class="bg-white">
                    <tr>
                        <th class="text-sm">Queries</th>
                    </tr>
                </thead>
                <tbody class="striped text-xs font-normal text-black bg-white">
                    {#each logs as log}
                        <tr class="border">
                            <td class="px-2">{log.message}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>
