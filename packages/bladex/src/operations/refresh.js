import { swapComponent } from '../components/dom.js';

export function applyRefreshOrReplace(operation) {
    const html = operation.html;

    if (typeof html !== 'string') {
        return false;
    }

    return swapComponent(operation.identifier, html);
}
