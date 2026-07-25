<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Ivanfuhr\BladeX\Operations\AppendOperation;
use Ivanfuhr\BladeX\Operations\Operation;
use Ivanfuhr\BladeX\Operations\PrependOperation;
use Ivanfuhr\BladeX\Operations\RedirectOperation;
use Ivanfuhr\BladeX\Operations\RefreshOperation;
use Ivanfuhr\BladeX\Operations\RemoveOperation;
use Ivanfuhr\BladeX\Operations\ReplaceOperation;
use Ivanfuhr\BladeX\Support\ComponentRenderer;

class BladeX implements Responsable
{
    /**
     * @var list<Operation>
     */
    private array $operations = [];

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
        return response()
            ->json([
                'operations' => $this->toOperationArray(),
            ])
            ->header('X-BladeX', 'true');
    }
}
