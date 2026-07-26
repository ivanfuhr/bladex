import { apply } from './operations/index.js';
import { isBladexResponse } from './fetch/bladex-response.js';
import {
    applyFormErrors,
    clearFormFieldErrors,
    normalizeErrors,
} from './forms/errors.js';
import { takePendingFormContext } from './forms/context.js';

/**
 * @param {Response} response
 * @param {unknown} payload
 */
function shouldProcessPayload(response, payload, form) {
    if (isBladexResponse(response)) {
        return true;
    }

    if (!(form instanceof HTMLFormElement) || response.ok) {
        return false;
    }

    return normalizeErrors(payload) !== null;
}

/**
 * @param {unknown} payload
 */
function applyOperationsFromPayload(payload) {
    if (
        payload === null ||
        typeof payload !== 'object' ||
        !Array.isArray(payload.operations)
    ) {
        return false;
    }

    return apply(payload);
}

/**
 * @param {Response} response
 * @returns {Promise<boolean>}
 */
export function processBladexResponse(response) {
    const context = takePendingFormContext();
    const form = context.form ?? null;
    const clearOnSuccess = context.clearOnSuccess !== false;

    if (
        !isBladexResponse(response) &&
        (!(form instanceof HTMLFormElement) || response.ok)
    ) {
        return Promise.resolve(false);
    }

    return response
        .clone()
        .json()
        .then(function (payload) {
            if (!shouldProcessPayload(response, payload, form)) {
                return false;
            }

            const operationsApplied = applyOperationsFromPayload(payload);
            const errors = normalizeErrors(payload);

            if (form instanceof HTMLFormElement) {
                if (response.ok && clearOnSuccess) {
                    clearFormFieldErrors(form);
                } else if (errors !== null) {
                    applyFormErrors(form, errors);
                }
            }

            return operationsApplied || errors !== null;
        })
        .catch(function (error) {
            console.error('[Bladex] Failed to process BladeX response.', error);

            return false;
        });
}
