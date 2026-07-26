/** @typedef {'morph' | 'replace'} DomUpdateMode */

/** @type {DomUpdateMode} */
let domUpdateMode = 'morph';

/**
 * @param {DomUpdateMode} mode
 */
export function setDomUpdateMode(mode) {
    if (mode === 'replace' || mode === 'morph') {
        domUpdateMode = mode;
    }
}

/**
 * @returns {DomUpdateMode}
 */
export function getDomUpdateMode() {
    return domUpdateMode;
}

/**
 * @param {string | null | undefined} value
 */
export function normalizeDomUpdateMode(value) {
    if (value === 'replace' || value === 'morph') {
        return value;
    }

    return 'morph';
}
