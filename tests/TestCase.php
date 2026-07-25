<?php

declare(strict_types=1);

namespace BladeX\BladeX\Tests;

use BladeX\BladeX\BladeXServiceProvider;
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
