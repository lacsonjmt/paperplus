import { toSlug } from "$lib/utils/String";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
    // @ts-ignore
    const { sql, user } = locals;

    const sqlTabs = 'exec uspGetTab';
    const tabsResult = await sql.query(sqlTabs);

    const tab = tabsResult.recordset.find((a: any) => toSlug(a.Tab) == params.page);
    let subtab;
    if(tab) {
        subtab = tabsResult.recordset.find((a: any) => toSlug(a.SubTab || '') == params.subpage);
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

    return {
        tab,
        subtab,
        clinicalUnit,
        patient
    }
}) satisfies PageServerLoad;