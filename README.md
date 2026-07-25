<div align="center">
    <h1>BladeX</h1>
</div>

<p align="center">
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://img.shields.io/packagist/v/ivanfuhr/bladex.svg?style=flat-square" alt="Packagist"></a>
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://img.shields.io/packagist/php-v/ivanfuhr/bladex.svg?style=flat-square" alt="PHP from Packagist"></a>
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://badge.laravel.cloud/badge/ivanfuhr/bladex?style=flat" alt="Laravel versions"></a>
    <a href="https://github.com/ivanfuhr/bladex/actions"><img alt="GitHub Workflow Status (main)" src="https://img.shields.io/github/actions/workflow/status/ivanfuhr/bladex/tests.yml?branch=main&label=Tests&style=flat-square"></a>
    <a href="https://packagist.org/packages/ivanfuhr/bladex"><img src="https://img.shields.io/packagist/dt/ivanfuhr/bladex.svg?style=flat-square" alt="Total Downloads"></a>
</p>

Extend Laravel Blade with HTTP-aware components and server-driven interactions.

## Installation

You can install the package via Composer:

```bash
composer require ivanfuhr/bladex
```

You may publish all of the package's resources at once:

```bash
php artisan vendor:publish --tag="bladex"
```

Or, you may publish each resource individually:

### Publishing the Configuration File

```bash
php artisan vendor:publish --tag="bladex-config"
```

### Publishing and Running the Migrations

```bash
php artisan vendor:publish --tag="bladex-migrations"
php artisan migrate
```

### Publishing the Views

```bash
php artisan vendor:publish --tag="bladex-views"
```

### Publishing the Translations

```bash
php artisan vendor:publish --tag="bladex-lang"
```

### Publishing the Public Assets

```bash
php artisan vendor:publish --tag="bladex-assets"
```

## Usage

<!-- Add a basic usage example here. -->

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Thank you for considering contributing to BladeX! Please review our [contributing guide](.github/CONTRIBUTING.md) to get started.

## Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [Ivan Führ](https://github.com/ivanfuhr)
- [All Contributors](../../contributors)

## License

BladeX is open-sourced software licensed under the [MIT license](LICENSE.md).
