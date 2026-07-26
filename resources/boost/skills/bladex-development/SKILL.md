---
name: bladex-development
description: >
  Configure and apply the BladeX package in Laravel applications.
license: MIT
metadata:
  author: Ivan Führ
---

# BladeX

Use this skill when a Laravel application needs to integrate the BladeX package.

## Primary Goal

- apply the `ivanfuhr/bladex` package's public API in the smallest correct way

## Workflow

### 1. Inspect the Laravel app context

- confirm the app is a Laravel project
- inspect the target code paths where the package should be applied

### 2. Apply the package's public API

1. Add `@bladexScripts` before `</body>` in the layout.
2. Extend `Ivanfuhr\BladeX\Component` for interactive Blade components and implement `identifier()`.
3. Return operations from routes or controllers:

```php
return bladex()->refresh(new RandomSentence());

return bladex()->replace(new LoadingSpinner(), new RandomSentence());

return bladex()->remove(new OldBanner());

return bladex()->append(new ListContainer(), new ListItem($id));

return bladex()->prepend(new ListContainer(), new ListItem($id));

return bladex()->redirect(route('items.index'));

return bladex()
    ->remove(new TodoItem($todo))
    ->when(Todo::query()->count() === 0, fn ($bx) => $bx
        ->append(new TodoList, new TodoEmptyState));

return bladex()
    ->refresh(new OrderForm($order))
    ->unprocessableEntity()
    ->withErrors($validator)
    ->usingResponse(fn (JsonResponse $response) => $response->header('X-Request-Id', (string) $request->headers->get('X-Request-Id')));
```

Validation errors in BladeX JSON use `errors` as a list of `{ name, messages }`. Session default-bag errors are included when `bladex.include_session_errors` is true. Failed Form Request validation on JSON requests is returned automatically in the same shape (no `->withErrors()` required). Override or add errors with `->withErrors($validator)` when validating manually. Declarative form submits apply the first message per field as `data-error` on matching `name` attributes after operations run.

4. On the client, prefer declarative attributes after `@bladexScripts` (for example `data-post="{{ route('items.refresh') }}"` on a button). While the request runs, BladeX sets `data-loading` on that element; for `<form data-post="...">` it also disables the form controls until the response returns. Style `[data-loading]` as needed. Operations apply automatically when the response has `X-BladeX: true`, regardless of HTTP status. `refresh` and `replace` morph server HTML into the matched root by default (`bladex.dom_update`); use `replace` for legacy `outerHTML` swaps. You can still call `fetch()` manually if needed. Ensure the layout has `<meta name="csrf-token" content="{{ csrf_token() }}">` for POST requests.

Ensure each mounted instance has a unique `identifier()` when multiple copies of the same component appear on one page.

## Rules, References, and Templates

Read before executing:

- package README operations section

## Examples

- POST endpoint returns `bladex()->refresh($component)`; `data-post` on a button (or `fetch(url, { method: 'POST' })`) applies operations via the fetch proxy.

## Anti-patterns

- do not use CSS selectors in PHP to target components; pass `Component` instances instead
- do not document package internals here; keep the skill focused on adoption in Laravel apps
