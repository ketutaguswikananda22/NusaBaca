<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Events\UserRegistered;

class AuthService
{
    public function handleGoogleCallback()
    {
        return DB::transaction(function () {
            $googleUser = Socialite::driver('google')->user();
            
            $existingUser = User::where('email', $googleUser->email)->first();

            $user = User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'google_id' => $googleUser->id,
                    'name' => $googleUser->name,
                    'password' => $user->password ?? bcrypt(str()->random(16)),
                    'email_verified_at' => now(),
                    'role' => ($googleUser->email == 'nusabacaa@gmail.com') ? 'admin' : ($user->role ?? 'user'),
                ]
            );

            $isApproved = DB::table('writer_applications')
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();

            if ($isApproved && $user->role !== 'admin') {
                $user->update(['role' => 'penulis']);
            }

            if ($user->wasRecentlyCreated) {
                event(new UserRegistered($user));
            }
            if ($user->wasRecentlyCreated) {
                // 1. Trigger Event (Untuk logic lain seperti kirim email/poin)
                event(new UserRegistered($user));

                // 2. Kirim Notifikasi Lonceng (System Behavior Layer)
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