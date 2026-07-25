<?php

declare(strict_types=1);

use Illuminate\View\Component as BaseComponent;
use Ivanfuhr\BladeX\Component;

it('extends the Illuminate view component base class', function () {
    expect(is_subclass_of(Component::class, BaseComponent::class))->toBeTrue();
});

it('requires subclasses to implement identifier', function () {
    $method = new ReflectionMethod(Component::class, 'identifier');

    expect($method->isAbstract())->toBeTrue()
        ->and($method->hasReturnType())->toBeTrue();

    $returnType = $method->getReturnType();
    expect($returnType)->not->toBeNull()
        ->and($returnType->allowsNull())->toBeFalse()
        ->and(collect($returnType->getTypes())->map(fn ($type) => $type->getName())->sort()->values()->all())
        ->toBe(['array', 'string']);
});

it('allows identifier to return a string', function () {
    $component = new class extends Component
    {
        public function identifier(): string|array
        {
            return 'alert';
        }

        public function render(): string
        {
            return '';
        }
    };

    expect($component->identifier())->toBe('alert');
});

it('allows identifier to return an array of strings', function () {
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

    expect($component->identifier())->toBe(['ui', 'alert']);
});
