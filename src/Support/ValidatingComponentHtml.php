<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Closure;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Contracts\View\View;
use Illuminate\Contracts\View\View as ViewContract;
use Ivanfuhr\BladeX\Component;

class ValidatingComponentHtml implements Htmlable
{
    /**
     * @param  View|Htmlable|Closure|string  $view
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        private readonly mixed $view,
        private readonly array $data,
        private readonly Component $component,
        private readonly RootElementValidator $validator,
        private readonly RootElementAttributeInjector $attributeInjector,
        private readonly ViewFactory $viewFactory,
    ) {}

    public function toHtml(): string
    {
        $html = $this->renderView();

        $html = $this->attributeInjector->inject($html, [
            'data-component-identifier' => $this->component->resolvedIdentifier(),
        ], $this->component);

        if (config('bladex.enforce_single_root_element', true) && config('app.debug')) {
            $this->validator->assertSingleRoot($this->component, $html);
        }

        return $html;
    }

    private function renderView(): string
    {
        $view = $this->view;

        if ($view instanceof ViewContract) {
            return $view->with($this->data)->render();
        }

        if ($view instanceof Htmlable) {
            return $view->toHtml();
        }

        if ($view instanceof Closure) {
            $view = $view($this->data);
        }

        if ($view instanceof ViewContract) {
            return $view->with($this->data)->render();
        }

        if ($view instanceof Htmlable) {
            return $view->toHtml();
        }

        return $this->viewFactory->make($view, $this->data)->render();
    }
}
