import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ locals }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const query = `exec uspGetPC "${user.userID}", "${sessionHostName}"`;
    const result = await logAndExecute(sql, query);
    
    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const pc = await request.json();

    const query = `exec uspLoadPC "${pc.hostname}",
        "${pc.location}",
        "${pc.unitID}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new PC.'
    }), { status: 200 });
}