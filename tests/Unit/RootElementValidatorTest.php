<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Exceptions\MultipleRootElementsDetectedException;
use Ivanfuhr\BladeX\Support\RootElementValidator;

function makeBladeXComponentForValidator(): Component
{
    return new class extends Component
    {
        public function identifier(): string|array
        {
            return 'test';
        }

        public function render(): string
        {
            return '';
        }
    };
}

it('throws when two or more root elements are present', function () {
    $validator = new RootElementValidator;
    $component = makeBladeXComponentForValidator();

    $html = <<<'HTML'
    <div>First element</div>
    <div>Second element</div>
    HTML;

    $validator->assertSingleRoot($component, $html);
})->throws(MultipleRootElementsDetectedException::class);

it('allows a script tag as a second root sibling', function () {
    $validator = new RootElementValidator;
    $component = makeBladeXComponentForValidator();

    $html = <<<'HTML'
    <div>First element</div>
    <script>let foo = 'bar'</script>
    HTML;

    $validator->assertSingleRoot($component, $html);

    expect($validator->getRootElementCount($html))->toBe(1);
});

it('allows a style tag as a second root sibling', function () {
    $validator = new RootElementValidator;
    $component = makeBladeXComponentForValidator();

    $html = <<<'HTML'
    <div>First element</div>
    <style>.foo { color: red; }</style>
    HTML;

    $validator->assertSingleRoot($component, $html);

    expect($validator->getRootElementCount($html))->toBe(1);
});

it('throws when two root elements remain after stripping script siblings', function () {
    $validator = new RootElementValidator;
    $component = makeBladeXComponentForValidator();

    $html = <<<'HTML'
    <div>First element</div>
    <script>let foo = 'bar'</script>
    <div>Second element</div>
    HTML;

    $validator->assertSingleRoot($component, $html);
})->throws(MultipleRootElementsDetectedException::class);

it('throws when two root elements remain after stripping style siblings', function () {
    $validator = new RootElementValidator;
    $component = makeBladeXComponentForValidator();

    $html = <<<'HTML'
    <div>First element</div>
    <style>.foo { color: red; }</style>
    <div>Second element</div>
    HTML;

    $validator->assertSingleRoot($component, $html);
})->throws(MultipleRootElementsDetectedException::class);

it('does not emit libxml warnings when parsing imperfect html', function () {
    $validator = new RootElementValidator;

    $html = '<div><p><div>nested</div></p></div>';

    set_error_handler(function (int $severity, string $message): void {
        throw new ErrorException($message, 0, $severity);
    }, E_WARNING);

    try {
        $validator->getRootElementCount($html);
    } finally {
        restore_error_handler();
    }

    expect(true)->toBeTrue();
});

it('formats array identifiers in the exception message', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return ['ui', 'alert'];
        }

        public function render(): string
        {
            return '';
        }
    };

    $exception = new MultipleRootElementsDetectedException($component);

    expect($exception->getMessage())->toContain('[ui.alert]');
});
