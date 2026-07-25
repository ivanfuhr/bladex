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

    @bladexScripts

    <script>
        document.getElementById('refresh-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/refresh') }}', { method: 'POST' });
        });

        document.getElementById('replace-demo').addEventListener('click', function () {
            fetch('{{ url('/operations/replace') }}', { method: 'POST' });
        });
    </script>
</body>
</html>
