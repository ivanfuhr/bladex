# Release Notes

## [Unreleased](https://github.com/ivanfuhr/bladex/compare/v0.1.0...1.x)

### Changed

- **Breaking:** BladeX responses use `response()->refresh()` / `replace()` / `navigate()` (and related macros) instead of `response()->bladex()`. Extra JSON keys: `response()->with([...])`.
- **Breaking:** Builder `redirect()` removed; use `navigate()` (client operation JSON type remains `redirect`).
- **Breaking:** Removed named HTTP helpers on the builder (`unprocessableEntity()`, `forbidden()`, etc.); use `response()->status($code)` or `->status($code)`.
- Responses are `Ivanfuhr\BladeX\Http\BladeXJsonResponse` instances; optional root JSON keys merge with `operations` and `errors` (reserved keys are ignored).

## [v0.1.0](https://github.com/ivanfuhr/bladex/compare/...v0.1.0) - 202x-xx-xx

Initial pre-release.
