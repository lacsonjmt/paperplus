export const GET = async ({ locals }) => {
    // @ts-ignore
    const { sql } = locals;

    const result = await sql.query("SELECT TOP 10 * FROM tbllogs ORDER BY logTime DESC");

    return new Response(JSON.stringify(result.recordset), { status: 200});
}