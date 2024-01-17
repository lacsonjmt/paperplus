import { logAndExecute } from "$lib/utils/Db";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const { ptEncounterID,
        unitID,
        selectedMainCategory,
        interventionsToAdd
    } = await request.json();

    let query = '';
    interventionsToAdd.forEach((a: any) => {
        const catalogID = a.catalogID ? `"${a.catalogID}"` : 'null';
        const tblName = a.tblName || 'tblptIntervention';
        query += `exec uspLoadptNewIntervention "${ptEncounterID}",
            "${unitID}",
            "${selectedMainCategory.catalogID}",
            ${catalogID},
            "${a.value}",
            "${tblName}",
            "${user.userID}",
            "${sessionHostName}"; `;
    });

    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}
