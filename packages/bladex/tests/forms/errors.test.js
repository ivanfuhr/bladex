import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    dispatchValidationCleared,
    dispatchValidationFailed,
    fieldNameMatchesErrorKey,
    fieldNameToErrorKey,
    normalizeErrors,
    resolveFieldsForErrors,
    VALIDATION_CLEARED_EVENT,
    VALIDATION_FAILED_EVENT,
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

    it('dispatches validation-failed on each matching control', () => {
        document.body.innerHTML =
            '<form id="f">' +
            '<input name="title" />' +
            '<input name="user[email]" />' +
            '</form>';

        const form = document.querySelector('#f');
        const titleInput = form.querySelector('[name="title"]');
        const emailInput = form.querySelector('[name="user[email]"]');
        const titleListener = vi.fn();
        const emailListener = vi.fn();

        titleInput.addEventListener(VALIDATION_FAILED_EVENT, titleListener);
        emailInput.addEventListener(VALIDATION_FAILED_EVENT, emailListener);

        dispatchValidationFailed(form, {
            title: ['The title field is required.'],
            'user.email': ['Invalid email.'],
        });

        expect(titleListener).toHaveBeenCalledTimes(1);
        expect(titleListener.mock.calls[0][0].detail).toEqual({
            form: form,
            control: titleInput,
            field: 'title',
            messages: ['The title field is required.'],
        });
        expect(emailListener).toHaveBeenCalledTimes(1);
        expect(emailListener.mock.calls[0][0].detail.field).toBe('user.email');
        expect(emailListener.mock.calls[0][0].bubbles).toBe(true);
    });

    it('dispatches validation-cleared on each form control', () => {
        document.body.innerHTML =
            '<form id="f"><input name="title" /><button type="button">x</button></form>';

        const form = document.querySelector('#f');
        const inputs = [...form.elements].filter(
            (element) => element instanceof HTMLElement,
        );
        const listener = vi.fn();

        for (const control of inputs) {
            control.addEventListener(VALIDATION_CLEARED_EVENT, listener);
        }

        dispatchValidationCleared(form, 'submit');

        expect(listener).toHaveBeenCalledTimes(inputs.length);
        expect(listener.mock.calls[0][0].detail).toEqual({
            form: form,
            control: inputs[0],
            reason: 'submit',
        });
    });

    it('normalizes payload errors with all messages', () => {
        expect(
            normalizeErrors({
                errors: {
                    title: ['Required', 'Too short'],
                    empty: [],
                },
            }),
        ).toEqual({
            title: ['Required', 'Too short'],
        });
    });

    it('normalizes errors as a list of field entries', () => {
        expect(
            normalizeErrors({
                errors: [
                    {
                        name: 'user.email',
                        messages: ['Invalid email.', 'Must be unique.'],
                    },
                ],
            }),
        ).toEqual({
            'user.email': ['Invalid email.', 'Must be unique.'],
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

    it('resolveFieldsForErrors includes all matching controls', () => {
        document.body.innerHTML =
            '<form id="f">' +
            '<input type="radio" name="choice" value="a" />' +
            '<input type="radio" name="choice" value="b" />' +
            '</form>';

        const form = document.querySelector('#f');

        const fields = resolveFieldsForErrors(form, {
            choice: ['Pick one.'],
        });

        expect(fields.choice).toHaveLength(2);
    });

    it('dispatches validation-failed on each radio for the same field', () => {
        document.body.innerHTML =
            '<form id="f">' +
            '<input type="radio" name="choice" value="a" />' +
            '<input type="radio" name="choice" value="b" />' +
            '</form>';

        const form = document.querySelector('#f');
        const listener = vi.fn();

        document.addEventListener(VALIDATION_FAILED_EVENT, listener);

        dispatchValidationFailed(form, {
            choice: ['Pick one.'],
        });

        expect(listener).toHaveBeenCalledTimes(2);
    });
});
