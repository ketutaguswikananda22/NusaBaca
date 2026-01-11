<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
 public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();

    $user = $request->user();

    // Cek apakah user kena ban (is_banned) ATAU statusnya bukan active
    if ($user->is_banned || $user->status !== 'active') {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Gunakan pesan yang lebih jelas sesuai kondisi
        $pesan = $user->is_banned 
            ? 'Akun Anda telah ditangguhkan secara permanen karena melanggar ketentuan.' 
            : 'Akun Anda sedang tidak aktif.';

        return redirect()->route('login')->with('error_suspended', $pesan);
    }

    $request->session()->regenerate();
    return redirect()->intended('/dashboard');
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
