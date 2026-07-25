<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX;

use Closure;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Traits\Conditionable;
use Ivanfuhr\BladeX\Operations\AppendOperation;
use Ivanfuhr\BladeX\Operations\Operation;
use Ivanfuhr\BladeX\Operations\PrependOperation;
use Ivanfuhr\BladeX\Operations\RedirectOperation;
use Ivanfuhr\BladeX\Operations\RefreshOperation;
use Ivanfuhr\BladeX\Operations\RemoveOperation;
use Ivanfuhr\BladeX\Operations\ReplaceOperation;
use Ivanfuhr\BladeX\Support\ComponentRenderer;
use Symfony\Component\HttpFoundation\Response;

class BladeX implements Responsable
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

    public function __construct(
        private readonly ComponentRenderer $componentRenderer,
    ) {}

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

    public function redirect(string $url): self
    {
        $this->operations[] = new RedirectOperation($url);

        return $this;
    }

    public function status(int $code): self
    {
        $this->status = $code;

        return $this;
    }

    public function ok(): self
    {
        return $this->status(Response::HTTP_OK);
    }

    public function created(): self
    {
        return $this->status(Response::HTTP_CREATED);
    }

    public function accepted(): self
    {
        return $this->status(Response::HTTP_ACCEPTED);
    }

    public function badRequest(): self
    {
        return $this->status(Response::HTTP_BAD_REQUEST);
    }

    public function unauthorized(): self
    {
        return $this->status(Response::HTTP_UNAUTHORIZED);
    }

    public function forbidden(): self
    {
        return $this->status(Response::HTTP_FORBIDDEN);
    }

    public function notFound(): self
    {
        return $this->status(Response::HTTP_NOT_FOUND);
    }

    public function conflict(): self
    {
        return $this->status(Response::HTTP_CONFLICT);
    }

    public function unprocessableEntity(): self
    {
        return $this->status(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function tooManyRequests(): self
    {
        return $this->status(Response::HTTP_TOO_MANY_REQUESTS);
    }

    public function serverError(): self
    {
        return $this->status(Response::HTTP_INTERNAL_SERVER_ERROR);
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

    public function toResponse($request): JsonResponse
    {
        $response = response()
            ->json(
                [
                    'operations' => $this->toOperationArray(),
                ],
                $this->status,
            )
            ->header('X-BladeX', 'true');

        foreach ($this->responseCustomizers as $customizer) {
            $response = $customizer($response);
        }

        return $response;
    }
}
