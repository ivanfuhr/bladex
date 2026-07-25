<div align="center">
    <h1>BladeX</h1>
</div>

<p align="center">
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://img.shields.io/packagist/v/ivanfuhr/bladex.svg?style=flat-square" alt="Packagist"></a>
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://img.shields.io/packagist/php-v/ivanfuhr/bladex.svg?style=flat-square" alt="PHP from Packagist"></a>
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://badge.laravel.cloud/badge/ivanfuhr/bladex?style=flat" alt="Laravel versions"></a>
    <a href="https://github.com/ivanfuhr/bladex/actions"><img alt="GitHub Workflow Status (main)" src="https://img.shields.io/github/actions/workflow/status/ivanfuhr/bladex/tests.yml?branch=main&label=Tests&style=flat-square"></a>
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://img.shields.io/packagist/dt/ivanfuhr/bladex.svg?style=flat-square" alt="Total Downloads"></a>
</p>

Extend Laravel Blade with HTTP-aware components and server-driven interactions.

## Installation

You can install the package via Composer:

```bash
composer require ivanfuhr/bladex
```

After installing or updating the package (especially from a path repository), run `composer dump-autoload` in your application so Composer registers the `bladex()` helper. If your editor still reports an unknown function, restart the PHP language server.

You may publish all of the package's resources at once:

```bash
php artisan vendor:publish --tag="bladex"
```

Or, you may publish each resource individually:

### Publishing the Configuration File

```bash
php artisan vendor:publish --tag="bladex-config"
```

### Publishing and Running the Migrations

```bash
php artisan vendor:publish --tag="bladex-migrations"
php artisan migrate
```

### Publishing the Views

```bash
php artisan vendor:publish --tag="bladex-views"
```

### Publishing the Translations

```bash
php artisan vendor:publish --tag="bladex-lang"
```

### Publishing the Public Assets

```bash
php artisan vendor:publish --tag="bladex-assets"
```

## Usage

Include the scripts directive in your layout before `</body>`:

```blade
@bladexScripts
```

No asset publishing is required. BladeX serves `bladex.js` from the `/bladex/bladex.js` route, similar to how Livewire serves its runtime script. The `?v=` query string is a short hash of that file and changes when the bundle changes.

To point at a different URL (for example a published CDN asset), pass the `url` option:

```blade
@bladexScripts(['url' => asset('vendor/bladex/bladex.js')])
```

In your application JavaScript, resolve a BladeX component root from a DOM node or identifier:

```javascript
const component = Bladex.find(document.querySelector('button'));

const alert = Bladex.find('ui.alert');
```

`Bladex.find()` returns `{ element, identifier }` when a `[data-component-identifier]` root is found, or `null` otherwise.

## Operations

Return BladeX operations from a route or controller to update the page without CSS selectors in PHP. Each operation targets a component by the `identifier()` of the `Component` instance you pass in.

```php
use App\View\Components\RandomSentence;

return bladex()->refresh(new RandomSentence());
```

`refresh` re-renders the given component and updates the existing root with the same `resolvedIdentifier()` on the page.

```php
use App\View\Components\LoadingSpinner;
use App\View\Components\RandomSentence;

return bladex()->replace(new LoadingSpinner(), new RandomSentence());
```

`replace` finds the root for `$from` and swaps it with the HTML rendered from `$to`. The DOM will then expose the identifier of `$to`.

```php
use App\View\Components\OldBanner;

return bladex()->remove(new OldBanner());
```

`remove` deletes the root that matches the given component’s `resolvedIdentifier()`.

```php
use App\View\Components\ListContainer;
use App\View\Components\ListItem;

return bladex()->append(new ListContainer(), new ListItem($id));
```

`append` inserts the rendered HTML of `$content` as the last child inside the root of `$into`.

```php
use App\View\Components\ListContainer;
use App\View\Components\ListItem;

return bladex()->prepend(new ListContainer(), new ListItem($id));
```

`prepend` inserts the rendered HTML as the first child inside the root of `$into`.

```php
return bladex()->redirect(route('items.index'));
```

`redirect` navigates the browser with `location.assign()`. Operations run in order; put `redirect` last so earlier DOM updates are not skipped.

The response is JSON with an `operations` array and an `X-BladeX: true` header.

### HTTP status and response customization

Use readable status helpers on the builder:

```php
return bladex()
    ->refresh(new OrderForm($order))
    ->unprocessableEntity();
```

Also available: `ok()`, `created()`, `accepted()`, `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `tooManyRequests()`, `serverError()`, and `status($code)` for anything else.

For headers, cookies, or any other `JsonResponse` API, use `usingResponse()` — BladeX does not reimplement `response()`:

```php
return bladex()
    ->refresh(new OrderForm($order))
    ->unprocessableEntity()
    ->usingResponse(fn (JsonResponse $response) => $response
        ->header('X-Request-Id', $requestId)
        ->cookie('flash', 'saved', 60));
```

The JSON body stays `{ "operations": [...] }`. The fetch proxy applies operations whenever `X-BladeX: true` is present, even if the status is not 2xx — your JavaScript can still branch on `response.ok` for validation or error handling.

### Automatic `fetch` handling

`@bladexScripts` installs a `fetch` proxy. When a response includes the `X-BladeX: true` header, BladeX applies the operations automatically — you do not need to call `Bladex.apply()` yourself.

Put a CSRF meta tag in your layout (Laravel’s default `app` layout already does):

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

Then a normal `fetch` is enough:

```javascript
fetch('/your-endpoint', { method: 'POST' });
```

The proxy also sets `Accept: application/json`, `X-Requested-With: XMLHttpRequest`, and `X-CSRF-TOKEN` (from the meta tag) on mutating requests when those headers are missing.

To disable the proxy (for example if you manage `fetch` yourself), pass:

```blade
@bladexScripts(['fetchProxy' => false])
```

You can still use `Bladex.fetch()` explicitly, or call `Bladex.apply(payload)` when the proxy is off.

### Declarative actions

After `@bladexScripts`, you can trigger BladeX requests from HTML attributes instead of writing `fetch()` or `onclick` handlers. The server still decides which components to update through `bladex()` operations and `identifier()` — there is no `hx-target` in the markup.

Put exactly one method attribute with the request URL on the element:

| Attribute | HTTP method |
|-----------|-------------|
| `data-get` | GET |
| `data-post` | POST |
| `data-put` | PUT |
| `data-patch` | PATCH |
| `data-delete` | DELETE |

Optional attribute:

| Attribute | Behavior |
|-----------|----------|
| `data-trigger` | Events to listen for (default: `submit` on `<form>`, `click` elsewhere). Comma-separated list, with optional `once` and `delay:300ms` modifiers per event (for example `click once` or `change delay:200ms`). |

Forms use `FormData` as the request body for mutating methods. Links and non-submit buttons call `preventDefault` on the configured trigger so navigation does not occur.

Example:

```blade
<button
    type="button"
    data-post="{{ route('items.store') }}"
>
    Add item
</button>
```

Both `refresh` and `replace` update the matched root via `outerHTML`. `remove` calls `element.remove()`. `append` and `prepend` insert `$content` inside the root of `$into` (`beforeend` / `afterbegin`).

If more than one element shares the same `data-component-identifier`, BladeX logs an error and skips the operation. Make `identifier()` unique per mounted instance when you render multiple copies of the same component (for example by including a model id in the identifier).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Thank you for considering contributing to BladeX! Please review our [contributing guide](.github/CONTRIBUTING.md) to get started. Package development requires Node.js: run `npm ci && npm run build` after cloning so `packages/bladex/dist/bladex.js` exists for PHP feature tests and the workbench.

## Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [Ivan Führ](https://github.com/ivanfuhr)
- [All Contributors](../../contributors)

## License

BladeX is open-sourced software licensed under the [MIT license](LICENSE.md).
