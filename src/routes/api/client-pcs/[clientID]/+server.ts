import { logAndExecute } from "$lib/utils/Db";

export const PATCH = async ({ params, locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const pc = await request.json();

    const query = `exec uspUpdatePC 
        "${params.clientID}",
        "${pc.hostname}",
        "${pc.location}", 
        "${pc.unitID}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully updated.'
    }), { status: 200 });
}

export const DELETE = async ({ params, locals }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const query = `exec uspDeletePC "${params.clientID}", "${user.userID}", "${sessionHostName}"`;
    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify({ 'message' : 'user successfully deleted.' }), { status: 200 });
}