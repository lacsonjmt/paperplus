import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals, params }) => {
    // @ts-ignore
    const { sql } = locals;

    const query = `exec uspGetlist "${params.catalogID}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}