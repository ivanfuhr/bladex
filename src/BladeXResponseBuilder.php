<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX;

use Closure;
use Illuminate\Contracts\Support\MessageProvider;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Traits\Conditionable;
use Illuminate\Validation\ValidationException;
use Ivanfuhr\BladeX\Http\BladeXJsonResponse;
use Ivanfuhr\BladeX\Operations\AppendOperation;
use Ivanfuhr\BladeX\Operations\Operation;
use Ivanfuhr\BladeX\Operations\PrependOperation;
use Ivanfuhr\BladeX\Operations\RedirectOperation;
use Ivanfuhr\BladeX\Operations\RefreshOperation;
use Ivanfuhr\BladeX\Operations\RemoveOperation;
use Ivanfuhr\BladeX\Operations\ReplaceOperation;
use Ivanfuhr\BladeX\Support\ComponentRenderer;
use Ivanfuhr\BladeX\Support\ErrorPayload;
use Symfony\Component\HttpFoundation\Response;

class BladeXResponseBuilder implements Responsable
{
    use Conditionable;

    /**
     * @var list<Operation>
     */
    private array $operations = [];

    private int $status = Response::HTTP_OK;

    /**
     * @var list<Closure(JsonResponse): JsonResponse>
     */
    private array $responseCustomizers = [];

    /**
     * @var array<string, list<string>>
     */
    private array $errors = [];

    private bool $includeSessionErrors = false;

    /**
     * @var array<string, mixed>
     */
    private array $data = [];

    public function __construct(
        private readonly ComponentRenderer $componentRenderer,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function withData(array $data): self
    {
        $this->data = array_merge($this->data, $data);

        return $this;
    }

    public function refresh(Component $component): self
    {
        $this->operations[] = new RefreshOperation(
            $component->resolvedIdentifier(),
            $this->componentRenderer->render($component),
        );

        return $this;
    }

    public function replace(Component $from, Component $to): self
    {
        $this->operations[] = new ReplaceOperation(
            $from->resolvedIdentifier(),
            $this->componentRenderer->render($to),
        );

        return $this;
    }

    public function remove(Component $component): self
    {
        $this->operations[] = new RemoveOperation(
            $component->resolvedIdentifier(),
        );

        return $this;
    }

    public function append(Component $into, Component $content): self
    {
        $this->operations[] = new AppendOperation(
            $into->resolvedIdentifier(),
            $this->componentRenderer->render($content),
        );

        return $this;
    }

    public function prepend(Component $into, Component $content): self
    {
        $this->operations[] = new PrependOperation(
            $into->resolvedIdentifier(),
            $this->componentRenderer->render($content),
        );

        return $this;
    }

    public function navigate(string $url): self
    {
        $this->operations[] = new RedirectOperation($url);

        return $this;
    }

    public function status(int $code): self
    {
        $this->status = $code;

        return $this;
    }

    /**
     * @param  Closure(JsonResponse): JsonResponse  $callback
     */
    public function usingResponse(Closure $callback): self
    {
        $this->responseCustomizers[] = $callback;

        return $this;
    }

    /**
     * @param  MessageProvider|array<string, mixed>|Validator|ValidationException  $errors
     */
    public function withErrors(mixed $errors): self
    {
        $this->errors = ErrorPayload::merge(
            $this->errors,
            ErrorPayload::normalize($errors),
        );

        return $this;
    }

    public function withSessionErrors(): self
    {
        $this->includeSessionErrors = true;

        return $this;
    }

    /**
     * @return array<string, list<string>>
     */
    public function resolvedErrors(): array
    {
        $errors = [];

        if ($this->shouldIncludeSessionErrors()) {
            $errors = ErrorPayload::merge($errors, ErrorPayload::fromSessionDefaultBag());
        }

        return ErrorPayload::merge($errors, $this->errors);
    }

    private function shouldIncludeSessionErrors(): bool
    {
        if ($this->includeSessionErrors) {
            return true;
        }

        return (bool) config('bladex.include_session_errors', true);
    }

    /**
     * @return list<Operation>
     */
    public function operations(): array
    {
        return $this->operations;
    }

    /**
     * @return list<array<string, string>>
     */
    public function toOperationArray(): array
    {
        return array_map(
            fn (Operation $operation): array => $operation->toArray(),
            $this->operations,
        );
    }

    public function toResponse($request): BladeXJsonResponse
    {
        $response = BladeXJsonResponse::make(
            $this->data,
            $this->toOperationArray(),
            $this->resolvedErrors(),
            $this->status,
        );

        foreach ($this->responseCustomizers as $customizer) {
            $customized = $customizer($response);

            if ($customized instanceof BladeXJsonResponse) {
                $response = $customized;
            }
        }

        return $response;
    }
}
