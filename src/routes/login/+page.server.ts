
import type { Actions } from './$types';
import hash from 'string-hash';
import { fail, redirect } from '@sveltejs/kit';
 
export const actions = {
    default: async ({ cookies, request, locals }) => {
        // @ts-ignore
        const { sql } = locals;

        let user;
        try {
            const form = await request.formData();
    
            const username = form.get('username')?.toString() || '';
            const password = form.get('password')?.toString() || '';
    
            const query = `SELECT u.*, roles = dbo.ufnGetUserRoles(u.userID) 
                FROM dbo.tblusers u WHERE loginID = '${username}'`;
            const users = await sql.query(query);

            if (users.recordset.length == 0) {
                return fail(400, {
                    errorMessage: 'Username is incorrect.',
                });
            }
    
            if (hash(password) != users.recordset[0].pass) {
                return fail(400, {
                    errorMessage: 'Incorrect password.',
                });
            }

            user = users.recordset[0];
            cookies.set('user', await JSON.stringify(user), {
                secure: false,
                path: '/',
                maxAge: 60 * 60 * 24 * 365
            });

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
        throw redirect(302, user.isAdmin ? '/admin' : '/');
    }
} satisfies Actions;