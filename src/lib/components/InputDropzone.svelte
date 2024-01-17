<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let { value, ...additionalProperties } = $$props;

    const change = (e) => {
        let image = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = (e) => {
            value = e.target.result;
        };

        dispatch('change');
    };

    const inputId = (Math.random() * 10e15).toString(16);
</script>
<label
    for={inputId}
    class="flex flex-col justify-center items-center w-full h-64 border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100">
    <div class="flex flex-col justify-center items-center pt-5 pb-6">
        <svg class="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
            ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            <span class="font-semibold">Click</span>
            or
            <span class="font-semibold">drag and drop</span>
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
    </div>
    <input {...additionalProperties} id={inputId} type="file" class="hidden" on:change={change} />
</label>
