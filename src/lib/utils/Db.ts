import moment from "moment";

export const logAndExecute = async (sql: any, query: string) => {
    const logTime = moment().format('Y-MM-DD HH:mm:ss');
    await sql.query(`INSERT INTO tbllogs(logTime, message) VALUES('${logTime}', '${query}')`);

    return await sql.query(query);
}