import { writable } from 'svelte/store';

export const DISPLAY_MODE = {
    DARK: 'DARK',
    LIGHT: 'LIGHT'
}

export const displayMode = writable(DISPLAY_MODE.DARK);