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

export const Bladex = {
    apply,
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
