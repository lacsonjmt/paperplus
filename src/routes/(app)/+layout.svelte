<script lang="ts">
    import type { LayoutData } from './$types';
    import Header from '$lib/components/Header.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';

    let isSidebarOpen = false;
    export let data: LayoutData;
</script>

<div class="bg-primary-blue grow">
    <Header bind:isSidebarOpen bind:user={data.user} />
</div>
<div class="grid grid-cols-10 grow">
    <div class="col-span-1 z-20 bg-pplus-light-gray h-full { isSidebarOpen ? '' : 'hidden' }">
        <Sidebar bind:user={data.user} />
    </div>
    <div class="{ isSidebarOpen ? 'col-span-9' : 'col-span-10' }">
        <slot />
    </div>
</div>
