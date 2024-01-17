import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals, params, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');

    const query = `exec uspGetCalculation "${ptEncounterID}",
        "${unitID}",
        "${params.catalogID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}