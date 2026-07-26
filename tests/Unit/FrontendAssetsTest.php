<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\Support\FrontendAssets;

it('renders a deferred script tag pointing at the bladex asset', function () {
    $html = FrontendAssets::scripts();

    expect($html)->toContain('bladex/bladex.js')
        ->and($html)->toContain('defer')
        ->and($html)->toContain('?v='.FrontendAssets::scriptVersion().'"');
});

it('uses the same version hash as the served javascript file', function () {
    expect(FrontendAssets::scriptVersion())->toBe(
        FrontendAssets::hashJavaScriptAt(FrontendAssets::javaScriptPath()),
    );
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

it('can disable the fetch proxy through script options', function () {
    app(FrontendAssets::class)->hasRenderedScripts = false;

    $html = FrontendAssets::scripts(['fetchProxy' => false]);

    expect($html)->toContain('data-fetch-proxy="false"');
});

it('emits the dom update mode on the script tag', function () {
    app(FrontendAssets::class)->hasRenderedScripts = false;

    $html = FrontendAssets::scripts();

    expect($html)->toContain('data-dom-update="morph"');
});

it('allows overriding the dom update mode through script options', function () {
    app(FrontendAssets::class)->hasRenderedScripts = false;

    $html = FrontendAssets::scripts(['domUpdate' => 'replace']);

    expect($html)->toContain('data-dom-update="replace"');
});

it('normalizes invalid dom update modes to morph', function () {
    expect(FrontendAssets::resolveDomUpdateMode('invalid'))->toBe('morph');
});
