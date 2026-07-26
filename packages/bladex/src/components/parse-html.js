const COMPONENT_IDENTIFIER_ATTRIBUTE = 'data-component-identifier';

/**
 * @param {string} html
 * @param {string} identifier
 * @returns {Element | null}
 */
export function parseComponentHtml(html, identifier) {
    if (typeof html !== 'string' || html.trim() === '') {
        console.error('[Bladex] Component HTML must be a non-empty string.');

        return null;
    }

    if (typeof identifier !== 'string' || identifier === '') {
        console.error('[Bladex] Component identifier is required to parse HTML.');

        return null;
    }

    const template = document.createElement('template');
    template.innerHTML = html.trim();

    const roots = [];

    for (let index = 0; index < template.content.childNodes.length; index++) {
        const node = template.content.childNodes[index];

        if (node.nodeType === Node.ELEMENT_NODE) {
            roots.push(node);
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            console.error(
                '[Bladex] Component HTML must have a single root element.',
            );

            return null;
        }
    }

    if (roots.length !== 1) {
        console.error(
            '[Bladex] Component HTML must have a single root element.',
        );

        return null;
    }

    const incoming = roots[0];
    const incomingIdentifier = incoming.getAttribute(
        COMPONENT_IDENTIFIER_ATTRIBUTE,
    );

    if (incomingIdentifier !== identifier) {
        console.error(
            '[Bladex] Component HTML identifier mismatch. Expected:',
            identifier,
            'Received:',
            incomingIdentifier,
        );

        return null;
    }

    return incoming;
}
