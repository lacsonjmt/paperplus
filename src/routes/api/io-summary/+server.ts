import { logAndExecute } from '$lib/utils/Db';

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');

    const query = `exec uspGetptIOSummary  "${ptEncounterID}", "${unitID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

