import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
    // @ts-ignore
    const { sql, user } = locals;
    
    const queryClinicalUnits = `exec uspGetClinicalUnits '${user.userID}'`;
    const resultClinicalUnits = await sql.query(queryClinicalUnits);

    const userClinicalUnits = resultClinicalUnits.recordset;
    const targetClinicalUnits = userClinicalUnits.filter((a: any) => a.terse.toLowerCase() == params.unit.toLowerCase());
    if(!targetClinicalUnits.length) {
        throw error(404, 'Not found');
    }

    const clinicalUnit = targetClinicalUnits[0];

    const queryBeds = `exec uspGetBeds '${clinicalUnit.unitID}'`
    const resultBeds = await sql.query(queryBeds);

    const sqlGetDashboard = `exec uspGetptUnitDashboard '${clinicalUnit.unitID}'`;
    const dashboard = await sql.query(sqlGetDashboard);

    return { 
        clinicalUnit,
        clinicalUnits: userClinicalUnits,
        beds: resultBeds.recordset,
        dashboard
    };
}) satisfies PageServerLoad;