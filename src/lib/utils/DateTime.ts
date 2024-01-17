import moment from "moment";

export const toStandardDateTimeString = (value: Date | string | undefined | null) => {
    if(!value) {
        return '';
    }
    let strValue = value.toString();
    if(value instanceof Date) {
        strValue = value.getFullYear() 
            + '-' + (value.getMonth() + 1).toString().padStart(2, '0')
            + '-' + value.getDate()
            + ' ' + (value.getHours()).toString().padStart(2, '0')
            + ':' + (value.getMinutes()).toString().padStart(2, '0')
            + ':' + (value.getSeconds()).toString().padStart(2, '0')
    }

    return moment(strValue.substring(0, 19)).format('Y-MM-DD HH:mm:ss');
}

export const toNormalDateTimeString = (value: string) => {
    if(!value) {
        return '';
    }
    return value.replace('T', ' ').substring(0, 19);
}


export const roundDownDateTime = (date: Date, minutes = 15): Date => {
    const ms = 1000 * 60 * minutes;
    return new Date(Math.floor(date.getTime() / ms) * ms);
};

export const roundUpDateTime = (date: Date, minutes = 15): Date => {
    const ms = 1000 * 60 * minutes;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
};

export const addMinutes = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes*60000);
}