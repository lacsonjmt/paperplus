import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
 
export const load = (async ({ locals }) => {
    const { sql } = locals;

    if(!locals.user) {
        throw redirect(307, '/login');
    }
    if(locals.user.isAdmin) {
        throw redirect(302, '/admin');
    }

    return {
        user: locals.user,
    };
}) satisfies LayoutServerLoad;