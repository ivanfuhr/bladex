import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    componentFromIdentifier,
    elementsFromIdentifier,
    uniqueElementFromIdentifier,
} from '../../src/components/find.js';

describe('components/find', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('returns no elements for an empty identifier', () => {
        expect(elementsFromIdentifier('')).toEqual([]);
    });

    it('finds a unique component by identifier', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.alert">Alert</div>';

        const element = uniqueElementFromIdentifier('ui.alert');

        expect(element).not.toBeNull();
        expect(element?.getAttribute('data-component-identifier')).toBe(
            'ui.alert',
        );
    });

    it('logs and returns null when no component matches', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(uniqueElementFromIdentifier('missing')).toBeNull();
        expect(error).toHaveBeenCalledWith(
            '[Bladex] No component found for identifier:',
            'missing',
        );
    });

    it('logs and returns null when multiple components match', () => {
        document.body.innerHTML = [
            '<div data-component-identifier="dup">One</div>',
            '<div data-component-identifier="dup">Two</div>',
        ].join('');

        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(uniqueElementFromIdentifier('dup')).toBeNull();
        expect(error).toHaveBeenCalledWith(
            '[Bladex] Multiple components found for identifier:',
            'dup',
        );
    });

    it('returns component metadata from identifier', () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.chip">Chip</div>';

        const component = componentFromIdentifier('ui.chip');

        expect(component).toEqual({
            element: expect.any(Element),
            identifier: 'ui.chip',
        });
    });
});
