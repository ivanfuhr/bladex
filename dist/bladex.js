(function () {
    function componentFromElement(element) {
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

    function componentFromIdentifier(identifier) {
        if (typeof identifier !== 'string' || identifier === '') {
            return null;
        }

        const element = document.querySelector(
            '[data-component-identifier="' + CSS.escape(identifier) + '"]',
        );

        if (element === null) {
            return null;
        }

        return { element, identifier };
    }

    window.Bladex = {
        find(target) {
            if (target instanceof Element) {
                return componentFromElement(target);
            }

            return componentFromIdentifier(target);
        },
    };
})();
