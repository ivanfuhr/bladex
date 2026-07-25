<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Ivanfuhr\BladeX\BladeX;
use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Support\ComponentRenderer;

function makeTestComponent(string $identifier, string $html): Component
{
    return new class($identifier, $html) extends Component
    {
        public function __construct(
            private readonly string $componentIdentifier,
            private readonly string $markup,
        ) {}

        public function identifier(): string|array
        {
            return $this->componentIdentifier;
        }

        public function render(): string
        {
            return $this->markup;
        }
    };
}

it('queues a refresh operation with rendered html', function () {
    $component = makeTestComponent('random.sentence', '<div>Hello</div>');

    $response = bladex()->refresh($component);

    $operations = $response->operations();

    expect($operations)->toHaveCount(1)
        ->and($operations[0]->toArray())->toBe([
            'type' => 'refresh',
            'identifier' => 'random.sentence',
            'html' => '<div data-component-identifier="random.sentence">Hello</div>',
        ]);
});

it('queues a replace operation targeting from and rendering to', function () {
    $from = makeTestComponent('ui.spinner', '<div>Loading</div>');
    $to = makeTestComponent('random.sentence', '<div>Done</div>');

    $response = bladex()->replace($from, $to);

    $operations = $response->operations();

    expect($operations)->toHaveCount(1)
        ->and($operations[0]->toArray())->toBe([
            'type' => 'replace',
            'identifier' => 'ui.spinner',
            'html' => '<div data-component-identifier="random.sentence">Done</div>',
        ]);
});

it('allows chaining refresh and replace operations', function () {
    $first = makeTestComponent('one', '<div>One</div>');
    $from = makeTestComponent('two', '<div>Two</div>');
    $to = makeTestComponent('three', '<div>Three</div>');

    $response = bladex()
        ->refresh($first)
        ->replace($from, $to);

    expect($response->toOperationArray())->toHaveCount(2)
        ->and($response->toOperationArray()[0]['type'])->toBe('refresh')
        ->and($response->toOperationArray()[1]['type'])->toBe('replace');
});

it('returns a json response with the bladex header', function () {
    $component = makeTestComponent('alert', '<div>Alert</div>');

    $jsonResponse = bladex()->refresh($component)->toResponse(request());

    expect($jsonResponse->getStatusCode())->toBe(200)
        ->and($jsonResponse->headers->get('X-BladeX'))->toBe('true')
        ->and($jsonResponse->getData(true))->toBe([
            'operations' => [
                [
                    'type' => 'refresh',
                    'identifier' => 'alert',
                    'html' => '<div data-component-identifier="alert">Alert</div>',
                ],
            ],
        ]);
});

it('exposes the bladex helper', function () {
    expect(function_exists('bladex'))->toBeTrue()
        ->and(bladex())->toBeInstanceOf(BladeX::class);
});

it('renders components through the component renderer', function () {
    $component = makeTestComponent('panel', '<section>Panel</section>');

    $html = app(ComponentRenderer::class)->render($component);

    expect($html)->toBe('<section data-component-identifier="panel">Panel</section>');
});

it('renders components with array identifiers', function () {
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

    $html = app(ComponentRenderer::class)->render($component);

    expect($html)->toContain('data-component-identifier="ui.alert"');
});

it('returns refresh operations from an http route', function () {
    Route::post('/_bladex/test/refresh', function () {
        $component = makeTestComponent('demo.refresh', '<div>Refreshed</div>');

        return bladex()->refresh($component);
    });

    $response = $this->post('/_bladex/test/refresh');

    $response->assertOk()
        ->assertHeader('X-BladeX', 'true')
        ->assertJson([
            'operations' => [
                [
                    'type' => 'refresh',
                    'identifier' => 'demo.refresh',
                    'html' => '<div data-component-identifier="demo.refresh">Refreshed</div>',
                ],
            ],
        ]);
});

it('returns replace operations from an http route', function () {
    Route::post('/_bladex/test/replace', function () {
        $from = makeTestComponent('demo.spinner', '<div>Spinner</div>');
        $to = makeTestComponent('demo.content', '<div>Content</div>');

        return bladex()->replace($from, $to);
    });

    $response = $this->post('/_bladex/test/replace');

    $response->assertOk()
        ->assertJsonPath('operations.0.type', 'replace')
        ->assertJsonPath('operations.0.identifier', 'demo.spinner')
        ->assertJsonPath('operations.0.html', '<div data-component-identifier="demo.content">Content</div>');
});
