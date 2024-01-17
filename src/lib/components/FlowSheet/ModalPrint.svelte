<script lang="ts">
	import { addMinutes, roundDownDateTime, roundUpDateTime, toNormalDateTimeString, toStandardDateTimeString } from "$lib/utils/DateTime";
	import { onMount } from "svelte";
    import Modal from "../Modal.svelte";
	import InputDateTime from "../InputDateTime.svelte";
	import { page } from "$app/stores";

    export let showPrintModal: boolean = false;
    export let ptEncounterID: string;
    export let unitID: string;
    export let intervalMinutes: number = 15;

    const TIME_SEGMENT_MINS = 60 * 8; //4 hours
    let isArchivedEpisode = $page.url.pathname.startsWith('/archived-episodes/');
    let dateRangeSegments: any[] = [];
    const generateDateRangeSegments = async (isFirstTime: boolean = true) => {
        const promisePeriod = await fetch(`/api/flowsheet/period?ptEncounterID=${ptEncounterID}&unitID=${unitID}`);
        const period = await promisePeriod.json();

        if(dateRangeSegments.length) {
            dateRangeSegments.pop();
            dateRangeSegments = dateRangeSegments;
        }

        const earliestDateTime = new Date(toNormalDateTimeString(period[0].earliest));
        const latestDateTime = isArchivedEpisode 
            ? new Date(toNormalDateTimeString(period[0].latest)) 
            : roundUpDateTime(new Date, intervalMinutes);

        let earliest = roundDownDateTime(earliestDateTime, intervalMinutes);

        let segmentStart = new Date(earliest);
        let segmentEnd = addMinutes(earliest, TIME_SEGMENT_MINS);
        segmentEnd = segmentEnd < latestDateTime ? segmentEnd : latestDateTime;

        let i = 0;
        const dateTimeStarts = dateRangeSegments.map(a => toStandardDateTimeString(a.dateTimeStart));
        do {
            if(!dateTimeStarts.includes(toStandardDateTimeString(segmentStart))) {
                dateRangeSegments.push({
                    dateTimeStart: segmentStart,
                    dateTimeEnd: segmentEnd,
                    isActivated: i++ < 5,
                    key: {}
                });
            }
            segmentStart = segmentEnd;
            segmentEnd = addMinutes(segmentEnd, TIME_SEGMENT_MINS);
            segmentEnd = segmentEnd < latestDateTime ? segmentEnd : latestDateTime;
        } while(segmentStart < latestDateTime);

        dateRangeSegments = dateRangeSegments;
    }

    const PRINT_DOCUMENT_TYPE = {
        FLOWSHEET: "Anaesthesia Report",
        BILLING: "Billing",
    };

    const PRINT_DURATION_HOURS = 24;

    let printDocument = PRINT_DOCUMENT_TYPE.FLOWSHEET;

    let printDateStart = '';
    let printDateEnd = '';
    let minDate = '';
    let maxDate = '';
    let maxEndDate: Date;

    onMount(async () => {
        await generateDateRangeSegments()
            .then(() => {
                minDate = toStandardDateTimeString(dateRangeSegments[0].dateTimeStart);

                // let tempMaxDate = dateRangeSegments[dateRangeSegments.length - 1].dateTimeEnd;
                // tempMaxDate = addMinutes(tempMaxDate, - (60 * PRINT_DURATION_HOURS));
                // maxDate = toStandardDateTimeString(tempMaxDate);
                // if(maxDate < minDate) {
                //     maxEndDate = tempMaxDate;
                //     maxDate = minDate;
                // }

                printDateStart = minDate;

                // printDateStart = maxDate;
            });
    });

    let printUrl = '';
    $: {
        if(printDocument == PRINT_DOCUMENT_TYPE.FLOWSHEET) {
            if(printDateStart) {
                printUrl = `/print?ptEncounterID=${ptEncounterID}`
                    + `&unitID=${unitID}`
                    + `&dateTimeStart=${printDateStart}` 
                    + `&dateTimeEnd=${printDateEnd}`
            }
        } else if(printDocument == PRINT_DOCUMENT_TYPE.BILLING){
            printUrl = `/print/billing?ptEncounterID=${ptEncounterID}`
                    + `&unitID=${unitID}}`
        }
    }

    $: if(printDateStart) {
        let tempMaxDate = dateRangeSegments[dateRangeSegments.length - 1].dateTimeEnd;
        let tempPrintEndDate = addMinutes(new Date(printDateStart), 60 * PRINT_DURATION_HOURS);
        if(tempPrintEndDate > tempMaxDate) {
            tempPrintEndDate = tempMaxDate;
        }
        printDateEnd = toStandardDateTimeString(tempPrintEndDate).substring(0, 16);
    }
</script>

<Modal bind:open={showPrintModal}>
    <h2 slot="title" class="uppercase">Print</h2>
    <form slot="content" class="p-4">
        
        <div class="w-full md:w-full px-3  md:mb-0">
            <label for="slc_document" class="form-label">
                Document
            </label>
            <select bind:value={printDocument}
                id="slc_document"
                class="w-full text-left">
                {#each Object.values(PRINT_DOCUMENT_TYPE) as printDocType}
                    <option class="text-lg" value={printDocType}>
                        {printDocType}
                    </option>
                {/each}
            </select>
        </div>
        {#if printDocument == PRINT_DOCUMENT_TYPE.FLOWSHEET}
            <div class="w-full md:w-full px-3  md:mb-0 text-black">
                <label for="txt_print_date_start" class="form-label">
                    Date Start
                </label>
                <InputDateTime bind:value={printDateStart}
                    id="txt_print_date_start"
                    {minDate}
                    {maxDate} />

                <label for="txt_print_date_end" class="form-label">
                    Date End
                </label>
                <input bind:value={printDateEnd}
                    id="txt_print_date_end"
                    class="pplus-textbox"
                    disabled />
            </div>
        {/if}
        <div class="flex flex-wrap justify-end items-center mt-2">
            <div class="flex-col lg:flex-row lg:space-x-2 items-center space-y-2 lg:space-y-0">
                {#if printUrl}
                    <a href={printUrl} class="save-btn">
                        Print
                    </a>
                {/if}
                <span on:click={() => showPrintModal = false}
                    on:keypress={() => showPrintModal = false}
                    class="cancel-btn">
                    Cancel
                </span>
            </div>
        </div>
    </form>
</Modal>