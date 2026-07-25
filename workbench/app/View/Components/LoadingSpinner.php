<?php

declare(strict_types=1);

namespace Workbench\App\View\Components;

use Ivanfuhr\BladeX\Component;

class LoadingSpinner extends Component
{
    public function identifier(): string|array
    {
        return 'demo.spinner';
    }

    public function render(): string
    {
        return '<div>Loading…</div>';
    }
}
