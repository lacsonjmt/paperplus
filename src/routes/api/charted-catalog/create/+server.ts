import { logAndExecute } from "$lib/utils/Db";
import moment from "moment";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const sessionHostName = 'DemoPC';
    
    const chartedCatalogs = await request.json();


    let query = '';
    for(const chartedCatalog of chartedCatalogs) {
        chartedCatalog.chartTime = moment().format('Y-MM-DD HH:mm:ss');

        const attributeID = chartedCatalog.attributeID ? `"${chartedCatalog.attributeID}"`: 'null';
        const defaultValue = chartedCatalog.parentCatalog?.value == 'Billing' ? 1 : 'null';

        query += `exec uspLoadptChartedCatalog "${chartedCatalog.ptEncounterID}",
            "${chartedCatalog.unitID}",
            "${chartedCatalog.catalogID}",
            ${attributeID},
            null,
            ${defaultValue},
            "${chartedCatalog.chartTime}",
            "${chartedCatalog.tblName}",
            "${user.userID}",
            "${sessionHostName}"; `;
    }

    console.log(query);
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}