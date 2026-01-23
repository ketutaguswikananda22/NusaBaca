<?php

namespace App\Listeners;

use App\Events\UserRegistered as UserRegisteredEvent;
use App\Notifications\AktivitasNotifikasi;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UserRegistered
{
    /**
     * Handle the event.
     */
    public function handle(UserRegisteredEvent $event): void
    {
        // Mengirim notifikasi selamat datang ke database
        $event->user->notify(new AktivitasNotifikasi([
            'title' => 'Selamat Datang di NusaBaca!',
            'message' => 'Halo ' . $event->user->name . ', akunmu berhasil dibuat via Google. Ayo mulai membaca!',
            'type' => 'success',
            'url' => route('dashboard'),
        ]));
    }
} 