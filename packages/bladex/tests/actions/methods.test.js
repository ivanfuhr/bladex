import { describe, expect, it, vi } from 'vitest';
import {
    ACTION_SELECTOR,
    resolveHttpMethod,
    resolveRequest,
} from '../../src/actions/methods.js';

describe('declarative actions / resolveRequest', () => {
    it('uses ACTION_SELECTOR for data-fetch', () => {
        expect(ACTION_SELECTOR).toBe('[data-fetch]');
    });

    it('returns null when data-fetch is missing or empty', () => {
        document.body.innerHTML = '<button type="button">Save</button>';

        expect(resolveRequest(document.querySelector('button'))).toBeNull();

        document.body.innerHTML =
            '<button type="button" data-fetch="">Save</button>';

        expect(resolveRequest(document.querySelector('button'))).toBeNull();
    });

    it('defaults to GET when data-method is absent', () => {
        document.body.innerHTML =
            '<a data-fetch="/items">Refresh</a>';

        expect(resolveRequest(document.querySelector('a'))).toEqual({
            url: '/items',
            method: 'GET',
        });
    });

    it('normalizes data-method case', () => {
        document.body.innerHTML =
            '<button type="button" data-fetch="/items" data-method="post">Save</button>';

        expect(resolveRequest(document.querySelector('button'))).toEqual({
            url: '/items',
            method: 'POST',
        });
    });

    it('accepts PATCH and other allowed methods', () => {
        document.body.innerHTML =
            '<form data-fetch="/items/1" data-method="patch"></form>';

        expect(resolveRequest(document.querySelector('form'))).toEqual({
            url: '/items/1',
            method: 'PATCH',
        });
    });

    it('warns and falls back to GET for unknown data-method', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(function () {});

        document.body.innerHTML =
            '<button type="button" data-fetch="/x" data-method="TRACE">Go</button>';

        expect(resolveHttpMethod(document.querySelector('button'))).toBe('GET');
        expect(resolveRequest(document.querySelector('button'))).toEqual({
            url: '/x',
            method: 'GET',
        });
        expect(warn).toHaveBeenCalled();

        warn.mockRestore();
    });
});
