import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseComponentHtml } from '../../src/components/parse-html.js';

describe('parseComponentHtml', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('parses a single root element with a matching identifier', () => {
        const element = parseComponentHtml(
            '<div data-component-identifier="ui.panel">Hello</div>',
            'ui.panel',
        );

        expect(element).not.toBeNull();
        expect(element?.getAttribute('data-component-identifier')).toBe(
            'ui.panel',
        );
        expect(element?.textContent).toBe('Hello');
    });

    it('rejects multiple root elements', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(
            parseComponentHtml(
                '<div data-component-identifier="a"></div><div data-component-identifier="b"></div>',
                'a',
            ),
        ).toBeNull();

        expect(error).toHaveBeenCalled();
    });

    it('rejects identifier mismatches', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(
            parseComponentHtml(
                '<div data-component-identifier="other">Hello</div>',
                'ui.panel',
            ),
        ).toBeNull();

        expect(error).toHaveBeenCalled();
    });
});
