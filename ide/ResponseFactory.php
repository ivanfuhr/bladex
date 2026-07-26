<?php

declare(strict_types=1);

/**
 * IDE stub for BladeX ResponseFactory macros (not loaded at runtime).
 *
 * Point your editor at this directory — for example VS Code / Cursor:
 * `"intelephense.environment.includePaths": ["vendor/ivanfuhr/bladex/ide"]`
 *
 * PHPStorm: Settings → PHP → Include Path → add `vendor/ivanfuhr/bladex/ide`.
 */
namespace Illuminate\Contracts\Routing;

use Ivanfuhr\BladeX\BladeXResponseBuilder;
use Ivanfuhr\BladeX\Component;

/**
 * @method BladeXResponseBuilder with(array<string, mixed> $data = [])
 * @method BladeXResponseBuilder status(int $code)
 * @method BladeXResponseBuilder refresh(Component $component)
 * @method BladeXResponseBuilder replace(Component $from, Component $to)
 * @method BladeXResponseBuilder remove(Component $component)
 * @method BladeXResponseBuilder append(Component $into, Component $content)
 * @method BladeXResponseBuilder prepend(Component $into, Component $content)
 * @method BladeXResponseBuilder navigate(string $url)
 */
interface ResponseFactory
{
}
