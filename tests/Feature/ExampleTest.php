<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\BladeX;

it('resolves the singleton', function () {
    expect(app(BladeX::class))->toBeInstanceOf(BladeX::class);
});

it('returns the same instance from the container', function () {
    expect(app(BladeX::class))->toBe(app(BladeX::class));
});

it('merges the package config', function () {
    expect(config('bladex.placeholder'))->toBe('default')
        ->and(config('bladex.version'))->toBeString()
        ->and(config('bladex.version'))->not->toBe('');
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
