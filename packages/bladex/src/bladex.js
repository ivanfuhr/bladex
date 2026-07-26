import {
    bootDeclarativeActions,
    unbootDeclarativeActions,
} from './actions/boot.js';
import {
    componentFromElement,
    componentFromIdentifier,
} from './components/find.js';
import {
    fetch,
    installFetchProxy,
    uninstallFetchProxy,
} from './fetch/proxy.js';
import { apply } from './operations/index.js';
import { processBladexResponse } from './response.js';
import {
    dispatchValidationCleared,
    dispatchValidationFailed,
    normalizeErrors,
    resolveFieldsForErrors,
    VALIDATION_CLEARED_EVENT,
    VALIDATION_FAILED_EVENT,
} from './forms/errors.js';

export const Bladex = {
    apply,
    processBladexResponse,
    dispatchValidationFailed,
    dispatchValidationCleared,
    normalizeErrors,
    resolveFieldsForErrors,
    VALIDATION_FAILED_EVENT,
    VALIDATION_CLEARED_EVENT,
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
