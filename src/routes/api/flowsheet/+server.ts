import { toNormalDateTimeString } from '$lib/utils/DateTime.js';
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

    const query = `exec uspGetptFlowsheets "${ptEncounterID}", 
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

    const sampleItemToSave = items[0];
    if(sampleItemToSave.type == 'Group') {
        const itemsToDelete = items.filter((a: any) => a.forDeletion && !a.isNew);
        itemsToDelete.forEach((a: any) => {
            Object.values(a.value).forEach((b: any) => {
                const chartTime = toNormalDateTimeString(a.original.chartTime);
                query += `exec uspDeleteptChartedCatalog "${ptEncounterID}",
                    "${unitID}",
                    "${b.catalogID}",
                    "${chartTime}",
                    "${b.tblName}",
                    "${user.userID}",
                    "${sessionHostName}"; `;
            });
        });

        const itemsToAdd = items.filter((a: any) => !a.forDeletion && a.isNew);
        itemsToAdd.forEach((a: any) => {
            Object.values(a.value).forEach((b: any) => {
                const attributeID = b.attributeID ? `"${b.attributeID}"`: 'null';
                query += `exec uspLoadptChartedCatalog "${ptEncounterID}",
                    "${unitID}",
                    "${b.catalogID}",
                    ${attributeID},
                    null,
                    "${b.value}",
                    "${a.chartTime}",
                    "${b.tblName}",
                    "${user.userID}",
                    "${sessionHostName}"; `;
            });
        });

        const itemsToUpdate = items.filter((a: any) => !a.forDeletion && !a.isNew);
        itemsToUpdate.forEach((a: any) => {
            Object.values(a.value).forEach((b: any) => {
                query += `exec uspUpdateptChartedCatalog "${ptEncounterID}",
                    "${unitID}",
                    "${b.catalogID}",
                    "${b.value}",
                    "${a.chartTime}",
                    null,
                    "${b.tblName}",
                    "${user.userID}",
                    "${sessionHostName}"; `;
            });
        });
    } else {
        const itemsToDelete = items.filter((a: any) => a.forDeletion && !a.isNew);
        itemsToDelete.forEach((a: any) => {
            const chartTime = toNormalDateTimeString(a.original.chartTime);
            query += `exec uspDeleteptChartedCatalog "${ptEncounterID}",
                "${unitID}",
                "${a.catalogID}",
                "${chartTime}",
                "${a.tblName}",
                "${user.userID}",
                "${sessionHostName}"; `;
        });
    
        const itemsToAdd = items.filter((a: any) => !a.forDeletion && a.isNew);
        itemsToAdd.forEach((a: any) => {
            const attributeID = a.attributeID ? `"${a.attributeID}"`: 'null';
            const shortLabel = a.shortLabel ? `"${a.shortLabel}"` : 'null';
            query += `exec uspLoadptChartedCatalog "${ptEncounterID}",
                "${unitID}",
                "${a.catalogID}",
                ${attributeID},
                ${shortLabel},
                "${a.value}",
                "${a.chartTime}",
                "${a.tblName}",
                "${user.userID}",
                "${sessionHostName}"; `;
        });
    
        const itemsToUpdate = items.filter((a: any) => !a.forDeletion && !a.isNew);;
        itemsToUpdate.forEach((a: any) => {
            query += `exec uspUpdateptChartedCatalog "${ptEncounterID}",
                "${unitID}",
                "${a.catalogID}",
                "${a.value}",
                "${a.chartTime}",
                null,
                "${a.tblName}",
                "${user.userID}",
                "${sessionHostName}"; `;
        });
    }
    console.log(query)
    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify({
        message: 'Flowsheet items successfully saved'
    }), { status: 200 });
}