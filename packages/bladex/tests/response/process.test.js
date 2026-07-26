import { afterEach, describe, expect, it } from 'vitest';
import { setDomUpdateMode } from '../../src/components/dom-update-mode.js';
import { setPendingFormContext } from '../../src/forms/context.js';
import { processBladexResponse } from '../../src/response.js';

describe('processBladexResponse', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        setDomUpdateMode('morph');
    });

    it('applies operations then data-error on the submitting form', async () => {
        document.body.innerHTML =
            '<div data-component-identifier="ui.form">' +
            '<form id="f" data-post="/items">' +
            '<input name="title" value="Hi" />' +
            '</form>' +
            '</div>';

        const form = document.querySelector('#f');

        setPendingFormContext({ form: form, clearOnSuccess: false });

        const response = new Response(
            JSON.stringify({
                operations: [
                    {
                        type: 'refresh',
                        identifier: 'ui.form',
                        html:
                            '<div data-component-identifier="ui.form">' +
                            '<form id="f" data-post="/items">' +
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

        const input = document.querySelector('input[name="title"]');

        expect(input.getAttribute('data-error')).toBe(
            'The title field is required.',
        );
        expect(document.querySelector('.error')).not.toBeNull();
    });

    it('clears data-error when the response is successful', async () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" data-error="Old" /></form>';

        const form = document.querySelector('#f');

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

        expect(form.querySelector('input').hasAttribute('data-error')).toBe(
            false,
        );
    });

    it('applies data-error from laravel validation json without X-BladeX', async () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" /></form>';

        const form = document.querySelector('#f');

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

        expect(form.querySelector('input').getAttribute('data-error')).toBe(
            'The title field is required.',
        );
    });
});
