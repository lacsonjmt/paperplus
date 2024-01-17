
import type { Actions } from './$types';
import hash from 'string-hash';
import { fail, redirect } from '@sveltejs/kit';
 
export const actions = {
    default: async ({ cookies, request, locals }) => {
        // @ts-ignore
        const { sql, user } = locals;
        try {
            const form = await request.formData();
    
            const oldPassword = form.get('oldPassword')?.toString() || '';
            const newPassword = form.get('newPassword')?.toString() || '';

            if(hash(oldPassword) != user.pass) {
                return fail(400, {
                    errorMessage: 'Password is incorrect.',
                });
            }

            const hashedNewPassword = hash(newPassword);
            const query = `UPDATE dbo.tblusers
                SET pass = '${hashedNewPassword}'
                WHERE userID = '${user.userID}';`;
            console.log(query);
            await sql.query(query);
            user.pass = hashedNewPassword;

        } catch (exception: any) {
            return {
                stuff: {
                    errorMessage: exception.message,
                },
                status: 403,
            };
        }

        if(!user) {
            return fail(400, {
                errorMessage: 'An error occured. Try again later.',
            });
        }
        throw redirect(302, '/logout');
    }
} satisfies Actions;