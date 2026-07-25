<?php

declare(strict_types=1);

namespace BladeX\BladeX\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \BladeX\BladeX\BladeX
 */
class BladeX extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \BladeX\BladeX\BladeX::class;
    }
}
