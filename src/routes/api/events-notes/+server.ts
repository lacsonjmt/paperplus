import { logAndExecute } from '$lib/utils/Db';

export const GET = async ({ locals, request, setHeaders }) => {
    setHeaders({
        "cache-control": "max-age=10",
    });

    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');
    const dateTimeStart = url.searchParams.get('dateTimeStart');
    const dateTimeEnd = url.searchParams.get('dateTimeEnd');

    const query = `exec uspGetptChartedNoteTopic "${ptEncounterID}", 
        "${unitID}", 
        "${dateTimeStart}",
        "${dateTimeEnd}",
        "${user.userID}",
        "${sessionHostName}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    let {
        ptEncounterID,
        unitID,
        items,
    } = await request.json();

    let query = '';

    const itemsToDelete = items.filter((a: any) => a.forDeletion && !a.isNew);
    itemsToDelete.forEach((a: any) => {
        query += `exec uspDeleteptChartedNotes "${ptEncounterID}",
            "${unitID}",
            "${a.catalogID}",
            "${user.userID}",
            "${sessionHostName}"; `;
    });

    const itemsToAdd = items.filter((a: any) => !a.forDeletion && a.isNew);
    itemsToAdd.forEach((a: any) => {
        query += `exec uspLoadptChartedNotes "${ptEncounterID}",
            "${unitID}",
            "${a.noteTypeID}",
            "${a.chartTime}",
            "${a.value}",
            "${user.userID}",
            "${sessionHostName}"; `;
    });

    const itemsToUpdate = items.filter((a: any) => !a.forDeletion && !a.isNew);;
    itemsToUpdate.forEach((a: any) => {
        query += `exec uspUpdateptChartedNotes "${ptEncounterID}",
            "${unitID}",
            "${a.catalogID}",
            "${a.chartTime}",
            "${a.value}",
            "${a.tblName}",
            "${user.userID}",
            "${sessionHostName}"; `;
    });

    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify({
        message: 'Flowsheet items successfully saved'
    }), { status: 200 });
}