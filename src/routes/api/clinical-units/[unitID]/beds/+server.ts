import { logAndExecute } from "$lib/utils/Db.js";

export const GET = async ({ locals, params }) => {
    // @ts-ignore
    const { sql } = locals;

    const query = `exec uspGetBeds "${params.unitID}"`;
    const result = await logAndExecute(sql, query);
    
    return new Response(JSON.stringify(result.recordset), { status: 200 })
}
