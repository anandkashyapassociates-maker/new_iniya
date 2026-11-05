<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auto-create storage symlink on Hostinger / shared hosting if not already linked
        if (! file_exists(public_path('storage'))) {
            try {
                Artisan::call('storage:link');
            } catch (Throwable $e) {
                // Ignore if symlink creation is restricted; fallback route in web.php serves the file
            }
        }
    }
}
