<script context="module">
    export const AlertType = {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error'
    };
</script>
<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let open = true;
    export let type = AlertType.INFO;

    let dispatch = createEventDispatcher();
    const close = () => {
        open = false;
        dispatch("close");
    };

    let bgCssClass = (type == AlertType.SUCCESS) ? "bg-green-100 border-green-400 text-green-700"
        : (type == AlertType.WARNING) ? "bg-orange-100 border-orange-400 text-orange-700"
        : (type == AlertType.ERROR) ? "bg-red-100 border-red-400 text-red-700"
        :  "bg-blue-100 border-blue-400 text-blue-700";
    let textCssClass = (type == AlertType.SUCCESS) ? "text-green-700"
        : (type == AlertType.WARNING) ? "text-orange-700"
        : (type == AlertType.ERROR) ? "text-red-700"
        :  "text-blue-700";

    setTimeout(() => {
        close();
    }, 5000);
</script>

{#if open}
    <div class="{bgCssClass} {textCssClass} border px-4 py-3 rounded relative mt-2" role="alert">
        <strong class="font-bold">
            <slot name="header" />
        </strong>
        <span class="block sm:inline">
            <slot name="content" />
        </span>
        <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <svg on:click={close}
                class="fill-current h-6 w-6 {textCssClass}"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20">
                <title>Close</title>
                <path
                    d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
                />
            </svg>
        </span>
    </div>
{/if}