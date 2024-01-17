import { logAndExecute } from "$lib/utils/Db";

export const POST = async ({ locals, request }) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const patientToTransferOrDischarge = await request.json();
    const { ptencounterID, unitID, bedID } = patientToTransferOrDischarge;

    const originalBedID = bedID ? `"${bedID}"` : 'null';

    let newbedID = '';
    if(patientToTransferOrDischarge.action == 'Bed Transfer') {
        newbedID = patientToTransferOrDischarge.transferToBedId;
    } else if(patientToTransferOrDischarge.action == 'Discharge Location') {
        newbedID = patientToTransferOrDischarge.dischargeToLocationId;
    }

    const query = `exec uspUpdateptBedTransfer "${ptencounterID}",
        "${unitID}",
        ${originalBedID},
        "${newbedID}",
        "${user.userID}",
        "${sessionHostName}"`;
    await logAndExecute(sql, query);

    return new Response(JSON.stringify({
        message: 'Successfully added a new catalog item.'
    }), { status: 200 });
}
