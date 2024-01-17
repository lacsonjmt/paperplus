<script lang="ts">
    import Fa from 'svelte-fa';
    import { faClose } from '@fortawesome/free-solid-svg-icons';
    import { createEventDispatcher } from 'svelte';
    export let open: any = null;

    let dispatch = createEventDispatcher();
    export function close () {
        open = false;
        dispatch("close");
    };
</script>
{#if !!open}
    <div>
        <div class="fixed inset-0 bg-opacity-75 transition-opacity z-40" />
        <div class="fixed z-50 inset-0 h-100 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div class="relative bg-primary-blue text-left shadow-xl transform transition-all">
                    <div class="pointer-events-auto md:w-screen max-w-xl">
                        <div class="flex flex-col bg-primary-blue overflow-y-auto shadow-xl">
                            <div class="divide-y divide-gray-200">
                                <div class="modal-header">
                                    <h2 class="text-xl text-white">
                                        <slot name="title" />
                                    </h2>
                                    <button title="Exit" on:click={close}> <Fa icon={faClose} /></button>
                                </div>
                                <div class="modal bg-dark-gray max-h-[35em] overflow-y-auto">
                                    <slot name="content" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
<style>
    .modal-header {
        @apply flex justify-between w-full px-2 py-2 items-center font-bold;
    }
    @keyframes zoom {
        from {
            transform: scale(0.95);
        }
        to {
            transform: scale(1);
        }
    }
    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
