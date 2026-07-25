<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\BladeX;

if (! function_exists('bladex')) {
    /**
     * Begin building a BladeX operations response.
     */
    function bladex(): BladeX
    {
        return app(BladeX::class);
    }
}
