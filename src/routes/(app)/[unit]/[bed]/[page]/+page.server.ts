import { toSlug } from "$lib/utils/String";
import type { PageServerLoad } from "./$types";
import { FLOWSHEET_INTERVAL_MINUTES, FLOWSHEET_AUTOCHART_MINUTES } from '$env/static/private'
import { DISPLAY_MODE } from "$lib/stores";

export const load = (async ({ locals, params, cookies }) => {
    // @ts-ignore
    const { sql, user } = locals;

    const sqlTabs = 'exec uspGetTab';
    const tabsResult = await sql.query(sqlTabs);

    let tab = tabsResult.recordset.find((a: any) => toSlug(a.Tab) == params.page);
    if(!tab) {
        tab = tabsResult.recordset.find((a: any) => toSlug(a.SubTab) == params.page);
    }

    const queryClinicalUnits = `exec uspGetClinicalUnits '${user.userID}'`;
    const resultClinicalUnits = await sql.query(queryClinicalUnits);
    const clinicalUnit = resultClinicalUnits.recordset.find((a: any) => a.terse.toLowerCase() == params.unit.toLowerCase());

    const queryBeds = `exec uspGetBeds '${clinicalUnit.unitID}'`
    const resultBeds = await sql.query(queryBeds);
    const bed = resultBeds.recordset.find((a: any) => a.terse.toLowerCase() == params.bed.toLowerCase());

    const sqlGetDashboard = `exec uspGetptUnitDashboard '${clinicalUnit.unitID}'`;
    const resultDashboard = await sql.query(sqlGetDashboard);
    const patient = resultDashboard.recordset.find((a: any) => a.bedID == bed.bedID);


    const displayMode = cookies.get('displayMode');
    return {
        tab,
        clinicalUnit,
        patient,
        FLOWSHEET_INTERVAL_MINUTES,
        FLOWSHEET_AUTOCHART_MINUTES,
        displayMode
    }
}) satisfies PageServerLoad;