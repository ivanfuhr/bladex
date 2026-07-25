<?php

declare(strict_types=1);

namespace Workbench\App\View\Components;

use Ivanfuhr\BladeX\Component;

class DemoChip extends Component
{
    public function identifier(): string|array
    {
        return 'demo.chip';
    }

    public function render(): string
    {
        return '<span>New chip</span>';
    }
}
