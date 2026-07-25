<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Illuminate\View\Compilers\BladeCompiler;
use Ivanfuhr\BladeX\Component;

class ComponentRenderer
{
    public function __construct(
        private readonly BladeCompiler $bladeCompiler,
    ) {}

    public function render(Component $component): string
    {
        return $this->bladeCompiler->renderComponent($component);
    }
}
