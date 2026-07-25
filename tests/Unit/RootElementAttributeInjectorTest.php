<?php

declare(strict_types=1);

use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Exceptions\RootElementMissingException;
use Ivanfuhr\BladeX\Support\RootElementAttributeInjector;

function makeBladeXComponentForInjector(string $identifier = 'test'): Component
{
    return new class($identifier) extends Component
    {
        public function __construct(private readonly string $identifier) {}

        public function identifier(): string|array
        {
            return $this->identifier;
        }

        public function render(): string
        {
            return '';
        }
    };
}

it('injects attributes after the first root tag name', function () {
    $injector = new RootElementAttributeInjector;
    $component = makeBladeXComponentForInjector();

    $html = $injector->inject(
        "\n            <div class=\"box\">Content</div>",
        ['data-component-identifier' => 'test'],
        $component,
    );

    expect($html)->toBe("\n            <div data-component-identifier=\"test\" class=\"box\">Content</div>");
});

it('injects attributes on custom root tag names', function () {
    $injector = new RootElementAttributeInjector;
    $component = makeBladeXComponentForInjector();

    $html = $injector->inject(
        '<section>Content</section>',
        ['data-component-identifier' => 'panel'],
        $component,
    );

    expect($html)->toBe('<section data-component-identifier="panel">Content</section>');
});

it('escapes attribute values for html', function () {
    $injector = new RootElementAttributeInjector;
    $component = makeBladeXComponentForInjector('say "hi"');

    $html = $injector->inject(
        '<div></div>',
        ['data-component-identifier' => 'say "hi"'],
        $component,
    );

    expect($html)->toBe('<div data-component-identifier="say &quot;hi&quot;"></div>');
});

it('throws when html has no root element', function () {
    $injector = new RootElementAttributeInjector;
    $component = makeBladeXComponentForInjector('empty');

    $injector->inject('plain text', ['data-component-identifier' => 'empty'], $component);
})->throws(RootElementMissingException::class, 'No root HTML element found for component: [empty].');
