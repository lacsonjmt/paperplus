import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals }) => {
    // @ts-ignore
    const { sql } = locals;

    const query = 'exec uspLoadAutoCharting';
    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
}