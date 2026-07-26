<?php

declare(strict_types=1);

return [

    'placeholder' => 'default',

    /*
    | When true, multiple root elements throw while APP_DEBUG is enabled (same as Livewire).
    | Set to false to disable the check entirely, including in local development.
    */
    'enforce_single_root_element' => true,

    /*
    | How refresh and replace operations update the DOM on the client.
    | morph: reconcile the existing root with server HTML (preserves focus when possible).
    | replace: set outerHTML on the matched root (legacy behavior).
    */
    'dom_update' => 'morph',

    /*
    | When true, validation errors from the session default bag are included in
    | BladeX JSON responses alongside operations. Use withErrors() to add or override.
    */
    'include_session_errors' => true,

    /*
    | When true, failed Form Request validation on JSON requests (for example BladeX
    | fetch with Accept: application/json) returns a BladeX payload with errors
    | and X-BladeX: true instead of Laravel's default validation JSON only.
    */
    'treat_json_validation_as_bladex' => true,

];
