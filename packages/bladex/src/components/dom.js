import { uniqueElementFromIdentifier } from './find.js';

export function swapComponent(identifier, html) {
    const element = uniqueElementFromIdentifier(identifier);

    if (element === null) {
        return false;
    }

    element.outerHTML = html;

    return true;
}

export function removeComponent(identifier) {
    const element = uniqueElementFromIdentifier(identifier);

    if (element === null) {
        return false;
    }

    element.remove();

    return true;
}

export function insertComponent(intoIdentifier, html, position) {
    const element = uniqueElementFromIdentifier(intoIdentifier);

    if (element === null) {
        return false;
    }

    if (typeof html !== 'string') {
        return false;
    }

    element.insertAdjacentHTML(position, html);

    return true;
}
