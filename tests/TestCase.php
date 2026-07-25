<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Tests;

use Ivanfuhr\BladeX\BladeXServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [
            BladeXServiceProvider::class,
        ];
    }
}
