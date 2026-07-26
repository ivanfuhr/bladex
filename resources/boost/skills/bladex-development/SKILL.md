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
return response()->refresh(new RandomSentence());

return response()->replace(new LoadingSpinner(), new RandomSentence());

return response()->remove(new OldBanner());

return response()->append(new ListContainer(), new ListItem($id));

return response()->prepend(new ListContainer(), new ListItem($id));

return response()->navigate(route('items.index'));

return response()->with()
    ->remove(new TodoItem($todo))
    ->when(Todo::query()->count() === 0, fn ($bx) => $bx
        ->append(new TodoList, new TodoEmptyState));

return response()->with(['meta' => ['saved' => true]])
    ->refresh(new OrderForm($order))
    ->status(422)
    ->usingResponse(fn (\Ivanfuhr\BladeX\Http\BladeXJsonResponse $response) => $response->header('X-Request-Id', (string) $request->headers->get('X-Request-Id')));
```

Validation errors in BladeX JSON use `errors` as a list of `{ name, messages }`. Session default-bag errors are included when `bladex.include_session_errors` is true. Failed Form Request validation on JSON requests is returned automatically in the same shape (no `->withErrors()` required). Override or add errors with `->withErrors($validator)` when validating manually. Declarative form submits dispatch `validation-failed` on each matching control with `detail.field` and `detail.messages` after operations run; use delegation on the form or `document` to render validation UI.

4. On the client, prefer declarative attributes after `@bladexScripts` (for example `data-fetch="{{ route('items.refresh') }}" data-method="post"` on a button). While the request runs, BladeX sets `data-loading` on that element; for `<form data-fetch="..." data-method="post">` it also disables the form controls until the response returns. Style `[data-loading]` as needed. Operations apply automatically when the response has `X-BladeX: true`, regardless of HTTP status. `refresh` and `replace` morph server HTML into the matched root by default (`bladex.dom_update`); use `replace` for legacy `outerHTML` swaps. You can still call `fetch()` manually if needed. Ensure the layout has `<meta name="csrf-token" content="{{ csrf_token() }}">` for POST requests.

Ensure each mounted instance has a unique `identifier()` when multiple copies of the same component appear on one page.

## Rules, References, and Templates

Read before executing:

- package README operations section

## Examples

- POST endpoint returns `response()->refresh($component)`; `data-fetch` with `data-method="post"` on a button (or `fetch(url, { method: 'POST' })`) applies operations via the fetch proxy.

## Anti-patterns

- do not use CSS selectors in PHP to target components; pass `Component` instances instead
- do not document package internals here; keep the skill focused on adoption in Laravel apps
