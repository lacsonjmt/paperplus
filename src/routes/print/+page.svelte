<script lang="ts">
    import { onMount } from 'svelte';
    import {
        addMinutes,
        roundDownDateTime,
        toNormalDateTimeString,
        toStandardDateTimeString
    } from '$lib/utils/DateTime';
    import { page } from '$app/stores';

    import moment from 'moment';

    import PrintHeader from './PrintHeader.svelte';
    import PrintFooter from './PrintFooter.svelte';
    import VitalsChart from '$lib/components/FlowSheet/VitalsChart.svelte';
    import PrintFlowsheetTable from './PrintFlowsheetTable.svelte';

    const MEDICATION_BOLUS_CATALOG_ID = '59F51342-2A8D-493F-A4DD-2FA9F8C65DC6';
    const MEDICATION_CONTINUOUS_CATALOG_ID = 'C2415DAD-03DB-4628-8F0B-8119AD0B6306';
    const OUTPUT_CATALOG_ID = '9204C4BA-CCAF-414F-8A30-C88EA2B24C30';

    const ptEncounterID = $page.url.searchParams.get('ptEncounterID') || '';
    const unitID = $page.url.searchParams.get('unitID') || '';

    const TIME_SEGMENT_MINS = 60 * 4; // 4 hours
    const INTERVAL_MINS = 15;
    const MAX_COLS = TIME_SEGMENT_MINS / INTERVAL_MINS;

    const EVENT_ICONS: any = {
        'Start Anaesthesia': ['startAne.png', 'startAne_dark.png'],
        Induction: ['induction.png', 'induction_dark.png'],
        'Start Surgery': ['startSurg.png', 'startSurg_dark.png'],
        'End Surgery': ['endSurg.png', 'endSurg_dark.png'],
        'End Anaesthesia': ['endAne.png', 'endAne_dark.png'],
        'Out of OR': ['outOr.png', 'outOr_dark.png'],
        'in OR': ['inOr.png', 'inOr_dark.png'],
        'Induction/Reversal': ['inductionOrReversal.png', 'inductionOrReversal_dark.png']
    };

    const paramDateTimeStart: string = $page.url.searchParams.get('dateTimeStart') || '';
    const paramDateTimeEnd: string = $page.url.searchParams.get('dateTimeEnd') || '';

    let institutionName: string = '';
    let patientInformation: any = {};
    let patientStaffs: any[] = [];
    let events: any[] = [];
    let ioSummaries: any[] = [];

    let renderedCharts: any[] = [];
    let renderedTables: any[] = [];

    let anaesthesiaReportData: any[] = [];

    const getDateTimeColumns = function (start: Date, end: Date, intervalMinutes = INTERVAL_MINS) {
        const arr = [];
        const dateEnd = new Date(end);
        for (
            let dt = new Date(start);
            dt <= dateEnd;
            dt = new Date(dt.getTime() + intervalMinutes * 60000)
        ) {
            arr.push(new Date(dt));
        }
        return arr.slice(0, arr.length - 1);
    };

    let dateRangeSegments: any[] = [];
    const generateDateRangeSegments = async () => {
        const earliestDateTime = new Date(paramDateTimeStart);
        let latestDateTime = new Date(paramDateTimeEnd);

        let promisePeriod: any = null;
        fetch(
            '/api/charted-value' +
                '?parentID=702F5B3D-7B37-44C6-B225-84638C0CA47B' +
                `&ptEncounterID=${ptEncounterID}`
        )
            .then(async (response) => {
                const result = await response.json();
                const value = Object.values(result[0])[0];
                if (value) {
                    promisePeriod = fetch(
                        `/api/flowsheet/period?ptEncounterID=${ptEncounterID}&unitID=${unitID}`
                    );
                }
            })
            .then(async () => {
                let flowsheetPeriodEarliestDateTime = new Date();
                let flowsheetPeriodLatestDateTime = new Date();
                if (promisePeriod) {
                    const period = await (await promisePeriod).json();
                    flowsheetPeriodEarliestDateTime = new Date(toNormalDateTimeString(period[0].earliest));
                    flowsheetPeriodLatestDateTime = new Date(toNormalDateTimeString(period[0].latest));

                    latestDateTime = new Date(toNormalDateTimeString(period[0].latest));
                }

                fetch(
                    '/api/events-notes' +
                        `?ptEncounterID=${ptEncounterID}` +
                        `&unitID=${unitID}` +
                        '&dateTimeStart=' +
                        toStandardDateTimeString(
                            roundDownDateTime(flowsheetPeriodEarliestDateTime, INTERVAL_MINS)
                        ) +
                        '&dateTimeEnd=' +
                        toStandardDateTimeString(flowsheetPeriodLatestDateTime)
                ).then(async (response) => {
                    const result = await response.json();
                    events = result.filter((a: any) => a.noteType == 'Events');
                });
            })
            .finally(async () => {
                let earliest = roundDownDateTime(earliestDateTime, INTERVAL_MINS);

                let segmentStart = new Date(earliest);
                let segmentEnd = addMinutes(earliest, TIME_SEGMENT_MINS);
                segmentEnd = segmentEnd < latestDateTime ? segmentEnd : latestDateTime;

                let i = 0;
                const dateTimeStarts = dateRangeSegments.map((a) =>
                    toStandardDateTimeString(a.dateTimeStart)
                );
                do {
                    if (!dateTimeStarts.includes(toStandardDateTimeString(segmentStart))) {
                        dateRangeSegments.push({
                            dateTimeStart: segmentStart,
                            dateTimeEnd: segmentEnd,
                            key: {}
                        });
                    }
                    segmentStart = segmentEnd;
                    segmentEnd = addMinutes(segmentEnd, TIME_SEGMENT_MINS);
                    segmentEnd = segmentEnd < latestDateTime ? segmentEnd : latestDateTime;
                } while (segmentStart < latestDateTime);

                dateRangeSegments = dateRangeSegments;
            });
    };

    onMount(async () => {
        fetch('/api/institution').then(async (a) => {
            const institution = await a.json();
            institutionName = institution[0] ? institution[0].institution : '';
        });

        fetch(`/api/patient-staffs/?ptEncounterID=${ptEncounterID}&unitID=${unitID}`).then(
            async (a) => {
                patientStaffs = await a.json();
            }
        );

        fetch('/api/io-summary' + `?ptEncounterID=${ptEncounterID}` + `&unitID=${unitID}`).then(
            async (response) => {
                ioSummaries = await response.json();
            }
        );

        fetch(
            '/api/charted-catalog' +
                '?parentID=A6634863-D81D-4950-97E1-F17604135252' +
                `&unitID=${unitID}` +
                `&ptEncounterID=${ptEncounterID}`
        ).then(async (response) => {
            const result = await response.json();
            patientInformation.HN = result.find((a: any) => a.catalog.startsWith('HN'))?.value;
            patientInformation.AN = result.find((a: any) => a.catalog.startsWith('AN'))?.value;
            patientInformation.givenName = result.find((a: any) =>
                a.catalog.startsWith('Given Name')
            )?.value;
            patientInformation.familyName = result.find((a: any) =>
                a.catalog.startsWith('Family Name')
            )?.value;
            patientInformation.dob = result.find((a: any) =>
                a.catalog.startsWith('Date of Birth')
            )?.value;
            // patientInformation.dob = patientInformation.dob.split(' ')[0];
            patientInformation.dob = new Date(patientInformation.dob).toLocaleDateString();
            patientInformation.dob = patientInformation.dob.split('/').join('-');
            patientInformation.age = result.find((a: any) => a.catalog.startsWith('Age'))?.value;
            patientInformation.bloodType = result.find((a: any) =>
                a.catalog.startsWith('Blood Type')
            )?.value;
            patientInformation.weight = result.find((a: any) => a.catalog.startsWith('Weight'))?.value;
            patientInformation.height = result.find((a: any) => a.catalog.startsWith('Height'))?.value;
            patientInformation.gender = result.find((a: any) => a.catalog.startsWith('Gender'))?.value;
            patientInformation.allergy = result.find((a: any) => a.catalog.startsWith('Allergy'))?.value;
            patientInformation.caseType = result.find((a: any) =>
                a.catalog.startsWith('Case Type')
            )?.value;
            patientInformation.anaesthesist = result.find((a: any) =>
                a.catalog.startsWith('Anaesthetist')
            )?.value;
            patientInformation.surgeon = result.find((a: any) => a.catalog.startsWith('Surgeon'))?.value;
            patientInformation.bed = result.find((a: any) => a.catalog.startsWith('Bed'))?.value;
            patientInformation.hospitalAdmitDate = result.find((a: any) =>
                a.catalog.startsWith('Hospital Admission Date')
            )?.value;
            patientInformation.asaStatus = result.find((a: any) =>
                a.catalog.startsWith('ASA status')
            )?.value;

            patientInformation.technique = result.find((a: any) =>
                a.catalog.startsWith('Technique')
            )?.value;
            patientInformation.InOutORDuration = result.find((a: any) =>
                a.catalog.startsWith('In/Out OR Duration')
            )?.value;
            patientInformation.surgeryDuration = result.find((a: any) =>
                a.catalog.startsWith('Surgery Duration')
            )?.value;
            patientInformation.anaesthesiaDuration = result.find((a: any) =>
                a.catalog.startsWith('Anaesthesia Duration')
            )?.value;
            patientInformation.inductionReversalDuration = result.find((a: any) =>
                a.catalog.startsWith('Induction/Reversal Duration')
            )?.value;
        });
        fetch(
            '/api/charted-catalog' +
                '?parentID=20C11519-FCC8-487C-A1EF-B6904BD505E7' +
                `&unitID=${unitID}` +
                `&ptEncounterID=${ptEncounterID}`
        ).then(async (response) => {
            const result = (await response.json()).filter((a: any) => a.catalog != 'Notes');
            if (result.length) {
                patientInformation.diagnosis = result[0].catalog;
            }
        });
        fetch(
            '/api/charted-catalog' +
                '?parentID=98594C4F-FC80-4580-98A4-493E3470D05B' +
                `&unitID=${unitID}` +
                `&ptEncounterID=${ptEncounterID}`
        ).then(async (response) => {
            const result = (await response.json()).filter((a: any) => a.catalog != 'Notes');
            if (result.length) {
                patientInformation.procedure = result[0].catalog;
            }
        });

        fetch('/api/anaesthesia-report' + `?unitID=${unitID}` + `&ptEncounterID=${ptEncounterID}`).then(
            async (response) => {
                anaesthesiaReportData = await response.json();
            }
        );

        await generateDateRangeSegments();
    });

    const getAnaesthesiaReportCatalog = (terse: string, parentID: string | null = null) => {
        return anaesthesiaReportData.find((a) => a.terse == terse && a.parentID == parentID);
    };

    const getAnaesthesiaReportCatalogValue = (terse: string, parentID: string | null = null) => {
        return getAnaesthesiaReportCatalog(terse, parentID)?.value || '';
    };

    let isPrintWindowShown = false;
    $: if (
        dateRangeSegments.length > 0 &&
        dateRangeSegments.length == renderedCharts.length &&
        dateRangeSegments.length == renderedTables.length
    ) {
        setTimeout(() => {
            if (!isPrintWindowShown) {
                window.print();
                isPrintWindowShown = true;
                history.back();
            }
        }, 2000);
    }
</script>

<svelte:head>
    <title>Paper+ Print</title>
    <meta name="description" content="Paper+" />
</svelte:head>

<main class="min-h-screen print">
    <div class="h-screen p-4">
        <table>
            <thead> 
                <tr class="bg-white">
                    <PrintHeader {patientInformation} {institutionName} />
                </tr>
            </thead>
            <!-- <tfoot>
                <tr>
                    <td>
                        <div class="mt-2">
                            <PrintFooter page={1} totalPages={dateRangeSegments.length + 1} />
                        </div>
                    </td>
                </tr>
            </tfoot> -->
            <tbody>
                <tr>
                    <!--tr 1-->
                    <div class="page" id="page1">
                        <table>
                            <thead> 
                                <tr class="bg-white">
                                    <!-- <PrintHeader {patientInformation} {institutionName} /> -->
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <td>
                                        <div class="mt-2">
                                            <PrintFooter page={1} totalPages={dateRangeSegments.length + 1} />
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                            <tbody>
                            
                                {#if anaesthesiaReportData.length}
                                    {@const preAnaesthesiaCatalog = getAnaesthesiaReportCatalog('Pre-Anaesthesia')}
                                    {@const anaesthesiaCatalog = getAnaesthesiaReportCatalog('Anaesthesia')}
                                    {@const recoveryCatalog = getAnaesthesiaReportCatalog('Recovery')}
                                    {@const postAnaesthesiaCatalog = getAnaesthesiaReportCatalog('Post-Anaesthesia')}
                                <tr>
                                    <td>
                                    <!--pre-ane-->
                                    {#if preAnaesthesiaCatalog}
                                        {@const monitorCatalog = getAnaesthesiaReportCatalog(
                                            'Monitor',
                                            preAnaesthesiaCatalog.catalogID
                                        )}
                                        {@const monitorSubCatalogs = monitorCatalog
                                            ? anaesthesiaReportData.filter((a) => a.parentID == monitorCatalog.catalogID)
                                            : []}
                                        {@const preAnaesthesiaSubCatalogs = anaesthesiaReportData.filter(
                                            (a) =>
                                                a.parentID == preAnaesthesiaCatalog.catalogID &&
                                                a.notes == 'Sub-Group' &&
                                                a.catalogID != monitorCatalog.catalogID
                                        )}

                                        <div class="row mt-2 p-[5px]">
                                            <div class="column mr-1">
                                                <table
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    class="col1row1 border-collapse table-fixed w-100 border-all"
                                                    width="100%"
                                                >
                                                    <thead>
                                                        <tr class="text-print-xxs text-center bg-white">
                                                            <th colspan="12" width="100%">Pre-Anaesthesia</th>
                                                        </tr>
                                                        <tr class="text-print-xxs text-center border-all bg-white">
                                                            <th class="border-all" width="10%">Date Time</th>
                                                            <th class="border-all" width="5%">Consent</th>
                                                            <th class="border-all" width="5%">Drug Allergy</th>
                                                            <th class="border-all" width="15%">Pre-Anaesthetic Evaluation</th>
                                                            <th class="border-all" width="5%">GCS(E)</th>
                                                            <th class="border-all" width="5%">GCS(V)</th>
                                                            <th class="border-all" width="5%">GCS(M)</th>
                                                            <th class="border-all" width="10%">BP</th>
                                                            <th class="border-all" width="5%">HR</th>
                                                            <th class="border-all" width="10%">Respiration Rate</th>
                                                            <th class="border-all" width="10%">Temperature</th>
                                                            <th class="border-all" width="15">Last Meal/Drink</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr class="text-print-xxs">
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue(
                                                                    'Date Time',
                                                                    preAnaesthesiaCatalog.catalogID
                                                                )}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue('Consent', preAnaesthesiaCatalog.catalogID)}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue(
                                                                    'Drug Allergy',
                                                                    preAnaesthesiaCatalog.catalogID
                                                                )}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue(
                                                                    'Pre-Anaesthetic Evaluation',
                                                                    preAnaesthesiaCatalog.catalogID
                                                                )}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue('GCS(E)', preAnaesthesiaCatalog.catalogID)}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue('GCS(V)', preAnaesthesiaCatalog.catalogID)}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue('GCS(M)', preAnaesthesiaCatalog.catalogID)}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue('BP', preAnaesthesiaCatalog.catalogID)}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue('HR', preAnaesthesiaCatalog.catalogID)}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue(
                                                                    'Respiration Rate',
                                                                    preAnaesthesiaCatalog.catalogID
                                                                )}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue(
                                                                    'Temperature',
                                                                    preAnaesthesiaCatalog.catalogID
                                                                )}
                                                            </td>
                                                            <td class="border-right">
                                                                {getAnaesthesiaReportCatalogValue(
                                                                    'Last meal/drink',
                                                                    preAnaesthesiaCatalog.catalogID
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="row mt-2 p-[5px]">
                                            <div class="column mr-1 flex">
                                                <table
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    class="col1row1 border-collapse table-fixed w-100"
                                                    width="100%"
                                                >
                                                    <tbody class=" m-[-1px]">
                                                        <tr class="text-print-xs">
                                                            <td valign="top" width="15%">
                                                                <table cellspacing="0"
                                                                    cellpadding="0"
                                                                    class="col1row1 border-collapse table-fixed w-100"
                                                                    width="100%" >
                                                                    <thead>
                                                                        <tr class="text-print-xxs text-center bg-white">
                                                                            <th class="border-all" width="100%">Monitor</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {#each monitorSubCatalogs as monitorSubCatalog}
                                                                            <tr class="text-print-xxs text-center border-all bg-white">
                                                                                <td class="border-all text-left">
                                                                                    {monitorSubCatalog.terse}
                                                                                </td>
                                                                            </tr>
                                                                        {/each}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                            <td valign="top" width="85%">
                                                                <div class="grid grid-cols-12 pl-1">
                                                                    {#each preAnaesthesiaSubCatalogs as preAnaesthesiaSubCatalog}
                                                                        {@const preAnaesthesiaSubCatalogValueSets = anaesthesiaReportData
                                                                            .filter((a) => a.parentID == preAnaesthesiaSubCatalog.catalogID)
                                                                            .sort((a, b) => a.order - b.order)}
                                                                        <div class="col-span-3">
                                                                            <td valign="top" width="85%">
                                                                                <table cellspacing="0"
                                                                                    cellpadding="0"
                                                                                    class="col1row1 border-collapse table-fixed w-100"
                                                                                    width="100%" >
                                                                                    <thead>
                                                                                        <tr class="text-print-xxs text-center border-all bg-white">
                                                                                            <th colspan="2">{preAnaesthesiaSubCatalog.terse}</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {#each preAnaesthesiaSubCatalogValueSets as valueSet}
                                                                                            <tr class="border-all">
                                                                                                <td class="border-right text-left" width="70%">
                                                                                                    {valueSet.terse}
                                                                                                </td>
                                                                                                <td class="text-left" width="30%">
                                                                                                    {valueSet.value || ''}
                                                                                                </td>
                                                                                            </tr>
                                                                                        {/each}
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </div>
                                                                    {/each}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="mt-1">
                                            <label for="preanaesthesiaNotes" class="form-label text-print-xs font-bold"> Notes </label>
                                            <textarea value={preAnaesthesiaCatalog.notes}
                                                id="preanaesthesiaNotes"
                                                rows="3"
                                                class="w-full border border-gray-500 text-black text-xs"
                                            />
                                        </div>
                                    {/if}
                                    <!--end of pre-ane-->
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <!--ane-->
                                    {#if anaesthesiaCatalog}
                                        {@const airwayManagementCatalog = getAnaesthesiaReportCatalog(
                                            'Airway Management',
                                            anaesthesiaCatalog.catalogID
                                        )}
                                        {@const whoChecklistCatalog = getAnaesthesiaReportCatalog(
                                            'WHO checklist',
                                            anaesthesiaCatalog.catalogID
                                        )}
                                        {@const whoChecklistSubCatalogs = whoChecklistCatalog
                                            ? anaesthesiaReportData.filter((a) => a.parentID == whoChecklistCatalog.catalogID)
                                            : []}
                                        {@const specialTechniqueCatalog = getAnaesthesiaReportCatalog(
                                            'Special Technique',
                                            anaesthesiaCatalog.catalogID
                                        )}
                                        {@const specialTechniqueSubCatalogs = specialTechniqueCatalog
                                            ? anaesthesiaReportData.filter((a) => a.parentID == specialTechniqueCatalog.catalogID)
                                            : []}
                                        {@const standardSubGroups = [
                                                airwayManagementCatalog.catalogID,
                                                whoChecklistCatalog.catalogID,
                                                specialTechniqueCatalog.catalogID
                                            ].filter(Boolean
                                        )}
                                        {@const anaesthesiaSubCatalogs = anaesthesiaReportData.filter(
                                            (a) =>
                                                a.parentID == anaesthesiaCatalog.catalogID &&
                                                a.notes == 'Sub-Group' &&
                                                !standardSubGroups.includes(a.catalogID)
                                        )}
                                        <div class="row mt-2 p-[5px]">
                                            <div class="column mr-1">
                                                <table    
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    class="col1row1 border-collapse table-fixed w-100"
                                                    width="100%">
                                                    <thead>
                                                        <tr class="text-print-xxs text-center bg-white">
                                                            <th colspan="6" width="100%">Anaesthesia</th>
                                                        </tr>
                                                    </thead>
                                                    <tr class="text-print-xxs text-center border-all bg-white font-bold">
                                                        <td class="border-all" width="15%">Anaesthesia Type</td>
                                                        <td class="border-all" width="15%">Technique</td>
                                                        <td class="border-all" width="15%">Positioning</td>
                                                        <td class="border-all" width="15%">Thermoregulation</td>
                                                        <td class="border-all" width="15%">Induction</td>
                                                        <td class="border-all" width="20%">Intubating Technique</td>
                                                    </tr>
                                                    <tr class="text-print-xxs border-bottom border-left">
                                                        <td class="border-right">
                                                            {getAnaesthesiaReportCatalogValue(
                                                                'Anaesthesia Type',
                                                                anaesthesiaCatalog.catalogID
                                                            )}
                                                            &nbsp;
                                                        </td>
                                                        <td class="border-right">
                                                            {getAnaesthesiaReportCatalogValue('Technique', anaesthesiaCatalog.catalogID)}
                                                        </td>
                                                        <td class="border-right">
                                                            {getAnaesthesiaReportCatalogValue('Positioning', anaesthesiaCatalog.catalogID)}
                                                        </td>
                                                        <td class="border-right">
                                                            {getAnaesthesiaReportCatalogValue(
                                                                'Thermoregulation',
                                                                anaesthesiaCatalog.catalogID
                                                            )}
                                                        </td>
                                                        <td class="border-right">
                                                            {getAnaesthesiaReportCatalogValue('Induction', anaesthesiaCatalog.catalogID)}
                                                        </td>
                                                        <td class="border-right">
                                                            {getAnaesthesiaReportCatalogValue(
                                                                'Intubating Technique',
                                                                anaesthesiaCatalog.catalogID
                                                            )}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="row mt-2 p-[5px]">
                                            <div class="column mr-1 flex">
                                                <table cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td width="60%" valign="top">
                                                            <div class="flex space-x-[-1px]">
                                                                <div>
                                                                    <table>
                                                                        <thead
                                                                            class="text-print-xxs text-center bg-white border-all"
                                                                            width="100%"
                                                                        >
                                                                            <th colspan="2" class="py-0 px-1">Airway Management</th>
                                                                        </thead>

                                                                        {#if airwayManagementCatalog}
                                                                            {@const airwayManagementValueSets = anaesthesiaReportData
                                                                                .filter(a => a.parentID == airwayManagementCatalog.catalogID)
                                                                                .sort((a, b) => a.order - b.order)}
                                                                            <tbody>
                                                                                {#each airwayManagementValueSets as airwayManagementDataSet}
                                                                                    <tr class="text-print-xxs text-left bg-white border-all">
                                                                                        <td class="border-right">{airwayManagementDataSet.terse}</td>
                                                                                        <td>{airwayManagementDataSet.value || ''}</td>
                                                                                    </tr>
                                                                                {/each}
                                                                            </tbody>
                                                                        {/if}
                                                                    </table>
                                                                </div>
                                                                <div>
                                                                    <table>
                                                                        <thead class="text-print-xxs text-center bg-white border-all"
                                                                            width="100%">
                                                                            <th class="py-0 px-1">WHO Checklist</th>
                                                                        </thead>
                                                                        <tbody>
                                                                            {#each whoChecklistSubCatalogs as whoChecklistSubCatalog}
                                                                                <tr class="text-print-xxs text-center bg-white border-all">
                                                                                    <td>{whoChecklistSubCatalog.terse}</td>
                                                                                </tr>
                                                                            {/each}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div>
                                                                    <table>
                                                                        <thead class="text-print-xxs text-center bg-white border-all">
                                                                            <th class="py-0 px-1">Special Technique</th>
                                                                        </thead>
                                                                        <tbody>
                                                                            {#each specialTechniqueSubCatalogs as specialTechniqueSubCatalog}
                                                                                <tr class="text-print-xxs text-center bg-white border-all">
                                                                                    <td>{specialTechniqueSubCatalog.terse}</td>
                                                                                </tr>
                                                                            {/each}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td width="40%" class="" valign="top">
                                                            <table
                                                                cellspacing="0"
                                                                cellpadding="0"
                                                                class="col1row1 border-collapse table-fixed w-100"
                                                                width="100%"
                                                            >
                                                                <tbody class="noPadding">
                                                                    <tr>
                                                                        <div class="grid grid-cols-1">
                                                                            <div class="col-span-1 text-print-xxs font-bold text-center bg-white border-all">Intra-op Problem</div>
                                                                        </div>
                                                                        </tr>
                                                                    <div class="grid grid-cols-2 mt-[-1.5px] ">
                                                                        
                                                                        {#each anaesthesiaSubCatalogs as anaesthesiaSubCatalog}
                                                                            {@const anaesthesiaValueSets = anaesthesiaReportData
                                                                                .filter(a => a.parentID == anaesthesiaSubCatalog.catalogID)
                                                                                .sort((a, b) => a.order - b.order)}
                                                                            <div class="col-span-1 border-all">
                                                                                <tr class="text-print-xxs text-center bg-white">
                                                                                    <td class="text-left">
                                                                                        <table>
                                                                                            <thead>
                                                                                                <tr class="text-print-xxs bg-white border-bottom">
                                                                                                    <th>{anaesthesiaSubCatalog.terse}</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {#each anaesthesiaValueSets as anaesthesiaDataSet}
                                                                                                    <tr
                                                                                                        class="text-print-xxs bg-white border-bottom lastChild">
                                                                                                        <td>
                                                                                                            {anaesthesiaDataSet.terse}
                                                                                                            &nbsp;
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                {/each}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </div>
                                                                        {/each}
                                                                    </div>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="mt-1">
                                            <label for="anaesthesiaNotes" class="form-label text-print-xs font-bold"> Notes </label>
                                            <textarea value={anaesthesiaCatalog.notes}
                                                id="anaesthesiaNotes"
                                                rows="3"
                                                class="w-full border border-gray-500 text-black text-xs"
                                            />
                                        </div>
                                    {/if}
                                    <!--end of ane-->
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <!--recovery-->
                                    <table class="mt-2">
                                        <tbody class="noPadding">
                                            <tr>
                                                <td valign="top">
                                                    {#if recoveryCatalog}
                                                        <table
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                            class="col1row1 border-collapse table-fixed w-100"
                                                            width="100%"
                                                        >
                                                            <thead>
                                                                <tr class="text-print-xxs text-center bg-white border-all">
                                                                    <th colspan="2">Recovery</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%">Status</td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue('Status', recoveryCatalog.catalogID)}
                                                                    </td>
                                                                </tr>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%">Location</td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue('Location', recoveryCatalog.catalogID)}
                                                                    </td>
                                                                </tr>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%"> Spontaneous Ventilation </td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue(
                                                                            'Spontaneous Ventilation',
                                                                            recoveryCatalog.catalogID
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%">Ventilation Support</td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue(
                                                                            'Ventilation Support',
                                                                            recoveryCatalog.catalogID
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan=2>
                                                                        <label for="recoveryNotes" class="form-label text-print-xs font-bold">
                                                                            Notes
                                                                        </label>
                                                                        <textarea
                                                                            value={recoveryCatalog.notes}
                                                                            id="recoveryNotes"
                                                                            rows="3"
                                                                            class="w-full border border-gray-500 text-black text-xs"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    {/if}
                                                </td>
                                                <td valign="top">
                                                    {#if postAnaesthesiaCatalog}
                                                        <table
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                            class="col1row1 border-collapse table-fixed w-100"
                                                            width="100%"
                                                        >
                                                            <thead>
                                                                <tr
                                                                    class="text-print-xxs text-center bg-white border-right border-top border-left"
                                                                >
                                                                    <th colspan="2">Post-Anaesthesia</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%">
                                                                        24-48hrs Post Anaesthetic Evaluation
                                                                    </td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue(
                                                                            '24-48hrs Post Anaesthetic Evaluation',
                                                                            postAnaesthesiaCatalog.catalogID
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%">Complication</td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue(
                                                                            'Complication',
                                                                            postAnaesthesiaCatalog.catalogID
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr class="text-print-xxs text-center bg-white">
                                                                    <td class="border-all text-left" width="40%">Nurse Anaesthesist </td>
                                                                    <td class="border-all text-left" width="60%">
                                                                        {getAnaesthesiaReportCatalogValue(
                                                                            'Nurse Anaesthesist',
                                                                            postAnaesthesiaCatalog.catalogID
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan=2>
                                                                        <div class="mt-[11.5px]">
                                                                            <label for="postAnaesthesiaNotes" class="form-label text-print-xs font-bold">
                                                                                Notes
                                                                            </label>
                                                                            <textarea
                                                                                value={postAnaesthesiaCatalog.notes}
                                                                                id="postAnaesthesiaNotes"
                                                                                rows="3"
                                                                                class="w-full border border-gray-500 text-black text-xs"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    {/if}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <!--end of recovery-->
                                    </td>
                                </tr>  
                                {/if}
                            </tbody>
                            
                        </table>
                    </div>
                    <!--end of tr 1-->
                </tr>
                <tr>
                    <!--tr 2-->
                    <div class="page" id="page1a">
                        <!-- <PrintHeader {patientInformation} {institutionName} /> -->
                        <div class="row mt-2 p-[5px]">
                            <div class="column mr-1">
                                <table
                                    cellspacing="0"
                                    cellpadding="0"
                                    class="col1row1 border-collapse table-fixed w-100 border-all"
                                    width="50%"
                                >
                                    <thead>
                                        <tr class="dynamic-data font-bold text-center border-all bg-white">
                                            <th class="border-all" width="45%">Name</th>
                                            <th class="border-all" width="21%">Role</th>
                                            <th class="border-all" width="17%">Time In</th>
                                            <th class="border-all" width="17%">Time Out</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each patientStaffs as staff}
                                            <tr class="text-print-xs">
                                                <td class="border-right">{staff.name}</td>
                                                <td class="border-right">{staff.role}</td>
                                                <td class="border-right">{toStandardDateTimeString(staff.inTime)}</td>
                                                <td class="border-right"
                                                    >{staff.outTime ? toStandardDateTimeString(staff.outTime) : ''}</td
                                                >
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>

                                <table cellspacing="0" cellpadding="0" class="col1row1 border-collapse table-fixed w-100">
                                    <thead>
                                        <tr
                                            class="dynamic-data font-bold text-center border-right border-left border-bottom bg-white"
                                        >
                                            <th colspan="5">I/O Summary (mL)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="noPadding">
                                        <tr>
                                            <td class="!p-0" colspan="2" valign="top">
                                                <table cellspacing="0" cellpadding="0">
                                                    <thead class="dynamic data">
                                                        <tr
                                                            class="dynamic-data font-bold text-center border-bottom border-left bg-white"
                                                        >
                                                            <td colspan="2">Medication (Bolus)</td>
                                                        </tr>
                                                    </thead>
                                                </table>
                                                <table cellspacing="0" cellpadding="0">
                                                    <thead class="dynamic data">

                                                        <tr
                                                            class="dynamic-data font-bold text-center border-bottom border-left border-right bg-white"
                                                        >
                                                            <th width="70%">&nbsp;</th>
                                                            <th width="30%">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {#each ioSummaries.filter((a) => a.parentID == MEDICATION_BOLUS_CATALOG_ID) as item}
                                                            <tr class="text-print-xs">
                                                                <td width="70%" class="border-all text-left">{item.terse}</td>
                                                                <td width="30%" class="border-all text-left">{item.total}</td>
                                                            </tr>
                                                        {/each}
                                                    </tbody>
                                                </table>
                                                <table cellspacing="0" cellpadding="0">
                                                    <thead>
                                                        <tr
                                                            class="dynamic-data font-bold text-center border-bottom border-left border-right bg-white"
                                                        >
                                                            <th colspan="2">Output</th>
                                                        </tr>
                                                    </thead>
                                                </table>
                                                <table cellspacing="0" cellpadding="0">
                                                    <thead>
                                                        <tr
                                                            class="dynamic-data font-bold text-center border-bottom border-left border-right bg-white"
                                                        >
                                                            <th width="70%">&nbsp;</th>
                                                            <th width="30%">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {#each ioSummaries.filter((a) => a.parentID == OUTPUT_CATALOG_ID) as item}
                                                            <tr class="text-print-xs">
                                                                <td width="70%" class="border-all text-left">{item.terse}</td>
                                                                <td width="30%" class="border-all text-left">{item.total}</td>
                                                            </tr>
                                                        {/each}
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td valign="top" colspan="3">
                                                <table cellspacing="0" cellpadding="0">
                                                    <thead>
                                                        <tr
                                                            class="dynamic-data font-bold text-center border-bottom border-left border-right bg-white"
                                                        >
                                                            <th colspan="3">Medication (Continuous)</th>
                                                        </tr>
                                                        <tr class="dynamic-data font-bold text-center border-all bg-white">
                                                            <th>&nbsp;</th>
                                                            <th>Start</th>
                                                            <th>Duration</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {#each ioSummaries.filter((a) => a.parentID == MEDICATION_CONTINUOUS_CATALOG_ID) as item}
                                                            <tr class="text-print-xs">
                                                                <td class="border-all text-left">{item.terse}</td>
                                                                <td class="border-all text-left">
                                                                    {toStandardDateTimeString(item.startTime)}
                                                                </td>
                                                                <td class="border-all text-left">{item.totalDuration}</td>
                                                            </tr>
                                                        {/each}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="column">
                                <table
                                    cellspacing="0"
                                    cellpadding="0"
                                    class="col1row2 border-collapse table-fixed w-100 border-all"
                                    width="50%"
                                >
                                    <tr class="dynamic-data font-bold text-center border-all">
                                        <th class="border-all" colspan="10">Events</th>
                                    </tr>
                                    {#each events as event}
                                        {@const iconFileName = EVENT_ICONS[event.value] ? EVENT_ICONS[event.value][0] : ''}
                                        <tr class="text-print-xs">
                                            <td class="border-right" colspan="3">
                                                {toStandardDateTimeString(event.chartTime)}
                                            </td>
                                            <td class="border-right" colspan="1">
                                                {#if iconFileName}
                                                    <img
                                                        src="/img/printIcons/{iconFileName}"
                                                        alt={event.value}
                                                        class="m-auto w-4 h-4"
                                                    />
                                                {/if}
                                            </td>
                                            <td class="border-right" colspan="6">{event.value}</td>
                                        </tr>
                                    {/each}
                                </table>
                            </div>
                        </div>
                        <div class="mt-2">
                            <PrintFooter page={1} totalPages={dateRangeSegments.length + 1} />
                        </div>
                    </div>
                    <!--end of tr 2-->
                </tr>
                <tr>
                     <!--tr 3-->
                    <table cellspacing="0" cellpadding="0" class="h-screen">
                        {#each dateRangeSegments as dateRangeSegment, index}
                            {@const dateTimeColumns = getDateTimeColumns(
                                dateRangeSegment.dateTimeStart,
                                dateRangeSegment.dateTimeEnd
                            )}
                            <div class:page={index < dateRangeSegments.length - 1}>
                                <tr>
                                    <!-- <PrintHeader {patientInformation} {institutionName} /> -->
                                </tr>
                                <tr>
                                    <table
                                        cellspacing="0"
                                        cellpadding="0"
                                        class="print border-collapse table-fixed w-full border-left border-right"
                                    >
                                        <tbody>
                                            <tr class="font-bold text-center">
                                                <td class="text-print-sm border-bottom border-right" width="156">
                                                    {moment(dateRangeSegment.dateTimeStart).format('DD-MMM-Y')} <br />
                                                    Trends
                                                </td>
                                                {#each dateTimeColumns as dateTimeColumn, i}
                                                    <td
                                                        class=" !min-w-[70px] !max-w-[70px] text-print-xxs border-bottom border-right"
                                                    >
                                                        {moment(toStandardDateTimeString(dateTimeColumn)).format('HH:mm')}
                                                    </td>
                                                {/each}
                                                {#each new Array(Math.max(0, MAX_COLS - dateTimeColumns.length)) as { }}
                                                    <td
                                                        class=" !min-w-[70px] !max-w-[70px] text-print-xxs border-bottom border-right"
                                                    >
                                                        &nbsp;
                                                    </td>
                                                {/each}
                                            </tr>
                                            <tr class="border-bottom h-6">
                                                <td class="text-print-xs border-right"> Events</td>
                                                {#each dateTimeColumns as { }}
                                                    <td class="text-print-sm" />
                                                {/each}
                                            </tr>
                                            <tr class="h-4 border-bottom">
                                                <td
                                                    class="text-print-xs border-right whitespace-nowrap !min-h-[20px] !max-h-[20px]"
                                                >
                                                    <div class="flex">
                                                        <div class="symbols w-48 p-1">
                                                            <span class="text-print-sm">Symbols</span>
                                                            <div class="grid grid-cols-6">
                                                                <div class="col-span-1 mt-[6px] flex w-2 h-auto mt-1">
                                                                    <img id="ABP" class="h-6" alt="" src="/img/chartIcons/ArterialBP.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div>
                                                                        <small class="text-print-xs">- Arterial BP Systolic </small>
                                                                    </div>
                                                                    <div>
                                                                        <small class=" text-print-xs">- Arterial BP Mean </small>
                                                                    </div>
                                                                    <div>
                                                                        <small class=" text-print-xs">- Arterial BP Diastolic </small>
                                                                    </div>
                                                                </div>

                                                                <div class="col-span-1 mt-[6px] flex w-2 h-auto mt-2">
                                                                    <img
                                                                        id="ABP"
                                                                        class="h-6"
                                                                        alt=""
                                                                        src="/img/chartIcons/NonInvasiveBP.png"
                                                                    />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div>
                                                                        <small class=" text-print-xs">- Non Invasive BP Systolic </small>
                                                                    </div>
                                                                    <div>
                                                                        <small class=" text-print-xs">- Non Invasive BP Mean </small>
                                                                    </div>
                                                                    <div>
                                                                        <small class=" text-print-xs">- Non Invasive BP Diastolic </small>
                                                                    </div>
                                                                </div>
                                                                <div class="col-span-1 mt-[6px] flex w-2 h-2 mt-2">
                                                                    <img id="ABP" alt="" src="/img/chartIcons/HeartRate.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div class="h-2">
                                                                        <small class=" text-print-xs">- Heart Rate </small>
                                                                    </div>
                                                                </div>
                                                                <div class="col-span-1 mt-[6px] flex w-2 h-2">
                                                                    <img id="ABP" alt="" src="/img/chartIcons/RespirationRate.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div>
                                                                        <small class=" text-print-xs">- Respiration Rate </small>
                                                                    </div>
                                                                </div>
                                                                <div class="col-span-1 mt-[6px] flex w-2 h-2">
                                                                    <img id="ABP" alt="" src="/img/chartIcons/SPO2.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div class="h-3">
                                                                        <small class=" text-print-xs">- SPO2 </small>
                                                                    </div>
                                                                </div>
                                                                <div class="col-span-1 mt-[6px] flex w-2 h-2">
                                                                    <img id="ABP" alt="" src="/img/chartIcons/CVP.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div>
                                                                        <small class=" text-print-xs">- CVP </small>
                                                                    </div>
                                                                </div>
                                                                <div class="col-span-1 mt-[6px] flex w-2 h-2">
                                                                    <img id="ABP" alt="" src="/img/chartIcons/Temperature.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div>
                                                                        <small class=" text-print-xs">- Temperature </small>
                                                                    </div>
                                                                </div>
                                                                <div class="col-span-1 mt-[6px] flex w-4 h-2">
                                                                    <img id="ABP" alt="" src="/img/zigzag.png" />
                                                                </div>
                                                                <div class="col-span-5 mt-[6px]">
                                                                    <div>
                                                                        <small class=" text-print-xs">- Running Dose </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <ul class=" text-right text-print-xs">
                                                                <li class="mt-[12px]">240</li>
                                                                <li class="mt-[15px]">200</li>
                                                                <li class="mt-[15px]">160</li>
                                                                <li class="mt-[15px]">120</li>
                                                                <li class="mt-[15px]">80</li>
                                                                <li class="mt-[15px]">40</li>
                                                                <li class="mt-[15px]">0</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td colspan={MAX_COLS} class="text-sm relative border-right px-0 print:px-0">
                                                    <VitalsChart
                                                        bind:renderedCharts
                                                        {ptEncounterID}
                                                        {unitID}
                                                        {index}
                                                        dateTimeStart={dateRangeSegment.dateTimeStart}
                                                        dateTimeEnd={dateRangeSegment.dateTimeEnd}
                                                        chartDateTimeEnd={addMinutes(
                                                            dateRangeSegment.dateTimeStart,
                                                            TIME_SEGMENT_MINS
                                                        )}
                                                        isPrint={true}
                                                    />
                                                </td>
                                            </tr>
                                            <tr class="p-0">
                                                <td colspan={MAX_COLS + 1} class="w-full px-0">
                                                    <PrintFlowsheetTable
                                                        bind:renderedTables
                                                        bind:ioSummaries
                                                        {index}
                                                        {ptEncounterID}
                                                        {unitID}
                                                        {MAX_COLS}
                                                        intervalMinutes={INTERVAL_MINS}
                                                        dateTimeStart={dateRangeSegment.dateTimeStart}
                                                        dateTimeEnd={dateRangeSegment.dateTimeEnd}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </tr>
                                <tfoot>
                                    <div class="mt-2 break-inside-avoid">
                                        <PrintFooter page={index + 2} totalPages={dateRangeSegments.length + 1} />
                                    </div>
                                </tfoot>
                            </div>
                        {/each}
                    </table>
                    <!--end of tr 3-->
                </tr>
            </tbody>
        </table>
        
        
       
    </div>
</main>

<style>
    table {
        table-layout: fixed;
        border-collapse: collapse !important;
        border-spacing: 0 !important;
    }

    .printSize {
        height: 1100px;
        width: 850px;
    }

    td {
        @apply break-normal px-1;
    }

    tbody.io td,
    .noPadding tr td {
        @apply p-0;
    }

	tr.lastChild:last-child {
  	border-bottom: none !important;}

    tr, tr:hover {
        background-color: white;
    }


</style>
