import { csrfToken } from './csrf.js';

export function isMutationMethod(method) {
    const normalized = (method || 'GET').toUpperCase();

    return (
        normalized === 'POST' ||
        normalized === 'PUT' ||
        normalized === 'PATCH' ||
        normalized === 'DELETE'
    );
}

export function mergeRequestInit(init) {
    const options = init ? Object.assign({}, init) : {};
    const headers = new Headers(options.headers || {});

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    if (isMutationMethod(options.method) && !headers.has('X-CSRF-TOKEN')) {
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
