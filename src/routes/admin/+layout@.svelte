<script lang="ts">
    import type { LayoutData } from './$types';
	import { page } from "$app/stores";
    import Header from '$lib/components/Header.svelte';

    export let data: LayoutData;
</script>

<svelte:head>
    <title>Paper+ Admin</title>
</svelte:head>

<div class="bg-primary-blue grow">
    <Header bind:user={data.user}/>
</div>


<main class="items-center w-full px-2 py-2 my-14 mx-auto bg-white-lg shadow-md sm:w-11/12">
    <div class="tabs mb-4">
        <div class="tab-list">
            {#each [
                { name: 'User Management', url: '/admin' }, 
                { name: 'Client PC Management', url: '/admin/client-pcs' },
                { name: 'Patient Access Management', url: '/admin/patient-accesses' }
            ] as navLink}
                <a class:active={$page.url.pathname === navLink.url} href={navLink.url} class="nav-item">
                    {navLink.name}
                </a>
            {/each}
        </div>
    </div>
    <slot class="container mx-auto" />
</main>

<style>
    .nav-item {
		background: none;
		border: none;
		border-bottom: 2px solid white;
		border-radius: 0;
		margin: 0;
		color: #ccc;
		@apply p-2;
    }
    .nav-item.active {
		border-bottom: 2px solid #2F5496;
		color: black;
    }
</style>