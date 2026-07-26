import { afterEach, describe, expect, it } from 'vitest';
import {
    applyFormErrors,
    clearFormFieldErrors,
    fieldNameMatchesErrorKey,
    fieldNameToErrorKey,
    normalizeErrors,
} from '../../src/forms/errors.js';

describe('forms/errors', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('maps bracket notation names to laravel error keys', () => {
        expect(fieldNameToErrorKey('title')).toBe('title');
        expect(fieldNameToErrorKey('user[email]')).toBe('user.email');
        expect(fieldNameMatchesErrorKey('user[email]', 'user.email')).toBe(
            true,
        );
    });

    it('sets data-error with the first message on matching fields', () => {
        document.body.innerHTML =
            '<form id="f">' +
            '<input name="title" />' +
            '<input name="user[email]" />' +
            '</form>';

        const form = document.querySelector('#f');

        applyFormErrors(form, {
            title: ['The title field is required.'],
            'user.email': ['Invalid email.'],
        });

        expect(form.querySelector('[name="title"]').getAttribute('data-error')).toBe(
            'The title field is required.',
        );
        expect(
            form.querySelector('[name="user[email]"]').getAttribute('data-error'),
        ).toBe('Invalid email.');
    });

    it('clears data-error from all form controls', () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" data-error="Old" /></form>';

        const form = document.querySelector('#f');

        clearFormFieldErrors(form);

        expect(form.querySelector('input').hasAttribute('data-error')).toBe(
            false,
        );
    });

    it('normalizes payload errors', () => {
        expect(
            normalizeErrors({
                errors: {
                    title: ['Required'],
                    empty: [],
                },
            }),
        ).toEqual({
            title: ['Required'],
        });
    });

    it('normalizes errors as a list of field entries', () => {
        expect(
            normalizeErrors({
                errors: [
                    {
                        name: 'user.email',
                        messages: ['Invalid email.'],
                    },
                ],
            }),
        ).toEqual({
            'user.email': ['Invalid email.'],
        });
    });

    it('still normalizes legacy laravel error objects for non-bladex 422 responses', () => {
        expect(
            normalizeErrors({
                errors: {
                    title: ['Required'],
                    empty: [],
                },
            }),
        ).toEqual({
            title: ['Required'],
        });
    });

    it('sets data-error-field and data-error on matching controls', () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" /></form>';

        const form = document.querySelector('#f');

        applyFormErrors(form, {
            title: ['The title field is required.'],
        });

        const input = form.querySelector('input');

        expect(input.getAttribute('data-error-field')).toBe('title');
        expect(input.getAttribute('data-error')).toBe(
            'The title field is required.',
        );
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });
});
