<?php

namespace App\Providers;

use App\Observers\GenreObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Tambahkan baris ini
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use App\Models\Genre;

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

    Genre::observe(GenreObserver::class);
    
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
