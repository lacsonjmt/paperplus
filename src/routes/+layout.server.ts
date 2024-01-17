import type { LayoutServerLoad } from './$types';
import { APP_MODE } from '$env/static/private'
 
export const load = (() => {
    return {
        appMode: APP_MODE,
    };
}) satisfies LayoutServerLoad;