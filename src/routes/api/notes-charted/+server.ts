import { logAndExecute } from '$lib/utils/Db';
import moment from 'moment';

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');
    const parentID = url.searchParams.get('parentID');

    const query = `exec uspGetptChartedNotes "${ptEncounterID}", "${unitID}", "${parentID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const catalog = await request.json();

    const query = `exec uspLoadptChartedNotes "${catalog.ptEncounterID}",
        "${catalog.unitID}",
        "${catalog.parentID}",
        "${catalog.chartTime}",
        "${catalog.value}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully created.'
    }), { status: 200 });
}

export const PATCH = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const catalog = await request.json();
    catalog.chartTime = moment().format('Y-MM-DD HH:mm:ss');

    const query = `exec uspUpdateptChartedNotes "${catalog.ptencounterID}",
        "${catalog.unitID}",
        "${catalog.catalogID}",
        "${catalog.chartTime}",
        "${catalog.value}",
        "${catalog.tblName}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully updated.'
    }), { status: 200 });
}

export const DELETE = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const catalog = await request.json();
    const query = `exec uspDeleteptChartedNotes "${catalog.ptencounterID}",
        "${catalog.unitID}",
        "${catalog.catalogID}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully deleted.'
    }), { status: 200 });
}