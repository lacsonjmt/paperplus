import { toStandardDateTimeString } from '$lib/utils/DateTime.js';
import { logAndExecute } from '$lib/utils/Db';

export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');

    const query = `exec uspGetptUserManagement "${ptEncounterID}",
        "${unitID}",
        "${user.userID}",
        "${sessionHostName}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');

    const staff = await request.json();
    const inTime = staff.inTime ? '"' + toStandardDateTimeString(staff.inTime) + '"' : 'null';
    const outTime = staff.outTime ? '"' + toStandardDateTimeString(staff.outTime) + '"' : 'null';

    const query = `exec uspLoadptUserManagement "${ptEncounterID}", 
        "${unitID}",
        "${staff.name}",
        "${staff.role}",
        ${inTime},
        ${outTime},
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new staff.'
    }), { status: 200 });
}

export const PATCH = async ({ params, locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');

    const staff = await request.json();
    const inTime = staff.inTime ? '"' + toStandardDateTimeString(staff.inTime) + '"' : 'null';
    const outTime = staff.outTime ? '"' + toStandardDateTimeString(staff.outTime) + '"' : 'null';

    const query = `exec uspUpdateptUserManagement "${ptEncounterID}",
        "${unitID}",
        "${staff.catalogID}",
        "${staff.name}",
        "${staff.role}",
        ${inTime},
        ${outTime},
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully updated.'
    }), { status: 200 });
}


export const DELETE = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const url = new URL(request.url);

    const ptEncounterID = url.searchParams.get('ptEncounterID');
    const unitID = url.searchParams.get('unitID');

    const staff = await request.json();
    
    const query = `exec uspDeleteptUserManagement "${ptEncounterID}",
        "${unitID}",
        "${staff.catalogID}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({ 'message' : 'user successfully deleted.' }), { status: 200 });
}