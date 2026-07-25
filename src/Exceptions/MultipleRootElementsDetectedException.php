<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Exceptions;

use Exception;
use Ivanfuhr\BladeX\Component;

class MultipleRootElementsDetectedException extends Exception
{
    public function __construct(Component $component)
    {
        parent::__construct(sprintf(
            'BladeX components must have a single root HTML element. Multiple root elements detected for component: [%s].',
            self::formatIdentifier($component),
        ));
    }

    private static function formatIdentifier(Component $component): string
    {
        $identifier = $component->identifier();

        if (is_array($identifier)) {
            return implode('.', $identifier);
        }

        return $identifier;
    }
}
