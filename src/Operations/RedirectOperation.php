<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Operations;

final class RedirectOperation implements Operation
{
    public function __construct(
        private readonly string $url,
    ) {}

    /**
     * @return array{type: string, url: string}
     */
    public function toArray(): array
    {
        return [
            'type' => 'redirect',
            'url' => $this->url,
        ];
    }
}
