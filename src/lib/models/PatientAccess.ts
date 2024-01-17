export const Action = {
    UNLOCK: 'unlock',
};

export class PatientAccess {
    bedID?: string = '';
    bed?: string = '';
    lockedinPC?: string = '';
    lockedbyuserID?: string = '';
    lockedTime?: string = '';
    unit?: string = '';
    loginID?: string = '';
    ptName?: string = '';
}