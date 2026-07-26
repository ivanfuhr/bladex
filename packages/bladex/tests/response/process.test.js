import { afterEach, describe, expect, it, vi } from 'vitest';
import { setDomUpdateMode } from '../../src/components/dom-update-mode.js';
import { VALIDATION_CLEARED_EVENT, VALIDATION_FAILED_EVENT } from '../../src/forms/errors.js';
import { setPendingFormContext } from '../../src/forms/context.js';
import { processBladexResponse } from '../../src/response.js';

describe('processBladexResponse', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        setDomUpdateMode('morph');
    });

    it('applies operations then dispatches validation-failed on the submitting form', async () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.form">' +
            '<form id="f" data-fetch="/items" data-method="post">' +
            '<input name="title" value="Hi" />' +
            '</form>' +
            '</div>';

        const form = document.querySelector('#f');
        const input = form.querySelector('input[name="title"]');
        const listener = vi.fn();

        input.addEventListener(VALIDATION_FAILED_EVENT, listener);

        setPendingFormContext({ form: form, clearOnSuccess: false });

        const response = new Response(
            JSON.stringify({
                operations: [
                    {
                        type: 'refresh',
                        identifier: 'ui.form',
                        html:
                            '<div data-component-identifier="ui.form">' +
                            '<form id="f" data-fetch="/items" data-method="post">' +
                            '<input name="title" value="Hi" />' +
                            '<p class="error">Too short</p>' +
                            '</form>' +
                            '</div>',
                    },
                ],
                errors: {
                    title: ['The title field is required.'],
                },
            }),
            {
                status: 422,
                headers: { 'X-BladeX': 'true', 'Content-Type': 'application/json' },
            },
        );

        await processBladexResponse(response);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].detail).toMatchObject({
            field: 'title',
            messages: ['The title field is required.'],
        });
        expect(document.querySelector('.error')).not.toBeNull();
    });

    it('dispatches validation-cleared when the response is successful', async () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" /></form>';

        const form = document.querySelector('#f');
        const input = form.querySelector('input');
        const listener = vi.fn();

        input.addEventListener(VALIDATION_CLEARED_EVENT, listener);

        setPendingFormContext({ form: form, clearOnSuccess: true });

        const response = new Response(
            JSON.stringify({
                operations: [],
            }),
            {
                status: 200,
                headers: { 'X-BladeX': 'true', 'Content-Type': 'application/json' },
            },
        );

        await processBladexResponse(response);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].detail.reason).toBe('success');
    });

    it('dispatches validation-failed from laravel validation json without X-BladeX', async () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" /></form>';

        const form = document.querySelector('#f');
        const input = form.querySelector('input[name="title"]');
        const listener = vi.fn();

        input.addEventListener(VALIDATION_FAILED_EVENT, listener);

        setPendingFormContext({ form: form, clearOnSuccess: false });

        const response = new Response(
            JSON.stringify({
                message: 'The title field is required.',
                errors: {
                    title: ['The title field is required.'],
                },
            }),
            {
                status: 422,
                headers: { 'Content-Type': 'application/json' },
            },
        );

        await processBladexResponse(response);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].detail.messages).toEqual([
            'The title field is required.',
        ]);
    });
});
