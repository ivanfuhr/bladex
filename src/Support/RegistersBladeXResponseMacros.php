<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Illuminate\Contracts\Routing\ResponseFactory;
use Ivanfuhr\BladeX\BladeXResponseBuilder;
use Ivanfuhr\BladeX\Component;

class RegistersBladeXResponseMacros
{
    public function register(ResponseFactory $responseFactory): void
    {
        $responseFactory->macro('with', function (array $data = []) {
            return app(BladeXResponseBuilder::class)->withData($data);
        });

        $responseFactory->macro('status', function (int $code) {
            return app(BladeXResponseBuilder::class)->status($code);
        });

        $responseFactory->macro('refresh', function (Component $component) {
            return app(BladeXResponseBuilder::class)->refresh($component);
        });

        $responseFactory->macro('replace', function (Component $from, Component $to) {
            return app(BladeXResponseBuilder::class)->replace($from, $to);
        });

        $responseFactory->macro('remove', function (Component $component) {
            return app(BladeXResponseBuilder::class)->remove($component);
        });

        $responseFactory->macro('append', function (Component $into, Component $content) {
            return app(BladeXResponseBuilder::class)->append($into, $content);
        });

        $responseFactory->macro('prepend', function (Component $into, Component $content) {
            return app(BladeXResponseBuilder::class)->prepend($into, $content);
        });

        $responseFactory->macro('navigate', function (string $url) {
            return app(BladeXResponseBuilder::class)->navigate($url);
        });
    }
}
