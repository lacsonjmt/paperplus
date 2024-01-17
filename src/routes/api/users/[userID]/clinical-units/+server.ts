import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ params, locals }) => {
    // @ts-ignore
    const { sql } = locals;

    const query = `exec uspGetClinicalUnits "${params.userID}"`;
    const result = await logAndExecute(sql, query);
    
    return new Response(JSON.stringify(result.recordset), { status: 200 })
}
