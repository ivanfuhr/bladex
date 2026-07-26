export const ALLOWED_HTTP_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
];

export const ACTION_SELECTOR = '[data-fetch]';

export function resolveHttpMethod(element) {
    const raw = element.getAttribute('data-method');

    if (raw === null || raw.trim() === '') {
        return 'GET';
    }

    const normalized = raw.trim().toUpperCase();

    if (ALLOWED_HTTP_METHODS.indexOf(normalized) === -1) {
        console.warn(
            '[Bladex] Unknown data-method "' +
                raw +
                '"; falling back to GET.',
        );

        return 'GET';
    }

    return normalized;
}

export function resolveRequest(element) {
    if (!(element instanceof Element)) {
        return null;
    }

    const url = element.getAttribute('data-fetch');

    if (url === null || url === '') {
        return null;
    }

    return { url: url, method: resolveHttpMethod(element) };
}

export function defaultTriggerSpec(element) {
    if (element.tagName === 'FORM') {
        return 'submit';
    }

    return 'click';
}

export function requestBodyForElement(element, method) {
    if (element.tagName !== 'FORM') {
        return undefined;
    }

    const normalized = method.toUpperCase();

    if (normalized === 'GET' || normalized === 'HEAD') {
        return undefined;
    }

    return new FormData(element);
}

export function setLoadingState(element, loading) {
    if (loading) {
        element.setAttribute('data-loading', '');
    } else {
        element.removeAttribute('data-loading');
    }
}

const formControlsDisabledByBladex = new WeakMap();

export function disableFormControls(form) {
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    const toggled = [];

    for (let index = 0; index < form.elements.length; index++) {
        const control = form.elements[index];

        if (control.disabled) {
            continue;
        }

        control.disabled = true;
        toggled.push(control);
    }

    formControlsDisabledByBladex.set(form, toggled);
}

export function restoreFormControls(form) {
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    const toggled = formControlsDisabledByBladex.get(form);

    if (toggled === undefined) {
        return;
    }

    for (let index = 0; index < toggled.length; index++) {
        toggled[index].disabled = false;
    }

    formControlsDisabledByBladex.delete(form);
}

export function setDeclarativeLoadingState(element, loading) {
    setLoadingState(element, loading);

    if (element.tagName !== 'FORM') {
        return;
    }

    if (loading) {
        disableFormControls(element);
    } else {
        restoreFormControls(element);
    }
}

export function shouldPreventDefault(element, event) {
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
