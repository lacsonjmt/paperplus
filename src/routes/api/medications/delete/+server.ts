import { logAndExecute } from "$lib/utils/Db";
import moment from "moment";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const { ptEncounterID,
        unitID,
        selectedMedications
    } = await request.json();

    let query = '';
    selectedMedications.forEach((a: any) => {
        query += `exec uspDeleteptMedication "${ptEncounterID}",
            "${unitID}",
            "${a.catalogID}",
            "${a.startTime}",
            "${user.userID}",
            "${sessionHostName}"; `;
    });

    if(query) {
        await logAndExecute(sql, query);
    }
    
    return new Response(JSON.stringify({
        message: 'Successfully deleted the medication/s.'
    }), { status: 200 });
}
