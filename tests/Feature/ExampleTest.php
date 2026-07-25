<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\BladeX;

it('resolves bladex from the container', function () {
    expect(app(BladeX::class))->toBeInstanceOf(BladeX::class);
});

it('resolves a fresh bladex instance on each container resolution', function () {
    expect(app(BladeX::class))->not->toBe(app(BladeX::class));
});

it('merges the package config', function () {
    expect(config('bladex.placeholder'))->toBe('default');
});

it('loads the package translations', function () {
    expect(trans('bladex::messages.placeholder'))->toBe('BladeX placeholder translation.');
});

it('loads the package views', function () {
    expect(view()->exists('bladex::placeholder'))->toBeTrue();
});

it('registers the artisan command', function () {
    $this->artisan('bladex:placeholder')
        ->expectsOutputToContain('BladeX placeholder command executed.')
        ->assertSuccessful();
});
