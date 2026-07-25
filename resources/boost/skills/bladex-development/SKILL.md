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
```

4. On the client, use `fetch()` after `@bladexScripts` — operations apply automatically when the response has `X-BladeX: true`. Ensure the layout has `<meta name="csrf-token" content="{{ csrf_token() }}">` for POST requests.

Ensure each mounted instance has a unique `identifier()` when multiple copies of the same component appear on one page.

## Rules, References, and Templates

Read before executing:

- package README operations section

## Examples

- POST endpoint returns `bladex()->refresh($component)`; `fetch(url, { method: 'POST' })` applies operations via the fetch proxy.

## Anti-patterns

- do not use CSS selectors in PHP to target components; pass `Component` instances instead
- do not document package internals here; keep the skill focused on adoption in Laravel apps
