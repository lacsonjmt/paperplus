import { error } from "@sveltejs/kit";
import { decode } from 'base64-arraybuffer'
import { STORAGE, SUPABASE_PROJECT_ID, SUPABASE_SERVICE_KEY } from '$env/static/private'
import { StorageClient } from '@supabase/storage-js'
import fs from 'fs';
import hash from 'string-hash';
import { logAndExecute } from "$lib/utils/Db";

export const GET = async ({ params, locals }) => {
    // @ts-ignore
    const { sql } = locals;

    const query = `SELECT * FROM tblusers WHERE userID = "${params.userID}"`;
    const result = await logAndExecute(sql, query);
    
    if(result.recordset.length) {
        return new Response(JSON.stringify(result.recordset[0]), { status: 200 });
    }
    throw error(404, 'Not found');
}

export const PATCH = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const userToUpdate = await request.json();

    let imagePath = userToUpdate.profilePhoto;
    if(userToUpdate.imageData) {
        const base64Image = userToUpdate.imageData.split(';base64,').pop();
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

    const hashedPassword = hash(userToUpdate.password);
    const query = `exec uspUpdateUser "${userToUpdate.userID}", 
        "${hashedPassword}",
        "${userToUpdate.lastName}",
        "${userToUpdate.firstName}",
        "${userToUpdate.contact}",
        "${userToUpdate.isAdmin}",
        "${imagePath}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    let queryRolesUnits = '';
    for(const roleId of userToUpdate.roleIds) {
        queryRolesUnits += `exec uspLoadUserRole "${userToUpdate.userID}", "${roleId}", "${user.userID}"; `;
    }
    for(const unitId of userToUpdate.unitIds) {
        queryRolesUnits += `exec uspLoadUserUnit "${userToUpdate.userID}", "${unitId}", "${user.userID}"; `;
    }
    await logAndExecute(sql, queryRolesUnits);

    return new Response(JSON.stringify({
        message: 'Successfully updated user.'
    }), { status: 200 });
}

export const DELETE = async ({ params, locals }) => {
    // @ts-ignore
    const { sql, user } = locals;

    const hostname = 'DemoPC';

    const query = `exec uspDeleteUser "${params.userID}", "${user.userID}", "${hostname}"`;
    const result = await logAndExecute(sql, query);

    return new Response(JSON.stringify({ 'message' : 'user successfully deleted.' }), { status: 200 });
}