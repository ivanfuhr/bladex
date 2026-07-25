<?php

declare(strict_types=1);

use Illuminate\View\Component as BaseComponent;
use Ivanfuhr\BladeX\Component;

it('extends the Illuminate view component base class', function () {
    expect(is_subclass_of(Component::class, BaseComponent::class))->toBeTrue();
});
