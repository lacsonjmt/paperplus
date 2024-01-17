import { logAndExecute } from "$lib/utils/Db";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const {
        ptEncounterID,
        unitID,
        start,
        end
    } = await request.json();

    const query = `exec uspLoadptTrendUpload "${ptEncounterID}",
        "${unitID}",
        "${start}",
        "${end}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);
        
    return new Response(JSON.stringify({
        message: 'Trend Upload successfully saved. '
    }), { status: 200 });
}