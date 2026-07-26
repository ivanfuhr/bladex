export const VALIDATION_FAILED_EVENT = 'validation-failed';
export const VALIDATION_CLEARED_EVENT = 'validation-cleared';

/**
 * @param {unknown} messages
 * @returns {string[]}
 */
function normalizeMessageList(messages) {
    if (!Array.isArray(messages)) {
        return [];
    }

    /** @type {string[]} */
    const normalized = [];

    for (let index = 0; index < messages.length; index++) {
        const message = messages[index];

        if (typeof message === 'string' && message !== '') {
            normalized.push(message);
        }
    }

    return normalized;
}

/**
 * @param {Record<string, string[]>} target
 * @param {string} name
 * @param {unknown} messages
 */
function addNormalizedFieldError(target, name, messages) {
    const list = normalizeMessageList(messages);

    if (list.length === 0) {
        return;
    }

    target[name] = list;
}

/**
 * @param {unknown} errors
 * @returns {Record<string, string[]> | null}
 */
function normalizeErrorsObject(errors) {
    if (errors === null || typeof errors !== 'object' || Array.isArray(errors)) {
        return null;
    }

    /** @type {Record<string, string[]>} */
    const normalized = {};

    for (const key in errors) {
        if (!Object.prototype.hasOwnProperty.call(errors, key)) {
            continue;
        }

        addNormalizedFieldError(
            normalized,
            key,
            /** @type {Record<string, unknown>} */ (errors)[key],
        );
    }

    return Object.keys(normalized).length === 0 ? null : normalized;
}

/**
 * @param {unknown} fieldErrors
 * @returns {Record<string, string[]> | null}
 */
function normalizeErrorsList(fieldErrors) {
    if (!Array.isArray(fieldErrors)) {
        return null;
    }

    /** @type {Record<string, string[]>} */
    const normalized = {};

    for (let index = 0; index < fieldErrors.length; index++) {
        const entry = fieldErrors[index];

        if (entry === null || typeof entry !== 'object') {
            continue;
        }

        const name = /** @type {Record<string, unknown>} */ (entry).name;
        const messages = /** @type {Record<string, unknown>} */ (entry).messages;

        if (typeof name !== 'string' || name === '') {
            continue;
        }

        addNormalizedFieldError(normalized, name, messages);
    }

    return Object.keys(normalized).length === 0 ? null : normalized;
}

/**
 * @param {unknown} payload
 * @returns {Record<string, string[]> | null}
 */
export function normalizeErrors(payload) {
    if (payload === null || typeof payload !== 'object') {
        return null;
    }

    const record = /** @type {Record<string, unknown>} */ (payload);
    const errors = record.errors;

    if (Array.isArray(errors)) {
        return normalizeErrorsList(errors);
    }

    return normalizeErrorsObject(errors);
}

/**
 * @param {string} name
 * @returns {string}
 */
export function fieldNameToErrorKey(name) {
    if (typeof name !== 'string' || name === '') {
        return '';
    }

    let key = name;

    key = key.replace(/\]/g, '');
    key = key.replace(/\[/g, '.');

    while (key.includes('..')) {
        key = key.replace(/\.\./g, '.');
    }

    return key.replace(/^\.|\.$/g, '');
}

/**
 * @param {string} name
 * @param {string} errorKey
 */
export function fieldNameMatchesErrorKey(name, errorKey) {
    return fieldNameToErrorKey(name) === errorKey;
}

/**
 * @param {HTMLFormElement} form
 * @param {Record<string, string[]>} errors
 * @returns {Record<string, HTMLElement[]>}
 */
export function resolveFieldsForErrors(form, errors) {
    /** @type {Record<string, HTMLElement[]>} */
    const fields = {};

    if (!(form instanceof HTMLFormElement)) {
        return fields;
    }

    const errorKeys = Object.keys(errors);

    for (let keyIndex = 0; keyIndex < errorKeys.length; keyIndex++) {
        const errorKey = errorKeys[keyIndex];

        /** @type {HTMLElement[]} */
        const controls = [];

        for (let index = 0; index < form.elements.length; index++) {
            const control = form.elements[index];

            if (!(control instanceof HTMLElement)) {
                continue;
            }

            const name = control.getAttribute('name');

            if (name === null || name === '') {
                continue;
            }

            if (!fieldNameMatchesErrorKey(name, errorKey)) {
                continue;
            }

            controls.push(control);
        }

        if (controls.length > 0) {
            fields[errorKey] = controls;
        }
    }

    return fields;
}

/**
 * @param {HTMLFormElement} form
 * @param {'submit' | 'success'} reason
 */
export function dispatchValidationCleared(form, reason) {
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    for (let index = 0; index < form.elements.length; index++) {
        const control = form.elements[index];

        if (!(control instanceof HTMLElement)) {
            continue;
        }

        control.dispatchEvent(
            new CustomEvent(VALIDATION_CLEARED_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    form: form,
                    control: control,
                    reason: reason,
                },
            }),
        );
    }
}

/**
 * @param {HTMLFormElement} form
 * @param {Record<string, string[]>} errors
 */
export function dispatchValidationFailed(form, errors) {
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    const fields = resolveFieldsForErrors(form, errors);
    const errorKeys = Object.keys(fields);

    for (let keyIndex = 0; keyIndex < errorKeys.length; keyIndex++) {
        const errorKey = errorKeys[keyIndex];
        const messages = errors[errorKey];
        const controls = fields[errorKey];

        if (messages === undefined || controls === undefined) {
            continue;
        }

        for (let controlIndex = 0; controlIndex < controls.length; controlIndex++) {
            const control = controls[controlIndex];

            control.dispatchEvent(
                new CustomEvent(VALIDATION_FAILED_EVENT, {
                    bubbles: true,
                    composed: true,
                    detail: {
                        form: form,
                        control: control,
                        field: errorKey,
                        messages: messages,
                    },
                }),
            );
        }
    }
}

/**
 * @param {Element} triggerElement
 * @returns {HTMLFormElement | null}
 */
export function formFromTriggerElement(triggerElement) {
    if (!(triggerElement instanceof Element)) {
        return null;
    }

    if (triggerElement instanceof HTMLFormElement) {
        return triggerElement;
    }

    const form = triggerElement.closest('form');

    return form instanceof HTMLFormElement ? form : null;
}
