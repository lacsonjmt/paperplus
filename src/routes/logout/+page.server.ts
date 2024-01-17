import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
    cookies.delete('user');
}) satisfies PageServerLoad;