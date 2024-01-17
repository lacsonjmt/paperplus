import { logAndExecute } from '$lib/utils/Db.js';

export const PATCH = async ({ locals, request, params }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const postData = await request.json();
    const { action } = postData;

    if(action == 'toggle-lock') {
        const query = `exec uspUpdatePtLocking "${params.bedID}", "${user.userID}", "${sessionHostName}"`;
        await logAndExecute(sql, query);
    }

    return new Response(JSON.stringify({
        message: 'Successfully saved.'
    }), { status: 200 });
}
