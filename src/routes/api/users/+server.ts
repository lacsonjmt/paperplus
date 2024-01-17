import fs from 'fs';
import { STORAGE, SUPABASE_PROJECT_ID, SUPABASE_SERVICE_KEY } from '$env/static/private'
import { StorageClient } from '@supabase/storage-js'
import { decode } from 'base64-arraybuffer';
import hash from 'string-hash';
import { logAndExecute } from '$lib/utils/Db';

export const GET = async ({ locals }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const hostname = 'DemoPC';

    const query = `exec uspGetUsers @userID="${user.userID}", @hostname="${hostname}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const userToCreate = await request.json();

    let imagePath = '';
    if(userToCreate.imageData) {
        const base64Image = userToCreate.imageData.split(';base64,').pop();
        const filename = (+new Date()).toString(16) + '.png';

        if(STORAGE == 'local') {
            imagePath = `/uploads/${filename}`;
            fs.writeFile('./static' + imagePath, base64Image, { encoding: 'base64' }, function(err) {
                console.log('File created');
            });
        } else if(STORAGE == 'supabase') {
            const supabaseStorageUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1`;
            const storageClient = new StorageClient(supabaseStorageUrl, {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            });
            const { data, error } = await storageClient
                .from('avatars')
                .upload(`uploads/${filename}`, decode(base64Image), { contentType: 'image/png' });
            if(!error) {
                imagePath = data.path;
            }
        }
    }

    const hashedPassword = hash(userToCreate.password);

    const query = `exec uspLoadUser "${userToCreate.loginID}", 
        "${hashedPassword}",
        "${userToCreate.lastName}",
        "${userToCreate.firstName}",
        "${userToCreate.contact}",
        "${userToCreate.isAdmin}",
        "${imagePath}",
        "${user.userID}",
        "${sessionHostName}"`;
    const result = await logAndExecute(sql, query);
    
    const newUserID = result.recordset[0].result;
    let queryRolesUnits = '';
    for(const roleId of userToCreate.roleIds) {
        queryRolesUnits += `exec uspLoadUserRole "${newUserID}", "${roleId}", "${user.userID}"; `;
    }
    for(const unitId of userToCreate.unitIds) {
        queryRolesUnits += `exec uspLoadUserUnit "${newUserID}", "${unitId}", "${user.userID}"; `;
    }
    await logAndExecute(sql, queryRolesUnits);

    return new Response(JSON.stringify({
        message: 'Successfully added a new User.'
    }), { status: 200 });
}