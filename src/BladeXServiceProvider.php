<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX;

use Illuminate\Support\ServiceProvider;
use Ivanfuhr\BladeX\Console\Commands\BladeXCommand;
use Ivanfuhr\BladeX\Support\FrontendAssets;
use Ivanfuhr\BladeX\Support\RootElementAttributeInjector;
use Ivanfuhr\BladeX\Support\RootElementValidator;

class BladeXServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/bladex.php', 'bladex');

        $this->app->singleton(BladeX::class);

        $this->app->singleton(RootElementValidator::class);

        $this->app->singleton(RootElementAttributeInjector::class);

        $this->app->singleton(FrontendAssets::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/bladex.php');

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'bladex');

        $this->loadTranslationsFrom(__DIR__.'/../lang', 'bladex');

        $this->app->make(FrontendAssets::class)->boot();

        if (! $this->app->runningInConsole()) {
            return;
        }

        $this->publishes([
            __DIR__.'/../config/bladex.php' => config_path('bladex.php'),
        ], ['bladex', 'bladex-config']);

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/bladex'),
        ], ['bladex', 'bladex-views']);

        $this->publishes([
            __DIR__.'/../lang' => $this->app->langPath('vendor/bladex'),
        ], ['bladex', 'bladex-lang']);

        $this->publishes([
            __DIR__.'/../dist' => public_path('vendor/bladex'),
        ], ['bladex', 'bladex-assets']);

        $this->publishesMigrations([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ], ['bladex', 'bladex-migrations']);

        $this->commands([
            BladeXCommand::class,
        ]);
    }
}
