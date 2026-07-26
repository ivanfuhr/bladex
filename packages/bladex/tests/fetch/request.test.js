import { describe, expect, it } from 'vitest';
import { mergeRequestInit } from '../../src/fetch/request.js';

describe('fetch/request bladex header', () => {
    it('sends X-BladeX-Request on proxied fetch requests', () => {
        const init = mergeRequestInit({ method: 'POST' });

        expect(init.headers.get('X-BladeX-Request')).toBe('true');
    });
});
