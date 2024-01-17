import { toStandardDateTimeString } from "$lib/utils/DateTime";
import { logAndExecute } from "$lib/utils/Db";

export const PATCH = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const patientStatus = await request.json();
    const { ptencounterID, unitID, catalogID } = patientStatus;
    const chartTime = '"' + toStandardDateTimeString(patientStatus.chartTime) + '"';

    const query = `exec uspUpdateptStatus "${ptencounterID}",
        "${unitID}",
        "${catalogID}",
        ${chartTime},
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully updated.'
    }), { status: 200 });
}