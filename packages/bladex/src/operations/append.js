import { insertComponent } from '../components/dom.js';

export function applyAppend(operation) {
    const html = operation.html;

    if (typeof html !== 'string') {
        return false;
    }

    return insertComponent(operation.identifier, html, 'beforeend');
}
