<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX;

use Closure;
use Illuminate\Container\Container;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component as BaseComponent;
use Ivanfuhr\BladeX\Support\RootElementValidator;
use Ivanfuhr\BladeX\Support\ValidatingComponentHtml;

/**
 * BladeX components must render a single root HTML element.
 * Sibling script and style tags at the root are ignored when counting.
 * The check runs only when application debug mode is enabled.
 */
abstract class Component extends BaseComponent
{
    /**
     * @return string|array<int, string>
     */
    abstract public function identifier(): string|array;

    /**
     * @return Closure(array<string, mixed>=): ValidatingComponentHtml
     */
    public function resolveView(): Closure
    {
        $resolved = parent::resolveView();

        return function (array $data = []) use ($resolved) {
            return $this->validatingHtml(value($resolved, $data), $data);
        };
    }

    /**
     * @param  View|Htmlable|Closure|string  $view
     * @param  array<string, mixed>  $data
     */
    protected function validatingHtml(mixed $view, array $data): ValidatingComponentHtml
    {
        return new ValidatingComponentHtml(
            $view,
            $data,
            $this,
            $this->rootElementValidator(),
            $this->viewFactory(),
        );
    }

    protected function rootElementValidator(): RootElementValidator
    {
        return Container::getInstance()->make(RootElementValidator::class);
    }

    protected function viewFactory(): ViewFactory
    {
        return Container::getInstance()->make(ViewFactory::class);
    }
}
