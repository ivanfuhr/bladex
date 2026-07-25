import { apply } from '../operations/index.js';
import { mergeRequestInit } from './request.js';

const nativeFetch = window.fetch.bind(window);

export function isBladexResponse(response) {
    return response.headers.get('X-BladeX') === 'true';
}

export function applyOperationsFromResponse(response) {
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

export function fetch(input, init) {
    return nativeFetch(input, mergeRequestInit(init)).then(function (response) {
        return applyOperationsFromResponse(response).then(function () {
            return response;
        });
    });
}

let fetchProxyInstalled = false;

export function installFetchProxy() {
    if (fetchProxyInstalled) {
        return;
    }

    window.fetch = fetch;
    window.fetch.native = nativeFetch;
    fetchProxyInstalled = true;
}

export function uninstallFetchProxy() {
    if (!fetchProxyInstalled) {
        return;
    }

    window.fetch = nativeFetch;
    fetchProxyInstalled = false;
}

export { nativeFetch };
