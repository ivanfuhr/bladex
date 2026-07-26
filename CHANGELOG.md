# Release Notes

## [Unreleased](https://github.com/ivanfuhr/bladex/compare/v0.1.0...1.x)

### Changed

- **Breaking:** Declarative form validation no longer sets `data-error` / `data-error-field` on controls. BladeX dispatches `validation-failed` and `validation-cleared` on each form control instead. Public JS API: `Bladex.dispatchValidationFailed`, `Bladex.dispatchValidationCleared`, `Bladex.normalizeErrors` (removed `applyFormErrors` / `clearFormFieldErrors`).
- **Breaking:** BladeX responses use `response()->refresh()` / `replace()` / `navigate()` (and related macros) instead of `response()->bladex()`. Extra JSON keys: `response()->with([...])`.
- **Breaking:** Builder `redirect()` removed; use `navigate()` (client operation JSON type remains `redirect`).
- **Breaking:** Removed named HTTP helpers on the builder (`unprocessableEntity()`, `forbidden()`, etc.); use `response()->status($code)` or `->status($code)`.
- **Breaking:** Declarative actions use `data-fetch` (URL) and optional `data-method` (defaults to `get`) instead of `data-get`, `data-post`, `data-put`, `data-patch`, and `data-delete`. Migrate for example `data-post="/items"` to `data-fetch="/items" data-method="post"`.
- Responses are `Ivanfuhr\BladeX\Http\BladeXJsonResponse` instances; optional root JSON keys merge with `operations` and `errors` (reserved keys are ignored).

## [v0.1.0](https://github.com/ivanfuhr/bladex/compare/...v0.1.0) - 202x-xx-xx

Initial pre-release.
