export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18')
];

export const server_loads = [0,2,4,3];

export const dictionary = {
		"/(app)": [5,[2]],
		"/admin/(users)": [~11,[4]],
		"/admin/client-pcs": [12,[4]],
		"/admin/patient-accesses": [13,[4]],
		"/(app)/archived-episodes/[ptEncounterID]/[unitID]/flowsheet": [~6,[2]],
		"/change-password": [~14],
		"/login": [~15],
		"/logout": [~16],
		"/print": [17],
		"/print/billing": [18],
		"/(app)/[unit]": [~7,[2]],
		"/(app)/[unit]/[bed]": [~8,[2,3]],
		"/(app)/[unit]/[bed]/[page]": [~9,[2,3]],
		"/(app)/[unit]/[bed]/[page]/[subpage]": [~10,[2,3]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';