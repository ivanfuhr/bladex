import { insertComponent } from '../components/dom.js';

export function applyPrepend(operation) {
    const html = operation.html;

    if (typeof html !== 'string') {
        return false;
    }

    return insertComponent(operation.identifier, html, 'afterbegin');
}
