import { toStandardDateTimeString } from '$lib/utils/DateTime.js';
import { logAndExecute } from '$lib/utils/Db';
import moment from 'moment';

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');
    const parentID = url.searchParams.get('parentID');

    const query = `exec uspGetptChartedCatalog "${ptEncounterID}", "${unitID}", "${parentID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const sessionHostName = 'DemoPC';
    
    const chartedCatalog = await request.json();
    chartedCatalog.chartTime = moment().format('Y-MM-DD HH:mm:ss');

    const attributeID = chartedCatalog.attributeID ? `"${chartedCatalog.attributeID}"`: 'null';

    const query = `exec uspLoadptChartedCatalog "${chartedCatalog.ptEncounterID}",
        "${chartedCatalog.unitID}",
        "${chartedCatalog.catalogID}",
        ${attributeID},
        null,
        "${chartedCatalog.value}",
        "${chartedCatalog.chartTime}",
        "${chartedCatalog.tblName}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}

export const PATCH = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const sessionHostName = 'DemoPC';
    
    const chartedCatalog = await request.json();
    chartedCatalog.chartTime = toStandardDateTimeString(chartedCatalog.chartTime);

    const query = `exec uspUpdateptChartedCatalog "${chartedCatalog.ptEncounterID}",
        "${chartedCatalog.unitID}",
        "${chartedCatalog.catalogID}",
        "${chartedCatalog.value}",
        "${chartedCatalog.chartTime}",
        null,
        "${chartedCatalog.tblName}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}

export const DELETE = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const sessionHostName = 'DemoPC';
    
    const chartedCatalog = await request.json();
    chartedCatalog.chartTime = toStandardDateTimeString(chartedCatalog.chartTime);

    const query = `exec uspDeleteptChartedCatalog "${chartedCatalog.ptEncounterID}",
        "${chartedCatalog.unitID}",
        "${chartedCatalog.catalogID}",
        "${chartedCatalog.chartTime}",
        "${chartedCatalog.tblName}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}