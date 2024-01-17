
<script>
    import { page } from '$app/stores';
    import Fa from 'svelte-fa';
    import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

    export let isSidebarOpen = true;
    export let user;
</script>

<header>
    <div class="z-40 text-white">
        <div class="grid grid-cols-2 gap-4">
            <div class="side-nav__header flex items-center p-2">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={() => (isSidebarOpen = !isSidebarOpen)}
                    class="float-right pl-2 pr-4 cursor-pointer faBars">
                    <Fa icon={faBars} />
                </div>
                <a href="/{$page.params.unit}" class="intro-x flex items-center">
                    <img alt="paperplus logo" class="nav_logo" src="/img/logo_light.png" width="128px" />
                </a>
            </div>
            <div class="flex justify-end items-center gap-4">
                <h2>{user?.firstName} {user?.lastName}</h2>
                <div class="mr-4">
                    <div class="dropdown inline-block relative">
                        <div class="flex items-center p-4">        
                            <span><Fa icon={faUser}/></span>
                        </div>
                        <ul class="dropdown-menu absolute hidden text-gray-700 right-0 z-50">
                            <li class="w-48">
                                <a class="bg-gray-200 hover:bg-gray-400 p-2 px-4 block " href="/change-password"> 
                                    <h3 class="font-medium ">Change Password</h3>
                                </a>
                            </li>
                            <li class="w-48">
                                <a class="bg-gray-200 hover:bg-gray-400 p-2 px-4 block whitespace-no-wrap" href="/logout"> 
                                    <h3 class="font-medium ">Logout</h3>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

<style>
    .dropdown:hover .dropdown-menu {
        display: block;
    }
</style>