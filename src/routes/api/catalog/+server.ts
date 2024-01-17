import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const url = new URL(request.url);

    const parentID = url.searchParams.get('parentID');
    const unitID = url.searchParams.get('unitID');

    const query = `exec uspGetCatalog "${parentID}", "${unitID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const catalog = await request.json();

    const query = `exec uspLoadCatalog "${catalog.parentID}",
        "${catalog.value}",
        "${catalog.tblName}"`;
    
    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}


