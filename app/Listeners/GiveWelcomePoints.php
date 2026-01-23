<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GiveWelcomePoints
{
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        // Gunakan Transaction & Lock untuk mencegah double point (Race Condition)
        DB::transaction(function () use ($user) {
            // Refresh data terbaru dari DB dan kunci baris ini
            $currentUser = $user->fresh();

            // Audit: Hanya beri poin jika poin masih benar-benar 0
            if ($currentUser && (int)$currentUser->points === 0) {
                $currentUser->increment('points', 100);
                Log::info("System Behavior: 100 Points granted to {$currentUser->email}");
            } else {
                Log::warning("System Behavior: Blocked double point attempt for {$user->email}");
            }
        });
    }
}