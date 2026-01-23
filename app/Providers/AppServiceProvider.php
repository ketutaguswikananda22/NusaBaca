<?php

namespace App\Providers;

use App\Models\Genre;
use App\Models\User;
use App\Events\UserRegistered;
use App\Listeners\GiveWelcomePoints;
use App\Observers\GenreObserver;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Event; // Tambahkan ini
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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

        // --- System Behavior Layer: Events ---
        Event::listen(
            UserRegistered::class,
            GiveWelcomePoints::class,
        );

        // --- Core System Layer: Observers ---
        Genre::observe(GenreObserver::class);
        
        // --- Security Layer: Rate Limiting ---
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip()); // Saya naikkan ke 60 agar tidak gampang terblokir saat dev
        });

        // --- Security Layer: Global Gate (Admin Override) ---
        Gate::before(function (User $user, $ability) {
            return $user->role === 'admin' ? true : null;
        });
        
        /*
        if (str_contains(request()->getHost(), 'ngrok-free.app')) {
            URL::forceScheme('https');
        }
        */
    }
}