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
        return '/bladex/bladex.js';
    }

    public static function javaScriptPath(): string
    {
        return dirname(__DIR__, 2).'/packages/bladex/dist/bladex.js';
    }

    public static function returnJavaScriptAsFile(): BinaryFileResponse
    {
        $path = self::javaScriptPath();
        $lastModified = filemtime($path);
        $maxAge = 31536000;

        return response()->file($path, [
            'Content-Type' => 'application/javascript; charset=utf-8',
            'Cache-Control' => 'public, max-age='.$maxAge,
            'Expires' => gmdate('D, d M Y H:i:s', time() + $maxAge).' GMT',
            'Last-Modified' => $lastModified !== false
                ? gmdate('D, d M Y H:i:s', $lastModified).' GMT'
                : gmdate('D, d M Y H:i:s').' GMT',
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
        $fetchProxy = $options['fetchProxy'] ?? true;
        $attributes = $fetchProxy === false ? ' data-fetch-proxy="false"' : '';

        return sprintf(
            '<script src="%s?v=%s" defer%s></script>',
            e($url),
            e(static::scriptVersion()),
            $attributes,
        );
    }

    public static function scriptVersion(): string
    {
        return static::hashJavaScriptAt(static::javaScriptPath());
    }

    public static function hashJavaScriptAt(string $path): string
    {
        if (! is_file($path)) {
            return 'dev';
        }

        $hash = hash_file('sha256', $path);

        return $hash === false ? 'dev' : substr($hash, 0, 8);
    }

    public static function scriptUrl(): string
    {
        return url(self::scriptPath());
    }
}
