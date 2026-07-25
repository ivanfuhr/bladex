<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Ivanfuhr\BladeX\BladeX
 */
class BladeX extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Ivanfuhr\BladeX\BladeX::class;
    }
}
