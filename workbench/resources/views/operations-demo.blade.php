<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>BladeX operations demo</title>
</head>
<body>
    <h1>BladeX operations</h1>

    <section>
        <h2>Refresh</h2>
        <x-random-sentence />
        <button type="button" id="refresh-demo">Refresh sentence</button>
    </section>

    <section>
        <h2>Replace</h2>
        <x-loading-spinner />
        <button type="button" id="replace-demo">Replace spinner with sentence</button>
    </section>

    <section>
        <h2>Remove</h2>
        <x-demo-removable />
        <button type="button" id="remove-demo">Remove block</button>
    </section>

    <section>
        <h2>Append / prepend</h2>
        <x-demo-slot />
        <button type="button" id="append-demo">Append chip after slot</button>
        <button type="button" id="prepend-demo">Prepend chip before slot</button>
    </section>

    <section>
        <h2>Redirect</h2>
        <button type="button" id="redirect-demo">Redirect to top of this page</button>
    </section>

    @bladexScripts

    <script>
        document.getElementById('refresh-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/refresh') }}', { method: 'POST' });
        });

        document.getElementById('replace-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/replace') }}', { method: 'POST' });
        });

        document.getElementById('remove-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/remove') }}', { method: 'POST' });
        });

        document.getElementById('append-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/append') }}', { method: 'POST' });
        });

        document.getElementById('prepend-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/prepend') }}', { method: 'POST' });
        });

        document.getElementById('redirect-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/redirect') }}', { method: 'POST' });
        });
    </script>
</body>
</html>
