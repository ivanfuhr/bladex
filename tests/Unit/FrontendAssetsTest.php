<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\Support\FrontendAssets;

it('renders a deferred script tag pointing at the bladex asset', function () {
    $html = FrontendAssets::scripts();

    expect($html)->toContain('vendor/bladex/bladex.js')
        ->and($html)->toContain('defer')
        ->and($html)->toContain('?v='.config('bladex.version').'"');
});

it('returns an empty string when scripts were already rendered', function () {
    FrontendAssets::scripts();

    expect(FrontendAssets::scripts())->toBe('');
});

it('allows overriding the script url through options', function () {
    app(FrontendAssets::class)->hasRenderedScripts = false;

    $html = FrontendAssets::scripts(['url' => 'https://cdn.example/bladex.js']);

    expect($html)->toContain('https://cdn.example/bladex.js');
});
