import { getDomUpdateMode } from './dom-update-mode.js';
import { morphComponent } from './morph.js';
import { parseComponentHtml } from './parse-html.js';
import { uniqueElementFromIdentifier } from './find.js';

function replaceComponentHtml(element, html) {
    element.outerHTML = html;
}

/**
 * @param {string} identifier
 * @param {string} html
 */
export function swapComponent(identifier, html) {
    const element = uniqueElementFromIdentifier(identifier);

    if (element === null) {
        return false;
    }

    if (typeof html !== 'string') {
        return false;
    }

    if (getDomUpdateMode() === 'replace') {
        replaceComponentHtml(element, html);

        return true;
    }

    const incoming = parseComponentHtml(html, identifier);

    if (incoming === null) {
        console.error(
            '[Bladex] Falling back to replace for identifier:',
            identifier,
        );
        replaceComponentHtml(element, html);

        return true;
    }

    morphComponent(element, incoming);

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
