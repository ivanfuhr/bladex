<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Operations;

final class ReplaceOperation implements Operation
{
    public function __construct(
        private readonly string $identifier,
        private readonly string $html,
    ) {}

    /**
     * @return array{type: string, identifier: string, html: string}
     */
    public function toArray(): array
    {
        return [
            'type' => 'replace',
            'identifier' => $this->identifier,
            'html' => $this->html,
        ];
    }
}
