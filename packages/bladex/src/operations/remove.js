import { removeComponent } from '../components/dom.js';

export function applyRemove(operation) {
    return removeComponent(operation.identifier);
}
