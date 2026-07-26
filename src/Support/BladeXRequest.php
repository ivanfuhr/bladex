<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BladeXRequest
{
    public const string REQUEST_HEADER = 'X-BladeX-Request';

    public const string RESPONSE_HEADER = 'X-BladeX';

    public static function wantsBladex(Request $request): bool
    {
        if ($request->headers->get(self::REQUEST_HEADER) === 'true') {
            return true;
        }

        if (! (bool) config('bladex.treat_json_validation_as_bladex', true)) {
            return false;
        }

        return $request->expectsJson();
    }

    /**
     * @return array<string, list<string>>
     */
    public static function validationErrors(ValidationException $exception): array
    {
        return ErrorPayload::normalize($exception);
    }

    public static function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        $errors = self::validationErrors($exception);

        $payload = [
            'operations' => [],
        ];

        ErrorPayload::appendToPayload($payload, $errors);

        return response()
            ->json($payload, $exception->status)
            ->header(self::RESPONSE_HEADER, 'true');
    }
}
