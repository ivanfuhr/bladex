<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\Support\FrontendAssets;

it('serves bladex.js from the package without publishing assets', function () {
    $response = $this->get(FrontendAssets::scriptPath());

    $response->assertOk()
        ->assertHeader('content-type', 'application/javascript; charset=utf-8');

    expect($response->headers->get('cache-control'))->toContain('public')
        ->and($response->headers->get('cache-control'))->toContain('max-age=31536000');

    $content = $response->streamedContent();

    expect($content)->toContain('window.Bladex');
});
