<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static \Ivanfuhr\BladeX\BladeX refresh(\Ivanfuhr\BladeX\Component $component)
 * @method static \Ivanfuhr\BladeX\BladeX replace(\Ivanfuhr\BladeX\Component $from, \Ivanfuhr\BladeX\Component $to)
 *
 * @see \Ivanfuhr\BladeX\BladeX
 */
class BladeX extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Ivanfuhr\BladeX\BladeX::class;
    }
}
