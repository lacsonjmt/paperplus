import { logAndExecute } from "$lib/utils/Db";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const admission = await request.json();
    const bedID = admission.bedID ? `"${admission.bedID}"` : 'null';
    const query = `exec uspLoadptAdmit "${admission.unitID}",
        ${bedID},
        "${admission.uin}",
        "${admission.hospNo}",
        "${admission.lastName}",
        "${admission.bundleID}",
        "${user.userID}",
        "${sessionHostName}"`;

    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully created.'
    }), { status: 200 });
}
