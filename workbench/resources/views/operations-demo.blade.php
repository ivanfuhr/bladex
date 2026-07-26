<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>BladeX operations demo</title>
    <style>
        section { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <h1>BladeX operations</h1>

    <section>
        <h2>Refresh</h2>
        <x-random-sentence />
        <button
            type="button"
            data-fetch="{{ url('/operations/refresh') }}"
            data-method="post"
        >
            Refresh sentence
        </button>
    </section>

    <section>
        <h2>Replace</h2>
        <x-loading-spinner />
        <button
            type="button"
            data-fetch="{{ url('/operations/replace') }}"
            data-method="post"
        >
            Replace spinner with sentence
        </button>
    </section>

    <section>
        <h2>Remove</h2>
        <x-demo-removable />
        <button
            type="button"
            data-fetch="{{ url('/operations/remove') }}"
            data-method="post"
        >
            Remove block
        </button>
    </section>

    <section>
        <h2>Append / prepend</h2>
        <x-demo-slot />
        <button
            type="button"
            data-fetch="{{ url('/operations/append') }}"
            data-method="post"
        >
            Append chip inside slot (end)
        </button>
        <button
            type="button"
            data-fetch="{{ url('/operations/prepend') }}"
            data-method="post"
        >
            Prepend chip inside slot (start)
        </button>
    </section>

    <section>
        <h2>Trigger (change)</h2>
        <p>Changing the select sends a POST to append a chip (same endpoint each time).</p>
        <x-demo-slot />
        <label for="slot-action">
            Append on change
            <select
                id="slot-action"
                data-trigger="change"
                data-fetch="{{ url('/operations/append') }}"
                data-method="post"
            >
                <option value="" selected>—</option>
                <option value="1">Append once</option>
                <option value="2">Append again</option>
            </select>
        </label>
    </section>

    <section>
        <h2>Redirect</h2>
        <button
            type="button"
            data-fetch="{{ url('/operations/redirect') }}"
            data-method="post"
        >
            Redirect to top of this page
        </button>
    </section>

    @bladexScripts
</body>
</html>
