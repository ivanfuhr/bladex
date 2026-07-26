import {
    defaultTriggerSpec,
    requestBodyForElement,
    resolveRequest,
    setDeclarativeLoadingState,
    shouldPreventDefault,
    ACTION_SELECTOR,
} from './methods.js';
import {
    clearFormFieldErrors,
    formFromTriggerElement,
} from '../forms/errors.js';
import {
    clearPendingFormContext,
    setPendingFormContext,
} from '../forms/context.js';
import { fetch } from '../fetch/proxy.js';

export const DECLARATIVE_EVENT_TYPES = [
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

export function parseDelayMs(modifier) {
    const match = /^delay:(\d+)ms$/i.exec(modifier);

    if (match === null) {
        return null;
    }

    return parseInt(match[1], 10);
}

export function parseTriggerSpec(spec, element) {
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

export function triggersForElement(element) {
    const spec = element.getAttribute('data-trigger');

    return parseTriggerSpec(spec, element);
}

export function triggerMatchesEvent(trigger, event) {
    return trigger.eventType === event.type;
}

function performRequest(triggerElement, request) {
    const init = {
        method: request.method,
    };

    const body = requestBodyForElement(triggerElement, request.method);

    if (body !== undefined) {
        init.body = body;
    }

    const form = formFromTriggerElement(triggerElement);

    setPendingFormContext({
        form: form,
        clearOnSuccess: true,
    });

    if (form !== null) {
        clearFormFieldErrors(form);
    }

    inFlightElements.add(triggerElement);
    setDeclarativeLoadingState(triggerElement, true);

    return fetch(request.url, init)
        .catch(function (error) {
            clearPendingFormContext();

            throw error;
        })
        .finally(function () {
            inFlightElements.delete(triggerElement);
            setDeclarativeLoadingState(triggerElement, false);
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
        performRequest(triggerElement, request)
            .then(function () {
                if (trigger.once) {
                    onceTriggeredElements.add(triggerElement);
                }
            })
            .catch(function (error) {
                console.error('[Bladex] Declarative request failed.', error);
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

export function bootDeclarativeActions() {
    if (declarativeBooted) {
        return;
    }

    for (let index = 0; index < DECLARATIVE_EVENT_TYPES.length; index++) {
        const eventType = DECLARATIVE_EVENT_TYPES[index];
        const listener = function (event) {
            handleDeclarativeEvent(event);
        };

        document.addEventListener(eventType, listener, false);
        declarativeListeners.push({ eventType: eventType, listener: listener });
    }

    declarativeBooted = true;
}

export function unbootDeclarativeActions() {
    if (!declarativeBooted) {
        return;
    }

    for (let index = 0; index < declarativeListeners.length; index++) {
        const entry = declarativeListeners[index];

        document.removeEventListener(entry.eventType, entry.listener, false);
    }

    declarativeListeners.length = 0;
    declarativeBooted = false;
}

export function scheduleDeclarativeBoot() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootDeclarativeActions, {
            once: true,
        });

        return;
    }

    bootDeclarativeActions();
}
