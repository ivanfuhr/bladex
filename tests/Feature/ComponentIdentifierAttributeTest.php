<?php

declare(strict_types=1);

use Illuminate\View\Compilers\BladeCompiler;
use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Exceptions\RootElementMissingException;

it('injects data-component-identifier from a string identifier', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'alert';
        }

        public function render(): string
        {
            return '<div>Alert</div>';
        }
    };

    $html = BladeCompiler::renderComponent($component);

    expect($html)->toContain('data-component-identifier="alert"');
});

it('injects data-component-identifier from an array identifier', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return ['ui', 'alert'];
        }

        public function render(): string
        {
            return '<div>Alert</div>';
        }
    };

    $html = BladeCompiler::renderComponent($component);

    expect($html)->toContain('data-component-identifier="ui.alert"');
});

it('throws when render output has no root element', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'empty';
        }

        public function render(): string
        {
            return '';
        }
    };

    BladeCompiler::renderComponent($component);
})->throws(RootElementMissingException::class);
