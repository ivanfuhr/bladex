import { afterEach, describe, expect, it } from 'vitest';
import { mergeRequestInit } from '../../src/fetch/request.js';
import { isBladexResponse } from '../../src/fetch/proxy.js';

describe('fetch/request', () => {
    afterEach(() => {
        document.head.innerHTML = '';
    });

    it('adds default Accept header', () => {
        const init = mergeRequestInit(undefined);

        expect(init.headers.get('Accept')).toBe('application/json');
    });

    it('adds CSRF and X-Requested-With for mutation requests', () => {
        document.head.innerHTML =
            '<meta name="csrf-token" content="test-token">';

        const init = mergeRequestInit({ method: 'POST' });

        expect(init.headers.get('X-CSRF-TOKEN')).toBe('test-token');
        expect(init.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    });
});

describe('fetch/proxy', () => {
    it('detects BladeX responses by header', () => {
        const response = new Response('{}', {
            headers: { 'X-BladeX': 'true' },
        });

        expect(isBladexResponse(response)).toBe(true);
        expect(
            isBladexResponse(
                new Response('{}', { headers: { 'X-BladeX': 'false' } }),
            ),
        ).toBe(false);
    });
});
