<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Foundation\Exceptions\Handler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegistersValidationExceptionRendering
{
    public function register(ExceptionHandler $handler): void
    {
        if (! $handler instanceof Handler) {
            return;
        }

        $handler->renderable(function (ValidationException $exception, Request $request) {
            if (! BladeXRequest::wantsBladex($request)) {
                return null;
            }

            return BladeXRequest::validationErrorResponse($exception);
        });
    }
}
