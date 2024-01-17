import sql from 'mssql';
import * as cookie from 'cookie';

import { DB_SERVER, DB_USER, DB_PASS, DB_NAME } from '$env/static/private'

import type { Handle } from '@sveltejs/kit';
 
export const handle = (async ({ event, resolve }) => {
    await sql.connect({
        server: DB_SERVER,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        trustServerCertificate: true,
    });
    event.locals.sql = sql;
    event.locals.user = (await getSession(event)).user;

    return await resolve(event);
}) satisfies Handle;

// /** @type {import('@sveltejs/kit').GetSession} */
export async function getSession({ request }) {
    const cookieItem = null;
    
    let headerCookie = '';
    
    try {
        headerCookie = request.headers.get('cookie');
    } catch (exception) {
        console.log(exception);
    }

    const cookies = headerCookie ? cookie.parse(headerCookie) : null;
    if (cookies?.user) {
        const user = cookies.user || '';
        return {
            authenticated: true,
            user: JSON.parse(user),
        };
    }
    
    return {
        authenticated: false,
    };
}