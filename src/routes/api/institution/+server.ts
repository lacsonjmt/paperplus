export const GET = async ({ locals, request }) => {
    // @ts-ignore
    const { sql } = locals;

    const result = await sql.query(`exec uspGetInstitution`);

    return new Response(JSON.stringify(result.recordset), { status: 200});
}