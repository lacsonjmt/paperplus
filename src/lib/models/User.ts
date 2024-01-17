export class User {
    userID?: string = '';
    loginID?: string = '';
    contact?: string = '';
    password?: string = '';
    firstName?: string = '';
    lastName?: string = '';
    isAdmin?: boolean = false;

    roles?: string[] = [];
    roleIds?: string[] | [];
    
    units?: string[] = [];
    unitIds?: string[] | [];

    imageData: any;
    profilePhoto?: string = '';
}