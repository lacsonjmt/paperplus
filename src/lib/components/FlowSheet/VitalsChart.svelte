<script lang="ts">
    import svgBuilder from 'svg-builder';
    import { roundDownDateTime, toNormalDateTimeString, toStandardDateTimeString } from '$lib/utils/DateTime';
	import { onMount } from 'svelte';

    export let renderedCharts: any = [];

    export let index: number = 0;
    export let ptEncounterID: string;
    export let unitID: string;

    export let dateTimeStart: Date;
    export let dateTimeEnd: Date;
    export let chartDateTimeEnd: Date | null = null;

    export let isPrint: boolean = false;
    export let intervalMinutes: number = 15;
    export let edgeData: any[] = [];

    export let flowsheetPageIndex = 0;

    const TOTAL_SECONDS = getDifferenceInSeconds(dateTimeStart, chartDateTimeEnd || dateTimeEnd);
    const TOTAL_MINUTES = TOTAL_SECONDS / 60;
    const COLS_PER_PAGE = (TOTAL_MINUTES / intervalMinutes);
    const INTERVAL_WIDTH = isPrint ? 550/COLS_PER_PAGE : 60;
    const TOTAL_WIDTH = isPrint? 530: (INTERVAL_WIDTH * COLS_PER_PAGE);

    const OFFSET_X = 0;

    const MAX_VALUE = 250;
    const TOTAL_HEIGHT = isPrint ? 150: 200;
    
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
    const BP_TYPE = {
        ARTERIAL: 'Arterial BP',
        NONINVASIVE: 'Non-Invasive BP'
    };
    const CHART_KEYS: any = {
        'Heart Rate': COLOR.GREEN,
        'SPO2': COLOR.GRAY,
        'Temperature(°C)': COLOR.RED,
        'CVP': COLOR.BLACK,
        'Respiratory Rate': COLOR.PURPLE
    }

    function getDifferenceInSeconds(date1: Date, date2: Date) {
        const diffInMs = Math.abs(date2.valueOf() - date1.valueOf());
        return Math.round(diffInMs / 1000);
    }

    const getXByDate = (date: Date) => {
        const seconds = getDifferenceInSeconds(dateTimeStart, date);
        return getXByValue(seconds);
    };

    const getXByValue = (value: number) => {
        return ((TOTAL_WIDTH - OFFSET_X) * value) / TOTAL_SECONDS;
    }

    const getY = (value: number) => {
        return TOTAL_HEIGHT * value / MAX_VALUE;
    }

    const drawConnectingLines = (svg: any, values: any[], color: string) => {
        for (let i = 0; i < values.length; i++) {
            const current = values[i];
            if (i > 0) {
                const previous = values[i - 1];
                if(previous.x < OFFSET_X) {
                    continue;
                }
                svg.line({
                    x1: previous.x,
                    y1: previous.y,
                    x2: current.x,
                    y2: current.y,
                    stroke: color,
                    'stroke-width': 1
                });
            }
        }
    };

    const drawBp = (svg: any, type: string, bp: any) => {
        if(!(bp.Systolic && bp.Diastolic && bp.Mean)) {
            return;
        }
        if(bp.Systolic.x < OFFSET_X) {
            return;
        }

        const color = type == BP_TYPE.ARTERIAL ? COLOR.RED : COLOR.BLUE;
        if (type == BP_TYPE.ARTERIAL) {
            svg.line({
                // v
                x1: bp.Systolic.x - 2,
                y1: bp.Systolic.y - 6,
                x2: bp.Systolic.x,
                y2: bp.Systolic.y,
                stroke: color,
                'stroke-width': 1
            }).line({
                x1: bp.Systolic.x + 2,
                y1: bp.Systolic.y - 6,
                x2: bp.Systolic.x,
                y2: bp.Systolic.y,
                stroke: color,
                'stroke-width': 1
            }).line({
                // ^
                x1: bp.Diastolic.x - 2,
                y1: bp.Diastolic.y + 6,
                x2: bp.Diastolic.x,
                y2: bp.Diastolic.y,
                stroke: color,
                'stroke-width': 1
            }).line({
                x1: bp.Diastolic.x + 2,
                y1: bp.Diastolic.y + 6,
                x2: bp.Diastolic.x,
                y2: bp.Diastolic.y,
                stroke: color,
                'stroke-width': 1
            });
        } else {
            svg.path({
                // top triangle
                d: `M${bp.Systolic.x - 2} ${bp.Systolic.y - 5} L${bp.Systolic.x} ${bp.Systolic.y} L${
                    bp.Systolic.x + 2
                } ${bp.Systolic.y - 5} Z`,
                stroke: color,
                'stroke-width': 1,
                fill: color
            }).path({
                // bottom triangle
                d: `M${bp.Diastolic.x - 2} ${bp.Diastolic.y + 5} L${bp.Diastolic.x} ${bp.Diastolic.y} L${
                    bp.Diastolic.x + 2
                } ${bp.Diastolic.y + 5} Z`,
                stroke: color,
                'stroke-width': 1,
                fill: color
            });
        }

        svg.line({
            // |
            x1: bp.Systolic.x,
            y1: bp.Systolic.y,
            x2: bp.Diastolic.x,
            y2: bp.Diastolic.y,
            stroke: color,
            'stroke-width': 1
        }).line({
            // =
            x1: bp.Mean.x - 4,
            y1: bp.Mean.y - 1,
            x2: bp.Mean.x + 4,
            y2: bp.Mean.y - 1,
            stroke: color,
            'stroke-width': 1
        }).line({
            x1: bp.Mean.x - 4,
            y1: bp.Mean.y + 1,
            x2: bp.Mean.x + 4,
            y2: bp.Mean.y + 1,
            stroke: color,
            'stroke-width': 1
        });
    };

    const getFormattedBpItems = (flowsheetData: any[], vitalsData: any[], parentBpLabel: string) => {
        const bpItems: any[] = [];
        const parentBp = flowsheetData.find((a) => a.shortLabel == parentBpLabel);
        if (parentBp) {
            vitalsData
                .filter((a) => a.parentID == parentBp.catalogID)
                .forEach((a) => {
                    const chartTime = a.chartTime.toString();
                    let bpInstance = bpItems.find((bp) => bp.chartTime == chartTime);
                    if (!bpInstance) {
                        bpInstance = { chartTime: a.chartTime };
                        bpItems.push(bpInstance);
                    }
                    bpInstance[a.shortLabel] = {
                        value: a.value,
                        x: a.x,
                        y: a.y
                    };
                });
        }
        return bpItems;
    };

    let flowsheetData: any[] = [];
    const generateSvg = () => {
        const svg = svgBuilder.newInstance();
        svg.width(TOTAL_WIDTH);
        svg.height(TOTAL_HEIGHT + 10);
        /* grid */
        for (let y = 0; y <= MAX_VALUE; y += 40) {
            svg.line({
                x1: OFFSET_X,
                y1: getY(MAX_VALUE - y),
                x2: TOTAL_WIDTH,
                y2: getY(MAX_VALUE - y),
                stroke: COLOR.GRAY,
                'stroke-width': 1
            });
            // if(isPrint) {
            //     svg.text(
            //         {
            //             x: OFFSET_X - 5,
            //             y: getY(MAX_VALUE - y + 5),
            //             stroke: COLOR.GRAY,
            //             fill: COLOR.GRAY,
            //             'text-anchor': 'end'
            //         },
            //         y.toString()
            //     );
            // }
        }
        if(!isPrint) {
            for(let i = 0; i < TOTAL_WIDTH; i+= INTERVAL_WIDTH) {
                svg.line({
                    x1: i,
                    y1: 0,
                    x2: i,
                    y2: MAX_VALUE,
                    stroke: COLOR.GRAY,
                    'stroke-width': 1
                });
            }
        }

        const vitalsData = flowsheetData
            .filter((a: any) => !!a.chartTime)
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));
        vitalsData.forEach((a: any) => {
            a.x = getXByDate(new Date(toStandardDateTimeString(a.chartTime))) 
                + OFFSET_X 
                - MOVE_LEFT;
            a.y = TOTAL_HEIGHT - getY(a.value);//a.value;
        });

        const o2Sats = flowsheetData
            .filter((a: any) => a.shortLabel == 'SPO2')
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));
        drawConnectingLines(svg, o2Sats, COLOR.GRAY);
        o2Sats.forEach((a) => {
            if(a.x < OFFSET_X) {
                return;
            }
            svg.circle({
                cx: a.x,
                cy: a.y,
                r: 3,
                stroke: COLOR.BLACK,
                'stroke-width': 1,
                fill: '#FFF'
            });
        });

        const heartRates = flowsheetData
            .filter((a: any) => a.shortLabel == 'Heart Rate')
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));
        drawConnectingLines(svg, heartRates, COLOR.GREEN);
        heartRates.forEach((a: any) => {
            if(a.x < OFFSET_X) {
                return;
            }
            svg.path({
                d: `M${a.x - 4} ${a.y - 4} L${a.x} ${a.y} L${a.x + 4} ${a.y - 4} Z`,
                stroke: '#000',
                'stroke-width': 1,
                fill: '#00FF00'
            });
        });

        const respiratoryRates = flowsheetData
            .filter((a) => a.shortLabel == 'Respiratory Rate')
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));
        drawConnectingLines(svg, respiratoryRates, COLOR.PURPLE);
        respiratoryRates.forEach((a) => {
            if(a.x < OFFSET_X) {
                return;
            }
            svg.path({
                d: `M${a.x - 3} ${a.y} L${a.x} ${a.y + 3} L${a.x + 3} ${a.y} L${a.x} ${a.y - 3} Z`,
                stroke: COLOR.PURPLE,
                'stroke-width': 1,
                fill: '#FFF'
            });
        });

        const temperatures = flowsheetData
            .filter((a) => a.shortLabel == 'Temperature(°C)')
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));
        drawConnectingLines(svg, temperatures, COLOR.RED);
        temperatures.forEach((a) => {
            if(a.x < OFFSET_X) {
                return;
            }
            svg.line({
                x1: a.x - 2,
                y1: a.y + 2,
                x2: a.x + 2,
                y2: a.y - 2,
                stroke: COLOR.RED,
                'stroke-width': 2
            }).line({
                x1: a.x - 2,
                y1: a.y - 2,
                x2: a.x + 2,
                y2: a.y + 2,
                stroke: COLOR.RED,
                'stroke-width': 2
            });
        });

        const cvps = flowsheetData
            .filter((a) => a.shortLabel == 'CVP')
            .sort((a: any, b: any) => (a.chartTime > b.chartTime ? 1 : -1));
        drawConnectingLines(svg, cvps, COLOR.BLACK);
        cvps.forEach((a) => {
            if(a.x < OFFSET_X) {
                return;
            }
            svg.circle({
                cx: a.x,
                cy: a.y,
                r: 3,
                stroke: 'none',
                'stroke-width': 1,
                fill: COLOR.BLACK
            });
        });

        const nonInvasiveBPs = getFormattedBpItems(flowsheetData, vitalsData, 'Non-Invasive BP');
        nonInvasiveBPs.forEach((bp: any) => drawBp(svg, BP_TYPE.NONINVASIVE, bp));

        const arterialBPs = getFormattedBpItems(flowsheetData, vitalsData, 'Arterial BP');
        arterialBPs.forEach((bp: any) => drawBp(svg, BP_TYPE.ARTERIAL, bp));

        return svg;
    }

    const getLeftPrevEdgeItem = (key: string) => {
        for(let i = index - 1; i >= 0; i--) {
            if(edgeData[i] && edgeData[i][key]?.last) {
                return edgeData[i][key].last;
            }
        }
        return null;
    }

    const getLeftNextEdgeItem = (key: string) => {
        for(let i = index; i < edgeData.length; i++) {
            if(edgeData[i] && edgeData[i][key]?.first) {
                return edgeData[i][key].first;
            }
        }
        return null;
    }

    const getRightPrevEdgeItem = (key: string) => {
        for(let i = index; i >= 0; i--) {
            if(edgeData[i] && edgeData[i][key]?.last) {
                return edgeData[i][key].last;
            }
        }

        return null;
    }

    const getRightNextEdgeItem = (key: string) => {
        for(let i = index + 1; i < edgeData.length; i++) {
            if(edgeData[i] && edgeData[i][key]?.first) {
                return edgeData[i][key].first;
            }
        }
        return null;
    }

    const formattedData: any = {};
    let markup = '';
    onMount(async () => {
        const promise = await fetch('/api/flowsheet'
            + `?ptEncounterID=${ptEncounterID}`
            + `&unitID=${unitID}`
            + '&dateTimeStart=' + toStandardDateTimeString(dateTimeStart)
            + '&dateTimeEnd=' + toStandardDateTimeString(dateTimeEnd));
        const results = await promise.json();

        for(const key of Object.keys(CHART_KEYS)){
            if(!edgeData[index]) {
                edgeData[index] = {};
            }
            if(!edgeData[index][key]) {
                edgeData[index][key] = { index };
            }
            const items = results.filter((a: any) => a.shortLabel == key);
            if(!items.length) {
                continue;
            }
            edgeData[index][key].first = JSON.parse(JSON.stringify(items[0]));
            edgeData[index][key].last = JSON.parse(JSON.stringify(items[items.length - 1]));
        }
        edgeData = edgeData;

        const baseCatalogs = results.filter((a: any) => a.type == 'Coded');
        const vitalSignsCatalog = baseCatalogs.find((a: any) => a.shortLabel == 'VITAL SIGNS');

        for(const a of results.filter((a: any) => a.chartTime != null)) {
            if(a.parentID == vitalSignsCatalog.catalogID) {
                const normalChartTime = toNormalDateTimeString(a.chartTime);
                const strDateTime = toStandardDateTimeString(roundDownDateTime(new Date(normalChartTime)));
                if(!formattedData[a.shortLabel]) {
                    formattedData[a.shortLabel] = {};
                }
                formattedData[a.shortLabel][strDateTime] = a;
            }
        };

        flowsheetData = results.filter((a: any) => !!a.value || a.type == 'Group');
    });

    $: if (edgeData) {
        const svg = generateSvg();

        Object.keys(CHART_KEYS).forEach(key => {
            if(index > 0) {
                const lPrevEdgeItem = getLeftPrevEdgeItem(key);
                const lNextEdgeItem = getLeftNextEdgeItem(key);
                if(lPrevEdgeItem && lNextEdgeItem) {
                    svg.line({
                        x1: - getXByDate(new Date(toStandardDateTimeString(lPrevEdgeItem.chartTime))) + OFFSET_X - MOVE_LEFT,
                        y1: TOTAL_HEIGHT - getY(lPrevEdgeItem.value),
                        x2: getXByDate(new Date(toStandardDateTimeString(lNextEdgeItem.chartTime))) + OFFSET_X - MOVE_LEFT,
                        y2: TOTAL_HEIGHT - getY(lNextEdgeItem.value),
                        stroke: CHART_KEYS[key],
                        'stroke-width': 1
                    });
                }
            }

            const rPrevEdgeItem = getRightPrevEdgeItem(key);
            const rNextEdgeItem = getRightNextEdgeItem(key);
            if(rPrevEdgeItem && rNextEdgeItem) {
                svg.line({
                    x1: getXByDate(new Date(toStandardDateTimeString(rPrevEdgeItem.chartTime))) + OFFSET_X - MOVE_LEFT,
                    y1: TOTAL_HEIGHT - getY(rPrevEdgeItem.value),
                    x2: getXByDate(new Date(toStandardDateTimeString(rNextEdgeItem.chartTime))) + OFFSET_X - MOVE_LEFT,
                    y2: TOTAL_HEIGHT - getY(rNextEdgeItem.value),
                    stroke: CHART_KEYS[key],
                    'stroke-width': 1
                });
            }
        });

        markup = svg.render();
        svg.reset();

        renderedCharts[index] = 1;
        renderedCharts = renderedCharts;
    }
</script>

{@html markup}

