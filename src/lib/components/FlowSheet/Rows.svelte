<script lang="ts">
	import { onMount } from 'svelte';
    import { roundDownDateTime, roundUpDateTime, toNormalDateTimeString, toStandardDateTimeString } from '$lib/utils/DateTime';

    const MEDICATION_BOLUS_CATALOG_ID = '59F51342-2A8D-493F-A4DD-2FA9F8C65DC6';
    const MEDICATION_CONTINUOUS_CATALOG_ID = 'C2415DAD-03DB-4628-8F0B-8119AD0B6306';
    const OUTPUT_CATALOG_ID = '9204C4BA-CCAF-414F-8A30-C88EA2B24C30';

    export let ptEncounterID: string;
    export let unitID: string;
    export let dateTimeStart: Date;
    export let dateTimeEnd: Date;
    export let dateTimeColumns: any[] = [];
    export let intervalMinutes: number = 15;

    export let ioSummaries: any[] = [];

    export let showStopContinuousMedModal: boolean;

    export let disabledCatalogIDs: any[] = [];
    export let isDarkMode: boolean = false;

    export let isEditable: boolean;
    export let flowsheetCellToEdit: any;

    export let eventsNotesTypes: any[] = [];
    export let eventsNotesCellToEdit: any;

    const EVENT_ICONS: any = {
        'Start Anaesthesia': ['startAne.png', 'startAne_dark.png'],
        'Induction': ['induction.png', 'induction_dark.png'],
        'Start Surgery': ['startSurg.png', 'startSurg_dark.png'],
        'End Surgery': ['endSurg.png', 'endSurg_dark.png'],
        'End Anaesthesia': ['endAne.png', 'endAne_dark.png'],
        'Out of OR': ['outOr.png', 'outOr_dark.png'],
        'in OR': ['inOr.png', 'inOr_dark.png'],
        'Induction/Reversal': ['inductionOrReversal.png', 'inductionOrReversal_dark.png'],
    }

    let formattedFlowsheetData: any = {};
    let formattedEventsNotesData: any = {};

    export let hierarchicalCatalogs: any[] = [];
    const createHierarchicalCatalogs = (flowsheetData: any[]) => {
        const arrangeHierarchicalCatalogs = (parentID: string, dest: any[] = hierarchicalCatalogs) : boolean => {
            let hasChanges = false;
            flowsheetData.forEach((a: any) => {
                if(a.parentID == parentID) {
                    const hierarchicalCatalogLabels = dest.map((b: any) => b.shortLabel);
                    if(!hierarchicalCatalogLabels.includes(a.shortLabel)) {
                        dest.push(a);
                        hasChanges = true;
                    }
                    const currentCatalog = dest.find(b => b.catalogID == a.catalogID);
                    if(currentCatalog) {
                        if(!currentCatalog.childCatalogs) {
                            currentCatalog.childCatalogs = [];
                        }
                        let changed = arrangeHierarchicalCatalogs(currentCatalog.catalogID, currentCatalog.childCatalogs);
                        if(changed) {
                            hasChanges = true;
                        }
                    }
                }
            });
            return hasChanges;
        }

        const possibleBaseCatalogs = flowsheetData.filter(a => a.type == 'Coded')
            .sort((a, b) => a.order - b.order);
        if(possibleBaseCatalogs.length) {
            const hasChanged = arrangeHierarchicalCatalogs(possibleBaseCatalogs[0].parentID);
            if(hasChanged) {
                hierarchicalCatalogs = hierarchicalCatalogs;
            }
        }
    }

    const formatFlowsheetData = (flowsheetData: any[]) => {
        const flowsheetMainGroupCatalogIDs = hierarchicalCatalogs.map((a: any) => a.catalogID);
        
        flowsheetData.filter((a: any) => flowsheetMainGroupCatalogIDs.includes(a.parentID))
            .forEach((a: any) => {
                if(!formattedFlowsheetData[a.catalogID]) {
                    formattedFlowsheetData[a.catalogID] = {};
                }
                if(a.chartTime) {
                    const normalChartTime = toNormalDateTimeString(a.chartTime);
                    const strBaseDateTime = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime), intervalMinutes));
                    const strDateTime = toStandardDateTimeString(new Date(normalChartTime));
                    if(!formattedFlowsheetData[a.catalogID][strBaseDateTime]) {
                        formattedFlowsheetData[a.catalogID][strBaseDateTime] = {};
                    }
                    if(!formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime]) {
                        formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime] = {};
                    }
                    formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime] = a;
                } else if(a.type == 'Group') {
                    flowsheetData.filter(((b: any) => b.parentID == a.catalogID))
                        .forEach((b: any) => {
                            if(b.chartTime) {
                                const normalChartTime = toNormalDateTimeString(b.chartTime);
                                const strBaseDateTime = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime), intervalMinutes));
                                const strDateTime = toStandardDateTimeString(new Date(normalChartTime));
                                if(!formattedFlowsheetData[a.catalogID][strBaseDateTime]) {
                                    formattedFlowsheetData[a.catalogID][strBaseDateTime] = {};
                                }
                                if(!formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime]) {
                                    formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime] = { ...a };
                                    formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime].chartTime = b.chartTime;
                                    formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime].value = { };
                                }
                                formattedFlowsheetData[a.catalogID][strBaseDateTime][strDateTime].value[b.shortLabel] = b;
                            }
                        });
                }
            });
    }

    const onFlowsheetCellDblClick = (hierarchicalCatalog: any, childCatalog: any, dateTimeColumn: string) => {
        if(!isEditable) {
            return;
        }

        const range = getRangeInContinuous(hierarchicalCatalog, childCatalog, dateTimeColumn)
        if(range) {
            if(!range.end) {
                showStopContinuousMedModal = true;
            }
            return;
        }

        let dataItems: any[] = [];

        const formattedFlowsheetDataItem = formattedFlowsheetData[childCatalog.catalogID] ? formattedFlowsheetData[childCatalog.catalogID][dateTimeColumn] : null
        if(formattedFlowsheetDataItem) {
            delete formattedFlowsheetDataItem.original;

            dataItems = Object.values(formattedFlowsheetDataItem);
            dataItems = dataItems.filter((a: any) => a.value);
            dataItems = dataItems.filter(
                (a: any) => (typeof a.value != 'object') 
                || (typeof a.value == 'object'  && Object.values(a.value).filter((b: any) => !!b).length)
            );
        }

        let items = [];
        if(dataItems.length) {
            if(hierarchicalCatalog.catalogID == MEDICATION_CONTINUOUS_CATALOG_ID) {
                showStopContinuousMedModal = true;
            } else {
                dataItems.forEach((a: any) => {
                    a.original = JSON.parse(JSON.stringify({ chartTime: a.chartTime, value: a.value }))
                });
                items = JSON.parse(JSON.stringify(dataItems));
            }
        }
        flowsheetCellToEdit = {
            catalog: childCatalog,
            chartTime: dateTimeColumn,
            items
        };
    }

    const onEventNoteCellDblClick = (data: any, dateTimeColumn: string) => {
        if(!isEditable) {
            return;
        }
        eventsNotesCellToEdit = {
            items: data[dateTimeColumn] ? Object.values(data[dateTimeColumn]).flat(1) : [],
            chartTime: dateTimeColumn
        }
    }

    const getCellEvents = (cellData: any) => {
        return  Object.values(cellData).flat(1).filter((a: any) => a.noteType == 'Events');
    }

    const getCellNotes = (cellData: any) => {
        return Object.values(cellData).flat(1).filter((a: any) => a.noteType == 'Charted Notes')
    }

    onMount(async () => {
        const promiseFlowsheetData = await fetch('/api/flowsheet'
            + `?ptEncounterID=${ptEncounterID}`
            + `&unitID=${unitID}`
            + '&dateTimeStart=' + toStandardDateTimeString(dateTimeStart)
            + '&dateTimeEnd=' + toStandardDateTimeString(dateTimeEnd));
        const resultsFlowsheetData = await promiseFlowsheetData.json();
        
        const clonedFlowsheetData = JSON.parse(JSON.stringify(resultsFlowsheetData));
        createHierarchicalCatalogs(clonedFlowsheetData);
        formatFlowsheetData(clonedFlowsheetData);

        const promiseEventsNotesData = await fetch('/api/events-notes'
            + `?ptEncounterID=${ptEncounterID}`
            + `&unitID=${unitID}`
            + '&dateTimeStart=' + toStandardDateTimeString(dateTimeStart)
            + '&dateTimeEnd=' + toStandardDateTimeString(dateTimeEnd));
        const resultsEventsNotesData = await promiseEventsNotesData.json();
        resultsEventsNotesData.forEach((a: any) => {
            const normalChartTime = toNormalDateTimeString(a.chartTime);
            const strBaseDateTime = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime), intervalMinutes));
            const strDateTime = toStandardDateTimeString(new Date(normalChartTime));
            if(!formattedEventsNotesData[strBaseDateTime]) {
                formattedEventsNotesData[strBaseDateTime] = {};
            }
            if(!formattedEventsNotesData[strBaseDateTime][strDateTime]) {
                formattedEventsNotesData[strBaseDateTime][strDateTime] = [];
            }
            formattedEventsNotesData[strBaseDateTime][strDateTime] = [
                ...formattedEventsNotesData[strBaseDateTime][strDateTime],
                a
            ];

            if(!eventsNotesTypes.map((a: any) => a.noteTypeID).includes(a.noteTypeID)) {
                eventsNotesTypes = [...eventsNotesTypes, a];
            }
        });
    });

    let getRangeInContinuous: any = () => { return null; };
    $: if(ioSummaries) {
        getRangeInContinuous = (hierarchicalCatalog: any, childCatalog: any, dateTimeColumn: string) => {
            if(!(hierarchicalCatalog.catalogID == MEDICATION_CONTINUOUS_CATALOG_ID)) {
                return null;
            }

            const roundedChartTime = toStandardDateTimeString(roundDownDateTime(new Date(dateTimeColumn), intervalMinutes));
            const ioSummaryItems = ioSummaries.filter(a => a.catalogID == childCatalog.catalogID);
            for(const item of ioSummaryItems) {
                if(!item.dateTimeStart) {
                    const dateTimeStart = new Date(toNormalDateTimeString(item.startTime)); 
                    const dateTimeStartDown = roundDownDateTime(dateTimeStart, intervalMinutes);
                    item.dateTimeStart = toStandardDateTimeString(dateTimeStartDown);
                }
                if(!item.dateTimeEnd && item.endTime) {
                    const dateTimeEnd = new Date(toNormalDateTimeString(item.endTime));
                    const dateTimeEndUp = roundUpDateTime(dateTimeEnd, intervalMinutes);
                    item.dateTimeEnd = toStandardDateTimeString(dateTimeEndUp);
                }
                if(roundedChartTime >= item.dateTimeStart) {
                    if(!item.dateTimeEnd) {
                        return item;
                    }
                    if(roundedChartTime <= item.dateTimeEnd) {
                        return item;
                    }
                }
            }
            return null;
        }
    }
</script>

<tr class="row1 select-none" style="background-color: transparent !important;">
    {#each dateTimeColumns as dateTimeColumn, i}
        {#if i < dateTimeColumns.length - 1}
            <td on:dblclick={() => onEventNoteCellDblClick(formattedEventsNotesData, dateTimeColumn)}
                class="!min-w-[60px] !max-w-[60px] h-[22px] select-none eventIcons"
                class:editable={isEditable}>
                <div class="flex h-full">
                    {#if formattedEventsNotesData[dateTimeColumn]}
                        {@const eventsData = getCellEvents(formattedEventsNotesData[dateTimeColumn])}
                        {@const notesData = getCellNotes(formattedEventsNotesData[dateTimeColumn])}
                        {#if eventsData.length}
                            {@const eventValue = eventsData[eventsData.length - 1]?.value}
                            {@const iconFileName = EVENT_ICONS[eventValue] ? EVENT_ICONS[eventValue][+isDarkMode] : ''}
                            <div class="h-full w-full relative">
                                {#if iconFileName}
                                    <img src="/img/printIcons/{iconFileName}"
                                        class="m-auto w-4 h-4 "
                                        alt="{eventValue}"
                                        title="{eventValue}" />
                                {:else}
                                    <img src="/img/Events.png"
                                        class="m-auto w-4 h-4"
                                        alt="{eventValue}"
                                        title="{eventValue}" />
                                {/if}
                                {#if eventsData.length > 1}
                                    <div class="cellTriangle" title=""></div>
                                {/if}
                            </div>
                        {/if}
                        {#if notesData.length}
                            {@const noteValue = notesData[notesData.length - 1]?.value}
                            <div class="h-full w-full relative">
                                <img src="/img/StickyNote.png"
                                    class="m-auto w-4 h-4"
                                    alt="{noteValue}"
                                    title="{noteValue}" />
                                {#if notesData.length > 1}
                                    <div class="cellTriangle" title=""></div>
                                {/if}
                            </div>
                        {/if}
                    {/if}
                </div>
            </td>
        {/if}
    {/each}
</tr>

{#if formattedFlowsheetData}
    {#each hierarchicalCatalogs as hierarchicalCatalog}
        {#if !disabledCatalogIDs.includes(hierarchicalCatalog.catalogID)}
            {#each hierarchicalCatalog?.childCatalogs || [] as childCatalog}
                {@const isMedicationContinuous = hierarchicalCatalog.catalogID == MEDICATION_CONTINUOUS_CATALOG_ID}
                <tr class="row2">
                    {#each dateTimeColumns as dateTimeColumn, i}
                        {#if i < dateTimeColumns.length - 1}
                            {@const formattedFlowsheetDataItem = formattedFlowsheetData[childCatalog.catalogID] ? formattedFlowsheetData[childCatalog.catalogID][dateTimeColumn] : null}
                            {@const cellZigzag = !!getRangeInContinuous(hierarchicalCatalog, childCatalog, dateTimeColumn)}
                            <td on:dblclick={() => onFlowsheetCellDblClick(hierarchicalCatalog, childCatalog, dateTimeColumn)}
                                class="!min-w-[60px] !max-w-[60px] h-[22px] whitespace-nowrap overflow-hidden text-xxs  relative text-center"
                                class:editable={isEditable}
                                class:cellZigzag>
                                <div class="tableTd"
                                    class:!text-purple-400={isMedicationContinuous}>
                                    {#if formattedFlowsheetDataItem}
                                        {@const keys = Object.keys(formattedFlowsheetDataItem).filter(k => formattedFlowsheetDataItem[k].value != null)}
                                        {#if hierarchicalCatalog.catalogID == MEDICATION_BOLUS_CATALOG_ID}
                                            <div class="flex justify-center w-full overflow-hidden">
                                                {#each keys as k}
                                                    {#if formattedFlowsheetDataItem[k].value}
                                                        <div>
                                                            <img alt="arrow White" class="m-auto w-2 h-auto" src="/img/arrowWhite.png" />
                                                        </div>
                                                    {/if}
                                                {/each}
                                            </div>
                                        {/if}                            
                                        {#if keys.length > 1}
                                            <div class="cellTriangle" />
                                        {/if}
                                        {#if keys.length}
                                            {@const lastKey = keys[keys.length - 1]}
                                            {#if childCatalog.type == 'Group'}
                                                {@const { Systolic, Diastolic, Mean } = formattedFlowsheetDataItem[lastKey].value}
                                                {#if Systolic?.value && Diastolic?.value && Mean?.value}
                                                    {Systolic.value}/{Diastolic.value} ({Mean.value})
                                                {/if}
                                            {:else}
                                                {formattedFlowsheetDataItem[lastKey].value || ''}
                                            {/if}
                                        {/if}
                                    {/if}
                                </div>
                            </td>
                        {/if}
                    {/each}
                </tr>
            {/each}
        {/if}
    {/each}
{/if}

<style>
    table tr td.editable {
        @apply cursor-pointer;
    }

    .tableTd {
        width: fit-content;
    }
</style>