<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Exceptions;

use Exception;
use Ivanfuhr\BladeX\Component;

class RootElementMissingException extends Exception
{
    public function __construct(Component $component)
    {
        parent::__construct(sprintf(
            'BladeX components must render a single root HTML element. No root HTML element found for component: [%s].',
            $component->resolvedIdentifier(),
        ));
    }
}
