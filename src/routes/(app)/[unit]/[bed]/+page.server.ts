import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const sqlTabs = 'exec uspGetTab';
    const tabsResult = await sql.query(sqlTabs);

    return {
        tabs: tabsResult.recordset
    };
}) satisfies PageServerLoad;