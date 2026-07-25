<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FrontendAssets
{
    public bool $hasRenderedScripts = false;

    public function boot(): void
    {
        Route::get(self::scriptPath(), [self::class, 'returnJavaScriptAsFile'])
            ->name('bladex.scripts');

        Blade::directive('bladexScripts', static function (?string $expression = null) {
            $expression = $expression ?? '';

            return '<?php echo \\Ivanfuhr\\BladeX\\Support\\FrontendAssets::scripts('.$expression.'); ?>';
        });
    }

    public static function scriptPath(): string
    {
        return '/vendor/bladex/bladex.js';
    }

    public static function javaScriptPath(): string
    {
        return dirname(__DIR__, 2).'/dist/bladex.js';
    }

    public static function returnJavaScriptAsFile(): BinaryFileResponse
    {
        return response()->file(self::javaScriptPath(), [
            'Content-Type' => 'application/javascript; charset=utf-8',
        ]);
    }

    /**
     * @param  array<string, mixed>  $options
     */
    public static function scripts(array $options = []): string
    {
        $instance = app(self::class);

        if ($instance->hasRenderedScripts) {
            return '';
        }

        $instance->hasRenderedScripts = true;

        $url = $options['url'] ?? static::scriptUrl();

        return sprintf('<script src="%s" defer></script>', e($url));
    }

    public static function scriptUrl(): string
    {
        if (file_exists(public_path('vendor/bladex/bladex.js'))) {
            return asset('vendor/bladex/bladex.js');
        }

        return url(self::scriptPath());
    }
}
