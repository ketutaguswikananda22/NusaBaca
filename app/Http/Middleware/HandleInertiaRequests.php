<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

   public function share(Request $request): array
{
    $user = $request->user();

    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ] : null,
            // Tambahkan ini: Mengambil 10 notifikasi terbaru dan jumlah yang belum dibaca
            'notifications' => $user ? [
                'list' => $user->notifications()->take(10)->get(),
                'unread_count' => $user->unreadNotifications()->count(),
            ] : null,
        ],
        'flash' => [
            'message' => session('message'),
            'type'    => session('type'),
            'success' => session('success'),
            'error'   => session('error'),
            'error_suspended' => session('error_suspended'),
        ],
        'ziggy' => fn () => [
            ...(new Ziggy)->toArray(),
            'location' => $request->url(),
        ],
    ]);
}
}