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

];
