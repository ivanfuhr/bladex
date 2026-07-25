<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Operations;

interface Operation
{
    /**
     * @return array<string, string>
     */
    public function toArray(): array;
}
