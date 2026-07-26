import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apply, applyOperation } from '../../src/operations/index.js';
import {
    getDomUpdateMode,
    setDomUpdateMode,
} from '../../src/components/dom-update-mode.js';

describe('operations', () => {
    /** @type {DomUpdateMode} */
    let previousMode;

    beforeEach(() => {
        previousMode = getDomUpdateMode();
        setDomUpdateMode('morph');
    });

    afterEach(() => {
        setDomUpdateMode(previousMode);
        document.body.innerHTML = '';
    });

    it('rejects invalid payloads', () => {
        expect(apply(null)).toBe(false);
        expect(apply({})).toBe(false);
        expect(apply({ operations: 'nope' })).toBe(false);
    });

    it('refreshes a component with html', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.panel">Old</div>';

        const applied = applyOperation({
            type: 'refresh',
            identifier: 'ui.panel',
            html: '<div data-component-identifier="ui.panel">New</div>',
        });

        expect(applied).toBe(true);
        expect(document.body.textContent).toBe('New');
    });

    it('removes a component', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.panel">Remove me</div>';

        expect(
            applyOperation({
                type: 'remove',
                identifier: 'ui.panel',
            }),
        ).toBe(true);

        expect(document.querySelector('[data-component-identifier]')).toBeNull();
    });

    it('rejects operations without a valid identifier', () => {
        expect(
            applyOperation({
                type: 'remove',
                identifier: '',
            }),
        ).toBe(false);
    });

    it('rejects unknown operation types', () => {
        expect(
            applyOperation({
                type: 'unknown',
                identifier: 'ui.panel',
            }),
        ).toBe(false);
    });

    it('applies multiple operations in order', () => {
        document.body.innerHTML = [
            '<div data-component-identifier="a">A</div>',
            '<div data-component-identifier="b">B</div>',
        ].join('');

        expect(
            apply({
                operations: [
                    {
                        type: 'replace',
                        identifier: 'a',
                        html: '<div data-component-identifier="a">A2</div>',
                    },
                    { type: 'remove', identifier: 'b' },
                ],
            }),
        ).toBe(true);

        expect(document.body.textContent).toBe('A2');
        expect(
            document.querySelector('[data-component-identifier="b"]'),
        ).toBeNull();
    });
});
