<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Illuminate\Contracts\Support\MessageBag;
use Illuminate\Contracts\Support\MessageProvider;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\ViewErrorBag;
use Illuminate\Validation\ValidationException;

class ErrorPayload
{
    /**
     * @return array<string, list<string>>
     */
    public static function fromSessionDefaultBag(): array
    {
        $errors = session('errors');

        if (! $errors instanceof ViewErrorBag) {
            return [];
        }

        return self::normalizeMessageBag($errors->getBag('default'));
    }

    /**
     * @return array<string, list<string>>
     */
    public static function normalize(mixed $provider): array
    {
        if ($provider instanceof ValidationException) {
            return self::normalizeArray($provider->errors());
        }

        if ($provider instanceof Validator) {
            return self::normalizeMessageBag($provider->errors());
        }

        if ($provider instanceof MessageProvider) {
            return self::normalizeMessageBag($provider->getMessageBag());
        }

        if ($provider instanceof MessageBag) {
            return self::normalizeMessageBag($provider);
        }

        if (is_array($provider)) {
            return self::normalizeArray($provider);
        }

        return [];
    }

    /**
     * @param  array<string, list<string>>  $base
     * @param  array<string, list<string>>  $override
     * @return array<string, list<string>>
     */
    public static function merge(array $base, array $override): array
    {
        foreach ($override as $key => $messages) {
            $base[$key] = $messages;
        }

        return $base;
    }

    /**
     * @param  array<string, list<string>>  $errors
     * @return list<array{name: string, messages: list<string>}>
     */
    public static function toFieldErrorsList(array $errors): array
    {
        $fieldErrors = [];

        foreach ($errors as $name => $messages) {
            if ($messages === []) {
                continue;
            }

            $fieldErrors[] = [
                'name' => $name,
                'messages' => $messages,
            ];
        }

        return $fieldErrors;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, list<string>>  $errors
     */
    public static function appendToPayload(array &$payload, array $errors): void
    {
        $list = self::toFieldErrorsList($errors);

        if ($list === []) {
            return;
        }

        $payload['errors'] = $list;
    }

    /**
     * @param  array<string, mixed>  $errors
     * @return array<string, list<string>>
     */
    private static function normalizeArray(array $errors): array
    {
        $normalized = [];

        foreach ($errors as $key => $messages) {
            $normalized[$key] = self::normalizeMessages($messages);
        }

        return $normalized;
    }

    /**
     * @return array<string, list<string>>
     */
    private static function normalizeMessageBag(MessageBag $bag): array
    {
        $normalized = [];

        foreach ($bag->getMessages() as $key => $messages) {
            $normalized[$key] = self::normalizeMessages($messages);
        }

        return $normalized;
    }

    /**
     * @return list<string>
     */
    private static function normalizeMessages(mixed $messages): array
    {
        if (is_string($messages)) {
            return [$messages];
        }

        if (! is_array($messages)) {
            return [];
        }

        $strings = [];

        foreach ($messages as $message) {
            if (is_string($message) && $message !== '') {
                $strings[] = $message;
            }
        }

        return $strings;
    }
}
