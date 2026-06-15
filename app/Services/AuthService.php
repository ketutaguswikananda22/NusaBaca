<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Events\UserRegistered;
use Illuminate\Support\Str;

class AuthService
{
    public function handleGoogleCallback()
    {
        return DB::transaction(function () {
            // 1. Tambahkan stateless() untuk mencegah hilangnya sesi
            $googleUser = Socialite::driver('google')->stateless()->user();

            $existingUser = User::where('email', $googleUser->email)->first();

            // 2. Gunakan $existingUser, bukan $user, untuk mengecek data lama
            $user = User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'google_id' => $googleUser->id,
                    'name' => $googleUser->name,
                    'password' => $existingUser->password ?? bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                    'role' => ($googleUser->email === 'nusabacaa@gmail.com') ? 'admin' : ($existingUser->role ?? 'user'),
                ]
            );

            // Cek status aplikasi penulis
            $isApproved = DB::table('writer_applications')
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();

            if ($isApproved && $user->role !== 'admin') {
                $user->update(['role' => 'penulis']);
            }

            // 3. Gabungkan blok pengecekan user baru untuk menghindari duplikasi event
            if ($user->wasRecentlyCreated) {
                // Trigger Event 
                event(new UserRegistered($user));

                // Kirim Notifikasi Lonceng
                $user->notify(new \App\Notifications\AktivitasNotifikasi([
                    'title' => 'Selamat Datang di NusaBaca!',
                    'message' => 'Halo ' . $user->name . ', senang melihatmu bergabung. Mulailah menjelajahi katalog kami!',
                    'type' => 'success',
                    'url' => route('dashboard'),
                ]));
            }

            Auth::login($user);
            request()->session()->regenerate();

            return $user;
        });
    }
}
