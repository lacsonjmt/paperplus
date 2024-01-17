import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals }) => {
    // @ts-ignore
    const { sql, user } = locals;

    const query = `exec uspGetClinicalUnits "${user.userID}"`;
    const result = await logAndExecute(sql, query);
    
    return new Response(JSON.stringify(result.recordset), { status: 200 });
}