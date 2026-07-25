<?php

declare(strict_types=1);

namespace Workbench\App\View\Components;

use Ivanfuhr\BladeX\Component;

class DemoSlot extends Component
{
    public function identifier(): string|array
    {
        return 'demo.slot';
    }

    public function render(): string
    {
        return '<div>Insertion anchor</div>';
    }
}
