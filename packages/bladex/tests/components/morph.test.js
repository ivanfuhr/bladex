import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { swapComponent } from '../../src/components/dom.js';
import {
    getDomUpdateMode,
    setDomUpdateMode,
} from '../../src/components/dom-update-mode.js';

describe('swapComponent morph', () => {
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

    it('preserves the root element reference when only child content changes', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.form"><input name="title" value="Hi" /></div>';

        const root = document.querySelector(
            '[data-component-identifier="ui.form"]',
        );
        const input = document.querySelector('input');

        input?.focus();

        swapComponent(
            'ui.form',
            '<div data-component-identifier="ui.form"><input name="title" value="Hi" /><p class="error">Too short</p></div>',
        );

        const rootAfter = document.querySelector(
            '[data-component-identifier="ui.form"]',
        );

        expect(rootAfter).toBe(root);
        expect(document.querySelector('.error')?.textContent).toBe(
            'Too short',
        );
        expect(document.activeElement).toBe(
            document.querySelector('input'),
        );
    });

    it('updates input values from server html', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.form"><input name="title" value="Old" /></div>';

        swapComponent(
            'ui.form',
            '<div data-component-identifier="ui.form"><input name="title" value="New" /></div>',
        );

        expect(document.querySelector('input')?.value).toBe('New');
    });
});
