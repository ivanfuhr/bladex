(function () {
    const nativeFetch = window.fetch.bind(window);

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

    function elementsFromIdentifier(identifier) {
        if (typeof identifier !== 'string' || identifier === '') {
            return [];
        }

        return document.querySelectorAll(
            '[data-component-identifier="' + CSS.escape(identifier) + '"]',
        );
    }

    function componentFromIdentifier(identifier) {
        const elements = elementsFromIdentifier(identifier);

        if (elements.length !== 1) {
            return null;
        }

        const element = elements[0];

        return { element, identifier };
    }

    function swapComponent(identifier, html) {
        const elements = elementsFromIdentifier(identifier);

        if (elements.length === 0) {
            console.error(
                '[Bladex] No component found for identifier:',
                identifier,
            );

            return false;
        }

        if (elements.length > 1) {
            console.error(
                '[Bladex] Multiple components found for identifier:',
                identifier,
            );

            return false;
        }

        elements[0].outerHTML = html;

        return true;
    }

    function applyOperation(operation) {
        if (operation === null || typeof operation !== 'object') {
            return false;
        }

        const type = operation.type;
        const identifier = operation.identifier;
        const html = operation.html;

        if (type !== 'refresh' && type !== 'replace') {
            return false;
        }

        if (typeof identifier !== 'string' || identifier === '') {
            return false;
        }

        if (typeof html !== 'string') {
            return false;
        }

        return swapComponent(identifier, html);
    }

    function apply(payload) {
        const operations =
            payload !== null &&
            typeof payload === 'object' &&
            Array.isArray(payload.operations)
                ? payload.operations
                : null;

        if (operations === null) {
            return false;
        }

        let applied = true;

        for (let index = 0; index < operations.length; index++) {
            if (!applyOperation(operations[index])) {
                applied = false;
            }
        }

        return applied;
    }

    function csrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');

        if (meta === null) {
            return null;
        }

        const token = meta.getAttribute('content');

        if (token === null || token === '') {
            return null;
        }

        return token;
    }

    function isMutationMethod(method) {
        const normalized = (method || 'GET').toUpperCase();

        return (
            normalized === 'POST' ||
            normalized === 'PUT' ||
            normalized === 'PATCH' ||
            normalized === 'DELETE'
        );
    }

    function mergeRequestInit(init) {
        const options = init ? Object.assign({}, init) : {};
        const headers = new Headers(options.headers || {});

        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json');
        }

        if (
            isMutationMethod(options.method) &&
            !headers.has('X-CSRF-TOKEN')
        ) {
            const token = csrfToken();

            if (token !== null) {
                headers.set('X-CSRF-TOKEN', token);
            }
        }

        if (
            isMutationMethod(options.method) &&
            !headers.has('X-Requested-With')
        ) {
            headers.set('X-Requested-With', 'XMLHttpRequest');
        }

        options.headers = headers;

        return options;
    }

    function isBladexResponse(response) {
        return response.headers.get('X-BladeX') === 'true';
    }

    function applyOperationsFromResponse(response) {
        if (!isBladexResponse(response)) {
            return Promise.resolve(false);
        }

        return response
            .clone()
            .json()
            .then(function (payload) {
                return apply(payload);
            })
            .catch(function (error) {
                console.error('[Bladex] Failed to apply operations.', error);

                return false;
            });
    }

    function fetch(input, init) {
        return nativeFetch(input, mergeRequestInit(init)).then(function (
            response,
        ) {
            return applyOperationsFromResponse(response).then(function () {
                return response;
            });
        });
    }

    let fetchProxyInstalled = false;

    function installFetchProxy() {
        if (fetchProxyInstalled) {
            return;
        }

        window.fetch = fetch;
        window.fetch.native = nativeFetch;
        fetchProxyInstalled = true;
    }

    function uninstallFetchProxy() {
        if (!fetchProxyInstalled) {
            return;
        }

        window.fetch = nativeFetch;
        fetchProxyInstalled = false;
    }

    window.Bladex = {
        apply,
        fetch,
        installFetchProxy,
        uninstallFetchProxy,
        find(target) {
            if (target instanceof Element) {
                return componentFromElement(target);
            }

            return componentFromIdentifier(target);
        },
    };

    if (
        document.currentScript === null ||
        document.currentScript.getAttribute('data-bladex-fetch-proxy') !==
            'false'
    ) {
        installFetchProxy();
    }
})();
