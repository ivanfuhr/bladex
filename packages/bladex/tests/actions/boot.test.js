import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();

vi.mock('../../src/fetch/proxy.js', () => ({
    fetch: (...args) => fetchMock(...args),
}));

import {
    bootDeclarativeActions,
    unbootDeclarativeActions,
} from '../../src/actions/boot.js';

describe('declarative actions / data-loading', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        bootDeclarativeActions();
    });

    afterEach(() => {
        unbootDeclarativeActions();
        document.body.innerHTML = '';
    });

    it('sets data-loading while the request is in flight', () => {
        fetchMock.mockImplementation(function () {
            return new Promise(function () {});
        });

        document.body.innerHTML =
            '<button type="button" data-post="/items">Save</button>';

        const button = document.querySelector('button');

        button.click();

        expect(button.hasAttribute('data-loading')).toBe(true);
    });

    it('removes data-loading after the request finishes', async () => {
        fetchMock.mockResolvedValue(new Response('{}'));

        document.body.innerHTML =
            '<button type="button" data-post="/items">Save</button>';

        const button = document.querySelector('button');

        button.click();

        await vi.waitFor(function () {
            expect(button.hasAttribute('data-loading')).toBe(false);
        });
    });

    it('removes data-loading when the request fails', async () => {
        fetchMock.mockRejectedValue(new Error('network'));

        document.body.innerHTML =
            '<button type="button" data-post="/items">Save</button>';

        const button = document.querySelector('button');

        button.click();

        await vi.waitFor(function () {
            expect(button.hasAttribute('data-loading')).toBe(false);
        });
    });

    it('disables form controls while a form request is in flight', () => {
        fetchMock.mockImplementation(function () {
            return new Promise(function () {});
        });

        document.body.innerHTML =
            '<form data-post="/items">' +
            '<input name="title" />' +
            '<button type="submit">Save</button>' +
            '</form>';

        const form = document.querySelector('form');
        const input = document.querySelector('input');
        const submit = document.querySelector('button[type="submit"]');

        form.requestSubmit(submit);

        expect(form.hasAttribute('data-loading')).toBe(true);
        expect(input.disabled).toBe(true);
        expect(submit.disabled).toBe(true);
    });

    it('restores form controls and leaves previously disabled fields disabled', async () => {
        fetchMock.mockResolvedValue(new Response('{}'));

        document.body.innerHTML =
            '<form data-post="/items">' +
            '<input name="locked" disabled />' +
            '<input name="title" />' +
            '<button type="submit">Save</button>' +
            '</form>';

        const form = document.querySelector('form');
        const locked = document.querySelector('input[name="locked"]');
        const title = document.querySelector('input[name="title"]');
        const submit = document.querySelector('button[type="submit"]');

        form.requestSubmit(submit);

        await vi.waitFor(function () {
            expect(form.hasAttribute('data-loading')).toBe(false);
            expect(title.disabled).toBe(false);
            expect(submit.disabled).toBe(false);
            expect(locked.disabled).toBe(true);
        });
    });
});
