/**
 * @param {unknown} messages
 * @returns {string | null}
 */
function firstErrorMessage(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return null;
    }

    const message = messages[0];

    return typeof message === 'string' && message !== '' ? message : null;
}

/**
 * @param {Record<string, string[]>} target
 * @param {string} name
 * @param {unknown} messages
 */
function addNormalizedFieldError(target, name, messages) {
    const message = firstErrorMessage(messages);

    if (message === null) {
        return;
    }

    target[name] = [message];
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
 */
export function clearFormFieldErrors(form) {
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    for (let index = 0; index < form.elements.length; index++) {
        const control = form.elements[index];

        if (control instanceof Element) {
            control.removeAttribute('data-error');
            control.removeAttribute('data-error-field');
            control.removeAttribute('aria-invalid');
        }
    }
}

/**
 * @param {HTMLFormElement} form
 * @param {Record<string, string[]>} errors
 */
export function applyFormErrors(form, errors) {
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    clearFormFieldErrors(form);

    const errorKeys = Object.keys(errors);

    for (let keyIndex = 0; keyIndex < errorKeys.length; keyIndex++) {
        const errorKey = errorKeys[keyIndex];
        const message = firstErrorMessage(errors[errorKey]);

        if (message === null) {
            continue;
        }

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

            control.setAttribute('data-error-field', errorKey);
            control.setAttribute('data-error', message);
            control.setAttribute('aria-invalid', 'true');
            break;
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
