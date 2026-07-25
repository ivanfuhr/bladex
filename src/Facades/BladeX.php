<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static \Ivanfuhr\BladeX\BladeX refresh(\Ivanfuhr\BladeX\Component $component)
 * @method static \Ivanfuhr\BladeX\BladeX replace(\Ivanfuhr\BladeX\Component $from, \Ivanfuhr\BladeX\Component $to)
 * @method static \Ivanfuhr\BladeX\BladeX remove(\Ivanfuhr\BladeX\Component $component)
 * @method static \Ivanfuhr\BladeX\BladeX append(\Ivanfuhr\BladeX\Component $into, \Ivanfuhr\BladeX\Component $content)
 * @method static \Ivanfuhr\BladeX\BladeX prepend(\Ivanfuhr\BladeX\Component $into, \Ivanfuhr\BladeX\Component $content)
 * @method static \Ivanfuhr\BladeX\BladeX redirect(string $url)
 * @method static \Ivanfuhr\BladeX\BladeX when(mixed $value = null, ?callable $callback = null, ?callable $default = null)
 * @method static \Ivanfuhr\BladeX\BladeX unless(mixed $value = null, ?callable $callback = null, ?callable $default = null)
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
