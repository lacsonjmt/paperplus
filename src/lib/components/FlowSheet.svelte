<svelte:head>
    <title>Flowsheet</title>
</svelte:head>

<script lang="ts">
	import { onMount } from "svelte";
    import Alert from '$lib/components/Alert.svelte';
    import Fa from 'svelte-fa';
    import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
    

    import { addMinutes, roundDownDateTime, roundUpDateTime, toNormalDateTimeString, toStandardDateTimeString } from "$lib/utils/DateTime";
	import VitalsChart from "$lib/components/FlowSheet/VitalsChart.svelte";
	import moment from "moment";
	import Rows from "$lib/components/FlowSheet/Rows.svelte";
	import ModalTrendUpload from "$lib/components/FlowSheet/ModalTrendUpload.svelte";
	import ModalArchivedEpisodes from "$lib/components/FlowSheet/ModalArchivedEpisodes.svelte";
	import ModalPrint from "$lib/components/FlowSheet/ModalPrint.svelte";
	import ModalStopContinuousMedication from "$lib/components/FlowSheet/ModalStopContinuousMedication.svelte";
	import ModalInterventions from "$lib/components/FlowSheet/ModalInterventions.svelte";
	import ModalDataEdit from "$lib/components/FlowSheet/ModalDataEdit.svelte";
	import { page } from "$app/stores";
	import ModalEventsNotesEdit from "./FlowSheet/ModalEventsNotesEdit.svelte";
	import { DISPLAY_MODE, displayMode } from "$lib/stores";
    
    export let ptEncounterID: string;
    export let unitID: string;
    export let intervalMinutes: number = 15;
    export let autochartMinutes: number = 5;
    export let isEditable: boolean;
    export let cookieDisplayMode: string = DISPLAY_MODE.DARK;

    const TIME_SEGMENT_MINS = 60 * 8; //4 hours

    const MEDICATION_BOLUS_CATALOG_ID = '59F51342-2A8D-493F-A4DD-2FA9F8C65DC6';
    const MEDICATION_CONTINUOUS_CATALOG_ID = 'C2415DAD-03DB-4628-8F0B-8119AD0B6306';
    const OUTPUT_CATALOG_ID = '9204C4BA-CCAF-414F-8A30-C88EA2B24C30';

    let hierarchicalCatalogs: any[] = [];
    let disabledCatalogs: any[] = [];
    let alertMessages: any[] = [];
    let edgeData: any[] = [];

    let flowsheetCellToEdit: any = null;
    let eventsNotesCellToEdit: any = null;
    let eventsNotesTypes: any[] = [];

    let showStopContinuousMedModal = false;
    let showInterventionsModal = false;
    let showTrendModal = false;
    let showPrintModal = false;
    let showArchivedEpisodesModal = false;

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
                    isActivated: i++ < 3,
                    key: `segment_${i}`
                });
            }
            segmentStart = segmentEnd;
            segmentEnd = addMinutes(segmentEnd, TIME_SEGMENT_MINS);
            segmentEnd = segmentEnd < latestDateTime ? segmentEnd : latestDateTime;
        } while(segmentStart < latestDateTime);

        dateRangeSegments = dateRangeSegments;
    }

    const toggleCatalog = (catalog: any) => {
        if(disabledCatalogIDs.includes(catalog.catalogID)) {
            disabledCatalogs = disabledCatalogs.filter(a => a.catalogID != catalog.catalogID);
        } else {
            disabledCatalogs = [...disabledCatalogs, catalog]
        }
    }

    const getDateTimeColumns = function (start: Date, end: Date) {
        start = roundDownDateTime(start, intervalMinutes);
        end = roundUpDateTime(end, intervalMinutes);
        const arr = [];
        const dateEnd = new Date(end);
        for (let dt = new Date(start); dt <= dateEnd; dt = new Date(dt.getTime() + intervalMinutes * 60000)) {
            arr.push(new Date(dt));
        }
        return arr;
    };

    let ioSummaries: any[] = [];
    const fetchIoSummaries = async () => {
        fetch('/api/io-summary'
            + `?ptEncounterID=${ptEncounterID}`
            + `&unitID=${unitID}`)
        .then(async response => {
            ioSummaries = await response.json();
        });
    }

    const refreshAutoCharting = async () => {
        // await fetch(`/api/flowsheet/auto-charting`);
        generateDateRangeSegments(false);
        refreshChartsAndTables();
        fetchIoSummaries();
        setTimeout(refreshAutoCharting, autochartMinutes * 60000);
    }

    const refreshChartsAndTables = () => {
        for(let segment of dateRangeSegments) {
            if(segment.isActivated) {
                segment.key += '_x';
            }
        }
        dateRangeSegments = dateRangeSegments;
        fetchIoSummaries();
    }

    let isDarkMode = true;
    const toggleDisplayMode = () => {
        const mode = isDarkMode ? DISPLAY_MODE.LIGHT : DISPLAY_MODE.DARK;
        document.cookie = `displayMode=${mode}`;
        displayMode.update(() => mode);
        isDarkMode = ($displayMode == DISPLAY_MODE.DARK);
    }

    const activateNextSegment = () => {
        const segment = dateRangeSegments.find(a => !a.isActivated);
        if(segment) {
            segment.isActivated = true;
            dateRangeSegments = dateRangeSegments;
            setTimeout(activateNextSegment, 2000);
        }
    }

    let divScroll: HTMLDivElement;
    let divFlowsheetContent;

    const labelCollision = ['23:45', '23:50', '23:55']

    let dtSegmentIndex = 40;
    let showDateX = 0;
    let showDatePaddingLeft = 0;

    onMount(async() => {
        if(cookieDisplayMode) {
            displayMode.update(() => cookieDisplayMode);
        }
        isDarkMode = ($displayMode == DISPLAY_MODE.DARK);

        await generateDateRangeSegments()
            .then(() => {
                setTimeout(activateNextSegment, 5000);
            });
        fetchIoSummaries();
        setTimeout(refreshAutoCharting, autochartMinutes * 60000);

        divScroll.addEventListener('scroll', ({ target }) => {
            if(target) {
                const scrollLeft = target.scrollLeft;                
                showDateX = Math.floor(scrollLeft / 60) * 60;
                showDatePaddingLeft = scrollLeft % 60;
                // console.log('scroll: '+scrollLeft, ' showDateX: '+showDateX, ' padding: '+showDatePaddingLeft);
                
                // console.log(target.scrollLeft, '/', divFlowsheetContent.clientWidth)

                // const scrolled = target.scrollLeft / divFlowsheetContent.clientWidth;
                // if(scrolled > .9) {
                //     console.log(target.scrollLeft, '/', divFlowsheetContent.clientWidth)
                // }
                
            }
        });
    });

    $: disabledCatalogIDs = disabledCatalogs.map(a => a.catalogID);
    $: disabledCatalogLabels = disabledCatalogs.map(a => a.shortLabel);
</script>

{#each alertMessages as alertMessage}
    <Alert type={alertMessage.type}>
        <h2 slot="header">{alertMessage.title}</h2>
        <div slot="content">{alertMessage.message}</div>
    </Alert>
{/each}

<div class="col-span-2 flex justify-end absolute right-[20px] top-[93px]">
    <div class="flex content-center space-x-2">
        {#if isEditable}
            <div>
                <img on:click={() => showStopContinuousMedModal = true}
                    on:keypress={() => showStopContinuousMedModal = true}
                    src="/img/stop3.png"
                    class="cursor-pointer"
                    alt="Stop Continuous: Medication/Fluid"
                    title = "Stop Medication"
                    width="32px" />
            </div>
            <div>
                <img on:click={() => showInterventionsModal = true}
                    on:keypress={() => showInterventionsModal = true}
                    src="/img/add.png"
                    class="cursor-pointer"
                    alt="Add New Intervention"
                    title="Add New Intervention"
                    width="32px" />
            </div>
            <div>
                <img on:click={() => showTrendModal = true}
                    on:keypress={() => showTrendModal = true}
                    src="/img/trends.png"
                    class="cursor-pointer"
                    alt="Trend Upload"
                    title="Trend Upload"
                    width="32px" />
            </div>
        {/if}
        <div>
            <img on:click={() => showPrintModal = true}
                on:keypress={() => showPrintModal = true}
                src="/img/printer.png"
                class="cursor-pointer"
                alt="Print"
                title="Print"
                width="32px" />
        </div>
        <div>
            <img on:click={() => showArchivedEpisodesModal = true}
                on:keypress={() => showArchivedEpisodesModal = true}
                src="/img/Document.png"
                class="cursor-pointer"
                alt="Archived Episodes"
                title="Archived Episodes"
                width="32px" />
        </div>
    </div>
</div>

<div class="flex w-full { isDarkMode ? 'darkMode' : 'lightMode' }">
    <div bind:this={divScroll} class="w-screen overflow-x-auto h-auto">
        <div class="sticky top-0 z-50">
            <table class="headerTable w-full"> 
                <tbody>
                    <tr class="row1 flex">
                        <td class="stickyCol symbols !min-w-[160px] !max-w-[160px] darkMode { isDarkMode ? 'darkMode' : 'lightMode' } w-full">
                            &nbsp;
                        </td>
                        <td class="numbers stickyNumbers !min-w-[150px] !max-w-[150px] !max-w-auto relative darkMode { isDarkMode ? 'darkMode' : 'lightMode' }">
                            &nbsp;
                        </td>
                        <td>
                            <div class="flex">
                                {#each dateRangeSegments as dateRangeSegment, index}
                                    {#if dateRangeSegment.isActivated}
                                        {@const dateTimeColumns = getDateTimeColumns(dateRangeSegment.dateTimeStart, dateRangeSegment.dateTimeEnd).map(a => toStandardDateTimeString(a))}
                                        {@const sliced = dateTimeColumns.slice(0,dateTimeColumns.length-1)}
                                        {#key dateRangeSegment.key}
                                            <table class="tableChart">
                                            <!-- <table class="tableChart z-{50}"> -->
                                                <thead>
                                                    <tr class="dateTime">
                                                        {#each sliced as dateTimeColumn, i}
                                                            {@const xValue = ((index * sliced.length) + i) * 60}
                                                            {#if i < sliced.length}
                                                                {@const momentDateTimeColumn = moment(dateTimeColumn)}
                                                                <th class="!min-w-[60px] !max-w-[60px] whitespace-nowrap text-xs font-normal" style="overflow: visible; whitespace: nowrap;">
                                                                    {#if ((!index && !i) && (xValue > showDateX))
                                                                        || ((momentDateTimeColumn.format('HH:mm') == '00:00') && xValue > showDateX)
                                                                        || (!(labelCollision.includes(momentDateTimeColumn.format('HH:mm'))                                                                       )
                                                                        && ((xValue == showDateX)))}
                                                                        <div style="padding-left: {(xValue == showDateX) ? showDatePaddingLeft : 0}px;">
                                                                            {momentDateTimeColumn.format('ddd Y-MM-DD')}
                                                                        </div>
                                                                    {/if}
                                                                    &nbsp;
                                                                </th>
                                                            {/if}
                                                        {/each}
                                                    </tr>
                                                    <tr class="dateTime">
                                                        {#each sliced as dateTimeColumn, i}
                                                            {#if i < sliced.length}
                                                                <th class="!min-w-[60px] !max-w-[60px] text-left text-xs font-normal">
                                                                    {moment(dateTimeColumn).format('HH:mm')}
                                                                </th>
                                                            {/if}
                                                        {/each}
                                                    </tr>
                                                </thead>
                                            </table>
                                        {/key}
                                    {/if}
                                {/each}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="scrollableTable">
            <table class="mainTable w-full">
                <tbody >
                    <tr class="row1 flex">
                        <td class="stickyCol symbols !min-w-[160px] !max-w-[160px] darkMode { isDarkMode ? 'darkMode' : 'lightMode' } w-full">
                            <div class="!max-h-[220px]">
                                <div class="mt-auto mb-[52px]" class:hidden={disabledCatalogLabels.includes('VITAL SIGNS GRAPH')}>
                                    <span class="text-xs">Symbols</span>
                                    <div class="grid grid-cols-5">
                                        <div class="col-span-1 flex w-2 h-auto ml-2 mt-1">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/ArterialBP.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class="text-xxs text-slate-400">- Arterial BP Systolic </small>
                                            </div>
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Arterial BP Mean </small>
                                            </div>
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Arterial BP Diastolic </small>
                                            </div>
                                        </div>
                    
                                        <div class="col-span-1 flex w-2 h-auto ml-2 mt-2">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/NonInvasiveBP.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Non Invasive BP Systolic </small>
                                            </div>
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Non Invasive BP Mean </small>
                                            </div>
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Non Invasive BP Diastolic </small>
                                            </div>
                                        </div>
                                        <div class="col-span-1 flex w-3 h-4 ml-2 mt-2">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/HeartRate.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Heart Rate </small>
                                            </div>
                                        </div>
                                        <div class="col-span-1 flex w-4 h-4 ml-2 mt-[6px]">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/RespirationRate.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Respiration Rate </small>
                                            </div>
                                        </div>
                                        <div class="col-span-1 flex w-3 h-4 ml-2  mt-[6px]">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/SPO2.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-3">
                                                <small class=" text-xxs text-slate-400">- SPO2 </small>
                                            </div>
                                        </div>
                                        <div class="col-span-1 flex w-3 h-4 ml-2  mt-[6px]">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/CVP.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- CVP </small>
                                            </div>
                                        </div>
                                        <div class="col-span-1 flex w-3 h-4 ml-2  mt-[6px]">
                                            <img id="ABP" alt="" class="m-1" src="/img/chartIcons/Temperature.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Temperature </small>
                                            </div>
                                        </div>
                                        <div class="col-span-1 flex w-6 h-4  mt-[6px]">
                                            <img id="ABP" alt="" class="m-1" src="/img/zigzag.png" />
                                        </div>
                                        <div class="col-span-4">
                                            <div class="gap-y-0 h-4">
                                                <small class=" text-xxs text-slate-400">- Running Dose </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 darkMode { isDarkMode ? 'darkMode' : 'lightMode' } mt-[48px]">
                                <ul>
                                    {#each hierarchicalCatalogs as catalog}
                                        <li class="catalogNav">
                                            <button on:click={() => toggleCatalog(catalog)}
                                                class="navBtn text-xxs"
                                                class:disabled={disabledCatalogIDs.includes(catalog.catalogID)}>
                                                {catalog.shortLabel}
                                            </button>
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </td>
                        <td class="numbers stickyNumbers !min-w-[150px] !max-w-[150px] !max-w-auto relative darkMode { isDarkMode ? 'darkMode' : 'lightMode' }">
                            <div>
                                <div>
                                    <ul class="vitalSignsNumbers chartNumbers text-right text-xs  !max-h-[200px] mb-[10px]"
                                        class:hidden={disabledCatalogLabels.includes('VITAL SIGNS GRAPH')}>
                                        <li>240</li>
                                        <li class="mt-[16px]">200</li>
                                        <li class="mt-[16px]">160</li>
                                        <li class="mt-[16px]">120</li>
                                        <li class="mt-[16px]">80</li>
                                        <li class="mt-[16px]">40</li>
                                        <li class="mt-[16px]">0</li>
                                    </ul>
                                </div>
                                <div>
                                    <table class="darkSubTable w-full">
                                        <tbody>
                                            <tr class="whitespace-nowrap text-left text-xxs">
                                                <td class="h-[22px]">Events/Notes</td>
                                            </tr>
                                            {#each hierarchicalCatalogs as hierarchicalCatalog}
                                                {#if !disabledCatalogIDs.includes(hierarchicalCatalog.catalogID)}
                                                    {#each hierarchicalCatalog?.childCatalogs || [] as childCatalog}
                                                        {@const isIO = [MEDICATION_BOLUS_CATALOG_ID, MEDICATION_CONTINUOUS_CATALOG_ID, OUTPUT_CATALOG_ID].includes(hierarchicalCatalog.catalogID)}
                                                        {@const isMedicationContinuous = hierarchicalCatalog.catalogID == MEDICATION_CONTINUOUS_CATALOG_ID}
                                                        {@const ioTotal = isIO ? ioSummaries.filter(a => a.catalogID == childCatalog.catalogID).map(a => a.total).reduce((a, b) => a + b, 0): ''}
                                                        <tr class="whitespace-nowrap text-left text-xxs">
                                                            <td class="!min-w-[150px] flex h-[22px]">
                                                                <div class="text-left"
                                                                    class:text-purple-400={isMedicationContinuous}>
                                                                    {childCatalog.shortLabel}
                                                                </div>
                                                                {#if isIO}
                                                                    <div class="text-right w-full"
                                                                        class:text-purple-400={isMedicationContinuous}>
                                                                        -Total: {ioTotal || 0}
                                                                    </div>
                                                                {/if}
                                                            </td>
                                                        </tr>
                                                    {/each}
                                                {/if}
                                            {/each}
                                        </tbody> 
                                    </table>
                                </div>
                            </div>
                        </td>
                        <td class="overflow-x-auto overflow-y-hidden">
                            <div bind:this={divFlowsheetContent} class="flex">
                                {#each dateRangeSegments as dateRangeSegment, index}
                                    {#if dateRangeSegment.isActivated}
                                        {@const dateTimeColumns = getDateTimeColumns(dateRangeSegment.dateTimeStart, dateRangeSegment.dateTimeEnd).map(a => toStandardDateTimeString(a))}
                                        {#key dateRangeSegment.key}
                                            <table class="tableChart">
                                                <tfoot>
                                                    <div>
                                                        <Rows bind:hierarchicalCatalogs
                                                            bind:disabledCatalogIDs
                                                            bind:flowsheetCellToEdit
                                                            bind:showStopContinuousMedModal
                                                            bind:eventsNotesTypes
                                                            bind:eventsNotesCellToEdit
                                                            bind:ioSummaries
                                                            {isDarkMode}
                                                            {isEditable}
                                                            {dateTimeColumns}
                                                            {ptEncounterID}
                                                            {unitID} 
                                                            {intervalMinutes}
                                                            dateTimeStart={dateRangeSegment.dateTimeStart}
                                                            dateTimeEnd={dateRangeSegment.dateTimeEnd} />
                                                    </div>
                                                </tfoot>
                                                <tbody>
                                                    <tr class="vitals"
                                                        class:hidden={disabledCatalogLabels.includes('VITAL SIGNS GRAPH')}>
                                                        <td colspan="{dateTimeColumns.length}" class="p-0">
                                                            {#key dateRangeSegment.key}
                                                                <VitalsChart bind:edgeData
                                                                    {index}
                                                                    {ptEncounterID}
                                                                    {unitID} 
                                                                    {intervalMinutes}
                                                                    dateTimeStart={dateRangeSegment.dateTimeStart}
                                                                    dateTimeEnd={dateRangeSegment.dateTimeEnd} />
                                                            {/key}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        {/key}
                                    {/if}
                                {/each}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="fixed z-50 bottom-[2px] right-2">
            <input type="checkbox" class="checkbox" id="checkbox" on:click={toggleDisplayMode}> 
            <label for="checkbox" class="checkbox-label">
                <Fa class="moon" icon={faMoon} /> 
                <Fa class="sun" icon={faSun} /> 
                <span class="ball"></span>
            </label>
        </div>
    </div>
</div>

{#if flowsheetCellToEdit}
    <ModalDataEdit bind:flowsheetCellToEdit
        on:save={refreshChartsAndTables}
        {ptEncounterID}
        {unitID} />
{/if}

{#if eventsNotesCellToEdit}
    <ModalEventsNotesEdit bind:eventsNotesCellToEdit
        bind:eventsNotesTypes
        {ptEncounterID}
        {unitID} />
{/if}

{#if showStopContinuousMedModal}
    <ModalStopContinuousMedication bind:showStopContinuousMedModal
        {ptEncounterID}
        {unitID} />
{/if}

<ModalInterventions bind:showInterventionsModal 
    bind:hierarchicalCatalogs
    {ptEncounterID}
    {unitID} />
<ModalTrendUpload bind:showTrendModal
    {ptEncounterID}
    {unitID} />

{#if showPrintModal}
    <ModalPrint bind:showPrintModal
        {ptEncounterID}
        {unitID} />
{/if}

{#if showArchivedEpisodesModal}
    <ModalArchivedEpisodes bind:showArchivedEpisodesModal
        {ptEncounterID} />
{/if}

<style>
    .stickyCol, .vitalSignsNumbers {
        position: sticky;
        left: 0;
        @apply z-40;
    }
    .stickyNumbers {
        position: sticky;
        left:160px;
        @apply z-40;
    }
    .vitalSignsNumbers {
        @apply pl-2;
    }
    .mainTable tr:hover {
        @apply bg-transparent;
    }
    .modalTable tr th {
        background-color: transparent !important;
    }
    .checkbox {
        opacity: 0;
        position: absolute;
    }
    .checkbox-label {
        background-color: #A4C2E5;
        width: 54px;
        height: 30px;
        border: 3px solid;
        border-color: #FFC90E;
        border-radius: 50px;
        position: relative;
        padding: 5px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .checkbox-label .ball {
        background-color: #fff;
        width: 21px;
        height: 21px;
        position: absolute;
        left: 4px;
        top: 2px;
        border-radius: 50%;
        transition: transform 0.2s linear;
    }
    .checkbox:checked + .checkbox-label .ball {
        transform: translateX(22px);
    }
    @media only screen and (max-width: 96rem) {
        .scrollableTable {
            min-height: 75vh;
            max-height: 75vh;
        }
    }
    @media only screen and (min-width: 97rem) {
        .scrollableTable {
            min-height: 75vh;
            max-height: 75vh;
        }
    }
</style>