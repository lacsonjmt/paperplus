import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params, parent }) => {
    // @ts-ignore
    const { sql, user } = locals;

    const queryClinicalUnits = `exec uspGetClinicalUnits '${user.userID}'`;
    const resultClinicalUnits = await sql.query(queryClinicalUnits);
    const clinicalUnit = resultClinicalUnits.recordset.find((a: any) => a.terse.toLowerCase() == params.unit.toLowerCase());

    const queryBeds = `exec uspGetBeds '${clinicalUnit.unitID}'`
    const resultBeds = await sql.query(queryBeds);
    const bed = resultBeds.recordset.find((a: any) => a.terse.toLowerCase() == params.bed.toLowerCase());

    const sqlGetDashboard = `exec uspGetptUnitDashboard '${clinicalUnit.unitID}'`;
    const resultDashboard = await sql.query(sqlGetDashboard);
    const patient = resultDashboard.recordset.find((a: any) => a.bedID == bed.bedID);
    
    const sqlTabs = 'exec uspGetTab';
    const tabsResult = await sql.query(sqlTabs);

    const sqlPtStatus = `exec uspGetptStatus '${patient.ptencounterID}', '${clinicalUnit.unitID}'`;
    const resultStatuses = await sql.query(sqlPtStatus);

    return {
        unit: params.unit,
        bed: params.bed,
        tabs : tabsResult.recordset,
        patient,
        clinicalUnit,
        statuses: resultStatuses.recordset
    }
}) satisfies PageServerLoad;