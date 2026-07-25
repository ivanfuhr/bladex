<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX;

use Illuminate\View\Component as BaseComponent;

abstract class Component extends BaseComponent
{
    /**
     * @return string|array<int, string>
     */
    abstract public function identifier(): string|array;
}
