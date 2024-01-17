import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const hostname = 'DemoPC';

    const query = `exec uspGetLockedPt "${user.userID}", "${hostname}"`;
    const result = await logAndExecute(sql, query);
    
    return new Response(JSON.stringify(result.recordset), { status: 200 });
}