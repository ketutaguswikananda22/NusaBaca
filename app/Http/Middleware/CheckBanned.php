<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
{
    // Ambil user dari request
    $user = $request->user();

    // Cek jika user login dan statusnya banned/tidak aktif
    if ($user && ($user->is_banned || $user->status !== 'active')) {
        
        // Gunakan Facade Auth agar VS Code tidak merah
        \Illuminate\Support\Facades\Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('error_suspended', 'Akun Anda Telah Di Nonaktifkan Permanen.');
    }
    
    return $next($request);
}
}
