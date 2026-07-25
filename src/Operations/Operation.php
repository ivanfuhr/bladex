<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Operations;

interface Operation
{
    /**
     * @return array{type: string, identifier: string, html: string}
     */
    public function toArray(): array;
}
