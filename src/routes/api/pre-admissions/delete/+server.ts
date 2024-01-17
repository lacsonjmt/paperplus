import { logAndExecute } from "$lib/utils/Db";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const { ptencounterID, HN, AN} = await request.json();
    const query = `exec uspDeleteptPreAdmit "${ptencounterID}",
        "${HN}",
        "${AN}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);
    
    return new Response(JSON.stringify([]), { status: 200 });
}

