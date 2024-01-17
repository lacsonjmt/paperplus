import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type RouteParams = { unit: string; bed: string }
type RouteId = '/(app)/[unit]/[bed]';
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
export type Snapshot<T = any> = Kit.Snapshot<T>;
type PageServerParentData = Omit<Omit<EnsureDefined<import('../../../$types.js').LayoutServerData>, keyof import('../../$types.js').LayoutServerData> & EnsureDefined<import('../../$types.js').LayoutServerData>, keyof LayoutServerData> & EnsureDefined<LayoutServerData>;
type PageParentData = Omit<Omit<EnsureDefined<import('../../../$types.js').LayoutData>, keyof import('../../$types.js').LayoutData> & EnsureDefined<import('../../$types.js').LayoutData>, keyof LayoutData> & EnsureDefined<LayoutData>;
type LayoutRouteId = RouteId | "/(app)/[unit]/[bed]" | "/(app)/[unit]/[bed]/[page]" | "/(app)/[unit]/[bed]/[page]/[subpage]"
type LayoutParams = RouteParams & { unit?: string,bed?: string,page?: string,subpage?: string }
type LayoutServerParentData = Omit<EnsureDefined<import('../../../$types.js').LayoutServerData>, keyof import('../../$types.js').LayoutServerData> & EnsureDefined<import('../../$types.js').LayoutServerData>;
type LayoutParentData = Omit<EnsureDefined<import('../../../$types.js').LayoutData>, keyof import('../../$types.js').LayoutData> & EnsureDefined<import('../../$types.js').LayoutData>;

export type EntryGenerator = () => Promise<Array<RouteParams>> | Array<RouteParams>;
export type PageServerLoad<OutputData extends OutputDataShape<PageServerParentData> = OutputDataShape<PageServerParentData>> = Kit.ServerLoad<RouteParams, PageServerParentData, OutputData, RouteId>;
export type PageServerLoadEvent = Parameters<PageServerLoad>[0];
export type ActionData = unknown;
export type PageServerData = Expand<OptionalUnion<EnsureDefined<Kit.AwaitedProperties<Awaited<ReturnType<typeof import('../../../../../../../src/routes/(app)/[unit]/[bed]/+page.server.js').load>>>>>>;
export type PageData = Expand<Omit<PageParentData, keyof PageServerData> & EnsureDefined<PageServerData>>;
export type Action<OutputData extends Record<string, any> | void = Record<string, any> | void> = Kit.Action<RouteParams, OutputData, RouteId>
export type Actions<OutputData extends Record<string, any> | void = Record<string, any> | void> = Kit.Actions<RouteParams, OutputData, RouteId>
export type LayoutServerLoad<OutputData extends Partial<App.PageData> & Record<string, any> | void = Partial<App.PageData> & Record<string, any> | void> = Kit.ServerLoad<LayoutParams, LayoutServerParentData, OutputData, LayoutRouteId>;
export type LayoutServerLoadEvent = Parameters<LayoutServerLoad>[0];
export type LayoutServerData = Expand<OptionalUnion<EnsureDefined<Kit.AwaitedProperties<Awaited<ReturnType<typeof import('../../../../../../../src/routes/(app)/[unit]/[bed]/+layout.server.js').load>>>>>>;
export type LayoutData = Expand<Omit<LayoutParentData, keyof LayoutServerData> & EnsureDefined<LayoutServerData>>;
export type RequestEvent = Kit.RequestEvent<RouteParams, RouteId>;