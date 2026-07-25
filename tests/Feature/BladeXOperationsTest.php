<?php

declare(strict_types=1);

use Illuminate\Http\JsonResponse;
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

it('returns a custom http status from the builder', function () {
    $component = makeTestComponent('alert', '<div>Alert</div>');

    $jsonResponse = bladex()
        ->refresh($component)
        ->created()
        ->toResponse(request());

    expect($jsonResponse->getStatusCode())->toBe(201)
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

it('supports readable http status helpers', function () {
    expect(bladex()->unprocessableEntity()->toResponse(request())->getStatusCode())->toBe(422)
        ->and(bladex()->forbidden()->toResponse(request())->getStatusCode())->toBe(403)
        ->and(bladex()->status(418)->toResponse(request())->getStatusCode())->toBe(418);
});

it('customizes the json response with usingResponse', function () {
    $component = makeTestComponent('alert', '<div>Alert</div>');

    $jsonResponse = bladex()
        ->refresh($component)
        ->usingResponse(fn (JsonResponse $response) => $response
            ->header('X-Request-Id', 'abc-123')
            ->header('X-Custom-Flag', 'yes'))
        ->toResponse(request());

    expect($jsonResponse->headers->get('X-Request-Id'))->toBe('abc-123')
        ->and($jsonResponse->headers->get('X-Custom-Flag'))->toBe('yes')
        ->and($jsonResponse->headers->get('X-BladeX'))->toBe('true');
});

it('chains operations with readable status and usingResponse', function () {
    $component = makeTestComponent('form', '<form></form>');

    $jsonResponse = bladex()
        ->refresh($component)
        ->unprocessableEntity()
        ->usingResponse(fn (JsonResponse $response) => $response->header('X-Validation', 'failed'))
        ->toResponse(request());

    expect($jsonResponse->getStatusCode())->toBe(422)
        ->and($jsonResponse->headers->get('X-Validation'))->toBe('failed')
        ->and($jsonResponse->getData(true)['operations'])->toHaveCount(1);
});

it('attaches cookies through usingResponse', function () {
    $jsonResponse = bladex()
        ->redirect('/home')
        ->usingResponse(fn (JsonResponse $response) => $response->cookie('flash', 'saved', 60))
        ->toResponse(request());

    $cookies = $jsonResponse->headers->getCookies();

    expect($cookies)->toHaveCount(1)
        ->and($cookies[0]->getName())->toBe('flash')
        ->and($cookies[0]->getValue())->toBe('saved');
});

it('returns custom status and headers from an http route', function () {
    Route::post('/_bladex/test/http', function () {
        $component = makeTestComponent('demo.form', '<form></form>');

        return bladex()
            ->refresh($component)
            ->unprocessableEntity()
            ->usingResponse(fn (JsonResponse $response) => $response->header('X-Custom', 'yes'));
    });

    $this->post('/_bladex/test/http')
        ->assertStatus(422)
        ->assertHeader('X-Custom', 'yes')
        ->assertHeader('X-BladeX', 'true')
        ->assertJsonPath('operations.0.type', 'refresh');
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

it('queues a remove operation with the component identifier', function () {
    $component = makeTestComponent('ui.banner', '<div>Banner</div>');

    $response = bladex()->remove($component);

    expect($response->operations())->toHaveCount(1)
        ->and($response->toOperationArray()[0])->toBe([
            'type' => 'remove',
            'identifier' => 'ui.banner',
        ]);
});

it('queues an append operation as the last child inside into', function () {
    $into = makeTestComponent('list.container', '<ul></ul>');
    $content = makeTestComponent('list.item', '<li>Item</li>');

    $response = bladex()->append($into, $content);

    expect($response->toOperationArray()[0])->toBe([
        'type' => 'append',
        'identifier' => 'list.container',
        'html' => '<li data-component-identifier="list.item">Item</li>',
    ]);
});

it('queues a prepend operation as the first child inside into', function () {
    $into = makeTestComponent('list.container', '<ul></ul>');
    $content = makeTestComponent('list.item', '<li>Item</li>');

    $response = bladex()->prepend($into, $content);

    expect($response->toOperationArray()[0])->toBe([
        'type' => 'prepend',
        'identifier' => 'list.container',
        'html' => '<li data-component-identifier="list.item">Item</li>',
    ]);
});

it('queues a redirect operation with the url', function () {
    $response = bladex()->redirect('/dashboard');

    expect($response->toOperationArray()[0])->toBe([
        'type' => 'redirect',
        'url' => '/dashboard',
    ]);
});

it('appends when when is truthy', function () {
    $banner = makeTestComponent('ui.banner', '<div>Banner</div>');
    $into = makeTestComponent('list.container', '<ul></ul>');
    $content = makeTestComponent('list.item', '<li>Item</li>');

    $response = bladex()
        ->remove($banner)
        ->when(true, fn ($bx) => $bx->append($into, $content));

    expect($response->toOperationArray())->toHaveCount(2)
        ->and($response->toOperationArray()[0]['type'])->toBe('remove')
        ->and($response->toOperationArray()[1]['type'])->toBe('append');
});

it('skips the callback when when is falsy', function () {
    $banner = makeTestComponent('ui.banner', '<div>Banner</div>');
    $into = makeTestComponent('list.container', '<ul></ul>');
    $content = makeTestComponent('list.item', '<li>Item</li>');

    $response = bladex()
        ->remove($banner)
        ->when(false, fn ($bx) => $bx->append($into, $content));

    expect($response->toOperationArray())->toHaveCount(1)
        ->and($response->toOperationArray()[0]['type'])->toBe('remove');
});

it('appends when unless is falsy', function () {
    $banner = makeTestComponent('ui.banner', '<div>Banner</div>');
    $into = makeTestComponent('list.container', '<ul></ul>');
    $content = makeTestComponent('list.item', '<li>Item</li>');

    $response = bladex()
        ->remove($banner)
        ->unless(false, fn ($bx) => $bx->append($into, $content));

    expect($response->toOperationArray())->toHaveCount(2)
        ->and($response->toOperationArray()[1]['type'])->toBe('append');
});

it('keeps the same instance when the when callback returns null', function () {
    $banner = makeTestComponent('ui.banner', '<div>Banner</div>');

    $response = bladex()
        ->remove($banner)
        ->when(true, function ($bx) {
            $bx->redirect('/done');

            return null;
        });

    expect($response->toOperationArray())->toHaveCount(2)
        ->and($response->toOperationArray()[0]['type'])->toBe('remove')
        ->and($response->toOperationArray()[1]['type'])->toBe('redirect');
});

it('allows chaining dom operations with redirect', function () {
    $banner = makeTestComponent('ui.banner', '<div>Banner</div>');
    $into = makeTestComponent('list.container', '<ul></ul>');
    $content = makeTestComponent('list.item', '<li>Item</li>');

    $response = bladex()
        ->remove($banner)
        ->append($into, $content)
        ->redirect('/done');

    expect($response->toOperationArray())->toHaveCount(3)
        ->and($response->toOperationArray()[0]['type'])->toBe('remove')
        ->and($response->toOperationArray()[1]['type'])->toBe('append')
        ->and($response->toOperationArray()[2])->toBe([
            'type' => 'redirect',
            'url' => '/done',
        ]);
});

it('returns remove operations from an http route', function () {
    Route::post('/_bladex/test/remove', function () {
        $component = makeTestComponent('demo.banner', '<div>Banner</div>');

        return bladex()->remove($component);
    });

    $this->post('/_bladex/test/remove')
        ->assertOk()
        ->assertJsonPath('operations.0.type', 'remove')
        ->assertJsonPath('operations.0.identifier', 'demo.banner');
});

it('returns append operations from an http route', function () {
    Route::post('/_bladex/test/append', function () {
        $into = makeTestComponent('demo.list', '<ul></ul>');
        $content = makeTestComponent('demo.item', '<li>Item</li>');

        return bladex()->append($into, $content);
    });

    $this->post('/_bladex/test/append')
        ->assertOk()
        ->assertJsonPath('operations.0.type', 'append')
        ->assertJsonPath('operations.0.identifier', 'demo.list')
        ->assertJsonPath(
            'operations.0.html',
            '<li data-component-identifier="demo.item">Item</li>',
        );
});
