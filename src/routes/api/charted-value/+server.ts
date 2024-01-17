import { logAndExecute } from '$lib/utils/Db';

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const parentID = url.searchParams.get('parentID');

    const query = `select dbo.ufnGetptChartedValue(1, '${ptEncounterID}', '${parentID}')`;
    const result = await sql.query(query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}