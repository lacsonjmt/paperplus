import { toStandardDateTimeString } from "$lib/utils/DateTime.js";
import { logAndExecute } from "$lib/utils/Db";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const { ptEncounterID,
        unitID,
        selectedMedications,
        dateTimeStop
    } = await request.json();

    let query = '';
    selectedMedications.forEach((a: any) => {
        const dateTimeStart = toStandardDateTimeString(a.startTime);
        query += `exec uspUpdateptChartedCatalog "${ptEncounterID}",
            "${unitID}",
            "${a.catalogID}",
            NULL,
            "${dateTimeStop}",
            "${dateTimeStart}",
            "tblptMedication",
            "${user.userID}",
            "${sessionHostName}"; `;
    });

    if(query) {
        await logAndExecute(sql, query);
    }
    
    return new Response(JSON.stringify({
        message: 'Successfully stopped the medication/s.'
    }), { status: 200 });
}
