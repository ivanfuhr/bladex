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
    applyFormErrors,
    clearFormFieldErrors,
} from './forms/errors.js';

export const Bladex = {
    apply,
    processBladexResponse,
    applyFormErrors,
    clearFormFieldErrors,
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
