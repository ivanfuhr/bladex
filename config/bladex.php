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
    | Cache-busting query string appended to @bladexScripts (bladex.js).
    | Defaults to a short hash of the bundled bladex.js file.
    */
    'version' => (static function (): string {
        $path = dirname(__DIR__).'/dist/bladex.js';

        if (! is_file($path)) {
            return 'dev';
        }

        $hash = hash_file('sha256', $path);

        return $hash === false ? 'dev' : substr($hash, 0, 8);
    })(),

];
