<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Http;

use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Ivanfuhr\BladeX\Support\BladeXRequest;
use Ivanfuhr\BladeX\Support\ErrorPayload;

class BladeXJsonResponse extends JsonResponse
{
    /**
     * @param  array<string, mixed>  $data
     * @param  list<array<string, string>>  $operations
     * @param  array<string, list<string>>  $errors
     */
    public static function make(
        array $data,
        array $operations,
        array $errors,
        int $status = self::HTTP_OK,
    ): self {
        $payload = self::withoutReservedKeys($data);
        $payload['operations'] = $operations;

        ErrorPayload::appendToPayload($payload, $errors);

        $response = new self($payload, $status);
        $response->headers->set(BladeXRequest::RESPONSE_HEADER, 'true');

        return $response;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromValidationException(
        ValidationException $exception,
        array $data = [],
    ): self {
        return self::make(
            $data,
            [],
            ErrorPayload::normalize($exception),
            $exception->status,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function withoutReservedKeys(array $data): array
    {
        unset($data['operations'], $data['errors']);

        return $data;
    }
}
