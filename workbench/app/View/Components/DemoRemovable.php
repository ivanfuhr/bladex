<?php

declare(strict_types=1);

namespace Workbench\App\View\Components;

use Ivanfuhr\BladeX\Component;

class DemoRemovable extends Component
{
    public function identifier(): string|array
    {
        return 'demo.removable';
    }

    public function render(): string
    {
        return '<div>Remove me</div>';
    }
}
