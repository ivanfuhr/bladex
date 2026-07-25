import { applyAppend } from './append.js';
import { applyPrepend } from './prepend.js';
import { applyRedirect } from './redirect.js';
import { applyRefreshOrReplace } from './refresh.js';
import { applyRemove } from './remove.js';

export function applyOperation(operation) {
    if (operation === null || typeof operation !== 'object') {
        return false;
    }

    const type = operation.type;

    if (type === 'redirect') {
        return applyRedirect(operation);
    }

    const identifier = operation.identifier;

    if (typeof identifier !== 'string' || identifier === '') {
        return false;
    }

    if (type === 'refresh' || type === 'replace') {
        return applyRefreshOrReplace(operation);
    }

    if (type === 'remove') {
        return applyRemove(operation);
    }

    if (type === 'append') {
        return applyAppend(operation);
    }

    if (type === 'prepend') {
        return applyPrepend(operation);
    }

    return false;
}

export function apply(payload) {
    const operations =
        payload !== null &&
        typeof payload === 'object' &&
        Array.isArray(payload.operations)
            ? payload.operations
            : null;

    if (operations === null) {
        return false;
    }

    let applied = true;

    for (let index = 0; index < operations.length; index++) {
        if (!applyOperation(operations[index])) {
            applied = false;
        }
    }

    return applied;
}
