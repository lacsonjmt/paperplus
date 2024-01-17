import type { PageServerLoad } from './$types';
import { FLOWSHEET_INTERVAL_MINUTES, FLOWSHEET_AUTOCHART_MINUTES } from '$env/static/private'

export const load = (async ({locals, params}) => {
    // @ts-ignore
    const { sql, user } = locals;
    const sessionHostName = 'DemoPC';

    const { ptEncounterID, unitID } = params;

    const query = `exec uspGetptArchiveEpisodes "${ptEncounterID}", "${user.userID}", "${sessionHostName}"`;
    const archivedEpisodesResult = await sql.query(query);
    const archivedEpisodes = archivedEpisodesResult.recordset;
    const archivedEpisode = archivedEpisodes.find((a:any) => a.ptencounterID == ptEncounterID && a.unitID == unitID);

    return {
        ptEncounterID,
        unitID,
        archivedEpisode,
        FLOWSHEET_INTERVAL_MINUTES,
        FLOWSHEET_AUTOCHART_MINUTES
    }
}) satisfies PageServerLoad;