<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\BladeXResponseBuilder;

it('resolves the bladex response builder from the container', function () {
    expect(app(BladeXResponseBuilder::class))->toBeInstanceOf(BladeXResponseBuilder::class);
});

it('creates a new builder instance on each resolution', function () {
    expect(app(BladeXResponseBuilder::class))->not->toBe(app(BladeXResponseBuilder::class));
});
