import { Idiomorph } from 'idiomorph';

/**
 * @param {Element} existing
 * @param {Element} incoming
 */
export function morphComponent(existing, incoming) {
    Idiomorph.morph(existing, incoming, {
        morphStyle: 'outerHTML',
    });
}
