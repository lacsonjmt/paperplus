import { Action } from '$lib/models/PatientAccess';
import { logAndExecute } from '$lib/utils/Db';

export const PATCH = async ({ params, locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const patientAccess = await request.json();
    if(patientAccess.action == Action.UNLOCK) {
        const sessionHostName = 'DemoPC';

        const query = `exec uspUpdateunlockPt "${params.bedID}", 
            "${user.userID}", 
            "${sessionHostName}"`;
        await logAndExecute(sql, query);

        return new Response(JSON.stringify({
            message: 'Successfully unlocked.'
        }), { status: 200 });
    }
}