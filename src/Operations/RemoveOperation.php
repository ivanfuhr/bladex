<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Operations;

final class RemoveOperation implements Operation
{
    public function __construct(
        private readonly string $identifier,
    ) {}

    /**
     * @return array{type: string, identifier: string}
     */
    public function toArray(): array
    {
        return [
            'type' => 'remove',
            'identifier' => $this->identifier,
        ];
    }
}
