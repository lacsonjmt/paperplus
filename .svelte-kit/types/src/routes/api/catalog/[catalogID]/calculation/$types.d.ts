import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type RouteParams = { catalogID: string }
type RouteId = '/api/catalog/[catalogID]/calculation';

export type EntryGenerator = () => Promise<Array<RouteParams>> | Array<RouteParams>;
export type RequestHandler = Kit.RequestHandler<RouteParams, RouteId>;
export type RequestEvent = Kit.RequestEvent<RouteParams, RouteId>;