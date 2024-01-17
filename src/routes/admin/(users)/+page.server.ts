import type { PageServerLoad } from './$types';
import { STORAGE, SUPABASE_PROJECT_ID } from '$env/static/private'
 
export const load = (async ({ params }) => {
    const avatarBaseUrl = (STORAGE == 'supabase') ? `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/avatars/` : '';
    return { avatarBaseUrl };
}) satisfies PageServerLoad;