import { mergeRequestInit } from './request.js';
import { isBladexResponse } from './bladex-response.js';
import { processBladexResponse } from '../response.js';

const nativeFetch = window.fetch.bind(window);

export { isBladexResponse } from './bladex-response.js';

/**
 * @param {Response} response
 */
export function applyOperationsFromResponse(response) {
    return processBladexResponse(response);
}

export function fetch(input, init) {
    return nativeFetch(input, mergeRequestInit(init)).then(function (response) {
        return processBladexResponse(response).then(function () {
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
