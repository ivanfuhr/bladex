/** @typedef {{ form?: HTMLFormElement | null, clearOnSuccess?: boolean }} FormContext */

/** @type {FormContext | null} */
let pendingFormContext = null;

/**
 * @param {FormContext | null} context
 */
export function setPendingFormContext(context) {
    pendingFormContext = context;
}

/**
 * @returns {FormContext}
 */
export function takePendingFormContext() {
    const context = pendingFormContext ?? {};
    pendingFormContext = null;

    return context;
}

/**
 * Clears pending context when a request fails before BladeX processes the response.
 */
export function clearPendingFormContext() {
    pendingFormContext = null;
}
