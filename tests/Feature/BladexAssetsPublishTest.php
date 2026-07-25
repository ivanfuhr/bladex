<?php

declare(strict_types=1);

it('publishes bladex.js through the bladex-assets tag', function () {
    $target = public_path('vendor/bladex/bladex.js');

    if (file_exists($target)) {
        unlink($target);
    }

    $this->artisan('vendor:publish', [
        '--tag' => 'bladex-assets',
        '--force' => true,
    ])->assertSuccessful();

    expect(file_exists($target))->toBeTrue()
        ->and(file_get_contents($target))->toContain('window.Bladex');
});
