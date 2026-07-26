import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { swapComponent } from '../../src/components/dom.js';
import {
    getDomUpdateMode,
    setDomUpdateMode,
} from '../../src/components/dom-update-mode.js';

describe('swapComponent fallback', () => {
    /** @type {DomUpdateMode} */
    let previousMode;

    beforeEach(() => {
        previousMode = getDomUpdateMode();
        setDomUpdateMode('morph');
    });

    afterEach(() => {
        setDomUpdateMode(previousMode);
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('falls back to replace when html has an identifier mismatch', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.panel">Old</div>';

        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(
            swapComponent(
                'ui.panel',
                '<div data-component-identifier="ui.other">New</div>',
            ),
        ).toBe(true);

        expect(error).toHaveBeenCalled();
        expect(document.body.textContent).toBe('New');
    });
});

describe('swapComponent replace mode', () => {
    /** @type {DomUpdateMode} */
    let previousMode;

    beforeEach(() => {
        previousMode = getDomUpdateMode();
        setDomUpdateMode('replace');
    });

    afterEach(() => {
        setDomUpdateMode(previousMode);
        document.body.innerHTML = '';
    });

    it('replaces the root via outerHTML', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.panel">Old</div>';

        const root = document.querySelector(
            '[data-component-identifier="ui.panel"]',
        );

        swapComponent(
            'ui.panel',
            '<div data-component-identifier="ui.panel">New</div>',
        );

        const rootAfter = document.querySelector(
            '[data-component-identifier="ui.panel"]',
        );

        expect(document.body.textContent).toBe('New');
        expect(rootAfter).not.toBe(root);
    });
});
