<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Tambahkan baris ini
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
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
    Vite::prefetch(concurrency: 3);
    
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(3)->by($request->ip());
    });

    /*
    if (str_contains(request()->getHost(), 'ngrok-free.app')) {
        URL::forceScheme('https');
    }
    */
    }
}
