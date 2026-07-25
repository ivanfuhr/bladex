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
        const element = uniqueElementFromIdentifier(identifier);

        if (element === null) {
            return null;
        }

        return { element, identifier };
    }

    function uniqueElementFromIdentifier(identifier) {
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

    function swapComponent(identifier, html) {
        const element = uniqueElementFromIdentifier(identifier);

        if (element === null) {
            return false;
        }

        element.outerHTML = html;

        return true;
    }

    function removeComponent(identifier) {
        const element = uniqueElementFromIdentifier(identifier);

        if (element === null) {
            return false;
        }

        element.remove();

        return true;
    }

    function insertComponent(intoIdentifier, html, position) {
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

    function applyOperation(operation) {
        if (operation === null || typeof operation !== 'object') {
            return false;
        }

        const type = operation.type;

        if (type === 'redirect') {
            const url = operation.url;

            if (typeof url !== 'string' || url === '') {
                return false;
            }

            window.location.assign(url);

            return true;
        }

        const identifier = operation.identifier;

        if (typeof identifier !== 'string' || identifier === '') {
            return false;
        }

        if (type === 'refresh' || type === 'replace') {
            const html = operation.html;

            if (typeof html !== 'string') {
                return false;
            }

            return swapComponent(identifier, html);
        }

        if (type === 'remove') {
            return removeComponent(identifier);
        }

        if (type === 'append') {
            const html = operation.html;

            if (typeof html !== 'string') {
                return false;
            }

            return insertComponent(identifier, html, 'beforeend');
        }

        if (type === 'prepend') {
            const html = operation.html;

            if (typeof html !== 'string') {
                return false;
            }

            return insertComponent(identifier, html, 'afterbegin');
        }

        return false;
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

    const METHOD_ATTRIBUTES = [
        { attribute: 'data-get', method: 'GET' },
        { attribute: 'data-post', method: 'POST' },
        { attribute: 'data-put', method: 'PUT' },
        { attribute: 'data-patch', method: 'PATCH' },
        { attribute: 'data-delete', method: 'DELETE' },
    ];

    const ACTION_SELECTOR = METHOD_ATTRIBUTES.map(function (entry) {
        return '[' + entry.attribute + ']';
    }).join(', ');

    const DECLARATIVE_EVENT_TYPES = [
        'click',
        'submit',
        'change',
        'keydown',
        'keyup',
    ];

    let declarativeBooted = false;
    const declarativeListeners = [];
    const inFlightElements = new WeakSet();
    const onceTriggeredElements = new WeakSet();

    function resolveRequest(element) {
        if (!(element instanceof Element)) {
            return null;
        }

        for (let index = 0; index < METHOD_ATTRIBUTES.length; index++) {
            const entry = METHOD_ATTRIBUTES[index];
            const url = element.getAttribute(entry.attribute);

            if (url !== null && url !== '') {
                return { url: url, method: entry.method };
            }
        }

        return null;
    }

    function defaultTriggerSpec(element) {
        if (element.tagName === 'FORM') {
            return 'submit';
        }

        return 'click';
    }

    function parseDelayMs(modifier) {
        const match = /^delay:(\d+)ms$/i.exec(modifier);

        if (match === null) {
            return null;
        }

        return parseInt(match[1], 10);
    }

    function parseTriggerSpec(spec, element) {
        const normalized =
            typeof spec === 'string' && spec.trim() !== ''
                ? spec.trim()
                : defaultTriggerSpec(element);

        const triggers = [];
        const parts = normalized.split(',');

        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            const tokens = parts[partIndex].trim().split(/\s+/).filter(Boolean);

            if (tokens.length === 0) {
                continue;
            }

            const eventType = tokens[0].toLowerCase();
            let once = false;
            let delayMs = 0;

            for (let tokenIndex = 1; tokenIndex < tokens.length; tokenIndex++) {
                const token = tokens[tokenIndex].toLowerCase();

                if (token === 'once') {
                    once = true;
                    continue;
                }

                const delay = parseDelayMs(tokens[tokenIndex]);

                if (delay !== null) {
                    delayMs = delay;
                }
            }

            triggers.push({ eventType: eventType, once: once, delayMs: delayMs });
        }

        if (triggers.length === 0) {
            const fallback = defaultTriggerSpec(element);

            triggers.push({
                eventType: fallback,
                once: false,
                delayMs: 0,
            });
        }

        return triggers;
    }

    function triggersForElement(element) {
        const spec = element.getAttribute('data-trigger');

        return parseTriggerSpec(spec, element);
    }

    function triggerMatchesEvent(trigger, event) {
        return trigger.eventType === event.type;
    }

    function requestBodyForElement(element, method) {
        if (element.tagName !== 'FORM') {
            return undefined;
        }

        const normalized = method.toUpperCase();

        if (normalized === 'GET' || normalized === 'HEAD') {
            return undefined;
        }

        return new FormData(element);
    }

    function shouldPreventDefault(element, event) {
        if (event.type === 'submit' && element.tagName === 'FORM') {
            return true;
        }

        if (event.type === 'click' && element.tagName === 'A') {
            return true;
        }

        if (
            event.type === 'click' &&
            element.tagName === 'BUTTON' &&
            element.getAttribute('type') !== 'submit'
        ) {
            return true;
        }

        return false;
    }

    function performRequest(triggerElement, request) {
        const init = {
            method: request.method,
        };

        const body = requestBodyForElement(triggerElement, request.method);

        if (body !== undefined) {
            init.body = body;
        }

        inFlightElements.add(triggerElement);

        return fetch(request.url, init).finally(function () {
            inFlightElements.delete(triggerElement);
        });
    }

    function runTrigger(triggerElement, trigger, event) {
        if (inFlightElements.has(triggerElement)) {
            return;
        }

        if (trigger.once && onceTriggeredElements.has(triggerElement)) {
            return;
        }

        const request = resolveRequest(triggerElement);

        if (request === null) {
            return;
        }

        if (shouldPreventDefault(triggerElement, event)) {
            event.preventDefault();
        }

        const execute = function () {
            performRequest(triggerElement, request).then(function () {
                if (trigger.once) {
                    onceTriggeredElements.add(triggerElement);
                }
            });
        };

        if (trigger.delayMs > 0) {
            window.setTimeout(execute, trigger.delayMs);

            return;
        }

        execute();
    }

    function handleDeclarativeEvent(event) {
        if (!(event.target instanceof Element)) {
            return;
        }

        const triggerElement = event.target.closest(ACTION_SELECTOR);

        if (triggerElement === null) {
            return;
        }

        const triggers = triggersForElement(triggerElement);
        let matched = null;

        for (let index = 0; index < triggers.length; index++) {
            if (triggerMatchesEvent(triggers[index], event)) {
                matched = triggers[index];
                break;
            }
        }

        if (matched === null) {
            return;
        }

        runTrigger(triggerElement, matched, event);
    }

    function bootDeclarativeActions() {
        if (declarativeBooted) {
            return;
        }

        for (
            let index = 0;
            index < DECLARATIVE_EVENT_TYPES.length;
            index++
        ) {
            const eventType = DECLARATIVE_EVENT_TYPES[index];
            const listener = function (event) {
                handleDeclarativeEvent(event);
            };

            document.addEventListener(eventType, listener, false);
            declarativeListeners.push({ eventType: eventType, listener: listener });
        }

        declarativeBooted = true;
    }

    function unbootDeclarativeActions() {
        if (!declarativeBooted) {
            return;
        }

        for (let index = 0; index < declarativeListeners.length; index++) {
            const entry = declarativeListeners[index];

            document.removeEventListener(
                entry.eventType,
                entry.listener,
                false,
            );
        }

        declarativeListeners.length = 0;
        declarativeBooted = false;
    }

    function scheduleDeclarativeBoot() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootDeclarativeActions, {
                once: true,
            });

            return;
        }

        bootDeclarativeActions();
    }

    window.Bladex = {
        apply,
        fetch,
        installFetchProxy,
        uninstallFetchProxy,
        bootDeclarativeActions,
        unbootDeclarativeActions,
        find(target) {
            if (target instanceof Element) {
                return componentFromElement(target);
            }

            return componentFromIdentifier(target);
        },
    };

    if (
        document.currentScript === null ||
        document.currentScript.getAttribute('data-fetch-proxy') !==
            'false'
    ) {
        installFetchProxy();
    }

    scheduleDeclarativeBoot();
})();
