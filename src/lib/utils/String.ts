export const toTitleCase = (value: string) => {
        return value.toLowerCase().split(' ').map(word => {
            return word.replace(word[0], word[0].toUpperCase());
        }).join(' ');
}

export const toSlug = (value: string) => {
    if(!value) {
        return '';
    }
    return value
        .toLowerCase()
        .trim()
        .replace('/', '-')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}