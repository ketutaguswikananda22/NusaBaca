<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        // Jika user sedang login DAN statusnya tidak active
        if (Auth::check() && Auth::user()->status !== 'active') {
            Auth::logout(); // Paksa keluar

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error_suspended', 'Mohon maaf akun anda telah ditangguhkan.');
        }

        return $next($request);
    }
}