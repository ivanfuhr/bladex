export function componentFromElement(element) {
    if (!(element instanceof Element)) {
        return null;
    }

    const root = element.closest('[data-component-identifier]');

    if (root === null) {
        return null;
    }

    const identifier = root.getAttribute('data-component-identifier');

    if (identifier === null || identifier === '') {
        return null;
    }

    return { element: root, identifier };
}

export function elementsFromIdentifier(identifier) {
    if (typeof identifier !== 'string' || identifier === '') {
        return [];
    }

    return document.querySelectorAll(
        '[data-component-identifier="' + CSS.escape(identifier) + '"]',
    );
}

export function uniqueElementFromIdentifier(identifier) {
    const elements = elementsFromIdentifier(identifier);

    if (elements.length === 0) {
        console.error(
            '[Bladex] No component found for identifier:',
            identifier,
        );

        return null;
    }

    if (elements.length > 1) {
        console.error(
            '[Bladex] Multiple components found for identifier:',
            identifier,
        );

        return null;
    }

    return elements[0];
}

export function componentFromIdentifier(identifier) {
    const element = uniqueElementFromIdentifier(identifier);

    if (element === null) {
        return null;
    }

    return { element, identifier };
}
