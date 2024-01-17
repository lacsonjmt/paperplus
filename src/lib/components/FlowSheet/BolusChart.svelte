<script lang="ts">
    import svgBuilder from 'svg-builder';
    import { roundDownDateTime, toNormalDateTimeString, toStandardDateTimeString } from '$lib/utils/DateTime';
	import { onMount } from 'svelte';

    export let ptEncounterID: string;
    export let unitID: string;
    export let dateTimeStart: Date;
    export let dateTimeEnd: Date;
    export let isPrint: boolean = false;
    export let intervalMinutes: number = 15;

    export let flowsheetPageIndex = 0;

    const MEDICATION_BOLUS_CATALOG_ID = '59F51342-2A8D-493F-A4DD-2FA9F8C65DC6';
    const OUTPUT_CATALOG_ID = '9204C4BA-CCAF-414F-8A30-C88EA2B24C30'; 

    const getDiffInMinutes = (date1: Date, date2: Date) => {
        return Math.abs(date2.valueOf() - date1.valueOf());
    }

    const getDifferenceInSeconds = (date1: Date, date2: Date) => {
        const diffInMs = getDiffInMinutes(date1, date2);
        return Math.round(diffInMs / 1000);
    }

    const TOTAL_SECONDS = getDifferenceInSeconds(dateTimeStart, dateTimeEnd);
    const TOTAL_MINUTES = TOTAL_SECONDS / 60;
    const COLS_PER_PAGE = TOTAL_MINUTES / intervalMinutes;
    const INTERVAL_WIDTH = 70;
    const TOTAL_WIDTH = INTERVAL_WIDTH * COLS_PER_PAGE + 4;

    const MAX_VALUE = 140;
    const OFFSET_X = isPrint ? 22: 0;
    const MOVE_LEFT = flowsheetPageIndex * COLS_PER_PAGE * INTERVAL_WIDTH;
    const COLOR = {
        WHITE: '#FFF',
        RED: '#FF0000',
        PURPLE: '#F63CED',
        BLUE: '#0000FF',
        GRAY: '#D3D3D3',
        BLACK: '#000',
        GREEN: '#00FF00',
        YELLOW: '#FFFF00'
    };

    const getX = (date: Date) => {
        const seconds = getDifferenceInSeconds(dateTimeStart, date);
        const totalSeconds = getDifferenceInSeconds(dateTimeStart, dateTimeEnd);
        return ((TOTAL_WIDTH - OFFSET_X) * seconds) / totalSeconds;
    };
    
    let markup: string = '';
    onMount(async () => {
        const formattedData: any = {};
        const promise = await fetch('/api/flowsheet'
            + `?ptEncounterID=${ptEncounterID}`
            + `&unitID=${unitID}`
            + '&dateTimeStart=' + toStandardDateTimeString(dateTimeStart)
            + '&dateTimeEnd=' + toStandardDateTimeString(dateTimeEnd));
        const results = await promise.json();

        const intakeCatalog = results.find((a: any) => a.catalogID == MEDICATION_BOLUS_CATALOG_ID);
        const intakes = results.filter((a: any) => a.parentID == intakeCatalog.catalogID)
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));

        const outputCatalog = results.find((a: any) => a.catalogID == OUTPUT_CATALOG_ID);
        const outputs = results.filter((a: any) => a.parentID == outputCatalog.catalogID)
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));

        results.filter((a: any) => a.chartTime != null).forEach((a: any) => {
            const normalChartTime = toNormalDateTimeString(a.chartTime);
            const strDateTime = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime)));
            if(!formattedData[a.shortLabel]) {
                formattedData[a.shortLabel] = {};
            }
            formattedData[a.shortLabel][strDateTime] = a;
        });


        const svg = svgBuilder.newInstance();
        svg.width(TOTAL_WIDTH);
        svg.height(200);
        /* grid */
        for (let y = 0; y <= MAX_VALUE; y += 40) {
            svg.line({
                x1: OFFSET_X,
                y1: MAX_VALUE - y,
                x2: TOTAL_WIDTH,
                y2: MAX_VALUE - y,
                stroke: COLOR.GRAY,
                'stroke-width': 1
            })
            if(isPrint) {
                svg.text(
                    {
                        x: OFFSET_X - 5,
                        y: MAX_VALUE - y + 5,
                        stroke: COLOR.GRAY,
                        fill: COLOR.GRAY,
                        'text-anchor': 'end'
                    },
                    y.toString()
                );
            }
        }

        intakes.forEach((a: any) => {
            a.x = getX(new Date(toStandardDateTimeString(a.chartTime))) 
                + OFFSET_X 
                - MOVE_LEFT;
            a.y = MAX_VALUE - a.value;
            svg.rect({
                x: a.x,
                y: a.y,
                width: 20,
                height: Math.abs(a.y),
                stroke: COLOR.BLUE,
                fill: COLOR.BLUE,
            });
        });

        outputs.forEach((a: any) => {
            a.x = getX(new Date(toStandardDateTimeString(a.chartTime))) 
                + OFFSET_X 
                - MOVE_LEFT;
            a.y = MAX_VALUE - a.value;
            svg.rect({
                x: a.x,
                y: a.y * 2,
                width: 20,
                height: Math.abs(a.y),
                stroke: COLOR.YELLOW,
                fill: COLOR.YELLOW,
            });
        });

        markup = svg.render();
        svg.reset();
    });
</script>

{@html markup}

