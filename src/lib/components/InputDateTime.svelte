<script lang="ts">
    import Flatpickr from 'svelte-flatpickr';
    import 'flatpickr/dist/flatpickr.css';
	import { toStandardDateTimeString } from '$lib/utils/DateTime';
    
    export let value: any;
    export let disabled: boolean = false;
    export let readonly: boolean = false;
    export let minDate: string = '';
    export let maxDate: string = '';
    export let id: string = Math.random().toString(36).substring(2, 8);;

    $: value = toStandardDateTimeString(value);
</script>
<Flatpickr bind:value
    {id}
    options={{
        dateFormat: "Y-m-d H:i",
        enableTime: true,
        allowInput: false,
        onChange: (selectedDates, dateStr, instance) => {
            value = dateStr;
        },
        minDate,
        maxDate,
        minuteIncrement: 1,
    }} 
    disabled={disabled}
    readonly={readonly}
    class="w-full px-2 inputDateTime"/>