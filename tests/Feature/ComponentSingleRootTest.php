<?php

declare(strict_types=1);

use Illuminate\View\Compilers\BladeCompiler;
use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Exceptions\MultipleRootElementsDetectedException;

beforeEach(function () {
    config()->set('bladex.enforce_single_root_element', true);
    config()->set('app.debug', true);
});

it('throws when a component renders multiple root elements', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'multi-root';
        }

        public function render(): string
        {
            return <<<'HTML'
            <div>First element</div>
            <div>Second element</div>
            HTML;
        }
    };

    BladeCompiler::renderComponent($component);
})->throws(MultipleRootElementsDetectedException::class);

it('allows script siblings when rendering a component', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'script-sibling';
        }

        public function render(): string
        {
            return <<<'HTML'
            <div>First element</div>
            <script>let foo = 'bar'</script>
            HTML;
        }
    };

    $html = BladeCompiler::renderComponent($component);

    expect($html)->toContain('First element')
        ->and($html)->toContain('data-component-identifier="script-sibling"');
});

it('does not validate multiple roots when app debug is disabled', function () {
    config()->set('app.debug', false);

    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'production';
        }

        public function render(): string
        {
            return <<<'HTML'
            <div>First element</div>
            <div>Second element</div>
            HTML;
        }
    };

    $html = BladeCompiler::renderComponent($component);

    expect($html)->toContain('First element')
        ->and($html)->toContain('Second element');
});

it('skips validation when enforce_single_root_element is disabled', function () {
    config()->set('bladex.enforce_single_root_element', false);

    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'disabled';
        }

        public function render(): string
        {
            return <<<'HTML'
            <div>First element</div>
            <div>Second element</div>
            HTML;
        }
    };

    $html = BladeCompiler::renderComponent($component);

    expect($html)->toContain('First element')
        ->and($html)->toContain('Second element');
});
