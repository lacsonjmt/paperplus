import { logAndExecute } from "$lib/utils/Db";
import moment from "moment";

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');
    const parentID = url.searchParams.get('parentID');

    const query = `exec uspGetptNotes "${ptEncounterID}", "${unitID}", "${parentID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}
