<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

it('compiles bladexScripts to a script tag for the bladex asset', function () {
    $html = Blade::render('@bladexScripts');

    expect($html)->toContain('vendor/bladex/bladex.js')
        ->and($html)->toContain('<script')
        ->and($html)->toContain('defer');
});

it('only renders bladexScripts once per request', function () {
    $html = Blade::render("@bladexScripts\n@bladexScripts");

    expect(substr_count($html, 'vendor/bladex/bladex.js'))->toBe(1);
});
