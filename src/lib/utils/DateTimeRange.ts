import { roundDownDateTime, toStandardDateTimeString } from "./DateTime";

export const getEarliestDateTime = (flowsheetData, vitalsData) => {
    const sortedFlowsheetData = flowsheetData
        .filter((a) => a.chartTime)
        .sort((a, b) => (a.chartTime > b.chartTime ? 1 : -1));
    const sortedVitalsData = vitalsData
        .filter((a) => a.value && a.chartTime)
        .sort((a, b) => (a.chartTime > b.chartTime ? 1 : -1));

    let earliestStandardDateTime = new Date;
    if(sortedFlowsheetData.length && sortedVitalsData.length) {
        const fTime = sortedFlowsheetData[0].chartTime || sortedFlowsheetData[0].startTime;
        if(fTime < sortedVitalsData[0].chartTime) {
            earliestStandardDateTime = new Date(toStandardDateTimeString(fTime));
        } else {
            earliestStandardDateTime = new Date(toStandardDateTimeString(sortedVitalsData[0].chartTime))
        }
    } else if(sortedFlowsheetData.length) {
        const earliestDateTime = sortedFlowsheetData[0].chartTime ||sortedFlowsheetData[0].startTime;
        earliestStandardDateTime = new Date(toStandardDateTimeString(earliestDateTime));
    } else if(sortedVitalsData.length) {
        earliestStandardDateTime = new Date(toStandardDateTimeString(sortedVitalsData[0].chartTime));
    }
    return roundDownDateTime(earliestStandardDateTime);
}

export const getLatestDateTime = (flowsheetData, vitalsData) => {
    const sortedFlowsheetData = flowsheetData
        .filter((a) => a.chartTime)
        .sort((a, b) => (a.chartTime > b.chartTime ? 1 : -1))
        .reverse();
    const sortedVitalsData = vitalsData
        .filter((a) => a.value && a.chartTime)
        .sort((a, b) => (a.chartTime > b.chartTime ? 1 : -1))
        .reverse();

    let latestStandardDateTime = new Date;
    if(sortedFlowsheetData.length && sortedVitalsData.length) {
        const fTime = sortedFlowsheetData[0].chartTime || sortedFlowsheetData[0].startTime;
        if(fTime < sortedVitalsData[0].chartTime) {
            latestStandardDateTime = new Date(toStandardDateTimeString(fTime));
        } else {
            latestStandardDateTime = new Date(toStandardDateTimeString(sortedVitalsData[0].chartTime))
        }
    } else if(sortedFlowsheetData.length) {
        const latestDateTime = sortedFlowsheetData[0].chartTime ||sortedFlowsheetData[0].startTime;
        latestStandardDateTime = new Date(toStandardDateTimeString(latestDateTime));
    } else if(sortedVitalsData.length) {
        latestStandardDateTime = new Date(toStandardDateTimeString(sortedVitalsData[0].chartTime));
    }
    return roundDownDateTime(latestStandardDateTime);
}