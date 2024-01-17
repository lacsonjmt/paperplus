<script lang="ts">
    import { roundDownDateTime, roundUpDateTime, toNormalDateTimeString, toStandardDateTimeString } from '$lib/utils/DateTime';

    const MEDICATION_BOLUS_CATALOG_ID = '59F51342-2A8D-493F-A4DD-2FA9F8C65DC6';
    const MEDICATION_CONTINUOUS_CATALOG_ID = 'C2415DAD-03DB-4628-8F0B-8119AD0B6306';
    const OUTPUT_CATALOG_ID = '9204C4BA-CCAF-414F-8A30-C88EA2B24C30';

    export let renderedTables: any[] = [];
    export let ioSummaries: any[] = [];
    export let index: number = 0;
    export let intervalMinutes: number = 15;

    export let ptEncounterID: string;
    export let unitID: string;
    export let dateTimeStart: Date;
    export let dateTimeEnd: Date;
    
    export let MAX_COLS: number = 0;
    
    const getDateTimeColumns = function (start: Date, end: Date, intervalMinutes = 15) {
        const arr = [];
        const dateEnd = new Date(end);
        for (let dt = new Date(start); dt <= dateEnd; dt = new Date(dt.getTime() + intervalMinutes * 60000)) {
            arr.push(new Date(dt));
        }
        return arr.slice(0, arr.length - 1);
    };
    const dateTimeColumns: any[] = getDateTimeColumns(dateTimeStart, dateTimeEnd).map(a => toStandardDateTimeString(a));

    const getBaseCatalogs = (flowsheetData: any[]) => {
        return flowsheetData.filter((a: any) => a.type == 'Coded');
    }

    const getChildCatalogs = (flowsheetData: any[], baseCatalog: any) => {
        return [
            ...new Map(
                flowsheetData.filter((a: any) => a.parentID == baseCatalog.catalogID)
                    .map((item) => [item.catalogID, item]),
            ).values(),
        ];
    }

    const getColumnValues = (flowsheetData: any[], catalog: any, dateTimeColumn: Date) => {
        const standardDateTimeColumn = toStandardDateTimeString(dateTimeColumn);
        return flowsheetData.filter(a => {
            if(a.catalogID != catalog.catalogID) {
                return false;
            }
            if(!a.dateTimeColumn) {
                const normalChartTime = toNormalDateTimeString(a.chartTime);
                a.dateTimeColumn = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime), 15));
            }
            return a.dateTimeColumn == standardDateTimeColumn;
        });
    }

    const getColumnBpValues = (flowsheetData: any[], catalog: any, dateTimeColumn: Date) => {
        const standardDateTimeColumn = toStandardDateTimeString(dateTimeColumn);
        return flowsheetData
            .filter(a => {
                if(a.parentID != catalog.catalogID) {
                    return false;
                }
                if(!a.dateTimeColumn) {
                    const normalChartTime = toNormalDateTimeString(a.chartTime);
                    a.normalChartTime = normalChartTime;
                    a.dateTimeColumn = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime), 15));
                }
                return a.dateTimeColumn == standardDateTimeColumn;
            })
            .reduce(function(rv, a) {
                (rv[a.normalChartTime] = rv[a.normalChartTime] || []).push(a);
                return rv;
            }, {});
    }

    const getColumnBpValue = (flowsheetData: any[], catalog: any, dateTimeColumn: Date) => {
        const values = getColumnBpValues(flowsheetData, catalog, dateTimeColumn);
        if(!values) {
            return null;
        }

        const normalChartTimes = Object.keys(values).sort();
        const key = normalChartTimes[normalChartTimes.length - 1];
        const latestValue = values[key];
        if(!latestValue) {
            return null;
        }

        const systolic = latestValue.find((a: any) => a.shortLabel == 'Systolic');
        
        const diastolic = latestValue.find((a: any) => a.shortLabel == 'Diastolic');
        const mean = latestValue.find((a: any) => a.shortLabel == 'Mean');
        if(!(systolic && diastolic && mean)) {
            return null;
        }

        return {
            systolic,
            diastolic,
            mean,
            count: values.length
        }
    }

    let promiseFlowsheetData = (async () => {
		const res = await fetch('/api/flowsheet'
            + `?ptEncounterID=${ptEncounterID}`
            + `&unitID=${unitID}`
            + '&dateTimeStart=' + toStandardDateTimeString(dateTimeStart)
            + '&dateTimeEnd=' + toStandardDateTimeString(dateTimeEnd));
        if(res.ok) {
            renderedTables[index] = 1;
            renderedTables = renderedTables;
            return await res.json();
        } else {
            const text = await res.text();
            throw new Error(text);
        }
	})()

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

{#await promiseFlowsheetData}
    <table class="border-collapse table-fixed w-full border-left border-right p-0">
        <tbody>
            {#each [1, 2, 3] as x}
                <tr>
                    <td class="text-print-xs">
                        Loading...
                    </td>
                    {#each dateTimeColumns as dateTimeColumn, i}
                        <td class="!min-w-[60px] !max-w-[60px] text-print-xs">
                            ...
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
{:then flowsheetData}
    {@const baseCatalogs = getBaseCatalogs(flowsheetData)}
    <table class="print border-collapse table-fixed w-full p-0">
        <tbody id="printTable">
            {#each baseCatalogs as baseCatalog}
                {@const childCatalogs = getChildCatalogs(flowsheetData, baseCatalog)}
                {#each childCatalogs as childCatalog}
                    {@const isIO = [MEDICATION_BOLUS_CATALOG_ID, MEDICATION_CONTINUOUS_CATALOG_ID, OUTPUT_CATALOG_ID].includes(baseCatalog.catalogID)}
                    {@const isMedicationContinuous = baseCatalog.catalogID == MEDICATION_CONTINUOUS_CATALOG_ID}
                    <!-- {@const ioTotal = isIO ? ioSummaries.find(a => a.catalogID == childCatalog.catalogID)?.total : null} -->
                    {@const ioTotal = isIO ? ioSummaries.filter(a => a.catalogID == childCatalog.catalogID).map(a => a.total).reduce((a, b) => a + b, 0): ''}
                    <tr class="break-inside-auto break-after-auto">
                        <td class="text-print-sm border-bottom"
                            class:text-purple-400={isMedicationContinuous}
                            width="155">
                            {childCatalog.shortLabel}
                            {#if ioTotal}
                                -Total: {ioTotal}
                            {/if}
                        </td>
                        {#each dateTimeColumns as dateTimeColumn, i}
                            {@const cellZigzag = !!getRangeInContinuous(baseCatalog, childCatalog, dateTimeColumn)}
                            <td class="!min-w-[70px] !max-w-[70px] border-left border-bottom text-print-xxs"
                                class:cellZigzag
                                class:text-purple-400={isMedicationContinuous}>
                                {#if childCatalog.type == 'Group'}
                                    {@const columnBpValue = getColumnBpValue(flowsheetData, childCatalog, dateTimeColumn)}
                                    {#if columnBpValue && (columnBpValue.systolic.value && columnBpValue.diastolic.value && columnBpValue.mean.value)}
                                        {columnBpValue.systolic.value} / {columnBpValue.diastolic.value} ({columnBpValue.mean.value})
                                    {/if}
                                {:else}
                                    {@const columnValues = getColumnValues(flowsheetData, childCatalog, dateTimeColumn)}
                                    {#if columnValues && columnValues.length}
                                        {#if baseCatalog.catalogID == MEDICATION_BOLUS_CATALOG_ID}
                                            {#each columnValues as columnValue}
                                                {#if columnValue.value}
                                                    <div>
                                                        <img alt="arrow Black" class="m-auto w-2 h-auto" src="/img/arrowBlack.png" />
                                                    </div>
                                                {/if}
                                            {/each}
                                        {/if}
                                        {columnValues[columnValues.length - 1].value || ''}
                                    {/if}
                                {/if}
                            </td>
                        {/each}
                        {#each new Array(Math.max(0, MAX_COLS - dateTimeColumns.length)) as {}}
                            <td class="!min-w-[70px] !max-w-[70px] !text-[9px]">&nbsp;</td>
                        {/each}
                    </tr>
                {/each}
            {/each}
        </tbody>
    </table>
{/await}
